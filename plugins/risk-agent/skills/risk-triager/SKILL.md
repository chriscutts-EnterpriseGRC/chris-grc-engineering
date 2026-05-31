---
name: risk-triager
description: Prioritises risks from the Supabase register and produces per-risk action recommendations based on score, treatment, control effectiveness, and age.
allowed-tools: Read, Bash
---

# Risk Triager

Ranks and recommends actions for open risks.

## Prioritisation factors

1. **Inherent score** (primary sort — higher = more urgent)
2. **Days open** — `NOW() - created_at` in days (breaks ties)
3. **Control effectiveness** — risks with all linked controls `ineffective` or `not_tested` are elevated one priority band
4. **Overdue** — `target_close_at < NOW()` and status not `closed` or `accepted` → flag as overdue

## Recommendation logic

| Condition | Recommendation |
|-----------|---------------|
| Score ≥ 20 AND status = open | **Escalate** — assign owner and set 7-day target |
| Score 12–19 AND no treatment plan | **Plan** — draft treatment plan within 14 days |
| Score 12–19 AND treatment plan exists | **Mitigate** — confirm plan is active |
| Score 6–11 AND days open > 90 | **Review** — reassess likelihood/impact; may have drifted |
| Score 6–11 AND days open ≤ 90 | **Monitor** — continue watching |
| Score ≤ 5 | **Accept or close** — document acceptance rationale |
| status = mitigating AND residual score ≤ 5 | **Close** — residual risk within appetite |

## Output per risk

```
RISK-001 | Cloud misconfiguration | inherent: 20 | residual: 8 | status: mitigating
→ MITIGATE: treatment plan active, residual within target. Review at next quarterly cycle.
```

## Overdue summary

Lists all risks where `target_close_at` has passed, grouped by owner team, so follow-ups can be dispatched.
