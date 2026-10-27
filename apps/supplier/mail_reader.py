import imaplib
import email
from email.header import decode_header
from email.utils import parsedate_to_datetime
import os
import io
import re
from pathlib import Path
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
from urllib.parse import urlparse, parse_qs

from drive_auth import get_drive_service
from supplier_config import require_env
from googleapiclient.http import MediaIoBaseDownload
from googleapiclient.errors import HttpError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

FOLDER_MIME = "application/vnd.google-apps.folder"
# Google-native типи, які треба експортувати, а не завантажувати напряму
GOOGLE_EXPORT_MIME_MAP = {
    "application/vnd.google-apps.document": (
        "application/pdf", ".pdf"
    ),
    "application/vnd.google-apps.spreadsheet": (
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".xlsx"
    ),
    "application/vnd.google-apps.presentation": (
        "application/pdf", ".pdf"
    ),
}


def _sanitize_filename(name: str) -> str:
    return "".join(c for c in name if c.isalnum() or c in "._- ()[]").strip() or "file"


def _download_file_by_id(service, file_id: str, file_name: str, mime_type: str, save_dir: Path) -> Optional[Path]:
    """Завантажує один файл (або експортує Google-native документ) у save_dir."""
    save_dir.mkdir(parents=True, exist_ok=True)
    safe_name = _sanitize_filename(file_name)

    try:
        if mime_type in GOOGLE_EXPORT_MIME_MAP:
            export_mime, ext = GOOGLE_EXPORT_MIME_MAP[mime_type]
            if not safe_name.endswith(ext):
                safe_name += ext
            request = service.files().export_media(fileId=file_id, mimeType=export_mime)
        elif mime_type == FOLDER_MIME:
            return None  # папки обробляються окремо
        else:
            request = service.files().get_media(fileId=file_id)

        output_path = save_dir / safe_name
        fh = io.FileIO(output_path, "wb")
        downloader = MediaIoBaseDownload(fh, request)

        done = False
        while not done:
            status, done = downloader.next_chunk()
        fh.close()

        logger.info(f"Завантажено: {output_path}")
        return output_path

    except HttpError as e:
        logger.warning(f"Не вдалося завантажити файл {file_name} ({file_id}): {e}")
        return None


def _download_folder_recursive(service, folder_id: str, save_dir: Path) -> List[Path]:
    """Рекурсивно обходить папку Google Drive і завантажує всі файли."""
    downloaded_files = []

    page_token = None
    while True:
        try:
            response = service.files().list(
                q=f"'{folder_id}' in parents and trashed = false",
                spaces="drive",
                fields="nextPageToken, files(id, name, mimeType)",
                pageToken=page_token,
                pageSize=1000,
            ).execute()
        except HttpError as e:
            logger.warning(f"Не вдалося отримати вміст папки {folder_id}: {e}")
            break

        for item in response.get("files", []):
            item_id = item["id"]
            item_name = item["name"]
            mime_type = item["mimeType"]

            if mime_type == FOLDER_MIME:
                sub_dir = save_dir / _sanitize_filename(item_name)
                downloaded_files.extend(
                    _download_folder_recursive(service, item_id, sub_dir)
                )
            else:
                path = _download_file_by_id(service, item_id, item_name, mime_type, save_dir)
                if path:
                    downloaded_files.append(path)

        page_token = response.get("nextPageToken")
        if not page_token:
            break

    return downloaded_files


def _extract_folder_id(url: str) -> Optional[str]:
    match = re.search(r"/folders/([-\w]{10,})", url)
    if match:
        return match.group(1)
    parsed = urlparse(url)
    qs_id = parse_qs(parsed.query).get("id", [None])[0]
    return qs_id


def _extract_file_id(url: str) -> Optional[str]:
    if "/file/d/" in url:
        return url.split("/file/d/")[1].split("/")[0]
    if "id=" in url:
        return parse_qs(urlparse(url).query).get("id", [None])[0]
    return None


