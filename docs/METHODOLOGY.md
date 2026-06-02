# Methodology

## GRC engineering approach

This system applies engineering principles to Governance, Risk, and Compliance - building automated, measurable, and repeatable processes rather than point-in-time assessments. The approach is aligned with ISO 31000:2018 and ISO 27005:2022.

---

## Core principles

### 1. Risk-based prioritisation
Decisions are driven by inherent and residual risk scores rather than checklist completion. Every vulnerability, incident, policy gap, and vendor relationship links back to a UCF control ID so risk is traceable end-to-end.

### 2. UCF control layer - one ID, many frameworks
All controls are assigned a Universal Control Framework (UCF) ID. A single control can satisfy requirements across SOC 2, ISO 27001, NIST CSF, GDPR, PCI DSS, EU AI Act, and ISO 42001 simultaneously. This eliminates duplicate effort across audits and compliance programs.

### 3. Preventive, detective, and corrective controls
- **Preventive** - Open Policy Agent blocks non-compliant infrastructure before deployment (CI/CD pipeline)
- **Detective** - SIEM, vulnerability scanning, and log monitoring surfaced in the dashboard
- **Corrective** - Remediation tracked through the Incidents and Vulnerabilities modules with MTTR metrics

### 4. Evidence as a byproduct
The Evidence Locker ties artefacts (screenshots, policy documents, test results, configurations) directly to UCF controls, with expiry tracking. Evidence is collected continuously rather than assembled at audit time.

---

## Risk assessment methodology

For the full scoring model see [RISK-METHODOLOGY.md](RISK-METHODOLOGY.md). Summary:

### Scoring

`Risk Score = Likelihood × Impact` (range: 1–25)

**Likelihood** is scored across three independent dimensions (Frequency, Technical Feasibility, Likelihood Precursor). The final score is the **highest of the three** (high water mark rule).

**Impact** is a single 1–5 scale from Low (operational noise) to Critical (total service loss or >$100M).

### Risk rating bands

| Rating | Score | Response SLA | Acceptance Authority |
|--------|-------|-------------|----------------------|
| Critical | 25 | 7 days | C-Suite / SVP+ |
| Severe | 16–24 | 30 days | VP+ |
| High | 10–15 | 60 days | Director+ |
| Moderate | 5–9 | 90 days | Sr Manager+ |
| Low | 1–4 | 180 days | Manager+ |

### Inherent vs. residual risk

- **Inherent** - exposure with zero controls applied
- **Residual** - exposure after accounting for control effectiveness

The dashboard calculates residual programmatically from each linked control's effectiveness score:

```js
const reductionFactor = controlIds.reduce(
  (f, id) => f * (1 - ((CTRL_EFF[id] ?? 50) / 100) * 0.5), 1
);
residualScore = Math.max(2, Math.round(inherentScore * reductionFactor));
```

### Risk treatment options

| Treatment | When to use |
|-----------|-------------|
| Mitigate | Implement controls to reduce likelihood or impact |
| Avoid | Cease the activity or move to a safer environment |
| Transfer | Insurance or outsourcing - shifts accountability |
| Accept / Monitor | Acknowledge and monitor - requires approval authority |

### Risk register workflow

```
Submitted → In Review → Risk Assessment
                      → Mitigating → Done
                      → Avoiding   → Done
                      → Transferring → Done
                      → Accepting/Monitoring
```

---

## Compliance framework coverage

The dashboard tracks 8 frameworks in the Control Alignment and Compliance modules:

| Framework | Type | Current posture |
|-----------|------|----------------|
| SOC 2 Type II | Audit standard | 94% - Certified |
| ISO 27001 | ISMS standard | 87% - In Progress |
| GDPR | Regulation | 91% - Compliant |
| NIST CSF 2.0 | Framework | 88% - Compliant |
| PCI DSS | Payment standard | 83% - Compliant |
| HIPAA | Healthcare regulation | 78% - In Progress |
| EU AI Act | AI regulation | 22% - Gap (enforcement Aug 2026) |
| ISO/IEC 42001 | AI management system | 18% - Gap |

Additionally 25+ frameworks are supported via the plugin layer (`plugins/frameworks/`) for assessment, evidence checklists, and gap reporting.

---

## Health score calculation

The **Resilience Score** shown on the Overview page is a composite 0–100 metric:

| Component | Weight | What it measures |
|-----------|--------|-----------------|
| Risk Posture | 40% | Unmitigated risks, vulnerability exposure, residual scores |
| Compliance Adherence | 30% | UCF control effectiveness rate, policy compliance |
| Operational Maturity | 20% | Process automation, tool coverage, evidence freshness |
| Security Posture | 10% | Incident MTTR, IR plan effectiveness, security awareness |

