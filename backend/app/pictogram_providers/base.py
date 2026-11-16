"""What any pictogram source must know how to do (docs/arquitetura.md, section 4)."""

from typing import Protocol


class PictogramUnavailableError(Exception):
    """The pictogram source could not be reached."""


class PictogramProvider(Protocol):
    def search(self, term: str, limit: int = 10) -> list[int]:
        """Up to `limit` pictogram ids for a Portuguese term, best first; empty if none.

        Raises PictogramUnavailableError when the source is down.
        """
        ...
