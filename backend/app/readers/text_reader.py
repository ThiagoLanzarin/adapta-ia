"""Reads the text pasted by the teacher (RF-19, R-001-05)."""

from app.models.material import Material
from app.readers.errors import InvalidTextError

MAX_TEXT_CHARS = 20_000


def read_text(text: str) -> Material:
    cleaned = text.strip()
    if not cleaned:
        raise InvalidTextError("empty text")
    if len(cleaned) > MAX_TEXT_CHARS:
        raise InvalidTextError(f"{len(cleaned)} characters")
    return Material(text=cleaned)
