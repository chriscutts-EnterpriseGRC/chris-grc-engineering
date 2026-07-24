---
name: risk-triager
description: Prioritises risks from the local register and produces per-risk action recommendations based on score, treatment, control effectiveness, and age.
allowed-tools: Read
---

# Risk Triager

Ranks and recommends actions for open risks.

## Prioritisation factors

1. **Inherent score** (primary sort — higher = more urgent)
2. **Days open** — `today - created_at` in days (breaks ties)
3. **Control effectiveness** — risks with all linked controls `ineffective` or `not_tested` are elevated one priority band
4. **Overdue** — `target_close_at < today` and status not `closed` or `accepted` → flag as overdue

## Recommendation logic

Thresholds align to the ISO 27005 rating bands in the risk-scorer skill:

| Condition | Recommendation |
|---|---|
| Score = 25 (Critical) | **Escalate** — C-Suite / SVP+ decision required within 7 days |
| Score 16–24 (Severe) AND no treatment plan | **Escalate** — VP+ decision required within 30 days |
| Score 16–24 (Severe) AND treatment plan exists | **Mitigate** — confirm plan is active and on track |
| Score 10–15 (High) AND no treatment plan | **Plan** — Director+ to draft treatment plan within 60 days |
| Score 10–15 (High) AND treatment plan exists | **Monitor** — confirm plan is progressing |
| Score 5–9 (Moderate) AND days open > 90 | **Review** — reassess likelihood/impact; score may have drifted |
| Score 5–9 (Moderate) AND days open ≤ 90 | **Monitor** — continue watching at bi-annual cadence |
| Score 1–4 (Low) | **Accept or close** — document acceptance rationale |
| status = mitigating AND residual score ≤ 4 | **Close** — residual risk within appetite |

## Output per risk

```
RSK-SE-2026-001 | Unenforced allowlists for apps, browsers, and AI tooling | inherent: 20 | residual: 16 | status: mitigating
→ MITIGATE: treatment plan active. Confirm all six surface areas are on track. Review at next monthly cycle.
```

## Overdue summary

Lists all risks where `target_close_at` has passed, grouped by owner team, so follow-ups can be dispatched.
