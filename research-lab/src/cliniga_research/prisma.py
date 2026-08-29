from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class PrismaFlow:
    records_identified: int
    duplicates_removed: int
    records_screened: int
    title_abstract_excluded: int
    full_text_assessed: int
    full_text_excluded: int
    studies_included: int

    def validate(self) -> None:
        for name, value in vars(self).items():
            if value < 0:
                raise ValueError(f"{name} cannot be negative")
        if self.records_screened != self.records_identified - self.duplicates_removed:
            raise ValueError("records_screened must equal identified minus duplicates")
        if self.full_text_assessed != self.records_screened - self.title_abstract_excluded:
            raise ValueError("full_text_assessed arithmetic is inconsistent")
        if self.studies_included != self.full_text_assessed - self.full_text_excluded:
            raise ValueError("studies_included arithmetic is inconsistent")

