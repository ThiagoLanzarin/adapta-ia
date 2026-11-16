"""POST /api/adaptations: text or photo in, adapted sheet out (spec 001)."""

from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile
from pydantic import ValidationError

from app.api.dependencies import get_adaptation_service
from app.models.adaptation import Adaptation
from app.models.profile import MaterialType, StudentProfile
from app.services.adaptation_service import AdaptationService
from app.services.errors import ServiceError
from app.services.material_service import MAX_UPLOAD_BYTES

router = APIRouter(prefix="/api")


def parse_profile(raw: str) -> StudentProfile:
    try:
        return StudentProfile.model_validate_json(raw)
    except ValidationError as error:
        raise ServiceError("INVALID_INPUT") from error


@router.post("/adaptations", response_model=Adaptation, response_model_by_alias=True)
def create_adaptation(
    service: Annotated[AdaptationService, Depends(get_adaptation_service)],
    material_type: Annotated[MaterialType, Form(alias="materialType")],
    profile: Annotated[str, Form()],
    text: Annotated[str | None, Form()] = None,
    file: Annotated[UploadFile | None, File()] = None,
) -> Adaptation:
    image = file.file.read(MAX_UPLOAD_BYTES + 1) if file is not None else None
    return service.adapt_submission(text, image, material_type, parse_profile(profile))
