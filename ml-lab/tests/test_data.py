import json
from pathlib import Path
import tempfile
import unittest

from ml_lab.data import overlapping_records, to_prompt_completion, validate_jsonl


def write_lines(path: Path, records: list[dict]) -> None:
    path.write_text("\n".join(json.dumps(item) for item in records) + "\n", encoding="utf-8")


def valid_record(question: str = "What is ML?") -> dict:
    return {
        "messages": [
            {"role": "user", "content": question},
            {"role": "assistant", "content": "A method for learning patterns from data."},
        ]
    }


class DataTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.path = Path(self.temporary_directory.name) / "data.jsonl"

    def tearDown(self) -> None:
        self.temporary_directory.cleanup()

    def test_validates_and_removes_duplicates(self) -> None:
        record = valid_record()
        write_lines(self.path, [record, record])
        report = validate_jsonl(self.path)
        self.assertTrue(report.ok)
        self.assertEqual(len(report.records), 1)
        self.assertTrue(any("duplicate" in warning for warning in report.warnings))

    def test_rejects_secret(self) -> None:
        record = valid_record("Use this token ghp_abcdefghijklmnopqrstuvwxyz123456")
        write_lines(self.path, [record])
        report = validate_jsonl(self.path)
        self.assertFalse(report.ok)
        self.assertTrue(any("GitHub token" in error for error in report.errors))

    def test_requires_assistant_final_message(self) -> None:
        record = {
            "messages": [
                {"role": "assistant", "content": "Hello"},
                {"role": "user", "content": "Hi"},
            ]
        }
        write_lines(self.path, [record])
        report = validate_jsonl(self.path)
        self.assertFalse(report.ok)
        self.assertTrue(any("final message" in error for error in report.errors))

    def test_prompt_completion_conversion(self) -> None:
        record = valid_record()
        converted = to_prompt_completion(record)
        self.assertEqual(converted["prompt"], record["messages"][:-1])
        self.assertEqual(converted["completion"], [record["messages"][-1]])

    def test_overlap_detection(self) -> None:
        record = valid_record()
        self.assertEqual(overlapping_records([record], [record]), 1)
        self.assertEqual(overlapping_records([record], [valid_record("Different")]), 0)


if __name__ == "__main__":
    unittest.main()
