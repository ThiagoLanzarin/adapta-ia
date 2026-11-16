"""Student profile sent with each adaptation (spec 003). The nickname never leaves the browser."""

from typing import Literal

from pydantic import Field

from app.models.base import CamelModel

MaterialType = Literal["test", "activity", "content"]

MAX_NOTES_LENGTH = 500


class StudentProfile(CamelModel):
    reads_little: bool = False
    needs_step_by_step: bool = False
    needs_more_images: bool = False
    sensitive_to_visual_clutter: bool = False
    easily_distracted: bool = False
    notes: str = Field(default="", max_length=MAX_NOTES_LENGTH)
