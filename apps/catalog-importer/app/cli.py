"""Personnel-facing commands. Validation always precedes any network access."""

import logging
from pathlib import Path
from typing import Annotated

import typer

from app.config import Settings
from app.parser.workbook import parse_workbook
from app.validation.errors import ValidationResult

cli = typer.Typer(no_args_is_help=True)
WorkbookPath = Annotated[Path, typer.Argument(exists=True, readable=True, dir_okay=False)]


def report(result: ValidationResult) -> None:
    c = result.catalog
    typer.echo(
        f"Validation summary\nProducts: {len(c.products)}\nVariations: {len(c.variations)}\nCharacteristics: {sum(len(p.characteristics) for p in c.products)}\nAdd-ons: {sum(len(p.addons) for p in c.products) + sum(len(v.addons) for v in c.variations)}"
    )
    typer.echo(
        f"Errors: {sum(i.severity == 'ERROR' for i in result.issues)}\nWarnings: {sum(i.severity == 'WARNING' for i in result.issues)}"
    )
    for issue in sorted(
        result.issues, key=lambda i: (i.source.sheet, i.source.row, i.source.column or "")
    ):
        typer.echo(
            f'{issue.severity} Sheet "{issue.source.sheet}", row {issue.source.row}, column {issue.source.column or "—"}, {issue.field}: {issue.message} Value: {issue.value or "—"}'
        )


def checked(path: Path, settings: Settings) -> ValidationResult:
    try:
        result = parse_workbook(path, settings)
    except Exception as exc:
        logging.getLogger(__name__).error("Cannot read workbook (%s)", type(exc).__name__)
        typer.echo(
            "Cannot read workbook. Check that this is a readable, valid XLSX file and that header configuration is valid.",
            err=True,
        )
        raise typer.Exit(1) from exc
    report(result)
    return result


@cli.callback()
def setup() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")
    logging.getLogger("httpx").setLevel(logging.WARNING)


@cli.command()
def validate(path: WorkbookPath) -> None:
    """Parse and validate only; never contact Strapi."""
    result = checked(path, Settings())
    raise typer.Exit(0 if result.valid else 1)


@cli.command()
def inspect(path: WorkbookPath) -> None:
    """Show detected tables, attribute counts, and validation issues."""
    result = checked(path, Settings())
    for table in result.tables:
        typer.echo(table)
    raise typer.Exit(0 if result.valid else 1)


def synchronize(path: Path, write: bool) -> None:
    from app.services.diff_service import build_plan
    from app.strapi.client import StrapiClient
    from app.strapi.sync import execute

    settings = Settings()
    result = checked(path, settings)
    if not result.valid:
        raise typer.Exit(1)
    client = None
    try:
        client = StrapiClient(settings)
        changes = build_plan(result.catalog, client, result.assets)
        for entity in dict.fromkeys(op.entity for op in changes.operations):
            for action in ("create", "update", "unchanged"):
                count = sum(
                    op.entity == entity and op.action == action for op in changes.operations
                )
                typer.echo(f"{action.upper()} {entity.upper()}: {count}")
        if write:
            journal = execute(changes, client, Path("import-runs"))
            typer.echo(f"Import completed. Journal: {journal}")
    except Exception as exc:
        typer.echo(f"Import/plan stopped: {exc}", err=True)
        raise typer.Exit(1) from exc
    finally:
        if client is not None:
            client.close()


@cli.command()
def plan(path: WorkbookPath) -> None:
    """Validate and calculate a read-only change plan."""
    synchronize(path, False)


@cli.command(name="import")
def import_catalog(path: WorkbookPath) -> None:
    """Validate fully, plan, then synchronize with a durable journal."""
    synchronize(path, True)
