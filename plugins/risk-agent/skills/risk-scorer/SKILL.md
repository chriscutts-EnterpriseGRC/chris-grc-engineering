---
name: risk-scorer
description: Calculates inherent and residual risk scores using the 5x5 likelihood/impact matrix defined in the Risk Management Framework v1.0. Produces scored output with reasoning notes for audit traceability.
allowed-tools: Read
---

# Risk Scorer

Applies the Risk Management Framework v1.0 scoring methodology (aligned ISO 31000 / ISO 27005).

## Impact dimensions (1–5)

| Score | Level | Threshold |
|-------|-------|-----------|
| 5 | Critical | Total service loss or >$100M impact. Urgent action required. |
| 4 | Severe | Significantly disrupts core business processes. Must be addressed swiftly. |
| 3 | High | Substantial impact. Mitigable with focused controls and monitoring. |
| 2 | Moderate | Noticeable disruption. Manageable through routine oversight. |
| 1 | Low | Unlikely to materially affect operations. Minimal effort to manage. |

## Likelihood dimensions (1–5) — HIGH WATER MARK RULE

Likelihood is scored across **three independent dimensions**. The final score is the **highest of the three**.

| Score | Frequency | Technical Feasibility | Likelihood Precursor |
|-------|-----------|----------------------|---------------------|
| 5 | More than once per year | No specialist skills required | Event is active or unavoidable |
| 4 | Once per year | Moderate effort required | Clear trend — when not if |
| 3 | Once every 2–3 years | Significant effort required | Near-misses observed |
| 2 | Once in 3–5 years | Highly specialised skills required | Theoretical only |
| 1 | Once in 5+ years | State-actor level resources required | Perfect storm required |

## Composite score

`score = likelihood × impact` (range 1–25)

## Risk rating bands

| Rating | Score | Response Decision SLA | Acceptance Authority |
|--------|-------|-----------------------|----------------------|
| Critical | 25 | 7 days | C-Suite / SVP+ |
| Severe | 16–24 | 30 days | VP+ |
| High | 10–15 | 60 days | Director+ |
| Moderate | 5–9 | 90 days | Sr Manager+ |
| Low | 1–4 | 180 days | Manager+ |

> **Default acceptance rule (§6, Step 3):** Any risk that breaches its Response Decision SLA is deemed accepted by default. A lack of action constitutes de-facto acceptance.

## Inherent vs. residual

- **Inherent**: score assuming zero controls in place
- **Residual**: re-evaluated likelihood and impact assuming existing controls are effective

When controls are present, reduce the relevant dimension based on control effectiveness:
- `effective` → reduce linked dimension by 1–2 points
- `partial` → reduce by 1 point
- `ineffective` or `not_tested` → no reduction

The dashboard calculates residual automatically:
```js
const reductionFactor = controlIds.reduce(
  (f, id) => f * (1 - ((CTRL_EFF[id] ?? 50) / 100) * 0.5), 1
);
residualScore = Math.max(2, Math.round(inherentScore * reductionFactor));
```

> **Note:** Thresholds represent defaults aligned to this framework. Organizations adjust based on risk appetite, regulatory context, and industry sector.

## Output

```json
{
  "inherent": { "likelihood": 4, "impact": 5, "score": 20, "notes": "Likelihood=4 driven by Frequency dimension (annual occurrence observed)." },
  "residual":  { "likelihood": 2, "impact": 4, "score": 8,  "notes": "MFA control (92% effective) reduces likelihood by 2 points." }
}
```
