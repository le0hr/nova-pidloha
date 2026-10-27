from typing import Any, Literal

from pydantic import BaseModel, Field


class MediaAsset(BaseModel):
    path: str
    name: str
    sha256: str
    mime: str


class Operation(BaseModel):
    entity: str
    action: Literal["create", "update", "unchanged"]
    external_id: str
    remote_id: str | None = None
    payload: dict[str, Any]
    before: dict[str, Any] | None = None


class ImportPlan(BaseModel):
    operations: list[Operation]
    assets: dict[str, MediaAsset] = Field(default_factory=dict)
