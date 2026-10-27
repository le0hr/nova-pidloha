"""Verify every local image before any network activity, including uploads."""

import hashlib
import mimetypes
from pathlib import Path, PureWindowsPath
from urllib.parse import urlparse

from app.config import Settings
from app.models.catalog import Product, Variation
from app.models.import_plan import MediaAsset
from app.validation.errors import ValidationResult


def prepare_media(result: ValidationResult, workbook: Path, settings: Settings) -> None:
    root = (settings.image_root or workbook.parent).resolve()
    checked: set[str] = set()
    entities: list[Product | Variation] = [*result.catalog.products, *result.catalog.variations]
    for entity in entities:
        name = entity.image
        if not name or name in checked or name in result.assets:
            continue
        checked.add(name)
        if name.startswith("/uploads/"):
            continue  # Existing Strapi media URLs are resolved read-only in the plan.
        source = entity.source
        if PureWindowsPath(name).drive:
            result.error(
                source,
                "image",
                "Windows drive and network paths are not portable. Copy the photo into the "
                "workbook folder or IMAGE_ROOT and use a relative path such as photos/image.jpg.",
                name,
            )
            continue
        if urlparse(name).scheme:
            result.error(
                source,
                "image",
                "Use a local photo path relative to the workbook, or an existing Strapi /uploads/ URL. External URLs are not downloaded.",
                name,
            )
            continue
        path = (root / name).resolve()
        if not path.is_relative_to(root):
            result.error(
                source,
                "image",
                "Photo path must stay inside IMAGE_ROOT or the workbook folder.",
                name,
            )
            continue
        mime = mimetypes.guess_type(path)[0]
        if mime not in {"image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"}:
            result.error(source, "image", "Use a JPEG, PNG, WebP, GIF or AVIF file.", name)
            continue
        try:
            content = path.read_bytes()
            if not content:
                raise ValueError("empty image")
        except (OSError, ValueError):
            result.error(
                source,
                "image",
                "Photo file is missing, empty or unreadable. Place it at this path, correct the cell, or clear the cell if no photo is intended.",
                name,
            )
            continue
        digest = hashlib.sha256(content).hexdigest()
        extension = ".jpg" if mime == "image/jpeg" else path.suffix.lower()
        result.assets[name] = MediaAsset(
            path=str(path), name=f"catalog-{digest}{extension}", sha256=digest, mime=mime
        )
