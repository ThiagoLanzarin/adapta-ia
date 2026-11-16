"""Rules for PowerPoint slides (spec 002). The server keeps no file (R-002-02): the slide list
goes back to the screen, and the screen sends back only the chosen slides."""

from app.models.slides import MAX_SELECTED_SLIDES, Slide, SlideList
from app.readers.errors import FileTooLargeError, UnsupportedFileError
from app.readers.pptx_reader import MAX_FILE_BYTES, read_slides
from app.services.errors import ServiceError

# Upload limit for the route.
MAX_SLIDE_FILE_BYTES = MAX_FILE_BYTES

PPTX_FILE_TYPE_MESSAGE = (
    "Não consegui abrir o arquivo. Envie um PowerPoint (.pptx) ou cole o texto."
)


def list_slides(data: bytes) -> SlideList:
    """CA-002-01..04: every slide of the file, or FILE_TYPE / FILE_TOO_LARGE."""
    try:
        return SlideList(slides=read_slides(data))
    except FileTooLargeError as error:
        raise ServiceError("FILE_TOO_LARGE") from error
    except UnsupportedFileError as error:
        raise ServiceError("FILE_TYPE", PPTX_FILE_TYPE_MESSAGE) from error


def slides_to_text(slides: list[Slide]) -> str:
    """CA-002-05..07: 1 to 5 slides become one material, each one marked "Slide N: ...", so
    the AI keeps the original numbering. Slides with neither title nor text are left out."""
    if not slides:
        raise ServiceError("INVALID_INPUT")
    if len(slides) > MAX_SELECTED_SLIDES:
        raise ServiceError("TOO_MANY_SLIDES")
    parts = []
    for slide in sorted(slides, key=lambda current: current.index):
        body = "\n".join(part for part in (slide.title.strip(), slide.text.strip()) if part)
        if body:
            parts.append(f"Slide {slide.index}: {body}")
    return "\n\n".join(parts)
