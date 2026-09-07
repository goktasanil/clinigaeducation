from __future__ import annotations

import ast
import re
from dataclasses import dataclass, field
from pathlib import Path

_TOKEN = re.compile(r"[A-Za-z_][A-Za-z0-9_]{2,}")
_PATH = re.compile(r"(?:^|[\s'\"(])([A-Za-z0-9_./-]+\.(?:py|ts|tsx|js|jsx|go|rs|java|rb|php))(?:[:\s)'\"]|$)")
_JS_SYMBOL = re.compile(r"(?:export\s+)?(?:async\s+)?(?:function|class)\s+([A-Za-z_$][\w$]*)|(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=")


@dataclass(frozen=True)
class FileMap:
    path: str
    symbols: tuple[str, ...] = ()
    imports: tuple[str, ...] = ()
    lines: int = 0
    centrality: int = 0


@dataclass(frozen=True)
class RankedFile:
    path: str
    score: float
    reasons: tuple[str, ...] = ()


class RepositoryMap:
    """Compact repository map for issue localization.

    Inspired by repo-map style coding agents: extract symbols/imports, then rank
    only the most relevant files into the active context budget. It never edits
    files or executes commands.
    """

    SUFFIXES = {".py", ".ts", ".tsx", ".js", ".jsx", ".go", ".rs", ".java", ".rb", ".php"}
    SKIP_PARTS = {".git", "node_modules", "dist", "build", ".venv", "venv", "__pycache__"}

    def __init__(self, root: str | Path = ".", max_files: int = 5000) -> None:
        self.root = Path(root).resolve()
        self.max_files = max_files
        self.files: dict[str, FileMap] = {}

    def build(self) -> "RepositoryMap":
        records: dict[str, FileMap] = {}
        for index, path in enumerate(self.root.rglob("*")):
            if index > self.max_files * 20:
                break
            if len(records) >= self.max_files:
                break
            if not path.is_file() or path.suffix.lower() not in self.SUFFIXES:
                continue
            if any(part in self.SKIP_PARTS for part in path.parts):
                continue
            rel = path.relative_to(self.root).as_posix()
            try:
                text = path.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            symbols, imports = self._extract(path.suffix.lower(), text)
            records[rel] = FileMap(rel, tuple(symbols[:80]), tuple(imports[:80]), text.count("\n") + 1, 0)
        incoming = {name: 0 for name in records}
        basenames = {Path(name).stem: name for name in records}
        for record in records.values():
            for imported in record.imports:
                key = imported.split(".")[-1]
                target = basenames.get(key)
                if target and target != record.path:
                    incoming[target] += 1
        self.files = {
            name: FileMap(rec.path, rec.symbols, rec.imports, rec.lines, incoming[name])
            for name, rec in records.items()
        }
        return self

    def rank(self, issue: str, failure_log: str = "", limit: int = 12) -> list[RankedFile]:
        if not self.files:
            self.build()
        issue_terms = {t.lower() for t in _TOKEN.findall(issue)}
        failure_terms = {t.lower() for t in _TOKEN.findall(failure_log)}
        mentioned_paths = {m.group(1).lstrip("./") for m in _PATH.finditer(issue + "\n" + failure_log)}
        ranked: list[RankedFile] = []
        for rec in self.files.values():
            haystack = " ".join([rec.path, *rec.symbols, *rec.imports]).lower()
            score = 0.0
            reasons: list[str] = []
            lexical = sum(1 for term in issue_terms if term in haystack)
            if lexical:
                score += lexical * 2.0
                reasons.append(f"issue-term overlap={lexical}")
            failure_overlap = sum(1 for term in failure_terms if term in haystack)
            if failure_overlap:
                score += failure_overlap * 1.25
                reasons.append(f"failure-term overlap={failure_overlap}")
            if rec.path in mentioned_paths or any(rec.path.endswith(path) for path in mentioned_paths):
                score += 30.0
                reasons.append("explicit path/stack-trace mention")
            if Path(rec.path).name.lower() in issue.lower():
                score += 12.0
                reasons.append("filename mentioned")
            if rec.centrality:
                score += min(5.0, rec.centrality * 0.5)
                reasons.append(f"dependency centrality={rec.centrality}")
            if score > 0:
                ranked.append(RankedFile(rec.path, score, tuple(reasons)))
        ranked.sort(key=lambda item: (-item.score, item.path))
        return ranked[: max(1, limit)]

    def render(self, ranked: list[RankedFile], max_chars: int = 12000) -> str:
        blocks: list[str] = []
        used = 0
        for item in ranked:
            rec = self.files[item.path]
            block = (
                f"{item.path} score={item.score:.2f} lines={rec.lines} centrality={rec.centrality}\n"
                f"symbols: {', '.join(rec.symbols[:30]) or '-'}\n"
                f"imports: {', '.join(rec.imports[:20]) or '-'}\n"
                f"reasons: {'; '.join(item.reasons)}\n"
            )
            if used + len(block) > max_chars:
                break
            blocks.append(block)
            used += len(block)
        return "\n".join(blocks)

    @staticmethod
    def _extract(suffix: str, text: str) -> tuple[list[str], list[str]]:
        if suffix == ".py":
            try:
                tree = ast.parse(text)
            except SyntaxError:
                return [], []
            symbols: list[str] = []
            imports: list[str] = []
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                    symbols.append(node.name)
                elif isinstance(node, ast.Import):
                    imports.extend(alias.name for alias in node.names)
                elif isinstance(node, ast.ImportFrom) and node.module:
                    imports.append(node.module)
            return symbols, imports
        symbols = [a or b for a, b in _JS_SYMBOL.findall(text) if a or b]
        imports = re.findall(r"(?:from\s+|require\(['\"])([A-Za-z0-9_./@-]+)", text)
        return symbols, imports
