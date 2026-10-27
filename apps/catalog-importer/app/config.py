from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    strapi_url: str = "http://localhost:1337"
    strapi_token: SecretStr = SecretStr("")
    strapi_timeout: float = Field(default=30, gt=0)
    strapi_publication_status: Literal["draft", "published"] = "draft"
    image_root: Path | None = None
    header_aliases: dict[str, list[str]] = Field(default_factory=dict)
    attribute_keys: dict[str, str] = Field(default_factory=dict)
    sku_is_variation_id: bool = False
