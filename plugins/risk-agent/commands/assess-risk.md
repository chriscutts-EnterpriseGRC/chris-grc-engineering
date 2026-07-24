---
description: Assess findings from a connector or file and create structured risk register entries, written to local files
---

# Assess Risk

Reads connector findings (from `plugins/connectors/*/` output or a raw file) and produces validated risk register entries conforming to `schemas/risk.schema.json`, then writes them to `reports/risks/`.

## Arguments

- `$1` - Source: connector name (e.g. `aws-inspector`) or path to a findings JSON file (required)
- `$2` - Category override: Security | Compliance | Privacy | Operational (optional)

## What the agent does

1. Reads findings from the source — connector output files or a provided JSON path
2. Deduplicates against existing records in `reports/risks/risk-register.json` by matching title + category
3. Scores each risk using the `risk-scorer` skill (likelihood × impact, 1–5 scale, High Water Mark rule)
4. Populates `linked_findings` from the source finding IDs and `linked_controls` from control matches
5. Populates ISO 27005 fields: `assets`, `threat_agent`, `threat_scenario`, `threat_vectors`, `vulnerabilities`, `consequences`, `affected_parties`, `blast_radius`, `compliance_scope`, `data_classification`
6. Validates the output against `schemas/risk.schema.json` before writing
7. Writes each risk record to `reports/risks/{risk-id}.json` and appends to `reports/risks/risk-register.json`

## Storage

Records are written to `reports/risks/` as JSON files. Each risk gets its own file at `reports/risks/{risk-id}.json`. The register index is maintained at `reports/risks/risk-register.json`.

## Output

- Summary table: risk_id | title | inherent score | status
- Count of new vs. updated records
- Any validation errors with the offending field

## Example

```bash
/risk-agent:assess-risk aws-inspector Security
/risk-agent:assess-risk ./tests/fixtures/findings/wiz-findings.json
```
