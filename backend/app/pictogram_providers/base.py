"""What any pictogram source must know how to do (docs/arquitetura.md, section 4)."""

from typing import Protocol


class PictogramUnavailableError(Exception):
    """The pictogram source could not be reached."""


class PictogramProvider(Protocol):
    def search(self, term: str, limit: int = 10, exact: bool = False) -> list[int]:
        """Up to `limit` pictogram ids for a Portuguese term, best first; empty if none.

        `exact` keeps only pictograms named by the term itself (R-001-10): no close matches.

        Raises PictogramUnavailableError when the source is down.
        """
        ...
