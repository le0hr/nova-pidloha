import os

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

from supplier_config import BASE_DIR, require_env

SCOPES = ["https://www.googleapis.com/auth/drive.readonly"]
TOKEN_FILE = BASE_DIR / "token.json"
CREDENTIALS_FILE = BASE_DIR / "credentials.json"
TOKEN_URI = "https://oauth2.googleapis.com/token"


def get_drive_service():
    """Load local OAuth credentials, refresh them, or request browser consent."""
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
    elif os.getenv("GOOGLE_REFRESH_TOKEN"):
        creds = Credentials(
            token=None,
            refresh_token=require_env("GOOGLE_REFRESH_TOKEN"),
            token_uri=TOKEN_URI,
            client_id=require_env("GOOGLE_CLIENT_ID"),
            client_secret=require_env("GOOGLE_CLIENT_SECRET"),
            scopes=SCOPES,
        )

    if not creds or not creds.valid:
        if creds and creds.refresh_token:
            creds.refresh(Request())
        else:
            if CREDENTIALS_FILE.exists():
                flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_FILE), SCOPES)
            else:
                flow = InstalledAppFlow.from_client_config({"installed": {
                    "client_id": require_env("GOOGLE_CLIENT_ID"),
                    "client_secret": require_env("GOOGLE_CLIENT_SECRET"),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": TOKEN_URI,
                    "redirect_uris": ["http://localhost"],
                }}, SCOPES)
            creds = flow.run_local_server(port=0)

        fd = os.open(TOKEN_FILE, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(fd, "w") as token:
            os.fchmod(token.fileno(), 0o600)
            token.write(creds.to_json())

    return build("drive", "v3", credentials=creds)
