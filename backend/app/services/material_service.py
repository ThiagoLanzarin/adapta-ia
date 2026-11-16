"""Rule for the material sent by the teacher: exactly one of text, image or slides
(CA-001-04, spec 002)."""

from app.models.material import Material
from app.models.slides import Slide
from app.readers.errors import FileTooLargeError, InvalidTextError, UnsupportedFileError
from app.readers.image_reader import MAX_FILE_BYTES, read_image
from app.readers.text_reader import read_text
from app.services.errors import ServiceError
from app.services.slide_service import slides_to_text

# Upload limit for the route. The route reads one byte more than this, so a file that is too
# large is detected without reading all of it into memory.
MAX_UPLOAD_BYTES = MAX_FILE_BYTES


def read_material(
    text: str | None, image: bytes | None, slides: list[Slide] | None = None
) -> Material:
    has_text = text is not None and text.strip() != ""
    has_image = image is not None and len(image) > 0
    if [has_text, has_image, slides is not None].count(True) != 1:
        raise ServiceError("INVALID_INPUT")
    if slides is not None:
        # The slides become text, with the same limits as pasted text.
        text, has_text = slides_to_text(slides), True
    try:
        return read_text(text) if has_text else read_image(image or b"")
    except FileTooLargeError as error:
        raise ServiceError("FILE_TOO_LARGE") from error
    except UnsupportedFileError as error:
        raise ServiceError("FILE_TYPE") from error
    except InvalidTextError as error:
        raise ServiceError("INVALID_INPUT") from error
