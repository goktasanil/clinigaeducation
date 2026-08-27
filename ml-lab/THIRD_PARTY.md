# Third-party review

Live GitHub review date: 2026-08-27 UTC. Stars are visibility signals, not quality or security guarantees.

| Repository | Pinned package | Maintenance signal | License signal | Security policy | Use |
|---|---:|---|---|---|---|
| `huggingface/transformers` | 5.16.1 | Release 2026-08-26; commit `155b8993` on 2026-08-27 | Apache-2.0 | Present | Model/tokenizer runtime |
| `huggingface/trl` | 1.12.0 | Release 2026-08-26; commit `e17a8ae6` on 2026-08-27 | Apache-2.0 | Present | SFT trainer |
| `huggingface/peft` | 0.20.0 | Release 2026-07-28; commit `13414e66` on 2026-08-27 | Apache-2.0 | Present | LoRA adapters |
| `pytorch/pytorch` | 2.13.0 | Release 2026-07-08; active 2026-08-27 | Repository `LICENSE` contains PyTorch and bundled third-party notices | Repository policy must be reviewed before redistribution | Tensor/GPU runtime |
| `huggingface/datasets` | 5.0.1 | Release 2026-07-28; active 2026-08-27 | Apache-2.0 | Review at upgrade | Dataset loading |
| `huggingface/accelerate` | 1.14.0 | Release 2026-06-11; active 2026-08-26 | Apache-2.0 | Review at upgrade | Distributed launch |
| `bitsandbytes-foundation/bitsandbytes` | 0.50.2 | Release 2026-08-27 | MIT | Review at upgrade | Optional 4-bit QLoRA |

Axolotl and Unsloth were reviewed but not included in the first core. Both were active and Apache-2.0 at review time, but a root `SECURITY.md` was not found through the checked GitHub path. Their additional abstraction and dependency surface were not needed for the first reproducible SFT path.

The code licenses above do not grant rights to any model weights or training dataset. Record those separately for every experiment.

