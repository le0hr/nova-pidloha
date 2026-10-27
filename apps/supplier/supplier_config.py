import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def require_env(name):
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Set {name} in {BASE_DIR / '.env'}")
    return value
