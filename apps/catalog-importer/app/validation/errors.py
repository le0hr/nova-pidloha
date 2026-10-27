from typing import Literal

from pydantic import BaseModel, Field

from app.models.catalog import Catalog, Source
from app.models.import_plan import MediaAsset


class Issue(BaseModel):
    severity: Literal["ERROR", "WARNING"] = "ERROR"
    source: Source
    field: str
    message: str
    value: str | None = None


class ValidationResult(BaseModel):
    catalog: Catalog = Field(default_factory=Catalog)
    issues: list[Issue] = Field(default_factory=list)
    tables: list[str] = Field(default_factory=list)
    assets: dict[str, MediaAsset] = Field(default_factory=dict)

    @property
    def valid(self) -> bool:
        return not any(issue.severity == "ERROR" for issue in self.issues)

    def error(self, source: Source, field: str, message: str, value: object = None) -> None:
        self.issues.append(
            Issue(
                source=source,
                field=field,
                message=message,
                value=None if value is None else str(value),
            )
        )
