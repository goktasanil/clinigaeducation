from __future__ import annotations

from pathlib import Path
import csv
import io
import json


def parse_document(path: str) -> str:
    p = Path(path)
    suffix = p.suffix.lower()
    if suffix in {'.txt', '.md', '.rst'}:
        return p.read_text(encoding='utf-8', errors='ignore')
    if suffix == '.json':
        data = json.loads(p.read_text(encoding='utf-8', errors='ignore'))
        return json.dumps(data, ensure_ascii=False, indent=2)
    if suffix == '.csv':
        raw = p.read_text(encoding='utf-8', errors='ignore')
        rows = list(csv.reader(io.StringIO(raw)))
        return '\n'.join(' | '.join(cell.strip() for cell in row) for row in rows)
    if suffix == '.pdf':
        from pypdf import PdfReader
        reader = PdfReader(str(p))
        return '\n\n'.join((page.extract_text() or '').strip() for page in reader.pages)
    if suffix == '.docx':
        from docx import Document
        doc = Document(str(p))
        return '\n'.join(paragraph.text.strip() for paragraph in doc.paragraphs if paragraph.text.strip())
    raise ValueError(f'Unsupported file type: {suffix}')
