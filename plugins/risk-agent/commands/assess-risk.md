---
description: Assess findings from a connector or file and create structured risk register entries in Supabase
---

# Assess Risk

Reads connector findings (from `plugins/connectors/*/` output or a raw file) and produces validated risk register entries conforming to `schemas/risk.schema.json`, then upserts them into the Supabase `risks` table.

## Arguments

- `$1` - Source: connector name (e.g. `aws-inspector`) or path to a findings JSON file (required)
- `$2` - Category override: Security | Compliance | Privacy | Operational (optional)

## What the agent does

1. Reads findings from the source — connector output files or a provided JSON path
2. Deduplicates against existing `risks` rows by matching title + category
3. Scores each risk using the `risk-scorer` skill (likelihood × impact, 1–5 scale)
4. Populates `linked_findings` from the source finding IDs and `linked_controls` from `controls` table matches
5. Validates the output against `schemas/risk.schema.json` before writing
6. Upserts into the Supabase `risks` table via the REST API using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from `.env`

## Output

- Summary table: risk_id | title | inherent score | status
- Count of new vs. updated records
- Any validation errors with the offending field

## Example

```bash
/risk-agent:assess-risk aws-inspector Security
/risk-agent:assess-risk ./tests/fixtures/findings/wiz-findings.json
```