class EmailReader:
    def __init__(
        self,
        host: str,
        port: int,
        username: str,
        password: str,
        use_ssl: bool = True,
        mailbox: str = "INBOX",
        drive_service=None,
    ):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.use_ssl = use_ssl
        self.mailbox = mailbox
        self.mail = None
        self.drive_service = drive_service  # авторизований клієнт Google Drive API

    def connect(self):
        if self.use_ssl:
            self.mail = imaplib.IMAP4_SSL(self.host, self.port)
        else:
            self.mail = imaplib.IMAP4(self.host, self.port)

        self.mail.login(self.username, self.password)
        self.mail.select(self.mailbox)
        logger.info(f"Підключено до {self.username}")

    def disconnect(self):
        if self.mail:
            try:
                self.mail.close()
                self.mail.logout()
            except Exception:
                pass

    def _decode_header(self, value: str) -> str:
        if not value:
            return ""
        decoded_parts = decode_header(value)
        result = []
        for part, encoding in decoded_parts:
            if isinstance(part, bytes):
                result.append(part.decode(encoding or "utf-8", errors="ignore"))
            else:
                result.append(part)
        return "".join(result)

    def _get_attachments(self, msg, save_dir: Path) -> List[Dict]:
        attachments = []
        save_dir.mkdir(parents=True, exist_ok=True)

        # --- Витягуємо текст листа ---
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() in ("text/plain", "text/html"):
                    payload = part.get_payload(decode=True)
                    if payload:
                        charset = part.get_content_charset() or "utf-8"
                        body += payload.decode(charset, errors="ignore") + "\n"
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                charset = msg.get_content_charset() or "utf-8"
                body = payload.decode(charset, errors="ignore")

        # --- Шукаємо тільки Google Drive ---
        urls = re.findall(r'https?://(?:drive|docs)\.google\.com/[^\s<>"\'\)\]]+', body)
        logger.info(f"Знайдені Google Drive посилання: {urls}")
        cloud_downloaded = False

        for url in urls:
            is_folder = "/folders/" in url or "folderview" in url

            if is_folder:
                folder_id = _extract_folder_id(url)
                if not folder_id:
                    logger.warning(f"Не вдалося витягти folder_id з {url}")
                    continue

                logger.info(f"Качаю папку: {url}")
                downloaded_paths = _download_folder_recursive(
                    self.drive_service, folder_id, save_dir
                )

                if not downloaded_paths:
                    logger.warning(
                        f"Не вдалося завантажити жодного файлу з {url} "
                        f"(порожня папка або немає доступу для цього акаунта)"
                    )
                    continue

                for file_path in downloaded_paths:
                    already_added = any(a["path"] == str(file_path) for a in attachments)
                    if not already_added:
                        attachments.append({
                            "filename": file_path.name,
                            "path": str(file_path),
                            "content_type": "application/octet-stream",
                            "size": file_path.stat().st_size,
                            "source": "google_drive_folder",
                            "original_url": url
                        })
                        cloud_downloaded = True

            else:
                file_id = _extract_file_id(url)
                if not file_id:
                    logger.warning(f"Не вдалося витягти file_id з {url}")
                    continue

                logger.info(f"Качаю файл: {file_id}")
                try:
                    meta = self.drive_service.files().get(
                        fileId=file_id, fields="name, mimeType"
                    ).execute()
                except HttpError as e:
                    logger.warning(f"Не вдалося отримати метадані файлу {file_id}: {e}")
                    continue

                file_path = _download_file_by_id(
                    self.drive_service, file_id, meta["name"], meta["mimeType"], save_dir
                )

                if file_path:
                    already_added = any(a["path"] == str(file_path) for a in attachments)
                    if not already_added:
                        attachments.append({
                            "filename": file_path.name,
                            "path": str(file_path),
                            "content_type": "application/octet-stream",
                            "size": file_path.stat().st_size,
                            "source": "google_drive_file",
                            "original_url": url
                        })
                        cloud_downloaded = True

        # --- Якщо з Google Drive нічого не скачали — беремо звичайні вкладення ---
        if not cloud_downloaded:
            for part in msg.walk():
                content_disposition = str(part.get("Content-Disposition", ""))
                if "attachment" in content_disposition or part.get_filename():
                    filename = part.get_filename()
                    if filename:
                        filename = self._decode_header(filename)
                        filename = _sanitize_filename(filename)

                        filepath = save_dir / filename
                        payload = part.get_payload(decode=True)
                        if payload:
                            with open(filepath, "wb") as f:
                                f.write(payload)

                            attachments.append({
                                "filename": filename,
                                "path": str(filepath),
                                "content_type": part.get_content_type(),
                                "size": filepath.stat().st_size,
                                "source": "attachment"
                            })

        return attachments

    def fetch_unseen(
        self,
        save_attachments_dir: str = "./attachments",
        mark_as_seen: bool = False,
        since_days: Optional[int] = None
    ) -> List[Dict]:
        self.connect()

        criteria = ["UNSEEN"]
        if since_days:
            date_since = (datetime.now() - timedelta(days=since_days)).strftime("%d-%b-%Y")
            criteria.append(f'SINCE "{date_since}"')

        status, messages = self.mail.search(None, *criteria)
        if status != "OK":
            logger.error("Не вдалося виконати пошук листів")
            return []

        email_ids = messages[0].split()
        results = []

        for email_id in email_ids:
            status, msg_data = self.mail.fetch(email_id, "(RFC822)")
            if status != "OK":
                continue

            raw_email = msg_data[0][1]
            msg = email.message_from_bytes(raw_email)

            subject = self._decode_header(msg.get("Subject", ""))
            from_ = self._decode_header(msg.get("From", ""))
            date_str = msg.get("Date")
            try:
                date = parsedate_to_datetime(date_str)
            except Exception:
                date = None

            body = ""
            if msg.is_multipart():
                for part in msg.walk():
                    if part.get_content_type() == "text/plain":
                        payload = part.get_payload(decode=True)
                        charset = part.get_content_charset() or "utf-8"
                        body = payload.decode(charset, errors="ignore")
                        break
            else:
                payload = msg.get_payload(decode=True)
                charset = msg.get_content_charset() or "utf-8"
                body = payload.decode(charset, errors="ignore")

            attach_dir = Path(save_attachments_dir) / email_id.decode()
            attachments = self._get_attachments(msg, attach_dir)

            results.append({
                "id": email_id.decode(),
                "subject": subject,
                "from": from_,
                "date": date.isoformat() if date else None,
                "body": body.strip(),
                "attachments": attachments
            })

            if mark_as_seen:
                self.mail.store(email_id, "+FLAGS", "\\Seen")

        self.disconnect()
        return results


if __name__ == "__main__":
    drive_service = get_drive_service()

    reader = EmailReader(
        host=os.getenv("IMAP_HOST", "imap.gmail.com"),
        port=int(os.getenv("IMAP_PORT", "993")),
        username=require_env("IMAP_USERNAME"),
        password=require_env("IMAP_PASSWORD"),
        use_ssl=True,
        drive_service=drive_service,
    )

    emails = reader.fetch_unseen(
        save_attachments_dir="./downloads",
        mark_as_seen=False,
    )

    for em in emails:
        print("=" * 60)
        print(f"Від: {em['from']}")
        print(f"Тема: {em['subject']}")
        print(f"Дата: {em['date']}")
        print(f"Вкладень: {len(em['attachments'])}")
        print(f"Тіло: {em['body']}")

        for att in em["attachments"]:
            print(f"  - {att['filename']} ({att['size']} bytes)")
        print()