---
description: Interactively score or re-score a risk's inherent and residual values
---

# Score Risk

Calculates or recalculates inherent and residual risk scores for a given risk ID or a described scenario, then patches the record in Supabase.

## Arguments

- `$1` - risk_id from the `risks` table, OR a free-text risk scenario description (required)
- `$2` - Score type: inherent | residual | both (default: both)

## Scoring methodology

Uses a 5×5 likelihood/impact matrix:

| Likelihood \ Impact | 1-Negligible | 2-Minor | 3-Moderate | 4-Major | 5-Critical |
|---|---|---|---|---|---|
| 5-Almost Certain | 5 | 10 | 15 | 20 | 25 |
| 4-Likely | 4 | 8 | 12 | 16 | 20 |
| 3-Possible | 3 | 6 | 9 | 12 | 15 |
| 2-Unlikely | 2 | 4 | 6 | 8 | 10 |
| 1-Rare | 1 | 2 | 3 | 4 | 5 |

Risk appetite thresholds:
- **Critical** (score 20–25): immediate escalation required
- **High** (score 12–19): remediation plan within 30 days
- **Medium** (score 6–11): track and monitor
- **Low** (score 1–5): accept or defer

## What the agent does

1. If a `risk_id` is given, fetches the existing record from Supabase
2. If a scenario description is given, drafts a new risk stub
3. Walks through likelihood and impact dimensions with reasoning
4. Produces final scores with justification notes
5. Patches `inherent` and/or `residual` fields in Supabase and updates `updated_at`

## Example

```bash
/risk-agent:score-risk RISK-001 residual
/risk-agent:score-risk "Okta admin account lacks MFA enforcement" both
```
