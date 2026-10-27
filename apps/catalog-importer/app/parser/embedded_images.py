"""Read anchored XLSX pictures directly, including when Pillow is unavailable."""

import hashlib
import mimetypes
import posixpath
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

from app.models.catalog import Source
from app.models.import_plan import MediaAsset
from app.validation.errors import ValidationResult

NS = {
    "s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "xdr": "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
}


def relationships(archive: ZipFile, part: str) -> dict[str, str]:
    folder, name = posixpath.split(part)
    rels = f"{folder}/_rels/{name}.rels"
    if rels not in archive.namelist():
        return {}
    return {
        rel.attrib["Id"]: posixpath.normpath(posixpath.join(folder, rel.attrib["Target"])).lstrip(
            "/"
        )
        for rel in ET.fromstring(archive.read(rels))
        if rel.get("TargetMode") != "External"
    }


def read_images(path: Path, result: ValidationResult) -> dict[tuple[str, int, int], list[str]]:
    """Return image parts by sheet and top-left anchor (one-based row/column)."""
    images: dict[tuple[str, int, int], list[str]] = {}
    with ZipFile(path) as archive:
        sheets = ET.fromstring(archive.read("xl/workbook.xml"))
        sheet_rels = relationships(archive, "xl/workbook.xml")
        for sheet in sheets.findall("s:sheets/s:sheet", NS):
            title = sheet.attrib["name"]
            part = sheet_rels[sheet.attrib[f"{{{NS['r']}}}id"]]
            document = ET.fromstring(archive.read(part))
            drawing_rels = relationships(archive, part)
            for drawing in document.findall("s:drawing", NS):
                drawing_part = drawing_rels[drawing.attrib[f"{{{NS['r']}}}id"]]
                media_rels = relationships(archive, drawing_part)
                for anchor in ET.fromstring(archive.read(drawing_part)):
                    pictures = anchor.findall(".//a:blip", NS)
                    if not pictures:
                        continue
                    marker = anchor.find("xdr:from", NS)
                    if marker is None:
                        result.error(
                            Source(sheet=title, row=1),
                            "image",
                            "Picture has no cell anchor. Attach it to a Photo cell.",
                        )
                        continue
                    row = int(marker.findtext("xdr:row", "0", NS)) + 1
                    col = int(marker.findtext("xdr:col", "0", NS)) + 1
                    for picture in pictures:
                        target = media_rels.get(picture.get(f"{{{NS['r']}}}embed", ""))
                        if target is None or target not in archive.namelist():
                            result.error(
                                Source(sheet=title, row=row),
                                "image",
                                "Embedded picture is missing or externally linked.",
                            )
                            continue
                        images.setdefault((title, row, col), []).append(target)
    return images


def prepare_embedded(path: Path, part: str, result: ValidationResult) -> str:
    key = f"embedded:{part}"
    if key in result.assets:
        return key
    mime = mimetypes.guess_type(part)[0]
    if mime not in {"image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"}:
        raise ValueError("Embedded photo must be JPEG, PNG, WebP, GIF or AVIF.")
    with ZipFile(path) as archive:
        content = archive.read(part)
    if not content:
        raise ValueError("Embedded photo is empty.")
    digest = hashlib.sha256(content).hexdigest()
    extension = ".jpg" if mime == "image/jpeg" else Path(part).suffix.lower()
    name = f"catalog-{digest}{extension}"
    # Persist for plan/import and their subsequent hash verification; never modify XLSX.
    cache = path.resolve().parent / ".catalog-media"
    cache.mkdir(exist_ok=True)
    destination = cache / name
    destination.write_bytes(content)
    result.assets[key] = MediaAsset(path=str(destination), name=name, sha256=digest, mime=mime)
    return key
