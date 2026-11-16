"""Turns a valid AI answer into the API adaptation, applying the spec 001 rules.

Pure functions: no AI, no internet. Pictogram ids are filled later (T06).
"""

from app.models.adaptation import Adaptation, AdaptationWarning, Keyword, Step, is_valid_box
from app.models.ai_adaptation import AiAdaptation, AiStep
from app.models.profile import MaterialType, StudentProfile


def max_keywords(profile: StudentProfile) -> int:
    """R-001-04: maximum keywords per step, from the two visual options of the profile."""
    more = profile.needs_more_images
    clutter = profile.sensitive_to_visual_clutter
    if more and not clutter:
        return 3
    if clutter and not more:
        return 1
    return 2


def clean_keywords(step: AiStep, limit: int) -> list[Keyword]:
    """CA-001-08, CA-001-09, CA-001-17: drop keywords outside the text and over the limit."""
    if step.kind == "text":
        return []
    text = step.text.casefold()
    kept = [k for k in step.keywords if k.word.strip() and k.word.casefold() in text]
    return [
        Keyword(word=k.word, search_term=k.search_term or k.word, pictogram_id=None)
        for k in kept[:limit]
    ]


def clean_step(step: AiStep, index: int, limit: int, has_image: bool) -> Step:
    box = step.figure_box if step.needs_figure and has_image else None
    if box is not None and not is_valid_box(box):
        box = None
    return Step(
        id=f"s{index}",
        kind=step.kind,
        source_number=step.source_number if step.kind == "question" else None,
        text=step.text,
        options=step.options if step.kind == "question" else [],
        keywords=clean_keywords(step, limit),
        needs_figure=step.needs_figure,
        figure_box=box,
    )


def figure_message(step: Step) -> str:
    subject = f"A questão {step.source_number}" if step.source_number else "Uma etapa"
    return (
        f"{subject} depende de uma figura do original. Cole ou desenhe a figura na folha impressa."
    )


def figure_warnings(steps: list[Step]) -> list[AdaptationWarning]:
    """CA-001-19: figure needed but no valid box (or no photo)."""
    return [
        AdaptationWarning(code="NEEDS_FIGURE", message=figure_message(step))
        for step in steps
        if step.needs_figure and step.figure_box is None
    ]


def missing_question_warnings(answer: AiAdaptation, steps: list[Step]) -> list[AdaptationWarning]:
    """CA-001-07: a question of the original that no step covers."""
    covered = {step.source_number for step in steps if step.kind == "question"}
    return [
        AdaptationWarning(
            code="MISSING_QUESTION",
            message=f"A questão {number} do original não aparece na adaptação. "
            "Confira antes de imprimir.",
        )
        for number in answer.source_questions
        if number not in covered
    ]


UNREADABLE = AdaptationWarning(
    code="UNREADABLE",
    message="Não consegui ler a foto. Tire outra com mais luz ou cole o texto.",
)


def build_adaptation(
    answer: AiAdaptation,
    material_type: MaterialType,
    profile: StudentProfile,
    has_image: bool,
) -> Adaptation:
    unreadable = not answer.transcription.strip()
    limit = max_keywords(profile)
    steps = (
        []
        if unreadable
        else [clean_step(s, i, limit, has_image) for i, s in enumerate(answer.steps, start=1)]
    )
    warnings = (
        [UNREADABLE]
        if unreadable
        else figure_warnings(steps) + missing_question_warnings(answer, steps)
    )
    return Adaptation(
        material_type=material_type,
        title=answer.title,
        objective=answer.objective,
        transcription=answer.transcription,
        teacher_notes=answer.teacher_notes,
        warnings=warnings,
        steps=steps,
    )
