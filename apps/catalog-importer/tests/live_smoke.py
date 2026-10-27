"""Called only by cms/tests/catalog-import-smoke.cjs against a disposable database."""

import sys
from pathlib import Path

from example_support import corrected_example

from app.config import Settings
from app.services.import_service import run
from app.strapi.client import StrapiClient


def main() -> None:
    directory = Path(sys.argv[1])
    path = corrected_example(directory)
    settings = Settings(_env_file=None)
    client = StrapiClient(settings)
    try:
        planned = run(path, settings, client)
        assert all(op.action == "create" for op in planned.operations)
        run(path, settings, client, write=True, journal_directory=directory / "runs")
        repeated = run(path, settings, client)
        changed = [
            (op.entity, op.external_id, op.action, op.before, op.payload)
            for op in repeated.operations
            if op.action != "unchanged"
        ]
        assert not changed, changed
        settings.strapi_publication_status = "published"
        run(path, settings, client, write=True, journal_directory=directory / "runs")
        repeated = run(path, settings, client)
        changed = [
            (op.entity, op.external_id, op.action, op.before, op.payload)
            for op in repeated.operations
            if op.action != "unchanged"
        ]
        assert not changed, changed
        assert len(client.fetch("products", "published")) == 3
        assert len(client.fetch("product-variations", "published")) == 50
        assert len(client.media()) == 1
        print(
            "LIVE SMOKE PASSED: 3 products, 50 variations, all relations, 1 reused image; draft and published re-imports unchanged."
        )
    finally:
        client.close()


if __name__ == "__main__":
    main()
