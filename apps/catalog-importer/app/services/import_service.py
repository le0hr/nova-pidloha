from pathlib import Path

from app.config import Settings
from app.models.import_plan import ImportPlan
from app.parser.workbook import parse_workbook
from app.services.diff_service import build_plan
from app.strapi.client import StrapiClient
from app.strapi.sync import execute
from app.validation.errors import ValidationResult


class InvalidCatalog(ValueError):
    def __init__(self, result: ValidationResult) -> None:
        super().__init__("Catalog validation failed. No Strapi requests were made.")
        self.result = result


def run(
    path: Path,
    settings: Settings,
    client: StrapiClient,
    *,
    write: bool = False,
    journal_directory: Path = Path("import-runs"),
) -> ImportPlan:
    result = parse_workbook(path, settings)
    if not result.valid:
        raise InvalidCatalog(result)
    plan = build_plan(result.catalog, client, result.assets)
    if write:
        execute(plan, client, journal_directory)
    return plan
