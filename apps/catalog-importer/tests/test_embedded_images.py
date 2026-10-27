import base64
from pathlib import Path
from zipfile import ZipFile

import pytest
from openpyxl import Workbook

from app.parser.embedded_images import NS
from app.parser.workbook import parse_workbook


def fixture(tmp_path, duplicate=False, column=2, text=None, anchor="oneCellAnchor"):
    path = tmp_path / "pictures.xlsx"
    wb = Workbook()
    wb.active.append(["product_id", "Назва", "Фото"])
    wb.active.append(["001", "Door", text])
    wb.active.append(["002", "Other", None])
    wb.save(path)
    with ZipFile(path) as z:
        parts = {n: z.read(n) for n in z.namelist()}
    parts["xl/worksheets/sheet1.xml"] = parts["xl/worksheets/sheet1.xml"].replace(
        b"</worksheet>", f'<drawing xmlns:r="{NS["r"]}" r:id="pic"/></worksheet>'.encode()
    )

    def rel(id, target, kind):
        return f'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="{id}" Target="{target}" Type="{NS["r"]}/{kind}"/></Relationships>'.encode()

    parts["xl/worksheets/_rels/sheet1.xml.rels"] = rel("pic", "../drawings/drawing1.xml", "drawing")
    pic = f'<xdr:{anchor}><xdr:from><xdr:col>{column}</xdr:col><xdr:row>1</xdr:row></xdr:from><xdr:pic><a:blip r:embed="img"/></xdr:pic></xdr:{anchor}>'
    parts["xl/drawings/drawing1.xml"] = (
        f'<xdr:wsDr xmlns:xdr="{NS["xdr"]}" xmlns:a="{NS["a"]}" xmlns:r="{NS["r"]}">'
        + pic * (2 if duplicate else 1)
        + "</xdr:wsDr>"
    ).encode()
    parts["xl/drawings/_rels/drawing1.xml.rels"] = rel("img", "/xl/media/image.png", "image")
    parts["xl/media/image.png"] = base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII="
    )
    with ZipFile(path, "w") as z:
        for name, content in parts.items():
            z.writestr(name, content)
    return path


@pytest.mark.parametrize("anchor", ["oneCellAnchor", "twoCellAnchor"])
def test_embedded_image(tmp_path, anchor):
    path = fixture(tmp_path, anchor=anchor)
    original = path.read_bytes()
    result = parse_workbook(path)
    assert result.valid, result.issues
    photo = result.catalog.products[0].image
    assert photo in result.assets
    assert result.catalog.products[1].image is None
    asset = result.assets[photo]
    assert Path(asset.path).read_bytes().startswith(b"\x89PNG")
    assert parse_workbook(path).assets[photo] == asset
    assert path.read_bytes() == original


@pytest.mark.parametrize("options", [{"duplicate": True}, {"column": 1}, {"text": "old.jpg"}])
def test_ambiguous_image_rejected(tmp_path, options):
    result = parse_workbook(fixture(tmp_path, **options))
    assert not result.valid
    assert any("Photo" in i.message for i in result.issues)


def test_upload_and_reimport(tmp_path):
    import httpx
    from test_sync import Server

    from app.config import Settings
    from app.services.import_service import run
    from app.strapi.client import StrapiClient

    settings = Settings(strapi_token="test", strapi_publication_status="draft")
    server = Server()
    client = StrapiClient(settings, httpx.MockTransport(server.handle))
    path = fixture(tmp_path)
    run(path, settings, client)
    assert set(server.methods) == {"GET"}
    run(path, settings, client, write=True, journal_directory=tmp_path / "runs")
    assert len(server.records["media"]) == 1
    assert server.records["products"]["1"]["image"] == "1"
    server.methods.clear()
    plan = run(path, settings, client, write=True, journal_directory=tmp_path / "runs")
    assert all(op.action == "unchanged" for op in plan.operations)
    assert set(server.methods) == {"GET"}
    assert len(server.records["media"]) == 1
    client.close()
