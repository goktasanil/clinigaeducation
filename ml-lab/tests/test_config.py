from pathlib import Path
import tempfile
import unittest

from ml_lab.config import ConfigError, load_config


def write_config(path: Path, revision: str, trust_remote_code: bool = False) -> None:
    path.write_text(
        f"""
[model]
name_or_path = "local/model"
revision = "{revision}"
trust_remote_code = {str(trust_remote_code).lower()}
use_safetensors = true
qlora_4bit = false

[data]
train_file = "train.jsonl"
eval_file = "eval.jsonl"

[training]
output_dir = "runs/test"

[lora]
r = 8
alpha = 16
dropout = 0.05
target_modules = "all-linear"
""".strip(),
        encoding="utf-8",
    )


class ConfigTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.path = Path(self.temporary_directory.name) / "config.toml"

    def tearDown(self) -> None:
        self.temporary_directory.cleanup()

    def test_config_requires_immutable_revision(self) -> None:
        write_config(self.path, "main")
        with self.assertRaisesRegex(ConfigError, "immutable"):
            load_config(self.path)

    def test_config_rejects_remote_code(self) -> None:
        write_config(self.path, "0123456789abcdef", trust_remote_code=True)
        with self.assertRaisesRegex(ConfigError, "trust_remote_code"):
            load_config(self.path)

    def test_valid_config_has_stable_fingerprint(self) -> None:
        write_config(self.path, "0123456789abcdef")
        first = load_config(self.path)
        second = load_config(self.path)
        self.assertEqual(first.fingerprint(), second.fingerprint())


if __name__ == "__main__":
    unittest.main()
