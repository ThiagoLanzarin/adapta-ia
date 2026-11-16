"""Every error leaves the server as { code, message } in Portuguese (constitution E7)."""

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.models.errors import ErrorCode, ErrorResponse
from app.services.errors import MESSAGES, ServiceError

STATUS: dict[ErrorCode, int] = {
    "AI_QUOTA": 429,
    "AI_TIMEOUT": 504,
    "AI_UNAVAILABLE": 503,
    "AI_INVALID": 502,
    "AI_BLOCKED": 422,
    "FILE_TOO_LARGE": 413,
    "FILE_TYPE": 415,
    "TOO_MANY_SLIDES": 422,
    "INVALID_INPUT": 422,
    "PICTOGRAMS_UNAVAILABLE": 503,
}


def error_response(code: ErrorCode, message: str | None = None) -> JSONResponse:
    body = ErrorResponse(code=code, message=message or MESSAGES[code])
    return JSONResponse(status_code=STATUS[code], content=body.model_dump(by_alias=True))


async def handle_service_error(_: Request, error: Exception) -> JSONResponse:
    assert isinstance(error, ServiceError)
    return error_response(error.code, error.message)


async def handle_validation_error(_: Request, __: Exception) -> JSONResponse:
    return error_response("INVALID_INPUT")


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(ServiceError, handle_service_error)
    app.add_exception_handler(RequestValidationError, handle_validation_error)
