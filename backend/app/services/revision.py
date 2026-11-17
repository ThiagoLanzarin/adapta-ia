"""Rules of the new version on request (spec 005). Pure functions: no AI, no internet.

The new version starts from the current sheet, with the teacher's edits (R-005-01). The server
keeps no photo, so the AI never sees the figures: their boxes come back from the current sheet.
"""

from app.models.adaptation import Adaptation, Step
from app.models.ai_adaptation import AiAdaptation

KIND_LABELS = {"instruction": "instrução", "text": "texto de apoio", "question": "questão"}


def _step_lines(step: Step) -> list[str]:
    label = KIND_LABELS[step.kind]
    if step.source_number:
        label += f" {step.source_number}"
    if step.needs_figure:
        label += ", usa uma figura do original"
    return [f"[{label}] {step.text}", *(f"    {option}" for option in step.options)]


def sheet_to_text(adaptation: Adaptation) -> str:
    """CA-005-02: the sheet as the teacher left it, written for the AI."""
    lines = [f"Título: {adaptation.title}"]
    for step in adaptation.steps:
        lines.extend(_step_lines(step))
    return "\n".join(lines)


def _figure_boxes(adaptation: Adaptation) -> dict[str, list[int]]:
    boxes: dict[str, list[int]] = {}
    for step in adaptation.steps:
        if step.source_number and step.figure_box is not None:
            boxes.setdefault(step.source_number, step.figure_box)
    return boxes


def keep_current_sheet_facts(answer: AiAdaptation, current: Adaptation) -> AiAdaptation:
    """What the AI must not change in a new version:

    - the transcription of the original (the AI only saw the adapted sheet);
    - the question numbers, so MISSING_QUESTION is checked against the sheet (CA-005-03);
    - the figure boxes, by question number (the AI never sees the photo).
    """
    boxes = _figure_boxes(current)
    steps = []
    for step in answer.steps:
        box = boxes.get(step.source_number or "") if step.kind == "question" else None
        steps.append(
            step.model_copy(
                update={"figure_box": box, "needs_figure": step.needs_figure or box is not None}
            )
        )
    numbers = [s.source_number for s in current.steps if s.kind == "question" and s.source_number]
    return answer.model_copy(
        update={
            "transcription": current.transcription,
            "source_questions": list(dict.fromkeys(numbers)),
            "steps": steps,
        }
    )


def has_figures(adaptation: Adaptation) -> bool:
    return any(step.figure_box is not None for step in adaptation.steps)
