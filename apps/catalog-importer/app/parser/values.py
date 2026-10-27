from decimal import Decimal, InvalidOperation

from app.models.catalog import Scalar


def identifier(value: object) -> str:
    if value is None or isinstance(value, bool):
        raise ValueError("Enter an ID; format ID cells as Text to preserve leading zeros.")
    if isinstance(value, (int, float, Decimal)):
        number = Decimal(str(value))
        if not number.is_finite() or number != number.to_integral_value():
            raise ValueError("IDs must be text or whole numbers.")
        if len(str(abs(int(number)))) > 15:
            raise ValueError("Long numeric IDs lose precision in Excel. Enter this ID as Text.")
        return str(int(number))
    text = str(value).strip()
    if not text:
        raise ValueError("Enter a non-empty ID.")
    return text


def money(value: object) -> Decimal:
    if value is None or isinstance(value, bool):
        raise ValueError("Enter a numeric price (for example 5130.50).")
    try:
        result = Decimal(
            str(value).strip().replace("\u00a0", "").replace(" ", "").replace(",", ".")
        )
    except InvalidOperation as exc:
        raise ValueError("Enter a numeric price (for example 5130.50).") from exc
    if not result.is_finite():
        raise ValueError("Price must be a finite number.")
    return result


def boolean(value: object) -> bool:
    if value is None:
        return True
    token = str(value).strip().casefold()
    if token in {"true", "1", "так", "yes"}:
        return True
    if token in {"false", "0", "ні", "no"}:
        return False
    raise ValueError("Use true/false, так/ні, or 1/0 for Active.")


def scalar(value: object) -> Scalar:
    if isinstance(value, (str, int, float, bool)):
        return value.strip() if isinstance(value, str) else value
    raise ValueError("Use text, numbers, or true/false for attributes; dates are not supported.")


def optional_text(value: object) -> str | None:
    return None if value is None or not str(value).strip() else str(value).strip()
