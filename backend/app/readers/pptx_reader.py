"""Reads the text of each slide of a PowerPoint file (RF-02, spec 002).

Only text boxes and tables are read (R-002-03). Speaker notes are for the teacher, not for the
student, so they are never read. Pictures and charts stay for V2.
"""

from io import BytesIO

from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE
from pptx.shapes.base import BaseShape
from pptx.slide import Slide as PptxSlide

from app.models.slides import Slide
from app.readers.errors import FileTooLargeError, UnsupportedFileError

MAX_FILE_BYTES = 20 * 1024 * 1024
TITLE_MAX_CHARS = 80
ZIP_SIGNATURE = b"PK\x03\x04"


def _shape_text(shape: BaseShape) -> list[str]:
    """Non-empty lines of a shape: its paragraphs, its table cells or its grouped shapes."""
    if shape.shape_type == MSO_SHAPE_TYPE.GROUP:
        return [line for inner in _in_reading_order(shape.shapes) for line in _shape_text(inner)]
    if shape.has_table:
        rows = (
            " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
            for row in shape.table.rows
        )
        return [row for row in rows if row]
    if shape.has_text_frame:
        lines = (paragraph.text.strip() for paragraph in shape.text_frame.paragraphs)
        return [line for line in lines if line]
    return []


def _in_reading_order(shapes) -> list[BaseShape]:
    """Top to bottom, then left to right, as a person reads the slide."""
    return sorted(shapes, key=lambda shape: (shape.top or 0, shape.left or 0))


def _title_from_text(text: str) -> str:
    first_line = text.split("\n", 1)[0]
    if len(first_line) <= TITLE_MAX_CHARS:
        return first_line
    return first_line[: TITLE_MAX_CHARS - 1].rstrip() + "…"


def _read_slide(index: int, slide: PptxSlide) -> Slide:
    title_shape = slide.shapes.title
    title = title_shape.text_frame.text.strip() if title_shape is not None else ""
    body = [
        line
        for shape in _in_reading_order(slide.shapes)
        if title_shape is None or shape.shape_id != title_shape.shape_id
        for line in _shape_text(shape)
    ]
    text = "\n".join(body)
    # CA-002-02: without a title, the title is the start of the text.
    return Slide(index=index, title=title or _title_from_text(text), text=text)


def read_slides(data: bytes) -> list[Slide]:
    """Every slide in file order, numbered from 1 (CA-002-01). The title is not repeated in
    the text."""
    if len(data) > MAX_FILE_BYTES:
        raise FileTooLargeError(f"{len(data)} bytes")
    if not data.startswith(ZIP_SIGNATURE):
        raise UnsupportedFileError("not a .pptx")
    try:
        presentation = Presentation(BytesIO(data))
        return [_read_slide(number, slide) for number, slide in enumerate(presentation.slides, 1)]
    except Exception as error:  # any parsing failure means a broken file
        raise UnsupportedFileError("broken or not a .pptx") from error
