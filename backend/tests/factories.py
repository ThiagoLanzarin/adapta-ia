"""Builders of AI answers for the tests."""

import json


def ai_step(**changes) -> dict:
    step = {
        "kind": "question",
        "sourceNumber": "1",
        "text": "O sol aquece a água. Como se chama essa etapa?",
        "options": ["a) Condensação", "b) Evaporação"],
        "keywords": [{"word": "sol", "searchTerm": "sol"}],
        "needsFigure": False,
        "figureBox": None,
    }
    return step | changes


def ai_answer(steps: list[dict] | None = None, **changes) -> dict:
    answer = {
        "title": "Prova de Ciências",
        "objective": "Ciclo da água",
        "transcription": "1) Como se chama a etapa em que a água vira vapor?",
        "sourceQuestions": ["1"],
        "teacherNotes": [],
        "steps": steps if steps is not None else [ai_step()],
    }
    return answer | changes


def ai_answer_json(steps: list[dict] | None = None, **changes) -> str:
    return json.dumps(ai_answer(steps, **changes), ensure_ascii=False)
