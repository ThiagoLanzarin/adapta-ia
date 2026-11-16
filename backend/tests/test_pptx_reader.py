"""PowerPoint reader (T07, spec 002). The route and the AI call are T08b."""

from io import BytesIO
from zipfile import ZipFile

import pytest

from app.readers.errors import FileTooLargeError, UnsupportedFileError
from app.readers.pptx_reader import MAX_FILE_BYTES, TITLE_MAX_CHARS, read_slides
from tests.pptx_factory import (
    add_blank,
    add_table,
    add_text_box,
    add_title_and_content,
    build_pptx,
    set_notes,
)


def test_ca_002_01_every_slide_with_number_title_and_text_in_order():
    def build(presentation):
        add_title_and_content(
            presentation, "Ciclo da água", ["O sol aquece a água.", "A água sobe."]
        )
        add_title_and_content(presentation, "Questão 1", ["Como se chama essa etapa?"])

    slides = read_slides(build_pptx(build))

    assert [(slide.index, slide.title, slide.text) for slide in slides] == [
        (1, "Ciclo da água", "O sol aquece a água.\nA água sobe."),
        (2, "Questão 1", "Como se chama essa etapa?"),
    ]


def test_ca_002_01_text_boxes_are_read_top_to_bottom():
    def build(presentation):
        slide = add_blank(presentation)
        add_text_box(slide, "b) Evaporação", top=3)
        add_text_box(slide, "1. Como se chama essa etapa?", top=1)
        add_text_box(slide, "a) Condensação", top=2)

    [slide] = read_slides(build_pptx(build))

    assert slide.text == "1. Como se chama essa etapa?\na) Condensação\nb) Evaporação"


def test_ca_002_02_slide_without_title_takes_the_start_of_its_text():
    def build(presentation):
        add_text_box(add_blank(presentation), "Leia o texto com atenção.\nDepois responda.", top=1)

    [slide] = read_slides(build_pptx(build))

    assert slide.title == "Leia o texto com atenção."
    assert slide.text == "Leia o texto com atenção.\nDepois responda."


def test_ca_002_02_long_first_line_is_cut_for_the_title():
    def build(presentation):
        add_text_box(add_blank(presentation), "palavra " * 30, top=1)

    [slide] = read_slides(build_pptx(build))

    assert len(slide.title) == TITLE_MAX_CHARS
    assert slide.title.endswith("…")


def test_ca_002_02_slide_without_text_comes_with_empty_text():
    def build(presentation):
        add_title_and_content(presentation, "Questão 1", ["Qual é a cor do céu?"])
        add_blank(presentation)

    slides = read_slides(build_pptx(build))

    assert (slides[1].index, slides[1].title, slides[1].text) == (2, "", "")


def test_ca_002_08_table_text_is_read_and_speaker_notes_are_not():
    def build(presentation):
        slide = add_title_and_content(presentation, "Chuva por mês", ["Olhe a tabela."])
        add_table(slide, [["Mês", "Chuva"], ["Janeiro", "200 mm"]], top=4)
        set_notes(slide, "Resposta: janeiro. Não ler para a turma.")

    [slide] = read_slides(build_pptx(build))

    assert slide.text == "Olhe a tabela.\nMês | Chuva\nJaneiro | 200 mm"
    assert "Resposta" not in slide.text


@pytest.mark.parametrize(
    "data",
    [
        b"%PDF-1.7 not a presentation",
        b"PK\x03\x04 broken zip",
        b"",
    ],
    ids=["pdf", "broken-zip", "empty"],
)
def test_ca_002_03_not_a_pptx_or_broken_is_unsupported(data):
    with pytest.raises(UnsupportedFileError):
        read_slides(data)


def test_ca_002_03_other_zip_file_is_unsupported():
    output = BytesIO()
    with ZipFile(output, "w") as archive:
        archive.writestr("word/document.xml", "<document/>")

    with pytest.raises(UnsupportedFileError):
        read_slides(output.getvalue())


def test_ca_002_04_file_above_20_mb_is_too_large():
    with pytest.raises(FileTooLargeError):
        read_slides(b"PK\x03\x04" + b"0" * MAX_FILE_BYTES)


def test_ca_002_01_text_inside_grouped_shapes_is_read():
    def build(presentation):
        group = add_blank(presentation).shapes.add_group_shape()
        add_text_box(group, "2. Qual é a cor do céu?", top=1)
        add_text_box(group, "a) azul", top=2)

    [slide] = read_slides(build_pptx(build))

    assert slide.text == "2. Qual é a cor do céu?\na) azul"
