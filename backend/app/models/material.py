"""The material sent by the teacher, already read into one shape (by the readers)."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Material:
    text: str | None = None
    image: bytes | None = None
    image_mime_type: str | None = None

    @property
    def has_image(self) -> bool:
        return self.image is not None
