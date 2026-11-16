"""Errors of the system rules, with the messages the teacher sees (spec 001, error table)."""

from app.models.errors import ErrorCode

MESSAGES: dict[ErrorCode, str] = {
    "AI_QUOTA": "A IA gratuita atingiu o limite. Tente em alguns minutos ou cole o texto.",
    "AI_TIMEOUT": "A IA demorou para responder. Tente de novo.",
    "AI_UNAVAILABLE": "A IA demorou para responder. Tente de novo.",
    "AI_INVALID": "Não consegui montar a folha. Tente de novo ou cole o texto.",
    "AI_BLOCKED": "A IA recusou este material. Confira se a foto é da prova em branco.",
    "FILE_TOO_LARGE": "O arquivo passa de 20 MB. Tire a foto de novo ou cole o texto.",
    "FILE_TYPE": "Envie uma foto (JPG, PNG, WEBP ou HEIC) ou cole o texto.",
    "TOO_MANY_SLIDES": "Escolha até 5 slides por vez.",
    "INVALID_INPUT": "Confira o material e as opções e tente de novo.",
}


class AdaptationError(Exception):
    def __init__(self, code: ErrorCode, message: str | None = None) -> None:
        self.code = code
        self.message = message or MESSAGES[code]
        super().__init__(self.message)
