---
name: risk-assessor
description: Converts raw security findings from connectors or files into validated risk register entries conforming to schemas/risk.schema.json. Handles deduplication, control linkage, and Supabase upsert.
allowed-tools: Read, Write, Bash, WebFetch
---

# Risk Assessor

Transforms connector findings into structured risk records.

## Input contract

Expects an array of finding objects, each with at minimum:
- `id` — stable finding ID (becomes an entry in `linked_findings`)
- `title` — finding description
- `severity` — Critical | High | Medium | Low

## Assessment logic

### Deduplication
Match against existing risks by normalised title + category. If a match exists, update `linked_findings` and re-score rather than creating a duplicate.

### Control linkage
For each finding, search the `controls` table for rows where `frameworks` array or `name` contains keywords from the finding title. Populate `linked_controls` with matched control IDs.

### Risk statement generation
Produce a one-to-two sentence statement: "If [threat], then [asset] could [impact], resulting in [consequence]."

### Owner inference
If the finding source maps to a known team (aws-inspector → Platform Security, okta-inspector → Identity Engineering, etc.), pre-populate the owner field. Otherwise leave `owner.team` as "Unassigned".

## Output contract

Array of objects valid against `schemas/risk.schema.json` with:
- `schema_version`: "1.0.0"
- `risk_id`: auto-generated as `RISK-{YYYYMMDD}-{slug}` for new records
- `status`: "open" for new, unchanged for updates
- `treatment`: "mitigate" as default for new Critical/High; "monitor" for Medium/Low

## Supabase write

Uses `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` env vars.  
Endpoint: `POST /rest/v1/risks?on_conflict=risk_id` with `Prefer: resolution=merge-duplicates`.
