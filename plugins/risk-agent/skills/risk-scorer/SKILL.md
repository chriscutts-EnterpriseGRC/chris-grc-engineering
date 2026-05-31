---
name: risk-scorer
description: Calculates inherent and residual risk scores using a 5x5 likelihood/impact matrix. Provides scored output with reasoning notes for audit traceability.
allowed-tools: Read
---

# Risk Scorer

Applies a consistent 5×5 matrix to produce likelihood, impact, and composite scores.

## Scoring dimensions

### Likelihood (1–5)
| Value | Label | Definition |
|-------|-------|------------|
| 5 | Almost Certain | Expected to occur within 3 months without controls |
| 4 | Likely | Expected to occur within 12 months |
| 3 | Possible | Could occur within 12 months |
| 2 | Unlikely | Could occur within 3 years |
| 1 | Rare | May occur in exceptional circumstances only |

### Impact (1–5)
| Value | Label | Definition |
|-------|-------|------------|
| 5 | Critical | Regulatory action, material breach, or business-stopping event |
| 4 | Major | Significant data exposure, customer notification required, or >$1M impact |
| 3 | Moderate | Degraded service, limited data exposure, or $100K–$1M impact |
| 2 | Minor | Contained incident, no data exposure, or <$100K impact |
| 1 | Negligible | No measurable impact; resolved internally without escalation |

### Composite score
`score = likelihood × impact` (range 1–25)

## Inherent vs. residual

- **Inherent**: score assuming zero controls are in place
- **Residual**: score given current control effectiveness from the `controls` table

When scoring residual, reduce likelihood and/or impact based on linked controls:
- `effective` control → reduce linked dimension by 1–2 points
- `partial` control → reduce by 1 point
- `ineffective` or `not_tested` → no reduction

## Output

```json
{
  "inherent": { "likelihood": 4, "impact": 5, "score": 20, "notes": "..." },
  "residual":  { "likelihood": 2, "impact": 4, "score": 8,  "notes": "..." }
}
```