Score interpretation:

| Range | Status |
|-------|--------|
| 85–100 | Platinum - leading posture |
| 70–84 | Gold - meeting expectations |
| 50–69 | Silver - needs focused improvement |
| 0–49 | Bronze - significant gaps, immediate action required |

The team-level health score in the Scorecard uses:
```js
health = ((effective + partial × 0.5) / total_controls) × 100
```
Partial controls count at 50% - they're not fully mitigating risk.

---

## Leadership reporting

### Monthly scorecard
Per-team health scores with 3-month trend, Bronze/Silver/Gold/Platinum levels, achievement badges, and a leaderboard. Accessible under the LEADERSHIP nav group.

### Monthly report
Per-leader filtered view showing their controls, open vulnerabilities, active incidents, policy ownership, risk register items, and auto-generated recommended actions. Shareable via `?leader=<teamId>` URL or exportable via browser print to PDF.

### Governance forums (per Risk Management Framework)
- Monthly Risk Review meetings - Critical and Severe risks
- Quarterly Leadership Risk Briefings - High and above
- Weekly operational risk stand-ups - active treatment tracking

---

## AI security methodology

AI features on this platform are assessed under a layered methodology that combines EU AI Act obligations, NIST AI RMF, and ISO 42001. This sits on top of the standard risk and compliance methodology above.

### AI risk assessment

AI risk is assessed across three dimensions:

| Dimension | Assessment method |
|-----------|------------------|
| **Regulatory tier** | Classify per EU AI Act Annex III: Prohibited / High-risk / Limited / Minimal. Current platform features are Limited or Minimal. Any move to High-risk requires full conformity assessment before deployment. |
| **Security risk** | Apply STRIDE to the AI trust boundary (agent ↔ MCP server ↔ data). Key threats: prompt injection (Tampering), data leakage (Info Disclosure), unauthorized writes (Elevation of Privilege). Full AI threat surface documented in [SECURITY.md](./SECURITY.md). |
| **Operational risk** | Assess model drift, output quality degradation, and adversarial misuse potential. Monitored via UCF.AI.07 (Model Risk Management) and UCF.AI.08 (Model Performance Monitoring). |

### AI control framework (UCF.AI)

Ten AI-specific controls (UCF.AI.01–10) extend the core UCF model to cover the AI lifecycle. Each maps to EU AI Act articles, ISO 42001 clauses, NIST AI RMF functions, and OWASP LLM Top 10:

| Control | Focus | Key frameworks |
|---------|-------|---------------|
| UCF.AI.01–02 | AI Model Governance + AI Data Privacy & Bias | EU AI Act Art.9, ISO 42001, GDPR Art.22 |
| UCF.AI.03 | AI Security Controls | OWASP LLM Top 10, NIST AI RMF MEASURE 2.5 |
| UCF.AI.04 | AI Vendor Risk | EU AI Act Art.28, UCF.06.01 |
| UCF.AI.05 | AI Incident Response | EU AI Act Art.62, NIST AI RMF MANAGE 2.4 |
| UCF.AI.06 | AI Risk Categorization | NIST AI RMF MAP 2.1, EU AI Act Art.6 |
| UCF.AI.07–08 | Model Risk + Performance Monitoring | NIST AI RMF MEASURE 3.2, ISO 42001 9.1 |
| UCF.AI.09 | AI Explainability & Transparency | EU AI Act Art.13, GDPR Art.22 |
| UCF.AI.10 | AI Model Lifecycle Management | NIST AI RMF MANAGE 4.3, EU AI Act Art.9 |

### AI audit trail requirement

Every AI-assisted decision must be traceable end-to-end. The audit trail must contain:

1. **Input provenance** — what data the agent accessed and from which SecTier assets
2. **Decision record** — the decision made, the reasoning summary, and the model version
3. **Human review** — who approved or overrode the decision, and when
4. **Output record** — what action was taken as a result

This trail is implemented via `AUDIT`-level structured logs as specified in [LOGGING-STRATEGY.md](./LOGGING-STRATEGY.md) and stored for 3 years per EU AI Act Art. 12.

### Current AI compliance posture

| Framework | Coverage | Gap | Enforcement |
|-----------|---------|-----|------------|
| EU AI Act | 22% | 78% | August 2026 |
| ISO 42001 | 18% | 82% | — |

Addressing UCF.AI.03 (AI Security Controls) and UCF.AI.05 (AI Incident Response) in the next sprint would move EU AI Act coverage from 22% → approximately 43%. See [AI-GRC-ROADMAP.md](./AI-GRC-ROADMAP.md) for the full gap analysis workflow.
