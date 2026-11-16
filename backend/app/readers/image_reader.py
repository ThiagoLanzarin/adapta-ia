"""Reads a photo of the material (RF-01). The format comes from the file's first bytes,
never from the name or the type declared by the browser."""

from app.models.material import Material
from app.readers.errors import FileTooLargeError, UnsupportedFileError

MAX_FILE_BYTES = 20 * 1024 * 1024
HEIF_BRANDS = {b"heic", b"heix", b"hevc", b"heim", b"heis", b"mif1", b"msf1"}


def detect_image_type(data: bytes) -> str | None:
    """MIME type of a PNG, JPEG, WEBP, HEIC or HEIF image; None for anything else."""
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    if data[4:8] == b"ftyp" and data[8:12] in HEIF_BRANDS:
        return "image/heic" if data[8:12] in {b"heic", b"heix", b"heim", b"heis"} else "image/heif"
    return None


def read_image(data: bytes) -> Material:
    if len(data) > MAX_FILE_BYTES:
        raise FileTooLargeError(f"{len(data)} bytes")
    mime_type = detect_image_type(data)
    if mime_type is None:
        raise UnsupportedFileError("not an accepted image")
    return Material(image=data, image_mime_type=mime_type)
