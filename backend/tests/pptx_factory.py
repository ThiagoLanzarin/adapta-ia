"""Builds small .pptx files for the tests, so no binary file lives in the repository."""

from io import BytesIO

from pptx import Presentation
from pptx.util import Inches

TITLE_ONLY = 5
TITLE_AND_CONTENT = 1
BLANK = 6


def build_pptx(build) -> bytes:
    """Runs `build(presentation)` and returns the saved file."""
    presentation = Presentation()
    build(presentation)
    output = BytesIO()
    presentation.save(output)
    return output.getvalue()


def add_title_and_content(presentation, title: str, lines: list[str]):
    slide = presentation.slides.add_slide(presentation.slide_layouts[TITLE_AND_CONTENT])
    slide.shapes.title.text = title
    body = slide.placeholders[1].text_frame
    body.text = lines[0]
    for line in lines[1:]:
        body.add_paragraph().text = line
    return slide


def add_text_box(slide, text: str, top: float, left: float = 1.0):
    box = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(4), Inches(1))
    box.text_frame.text = text
    return box


def add_blank(presentation):
    return presentation.slides.add_slide(presentation.slide_layouts[BLANK])


def add_table(slide, rows: list[list[str]], top: float):
    shape = slide.shapes.add_table(
        len(rows), len(rows[0]), Inches(1), Inches(top), Inches(6), Inches(2)
    )
    for row_index, row in enumerate(rows):
        for column_index, value in enumerate(row):
            shape.table.cell(row_index, column_index).text = value
    return shape


def set_notes(slide, text: str):
    slide.notes_slide.notes_text_frame.text = text
