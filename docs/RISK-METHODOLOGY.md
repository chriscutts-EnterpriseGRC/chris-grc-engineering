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

### Likelihood (1–5) - High Water Mark Rule

Likelihood is scored across **three independent dimensions**. The final score is the **highest of the three** - not an average.

| Score | Frequency | Technical Feasibility | Likelihood Precursor |
|-------|-----------|----------------------|---------------------|
| 5 | >Once per year | No specialist skills required | Event is active or unavoidable |
| 4 | Once per year | Moderate effort required | Clear trend - when not if |
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

- **Inherent risk** - exposure with zero controls applied
- **Residual risk** - re-evaluated score assuming existing controls are effective

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

## FAIR — Quantitative Risk Extension

### What FAIR is and when to use it

**Factor Analysis of Information Risk (FAIR)** is a quantitative risk methodology that replaces ordinal scores (1–25) with financial loss estimates expressed as a probability distribution. Output is a dollar range with a confidence interval — for example, "expected annual loss between $180K and $2.4M, 50th percentile $640K."

ISO 27005 and FAIR are complementary, not competing:

| | ISO 27005 (this methodology) | FAIR |
|---|---|---|
| **Output** | Ordinal score 1–25 | Financial loss in dollars |
| **Speed** | Fast — score the whole register | Slow — 2–4 hours per risk |
| **Use case** | Prioritise across 50+ risks | Quantify the top 5–10 for budget decisions |
| **Audience** | Security and GRC team | CFO, board, executive leadership |
| **Question answered** | Which risks are worst? | What does this risk cost us per year? |

**When to reach for FAIR:**
- Leadership asks "what is the financial exposure if this risk materialises?"
- You need to justify budget for a security control — FAIR gives you the ROI calculation
- Two risks score similarly on the qualitative scale but feel materially different
- Preparing a board-level risk brief where dollar figures carry more weight than a heat map
- Cyber insurance renewal — insurers increasingly want expected loss ranges

**When to stay with ISO 27005:**
- Running the full register triage — FAIR at scale is impractical
- Risks below High rating where financial exposure is inherently low
- Any situation where speed matters more than precision

---

### FAIR model structure

FAIR measures risk as the **probable frequency and probable magnitude of future loss**.

```
Risk = Loss Event Frequency (LEF) × Loss Magnitude (LM)

LEF  = Threat Event Frequency (TEF) × Vulnerability

LM   = Primary Loss + Secondary Loss
```

**Key terms:**

| Term | Definition | ISO 27005 equivalent |
|---|---|---|
| Threat Agent | The entity capable of causing harm | Threat Source |
| Threat Event | The action taken against an asset | Threat Event |
| Threat Event Frequency (TEF) | How often a threat agent acts against this asset per year | Likelihood dimension 1 — Frequency |
| Vulnerability | Probability that a threat event results in a loss given it occurs | Control effectiveness (inverse) |
| Loss Event Frequency (LEF) | How often a loss actually occurs per year | Likelihood (combined) |
| Primary Loss | Direct costs: incident response, recovery, downtime | Impact |
| Secondary Loss | Indirect costs: regulatory fines, litigation, reputation, churn | Impact — regulatory and reputational dimensions |
| Loss Magnitude (LM) | Total financial loss per event | Impact in dollars |

---

### How ISO 27005 scores map to FAIR inputs

Use the qualitative scores as calibration anchors for FAIR ranges. This bridges the two methodologies without redundant work.

| ISO 27005 Likelihood | FAIR TEF (events per year) |
|---|---|
| 5 — Almost Certain | 4–12 events/year |
| 4 — Likely | 1–4 events/year |
| 3 — Possible | 0.2–1 events/year (once every 1–5 years) |
| 2 — Unlikely | 0.05–0.2 events/year (once every 5–20 years) |
| 1 — Rare | <0.05 events/year |

| ISO 27005 Impact | FAIR Loss Magnitude (LM) range |
|---|---|
| 5 — Critical | $5M–$50M+ |
| 4 — High | $500K–$5M |
| 3 — Medium | $50K–$500K |
| 2 — Low | $5K–$50K |
| 1 — Negligible | <$5K |

