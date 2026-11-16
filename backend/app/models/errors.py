"""Error body shared by every route (constitution E7: clear message in Portuguese)."""

from typing import Literal

from app.models.base import CamelModel

ErrorCode = Literal[
    "AI_QUOTA",
    "AI_TIMEOUT",
    "AI_UNAVAILABLE",
    "AI_INVALID",
    "AI_BLOCKED",
    "FILE_TOO_LARGE",
    "FILE_TYPE",
    "TOO_MANY_SLIDES",
    "INVALID_INPUT",
    "PICTOGRAMS_UNAVAILABLE",
]


class ErrorResponse(CamelModel):
    code: ErrorCode
    message: str
