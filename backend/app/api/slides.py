"""POST /api/slides: the slide list of a PowerPoint file (spec 002, CA-002-01..04)."""

from typing import Annotated

from fastapi import APIRouter, File, UploadFile

from app.models.slides import SlideList
from app.services.slide_service import MAX_SLIDE_FILE_BYTES, list_slides

router = APIRouter(prefix="/api")


@router.post("/slides", response_model=SlideList, response_model_by_alias=True)
def create_slide_list(file: Annotated[UploadFile, File()]) -> SlideList:
    # One byte more than the limit: a file that is too large is detected without reading it all.
    return list_slides(file.file.read(MAX_SLIDE_FILE_BYTES + 1))