Control effectiveness in the residual formula (0.0–1.0) maps to FAIR Vulnerability as its inverse: a control with 0.8 effectiveness produces a Vulnerability of 0.2 (20% probability that a threat event becomes a loss event).

---

### Worked example — T-TECH-03: Credential stuffing

**ISO 27005 scores:**
- Likelihood: 5 (Scattered Spider actively uses credential stuffing against SaaS targets)
- Impact: 4 (account compromise — customer data exposure, platform access)
- Inherent score: 20 (Exceeds Appetite)
- Residual after MFA + detection rules: 12 (Approaches Appetite)

**FAIR quantification:**

*Step 1 — Loss Event Frequency*

| Input | Range (low–high) | Most likely |
|---|---|---|
| TEF (Scattered Spider targets SaaS ~monthly) | 4–12 events/year | 6/year |
| Vulnerability without FIDO2 MFA (push MFA bypassable) | 25%–50% | 35% |
| LEF = TEF × Vulnerability | 1.0–6.0 events/year | **2.1/year** |

After implementing FIDO2 (phishing-resistant) — Vulnerability drops to 3%–8%, LEF drops to 0.12–0.96 events/year.

*Step 2 — Loss Magnitude per event*

| Loss category | Low | Most likely | High |
|---|---|---|---|
| Primary: IR, forensics, credential reset, downtime | $30K | $80K | $200K |
| Secondary: customer notification, regulatory (GDPR 72h) | $50K | $150K | $600K |
| Secondary: reputational — customer churn on breach disclosure | $20K | $100K | $500K |
| **Total LM** | **$100K** | **$330K** | **$1.3M** |

*Step 3 — Expected Annual Loss (EAL)*

| Scenario | LEF | LM (50th pct) | EAL |
|---|---|---|---|
| Current state (push MFA, no FIDO2) | 2.1/year | $330K | **$693K/year** |
| After FIDO2 deployment | 0.3/year | $330K | **$99K/year** |
| **Risk reduction from FIDO2** | | | **$594K/year** |

**The business case:** FIDO2 hardware keys for 200 employees cost approximately $8K–$15K. The expected annual loss reduction is $594K. Payback period: 10 days. This is the number that gets a security control approved in a budget conversation — not "risk score moves from 20 to 12."

---

### Running FAIR in practice

For each risk you want to quantify:

1. Pull the ISO 27005 scores from the register as your calibration anchors
2. Gather SME inputs: ask engineering, security ops, and finance for the dollar estimates — they know their system costs, and FAIR inputs are ranges, not precise figures
3. Use the mapping tables above to convert qualitative scores to FAIR ranges
4. Calculate LEF and LM as ranges (low, most likely, high)
5. Multiply to get EAL range — report the 10th, 50th, and 90th percentile
6. Identify the single control that most reduces Vulnerability — that is the budget ask

**Tools:** The FAIR Institute publishes a free spreadsheet model. OpenFAIR is the open standard. Commercial tools (RiskLens, Safe Security) automate the Monte Carlo simulation. For most GRC programmes starting out, the spreadsheet is sufficient for the top 5 risks.

**Where to record it:** Add a `FAIR Analysis` linked page or attachment to the Jira Risk issue. Keep the qualitative score as the primary register field — FAIR is the supplement for board reporting, not the daily tracking mechanism.

---



The dashboard in `dashboard/src/GRCDashboard.jsx` implements this methodology directly:

- **Scoring constants** - `RISK_APPETITE`, `getRiskRating()`, `getRiskColor()`, `getAppetite()` at the top of the file reflect the band thresholds above
- **Response SLA** - `RESPONSE_SLA` object maps each rating to its SLA; displayed as a column in the Risk Register table
- **Acceptance Authority** - `ACCEPT_AUTH` object maps each rating to the required approver; displayed alongside SLA in the Risk Register
- **Risk register states** - `StatusBadge` component supports all workflow states defined in §7 of the framework
- **Heat matrix** - 5×5 grid colour-coded to Critical / Severe / High / Moderate / Low bands

---

*References: ISO 31000:2018, ISO 27005:2022, ISO 27001:2022, NIST SP 800-30, NIST CSF 2.0*
