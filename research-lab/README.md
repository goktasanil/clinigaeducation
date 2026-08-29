# CliniGA Thesis Research Lab

An auditable, model-agnostic research layer for thesis and publication work. It is designed to sit on top of the Secure Intelligence Suite and its offline PaperQA contract without changing the website runtime.

## What it adds

- structured evidence records with DOI/URL provenance;
- duplicate detection and citation-key validation;
- explicit findings, limitations and risk-of-bias fields;
- PRISMA-style flow arithmetic validation;
- a pinned scientific repository catalogue and task router;
- hard exclusion of repositories whose root software license could not be verified.

The lab helps organize and verify research; it does not write a thesis deceptively, invent references, replace a supervisor, or turn observational evidence into causal proof.

## Verify

```bash
cd research-lab
python -m unittest discover -s tests -v
python -m compileall -q src tests
```

## Workflow

1. Define the research question, population, outcomes, date range and study designs.
2. Record the exact search strings and databases.
3. Add only sources with a DOI or stable URL.
4. Store findings and limitations separately.
5. Validate PRISMA counts before producing a diagram.
6. Route analysis to a reviewed profile; all heavy tools remain optional and isolated.
7. Require human review for every scientific conclusion and citation.

