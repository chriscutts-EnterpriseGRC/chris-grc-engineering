---
description: Generate a risk register report from Supabase data in Markdown or JSON
---

# Generate Report

Produces a full risk register report from the Supabase `risks` table, suitable for board reporting, audit evidence, or stakeholder review.

## Arguments

- `$1` - Output format: markdown | json | csv (default: markdown)
- `$2` - Output file path (optional, prints to stdout if omitted)
- `$3` - Status filter: open | all | closed (default: all)

## Report sections (markdown)

1. **Executive Summary** — total risks by severity band, trend vs. previous review
2. **Risk Register** — full table sorted by inherent score
3. **Treatment Coverage** — breakdown by treatment type (mitigate / accept / transfer / avoid / monitor)
4. **Control Gaps** — risks whose `linked_controls` reference ineffective controls
5. **Overdue Items** — risks past `target_close_at` still open
6. **Vendor Risks** — risks tagged with vendor names cross-referenced against the `vendors` table

## What the agent does

1. Fetches all matching risks from Supabase
2. Joins `linked_controls` against the `controls` table for effectiveness data
3. Joins vendor-tagged risks against the `vendors` table for tier/risk_score
4. Renders the chosen format and writes to file or stdout

## Example

```bash
/risk-agent:generate-report markdown ./docs/risk-register-2026-Q2.md all
/risk-agent:generate-report json
```
