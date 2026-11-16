"""Reasons a material cannot be read. The services turn them into error codes."""


class ReaderError(Exception):
    """Base class for reading failures."""


class UnsupportedFileError(ReaderError):
    """The file is not one of the accepted formats."""


class FileTooLargeError(ReaderError):
    """The file is larger than the limit."""


class InvalidTextError(ReaderError):
    """The pasted text is empty or too long."""
