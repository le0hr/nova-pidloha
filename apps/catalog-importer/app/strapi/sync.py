"""Stop-on-failure execution, with durable write-ahead diagnostics."""

import json
import logging
import os
from pathlib import Path
from typing import Any, TextIO
from uuid import uuid4

from app.models.import_plan import ImportPlan
from app.strapi.client import StrapiClient
from app.strapi.mapping import resolve


def record(stream: TextIO, data: dict[str, Any]) -> None:
    stream.write(json.dumps(data, ensure_ascii=False) + "\n")
    stream.flush()
    os.fsync(stream.fileno())


def execute(plan: ImportPlan, client: StrapiClient, directory: Path) -> Path:
    """Apply a freshly validated plan; never delete or retry a write automatically."""
    directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    path = directory / f"{uuid4().hex}.jsonl"
    identifiers = {
        (op.entity, op.external_id): op.remote_id
        for op in plan.operations
        if op.remote_id is not None
    }
    # Check all local files again before the first mutation, not halfway through the run.
    import hashlib

    for asset in plan.assets.values():
        if hashlib.sha256(Path(asset.path).read_bytes()).hexdigest() != asset.sha256:
            raise ValueError("Photo changed since validation; rebuild the plan.")
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as journal:
        record(journal, {"event": "plan", "plan": plan.model_dump(mode="json")})
        for index, op in enumerate(plan.operations):
            if op.action == "unchanged":
                continue
            logging.getLogger(__name__).info(
                "%s %s external_id=%s", op.action, op.entity, op.external_id
            )
            record(journal, {"event": "started", "operation": index})
            try:
                if op.entity == "media":
                    remote_id = client.upload(plan.assets[op.external_id])
                else:
                    remote_id = client.write(
                        op.entity, resolve(op.payload, identifiers), op.remote_id
                    )
                identifiers[(op.entity, op.external_id)] = remote_id
                record(journal, {"event": "succeeded", "operation": index, "remote_id": remote_id})
            except Exception as exc:
                record(
                    journal,
                    {
                        "event": "failed_or_unknown",
                        "operation": index,
                        "error_type": type(exc).__name__,
                    },
                )
                logging.getLogger(__name__).error(
                    "Import stopped at %s %s; journal=%s", op.entity, op.external_id, path
                )
                raise
        record(journal, {"event": "completed"})
    return path
