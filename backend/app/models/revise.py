"""Request for a new version written by the teacher (spec 005)."""

from pydantic import Field

from app.models.adaptation import Adaptation
from app.models.base import CamelModel
from app.models.profile import MaterialType, StudentProfile

MAX_INSTRUCTION_LENGTH = 300


class ReviseRequest(CamelModel):
    adaptation: Adaptation
    profile: StudentProfile
    material_type: MaterialType
    instruction: str = Field(min_length=1, max_length=MAX_INSTRUCTION_LENGTH)
