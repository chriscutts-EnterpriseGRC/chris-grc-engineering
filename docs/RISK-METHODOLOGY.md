# Risk Methodology

**Source document:** [Risk-Management-Framework.docx](./Risk-Management-Framework.docx)  
**Framework version:** v1.0  
**Alignment:** ISO 31000:2018, ISO 27005:2022  

> Scores, thresholds, SLAs, and approval authorities documented here reflect the defaults in the Risk Management Framework. Organizations adapt these based on their specific risk appetite, regulatory context, and industry sector.

---

## Scoring model

`Risk Score = Likelihood × Impact` (range: 1–25)

### Impact (1–5)

| Score | Level | Description |
|-------|-------|-------------|
| 5 | Critical | Total service loss or >$100M impact. Urgent action. |
| 4 | Severe | Significantly disrupts core business processes. |
| 3 | High | Substantial impact. Mitigable with focused controls. |
| 2 | Moderate | Noticeable disruption. Manageable through routine oversight. |
| 1 | Low | Unlikely to materially affect operations. |

### Likelihood (1–5) — High Water Mark Rule

Likelihood is scored across **three independent dimensions**. The final score is the **highest of the three** — not an average.

| Score | Frequency | Technical Feasibility | Likelihood Precursor |
|-------|-----------|----------------------|---------------------|
| 5 | >Once per year | No specialist skills required | Event is active or unavoidable |
| 4 | Once per year | Moderate effort required | Clear trend — when not if |
| 3 | Once every 2–3 years | Significant effort required | Near-misses observed |
| 2 | Once in 3–5 years | Highly specialised skills required | Theoretical only |
| 1 | Once in 5+ years | State-actor level resources required | Perfect storm required |

---

## Risk rating bands

| Rating | Score Range | Heat Map |
|--------|-------------|----------|
| Critical | 25 | 🔴 Dark red |
| Severe | 16–24 | 🔴 Red |
| High | 10–15 | 🟠 Orange |
| Moderate | 5–9 | 🟡 Amber |
| Low | 1–4 | 🟢 Green |

### Inherent vs. residual

- **Inherent risk** — exposure with zero controls applied
- **Residual risk** — re-evaluated score assuming existing controls are effective

> The risk register carries the residual score by default. When no controls are in place, inherent and residual scores are equal.

The dashboard calculates residual programmatically:
```js
// Each linked control's effectiveness score reduces residual proportionally
const reductionFactor = controlIds.reduce(
  (f, id) => f * (1 - ((CTRL_EFF[id] ?? 50) / 100) * 0.5), 1
);
residualScore = Math.max(2, Math.round(inherentScore * reductionFactor));
```

---

## Risk treatment

| Treatment | Description |
|-----------|-------------|
| Mitigate | Implement controls to reduce impact or likelihood |
| Avoid | Cease the activity or move assets to a safer environment |
| Transfer | Shift accountability via insurance or outsourcing |
| Accept / Monitor | Acknowledge and choose not to act at this time |

---

## Response Decision SLAs

> **Default acceptance rule:** Any risk that breaches its Response Decision SLA is deemed accepted by default. Inaction constitutes de-facto acceptance of the risk in its current state.

| Rating | Response Decision SLA | Treatment Plan SLA | Acceptance Authority |
|--------|----------------------|--------------------|----------------------|
| Critical | 7 days | 7 days (VP+ approval) | C-Suite / SVP+ |
| Severe | 30 days | 30 days (Director+ approval) | VP+ |
| High | 60 days | 60 days (Director+ approval) | Director+ |
| Moderate | 90 days | 90 days | Sr Manager+ |
| Low | 180 days | 180 days | Manager+ |

---

## Risk register workflow states

```
Submitted → In Review → Risk Assessment → Mitigating
                                        → Avoiding
                                        → Transferring
                                        → Accepting/Monitoring
                                        → Done
```

| State | Description |
|-------|-------------|
| Submitted | Risk first created in register |
| In Review | Risk team assesses and validates |
| Risk Assessment | Additional data or analysis required |
| Mitigating | Active treatment in progress |
| Avoiding | Risk being eliminated |
| Transferring | Risk being transferred to a third party |
| Accepting/Monitoring | Risk accepted with ongoing oversight |
| Done | Treatment implemented and verified |

---

## Monitoring cadence

| Rating | Review Frequency | Reporting |
|--------|-----------------|-----------|
| Critical | Monthly | Dashboard + Report |
| Severe | Monthly | Dashboard + Report |
| High | Quarterly | Dashboard + Report |
| Moderate | Bi-annually | Dashboard + Report |
| Low | Annually | Dashboard + Report |

---

## Key Risk Indicators (KRIs)

| KRI | Description |
|-----|-------------|
| Risk Exposure Trends | Open risks by severity over time |
| Treatment Timeliness | % risks treated within SLA |
| Risk Acceptance Rate | % accepted vs. mitigated |
| Third-Party Risk Exposure | Vendor risks by impact level |
| Regulatory Compliance Risks | Risks linked to non-compliance |
| Unassigned Risks | Risks lacking ownership |
| Open Critical / Severe | Current critical exposure |
| Overdue Risk Actions | Treatment plans past due date |

---

## Dashboard implementation notes

The dashboard in `dashboard/src/GRCDashboard.jsx` implements this methodology directly:

- **Scoring constants** — `RISK_APPETITE`, `getRiskRating()`, `getRiskColor()`, `getAppetite()` at the top of the file reflect the band thresholds above
- **Response SLA** — `RESPONSE_SLA` object maps each rating to its SLA; displayed as a column in the Risk Register table
- **Acceptance Authority** — `ACCEPT_AUTH` object maps each rating to the required approver; displayed alongside SLA in the Risk Register
- **Risk register states** — `StatusBadge` component supports all workflow states defined in §7 of the framework
- **Heat matrix** — 5×5 grid colour-coded to Critical / Severe / High / Moderate / Low bands

---

*References: ISO 31000:2018, ISO 27005:2022, ISO 27001:2022, NIST SP 800-30, NIST CSF 2.0*
