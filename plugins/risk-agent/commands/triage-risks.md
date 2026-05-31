---
description: Pull the live risk register from Supabase and produce a prioritised triage view
---

# Triage Risks

Queries the Supabase `risks` table, ranks entries by inherent score descending, and produces an actionable triage report with recommended next steps for each open or watching risk.

## Arguments

- `$1` - Filter status: open | watching | mitigating | all (default: open)
- `$2` - Max results to display (default: 20)

## What the agent does

1. Fetches risks from Supabase filtered by status
2. Ranks by `inherent->>'score'` descending, breaking ties by `target_close_at` ascending
3. For each risk, uses `risk-triager` skill to recommend: escalate | monitor | close | accept
4. Cross-references `linked_controls` against the `controls` table to surface any ineffective controls
5. Flags overdue risks where `target_close_at < NOW()` and status is not closed

## Output

Ranked markdown table:

| # | risk_id | title | score | treatment | recommendation | overdue |
|---|---------|-------|-------|-----------|----------------|---------|

Followed by a short action summary per top-5 risk.

## Example

```bash
/risk-agent:triage-risks open 10
/risk-agent:triage-risks all
```
