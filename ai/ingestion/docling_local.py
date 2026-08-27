from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

_ALLOWED_SUFFIXES = {
    ".pdf",
    ".docx",
    ".pptx",
    ".xlsx",
    ".html",
    ".htm",
    ".md",
    ".txt",
}


@dataclass(frozen=True)
class ParsedDocument:
    source: str
    markdown: str
    bytes_read: int
    parser: str = "docling"
    trusted: bool = False


class LocalDoclingParser:
    """Parse approved local documents without permitting URL or path escape."""

    def __init__(
        self,
        root: str | Path,
        *,
        max_bytes: int = 50 * 1024 * 1024,
        max_output_chars: int = 2_000_000,
        converter_factory: Callable[[], Any] | None = None,
    ) -> None:
        self.root = Path(root).resolve()
        self.max_bytes = max_bytes
        self.max_output_chars = max_output_chars
        self.converter_factory = converter_factory

    def _resolve(self, source: str | Path) -> Path:
        raw = str(source)
        if "://" in raw or raw.startswith(("data:", "file:")):
            raise PermissionError("remote and URI document sources are disabled")
        candidate = (self.root / source).resolve() if not Path(source).is_absolute() else Path(source).resolve()
        if not candidate.is_relative_to(self.root):
            raise PermissionError("document path escapes the approved root")
        if not candidate.is_file():
            raise FileNotFoundError(candidate)
        if candidate.suffix.lower() not in _ALLOWED_SUFFIXES:
            raise ValueError("document format is not allowlisted")
        size = candidate.stat().st_size
        if size <= 0 or size > self.max_bytes:
            raise ValueError("document size is outside the allowed range")
        return candidate

    def _converter(self) -> Any:
        if self.converter_factory is not None:
            return self.converter_factory()
        try:
            from docling.document_converter import DocumentConverter
        except ImportError as exc:
            raise RuntimeError("Install ai/requirements-capabilities.txt in an isolated image") from exc
        return DocumentConverter()

    def parse(self, source: str | Path) -> ParsedDocument:
        candidate = self._resolve(source)
        result = self._converter().convert(str(candidate))
        document = getattr(result, "document", None)
        export = getattr(document, "export_to_markdown", None)
        if not callable(export):
            raise TypeError("Docling result does not expose export_to_markdown")
        markdown = export()
        if not isinstance(markdown, str) or not markdown.strip():
            raise ValueError("document conversion produced no text")
        if len(markdown) > self.max_output_chars:
            raise ValueError("converted document exceeds the output limit")
        return ParsedDocument(
            source=str(candidate.relative_to(self.root)),
            markdown=markdown,
            bytes_read=candidate.stat().st_size,
        )
