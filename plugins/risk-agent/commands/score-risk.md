---
description: Interactively score or re-score a risk's inherent and residual values
---

# Score Risk

Calculates or recalculates inherent and residual risk scores for a given risk ID or a described scenario, then patches the record in `reports/risks/`.

## Arguments

- `$1` - risk_id from the register, OR a free-text risk scenario description (required)
- `$2` - Score type: inherent | residual | both (default: both)

## Scoring methodology

Uses a 5×5 likelihood/impact matrix aligned to ISO 27005/31000:

| Likelihood \ Impact | 1-Low | 2-Moderate | 3-High | 4-Severe | 5-Critical |
|---|---|---|---|---|---|
| 5-Almost Certain | 5 | 10 | 15 | 20 | 25 |
| 4-Likely | 4 | 8 | 12 | 16 | 20 |
| 3-Possible | 3 | 6 | 9 | 12 | 15 |
| 2-Unlikely | 2 | 4 | 6 | 8 | 10 |
| 1-Rare | 1 | 2 | 3 | 4 | 5 |

**Likelihood uses the High Water Mark rule** — scored across three dimensions (Frequency, Technical Feasibility, Likelihood Precursor). The highest of the three is the final likelihood score.

### Risk rating bands

| Rating | Score | Response Decision SLA | Acceptance Authority |
|---|---|---|---|
| Critical | 25 | 7 days | C-Suite / SVP+ |
| Severe | 16–24 | 30 days | VP+ |
| High | 10–15 | 60 days | Director+ |
| Moderate | 5–9 | 90 days | Sr Manager+ |
| Low | 1–4 | 180 days | Manager+ |

## What the agent does

1. If a `risk_id` is given, reads the existing record from `reports/risks/{risk-id}.json`
2. If a scenario description is given, drafts a new risk stub
3. Walks through likelihood dimensions (Frequency, Technical Feasibility, Precursor) and impact with reasoning
4. Applies High Water Mark to determine final likelihood
5. Produces final scores with justification notes
6. Patches `inherent` and/or `residual` fields in `reports/risks/{risk-id}.json` and updates `updated_at`

## Example

```bash
/risk-agent:score-risk RSK-SE-2026-001 residual
/risk-agent:score-risk "Okta admin account lacks MFA enforcement" both
```
