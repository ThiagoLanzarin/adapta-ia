"""Rule for the material sent by the teacher: exactly one of text or image (CA-001-04)."""

from app.models.material import Material
from app.readers.errors import FileTooLargeError, InvalidTextError, UnsupportedFileError
from app.readers.image_reader import MAX_FILE_BYTES, read_image
from app.readers.text_reader import read_text
from app.services.errors import ServiceError

# Upload limit for the route. The route reads one byte more than this, so a file that is too
# large is detected without reading all of it into memory.
MAX_UPLOAD_BYTES = MAX_FILE_BYTES


def read_material(text: str | None, image: bytes | None) -> Material:
    has_text = text is not None and text.strip() != ""
    has_image = image is not None and len(image) > 0
    if has_text == has_image:
        raise ServiceError("INVALID_INPUT")
    try:
        return read_text(text) if has_text else read_image(image or b"")
    except FileTooLargeError as error:
        raise ServiceError("FILE_TOO_LARGE") from error
    except UnsupportedFileError as error:
        raise ServiceError("FILE_TYPE") from error
    except InvalidTextError as error:
        raise ServiceError("INVALID_INPUT") from error
