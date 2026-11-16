"""Pictogram alternatives for the teacher (spec 004)."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_pictogram_service
from app.models.pictograms import PictogramSearch
from app.services.pictogram_service import PictogramService

router = APIRouter(prefix="/api")

MAX_QUERY_LENGTH = 50


@router.get("/pictograms", response_model=PictogramSearch, response_model_by_alias=True)
def search_pictograms(
    q: Annotated[str, Query(min_length=1, max_length=MAX_QUERY_LENGTH)],
    service: Annotated[PictogramService, Depends(get_pictogram_service)],
) -> PictogramSearch:
    return service.alternatives(q.strip())
