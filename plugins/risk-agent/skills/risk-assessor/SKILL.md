---
name: risk-assessor
description: Converts raw security findings from connectors or files into validated risk register entries conforming to schemas/risk.schema.json. Handles deduplication, control linkage, and ISO 27005 field population. Writes to local files.
allowed-tools: Read, Write
---

# Risk Assessor

Transforms connector findings into structured risk records conforming to the full ISO 27005 schema.

## Input contract

Expects an array of finding objects, each with at minimum:
- `id` — stable finding ID (becomes an entry in `linked_findings`)
- `title` — finding description
- `severity` — Critical | High | Medium | Low

## Assessment logic

### Deduplication
Match against existing records in `reports/risks/risk-register.json` by normalised title + category. If a match exists, update `linked_findings` and re-score rather than creating a duplicate.

### Control linkage
For each finding, search available controls for entries where frameworks or name contains keywords from the finding title. Populate `linked_controls` with matched control IDs.

### ISO 27005 field population
For each risk record, populate:
- `assets` — identify affected systems, data, services, or processes from the finding context
- `threat_agent` — identify the entity or source capable of causing harm
- `threat_scenario` — narrative of how the threat materializes against the asset
- `threat_vectors` — discrete pathways by which the threat reaches the asset
- `vulnerabilities` — weaknesses the threat exploits, with CVE if applicable
- `consequences` — outcomes if the risk materializes
- `affected_parties` — who is impacted; mark `(inferred)` if reasoned from context
- `blast_radius` — downstream exposure; mark `(inferred)` if not explicitly stated
- `compliance_scope` — regulatory frameworks implicated; mark `(inferred)` if reasoned
- `data_classification` — Restricted | Confidential | Public | Unknown | Not Applicable

### Risk ID generation
Generate IDs as `[JIRA_PROJECT_KEY]-{YYYY}-{NNNN}` where NNNN is zero-padded and sequential within the year. Replace `[JIRA_PROJECT_KEY]` with the configured project key once Jira is set up. Until then use `RSK` as the prefix (e.g. `RSK-2026-0001`).

### Owner inference
If the finding source maps to a known team (aws-inspector → Platform Security, okta-inspector → Identity Engineering), pre-populate the owner field. Otherwise leave `owner.team` as "Unassigned".

## Output contract

Array of objects valid against `schemas/risk.schema.json` with:
- `schema_version`: "1.0.0"
- `risk_id`: generated as described above
- `status`: "open" for new records, unchanged for updates
- `treatment`: "mitigate" as default for Critical/Severe/High; "monitor" for Moderate/Low

## Storage

Writes each record to `reports/risks/{risk-id}.json`. Updates the register index at `reports/risks/risk-register.json`.
