# Supplier scripts

Install dependencies with `python -m pip install -r apps/supplier/requirements.txt`.
Copy `.env.example` to `.env` in this directory and fill the required values.
Existing process environment variables take precedence over this file.
Keep `.env`, `credentials.json`, and `token.json` local; Git ignores them.

For Google Drive, set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from a
Google OAuth **Desktop app** client. Optionally set `GOOGLE_REFRESH_TOKEN`.
Without a refresh token, the first call opens a browser for consent and saves
the resulting credentials in `token.json` with owner-only permissions.
An existing local `credentials.json` or `token.json` is also supported.
OAuth paths are relative to this directory, regardless of the working directory.

`mail_reader.py` uses `IMAP_USERNAME` and `IMAP_PASSWORD` for email.
`extract.py` uses `LLAMA_CLOUD_API_KEY`; its Telegram/Strapi integration also
requires `TG_BOT_TOKEN`, `TG_CHAT_ID`, `STRAPI_GQL_URL`, and `STRAPI_TOKEN`.
