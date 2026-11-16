"""Health check: wakes the server before the demo and tells which AI is on."""

from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/health")
def health(request: Request) -> dict[str, str]:
    """aiProvider lets the screen warn when the answers come from the fake AI."""
    return {"status": "ok", "aiProvider": request.app.state.ai_provider_name}
