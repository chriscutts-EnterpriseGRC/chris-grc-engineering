---
description: Read the risk register and produce a prioritised triage view
---

# Triage Risks

Reads risk records from `reports/risks/risk-register.json`, ranks entries by inherent score descending, and produces an actionable triage report with recommended next steps for each open or watching risk.

## Arguments

- `$1` - Filter status: open | watching | mitigating | all (default: open)
- `$2` - Max results to display (default: 20)

## What the agent does

1. Reads risks from `reports/risks/risk-register.json` filtered by status
2. Ranks by `inherent.score` descending, breaking ties by `target_close_at` ascending
3. For each risk, uses the `risk-triager` skill to recommend: escalate | plan | mitigate | monitor | accept | close
4. Cross-references `linked_controls` against the controls list to surface any ineffective controls
5. Flags overdue risks where `target_close_at < today` and status is not closed or accepted

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
