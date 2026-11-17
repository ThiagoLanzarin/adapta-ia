"""Provider-neutral AI errors. Each implementation translates its own errors into these."""


class AiProviderError(Exception):
    """Base class for AI failures."""


class AiQuotaError(AiProviderError):
    """Quota or rate limit reached (HTTP 429). Never retried."""


class AiTimeoutError(AiProviderError):
    """The AI took longer than the time limit."""


class AiUnavailableError(AiProviderError):
    """The AI is overloaded or down (HTTP 5xx)."""


class AiBlockedError(AiProviderError):
    """The AI refused the material (safety block)."""


class AiNotRecordedError(AiProviderError):
    """Replay mode: no answer was recorded for this request (T22)."""
