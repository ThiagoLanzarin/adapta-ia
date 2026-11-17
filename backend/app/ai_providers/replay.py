"""Recorded answers for the demo (T22, docs/arquitetura.md, section 7).

In the rehearsal, the Gemini provider runs wrapped by RecordingAiProvider (AI_RECORD=on):
each answer is saved in replay_answers/, named by a hash of the request. With
AI_PROVIDER=replay, ReplayAiProvider gives back the saved answer for the same request,
without calling the internet.

The request holds the prompt (material text, profile, material type) and the photo, so the
same material with the same profile finds the same answer. Anything else gives
AiNotRecordedError.
"""

import hashlib
import json
import logging
from pathlib import Path

from app.ai_providers.base import AiProvider, AiRequest
from app.ai_providers.errors import AiNotRecordedError

ANSWERS_DIR = Path(__file__).parent / "replay_answers"

logger = logging.getLogger(__name__)


def request_key(request: AiRequest) -> str:
    digest = hashlib.sha256(request.prompt.encode("utf-8"))
    digest.update(b"\0")
    digest.update(request.image or b"")
    return digest.hexdigest()[:32]


def _answer_path(directory: Path, request: AiRequest) -> Path:
    return directory / f"{request_key(request)}.json"


class ReplayAiProvider:
    def __init__(self, directory: Path = ANSWERS_DIR) -> None:
        self._directory = directory

    def generate(self, request: AiRequest) -> str:
        path = _answer_path(self._directory, request)
        if not path.is_file():
            # Only the hash goes to the log: never the material or the profile.
            logger.warning("replay: no recorded answer for %s", path.stem)
            raise AiNotRecordedError(path.stem)
        return json.loads(path.read_text(encoding="utf-8"))["answer"]


class RecordingAiProvider:
    """Wraps the real AI and saves every answer it gives. Errors are not saved."""

    def __init__(self, inner: AiProvider, directory: Path = ANSWERS_DIR) -> None:
        self._inner = inner
        self._directory = directory

    def generate(self, request: AiRequest) -> str:
        answer = self._inner.generate(request)
        self._directory.mkdir(parents=True, exist_ok=True)
        path = _answer_path(self._directory, request)
        path.write_text(json.dumps({"answer": answer}, ensure_ascii=False), encoding="utf-8")
        logger.warning("replay: recorded %s", path.stem)
        return answer
