from __future__ import annotations

from dataclasses import dataclass, field
import re
from urllib.parse import urlparse


DOI_PATTERN = re.compile(r"^10\.\d{4,9}/\S+$", re.IGNORECASE)


def normalize_doi(value: str) -> str:
    doi = value.strip()
    for prefix in ("https://doi.org/", "http://doi.org/", "doi:"):
        if doi.lower().startswith(prefix):
            doi = doi[len(prefix) :]
            break
    doi = doi.strip().lower().rstrip(".,;)")
    if doi and not DOI_PATTERN.fullmatch(doi):
        raise ValueError(f"invalid DOI: {value}")
    return doi


def _stable_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme == "https" and bool(parsed.netloc)


@dataclass(frozen=True)
class EvidenceRecord:
    key: str
    title: str
    year: int
    study_type: str
    finding: str
    limitation: str
    risk_of_bias: str
    doi: str = ""
    url: str = ""
    sample_size: int | None = None
    tags: tuple[str, ...] = field(default_factory=tuple)

    def __post_init__(self) -> None:
        if not self.key.strip() or not self.title.strip():
            raise ValueError("key and title are required")
        if self.year < 1600 or self.year > 2100:
            raise ValueError("year is outside the supported range")
        if not self.finding.strip() or not self.limitation.strip() or not self.risk_of_bias.strip():
            raise ValueError("finding, limitation and risk_of_bias are required")
        normalized = normalize_doi(self.doi)
        object.__setattr__(self, "doi", normalized)
        if not normalized and not _stable_url(self.url):
            raise ValueError("a valid DOI or stable HTTPS URL is required")
        if self.sample_size is not None and self.sample_size <= 0:
            raise ValueError("sample_size must be positive")


class EvidenceMatrix:
    def __init__(self) -> None:
        self._records: dict[str, EvidenceRecord] = {}
        self._identifiers: set[str] = set()

    def add(self, record: EvidenceRecord) -> None:
        if record.key in self._records:
            raise ValueError(f"duplicate evidence key: {record.key}")
        identifier = record.doi or record.url
        if identifier in self._identifiers:
            raise ValueError(f"duplicate source: {identifier}")
        self._records[record.key] = record
        self._identifiers.add(identifier)

    def validate_citations(self, keys: set[str]) -> None:
        missing = sorted(keys.difference(self._records))
        if missing:
            raise ValueError(f"unknown evidence keys: {', '.join(missing)}")

    def records(self) -> tuple[EvidenceRecord, ...]:
        return tuple(self._records.values())

