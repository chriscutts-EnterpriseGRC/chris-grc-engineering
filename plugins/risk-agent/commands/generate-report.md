---
description: Generate a risk register report from local files in Markdown, JSON, or CSV
---

# Generate Report

Produces a full risk register report from `reports/risks/`, suitable for board reporting, audit evidence, or stakeholder review.

## Arguments

- `$1` - Output format: markdown | json | csv (default: markdown)
- `$2` - Output file path (optional, prints to stdout if omitted)
- `$3` - Status filter: open | all | closed (default: all)

## Report sections (markdown)

1. **Executive Summary** — total risks by severity band, trend vs. previous review
2. **Risk Register** — full table sorted by inherent score descending
3. **Treatment Coverage** — breakdown by treatment type (mitigate / accept / transfer / avoid / monitor)
4. **Control Gaps** — risks whose `linked_controls` reference ineffective or untested controls
5. **Overdue Items** — risks past `target_close_at` still open, grouped by owner
6. **Vendor Risks** — risks tagged with vendor names cross-referenced against vendor records

## What the agent does

1. Reads all risk records from `reports/risks/risk-register.json` filtered by status
2. Loads full records from `reports/risks/{risk-id}.json` for detail sections
3. Joins `linked_controls` against the controls list for effectiveness data
4. Renders the chosen format and writes to file or stdout

## Example

```bash
/risk-agent:generate-report markdown ./docs/risk-register-2026-Q2.md all
/risk-agent:generate-report json
/risk-agent:generate-report csv ./exports/risks.csv open
```
