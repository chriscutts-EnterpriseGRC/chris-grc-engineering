# Risk Management Framework
## Docker Hull — Security Risk Programme

| Field | Value |
|---|---|
| Version | v1.0 |
| Document Owner | Security GRC |
| Approvers | Director, Security Risk / VP, Security |
| Approval Date | 2026-06-24 |
| Review Frequency | Annually or upon significant organisational change |
| Classification | Confidential — Internal Use Only |
| Alignment | ISO 31000:2018, ISO 27005:2022 |

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Scope](#2-scope)
3. [Target Audience](#3-target-audience)
4. [Framework Overview](#4-framework-overview)
5. [Risk Assessment Process](#5-risk-assessment-process)
6. [Risk Treatment Process](#6-risk-treatment-process)
7. [Risk Register Management](#7-risk-register-management)
8. [Risk Monitoring and Review](#8-risk-monitoring-and-review)
9. [Risk Reporting](#9-risk-reporting)
10. [Risk Culture and Awareness](#10-risk-culture-and-awareness)
11. [Risk Aggregation](#11-risk-aggregation)
12. [Appendix](#12-appendix)

---

## 1. Purpose

This document establishes Docker Hull's Security Risk Programme framework, providing a clear, structured, and repeatable process for identifying, assessing, treating, monitoring, and reporting risks. Aligned with ISO 31000:2018 and ISO 27005:2022, it enables the organisation to:

- Guide systematic risk identification, analysis, evaluation, and treatment
- Ensure alignment with strategic objectives and regulatory requirements
- Support proactive risk management and safeguard critical assets
- Maintain a consistent and current risk register
- Enable informed decision-making and effective stakeholder communication
- Foster a culture of continuous improvement across the organisation

---

## 2. Scope

This framework applies to all business units, teams, and systems within Docker Hull's security risk programme scope.

**Risk types covered:**

- Information security and technology risks
- Operational and business continuity risks
- Compliance and regulatory risks
- Third-party and vendor risks
- Financial risks

---

## 3. Target Audience

- All employees and contractors
- Risk owners and mitigation owners
- Security GRC team members
- Business leaders and executive management
- Third-party risk management teams
- Compliance and audit teams

---

## 4. Framework Overview

### Core Components

The framework provides a systematic seven-component lifecycle for managing risk end-to-end:

| # | Component | Description |
|---|---|---|
| 1 | Context Establishment | Define internal/external environment, risk criteria, and scope |
| 2 | Risk Identification | Identify threats, vulnerabilities, and risk scenarios |
| 3 | Risk Analysis | Assess likelihood and impact, considering control effectiveness |
| 4 | Risk Evaluation | Compare risk levels against defined acceptance criteria |
| 5 | Risk Treatment | Select and implement mitigation, transfer, acceptance, or avoidance |
| 6 | Monitoring and Review | Continuously track risks, reassess controls, and update the register |
| 7 | Communication and Reporting | Ensure transparent risk communication across all stakeholders |

### Leadership and Commitment

- Senior management establishes a risk-aware culture and integrates risk management into strategic decision-making
- Leadership ensures adequate resources, competencies, and accountability for risk management activities
- Leadership commits to ongoing training to keep the risk management team current with best practices
- Leadership clearly communicates the organisation's risk management objectives

### Governance and Roles

| Role | Responsibilities |
|---|---|
| Senior Leadership | Formally approves and supervises implementation of risk management measures |
| Security GRC Team | Oversees the risk management process and ensures alignment with business objectives. Facilitates risk identification, assessment, and treatment. Owns and maintains the risk register |
| Third-Party / Vendor Team | Manages security risks related to third-party vendors, suppliers, and partners |
| Risk Owners | Accountable for managing risks within their domains. Review risks and update status, mitigation progress, and severity changes per monitoring cadence |
| Mitigation Owners | Responsible for implementing treatment plans and mitigation actions. Provide progress updates to the Risk Owner |

### Governance Forums

The Security GRC team leads or attends the following recurring forums:

| Forum | Frequency | Scope |
|---|---|---|
| Operational Risk Stand-up | Weekly | Active treatment tracking, overdue actions |
| Monthly Risk Review | Monthly | Critical and Severe risks, SLA breaches, new risks |
| Leadership Risk Briefing | Quarterly | High and above, programme health, appetite review |

### Integration with Business Processes

**Key risk information sources:**

- Security compliance reviews
- Third-party risk assessments
- Threat and vulnerability management programmes
- Internal and external audits
- Employee reporting
- Penetration testing and red team exercises
- Incident responses and Post-Incident Reviews (PIRs)

**Control framework integration:**

All controls are assigned a Universal Control Framework (UCF) ID, allowing a single control to satisfy requirements across SOC 2, ISO 27001, NIST CSF, GDPR, PCI DSS, and other frameworks simultaneously. This eliminates duplicate effort across audit and compliance activities, and ensures risk assessments are directly traceable to control gaps.

---

## 5. Risk Assessment Process

Risk assessment encompasses risk identification, analysis, and evaluation. This process is performed:

- At least annually
- Upon significant changes to systems, processes, or business operations
- After a major incident involving mission-critical systems

### 5.1 Establishing Context

When defining scope and boundaries, consider:

- Strategic business objectives
- Key operational workflows and security impacts
- Organisational structure and risk exposure
- Legal, regulatory, and contractual requirements
- Information security policy
- Critical data, systems, and resources
- Operational constraints affecting mitigation strategies
- Stakeholder expectations

### 5.2 Risk Identification

**Process steps:**

1. **Understand Assets** — Identify the assets, processes, and services requiring protection
2. **Identify Threats** — Identify internal and external threat sources that could exploit vulnerabilities
3. **Analyse Vulnerabilities** — Analyse systems, processes, and environments to uncover weaknesses
4. **Define Risk Scenarios** — Combine asset, threat, and vulnerability information to define risk scenarios

**Identification techniques:**

- Stakeholder interviews
- Threat modelling workshops
- Single-point-of-failure analysis
- Security assessments and audits
- Post-Incident Reviews
- Security tooling outputs

### 5.3 Risk Analysis

Risk scores are calculated across two dimensions: **Impact** and **Likelihood**.

`Risk Score = Impact × Likelihood` (range: 1–25)

**Impact scoring:**

| Score | Level | Description |
|---|---|---|
| 5 | Critical | Immediate and severe threat. Total service loss or >$100M impact. Requires urgent action. |
| 4 | Severe | Significantly disrupts core business processes. Must be addressed swiftly. |
| 3 | High | Substantial impact. Mitigable with focused controls and monitoring. |
| 2 | Moderate | Noticeable disruption. Manageable through routine oversight. |
| 1 | Low | Unlikely to materially affect operations. Minimal effort to manage. |

**Likelihood scoring — High Water Mark Rule:**

Likelihood is scored across three independent dimensions. The final score is the **highest of the three**, not an average. This reflects that a single credible attack vector is sufficient to make an event likely regardless of other factors.

| Score | Frequency | Technical Feasibility | Likelihood Precursor |
|---|---|---|---|
| 5 | More than once per year | No specialist skills required | Event is active or unavoidable |
| 4 | Once per year | Moderate effort required | Clear trend — when not if |
| 3 | Once every 2–3 years | Significant effort required | Near-misses observed |
| 2 | Once in 3–5 years | Highly specialised skills required | Theoretical only |
| 1 | Once in 5+ years | State-actor level resources required | Perfect storm required |

**Inherent vs. residual risk:**

| Score Type | Definition |
|---|---|
| Inherent Risk | The risk exposure without any controls applied |
| Residual Risk | The re-evaluated score after accounting for the effectiveness of linked controls |

> The risk register carries the residual score by default. When no controls are in place, inherent and residual scores are equal.

**Residual score calculation:**

Each risk record links to one or more UCF control IDs. The residual score is calculated programmatically as follows:

```
For each linked control, apply a reduction proportional to its effectiveness score.
The reduction factor per control = 1 − (effectiveness% / 100 × 0.5)
Combined reduction = product of all per-control reduction factors
Residual score = max(2, round(inherent score × combined reduction factor))
```

The 0.5 dampening coefficient reflects that no control is perfectly effective in isolation — even a 100% effective control reduces exposure by at most 50% on its own. Stacking multiple controls compounds the reduction.

**Risk rating bands:**

| Rating | Score Range | Description |
|---|---|---|
| Critical | 25 | Immediate and severe threat. Requires urgent action. |
| Severe | 16–24 | Significantly disrupts business processes. Must be addressed swiftly. |
| High | 10–15 | Substantial impact. Mitigable with focused controls and monitoring. |
| Moderate | 5–9 | Noticeable disruption. Manageable through routine oversight. |
| Low | 1–4 | Unlikely to materially affect operations. Minimal effort to manage. |

### 5.4 Risk Evaluation

Risk evaluation determines whether a risk is within appetite and what response is required.

**Risk appetite thresholds:**

| Appetite Status | Residual Score | Meaning |
|---|---|---|
| Within Appetite | 1–11 | Acceptable. Monitor per standard cadence. No escalation required. |
| Approaches Appetite | 12–19 | Elevated. Active treatment expected. Owner review at next cycle. |
| Exceeds Appetite | 20–24 | Outside tolerance. Treatment plan required within SLA. Director+ awareness. |
| Significantly Exceeds Appetite | 25 | Critical breach. Immediate escalation. C-Suite visibility required. |

Risks that Exceed or Significantly Exceed appetite are surfaced as priority items in the monthly Risk Review and the Leadership Risk Briefing. A risk that remains above appetite at the next review cycle without a treatment plan in place is escalated to the Risk Owner's manager.

---

## 6. Risk Treatment Process

### Step 1 — Review Risk Assessment Results

- Analyse identified risks, their impact and likelihood scores, and prioritise by severity
- Identify existing controls, evaluate their effectiveness, and document current and residual risk posture
- Confirm that linked UCF control IDs are accurate and effectiveness scores are current

### Step 2 — Evaluate Treatment Options

- Compare business risk against the cost of implementing controls
- Assess each option against risk rating, business objectives, and compliance requirements
- Estimate residual risk after implementing each option
- Select the option that best balances risk reduction with available resources

**Treatment options:**

| Treatment | Description | When to use |
|---|---|---|
| Mitigate | Implement controls to reduce the likelihood or impact of the risk | Default for risks that Exceed or Significantly Exceed appetite |
| Avoid | Cease the activity causing the risk or move assets to a better-protected environment | When the risk cannot be reduced to appetite through controls |
| Transfer | Transfer accountability to a third party through insurance or outsourcing | When the risk is financial in nature or better managed externally |
| Accept / Monitor | Acknowledge the risk and choose not to act at this time | Within Appetite risks, or when treatment is not cost-effective at current severity |

### Step 3 — Risk Response Decision SLA

A response decision (choose a treatment path) must be made within the following SLAs from the date the risk rating is finalised:

> **Default acceptance rule:** Any risk that breaches its Response Decision SLA is deemed accepted by default. Inaction constitutes de-facto acceptance of the risk in its current state.

| Risk Level | Response Decision SLA |
|---|---|
| Critical | Within 7 days of finalised risk rating |
| Severe | Within 30 days of finalised risk rating |
| High | Within 60 days of finalised risk rating |
| Moderate | Within 90 days of finalised risk rating |
| Low | Within 180 days of finalised risk rating |

### Step 4 — Select Treatment Path

Use the following guidance when selecting between active treatment and acceptance:

| Risk Level | Mitigate, Transfer, or Avoid | Accept |
|---|---|---|
| Critical | Critical Priority — Immediate action required | Highly Restricted — Extreme circumstances only |
| Severe | Strongly Recommended — Prioritise immediately | Restricted — Requires strong justification |
| High | Expected — Standard course of action | Discouraged — Only when resources unavailable |
| Moderate | Encouraged — If resources allow | Permitted — If treatment is not cost-effective |
| Low | Discretionary — Risk Owner's preference | Permitted — At Risk Owner discretion |

### Step 5 — Risk Acceptance Process

When a risk is accepted rather than actively treated, the following apply:

1. Risk Owner documents the acceptance rationale in the risk register record
2. Acceptance is approved by the authority level corresponding to the risk rating (see approval authority table in Step 6)
3. Accepted risks are reviewed at the standard monitoring cadence — acceptance does not remove the review obligation
4. Acceptance is revisited if the threat landscape changes, a related incident occurs, or controls deteriorate
5. Acceptance of Critical or Severe risks requires documented sign-off from VP+ and is reported to the Leadership Risk Briefing

**Documentation requirements:**

- Acceptance rationale
- Approver name and date
- Conditions that would trigger re-evaluation
- Next scheduled review date

### Step 6 — Treatment Planning and Implementation

**Treatment plan SLA** — once a treatment path is selected, a treatment plan must be in place within:

> **Default acceptance rule:** Any risk that breaches its Treatment Plan SLA is deemed accepted by default.

| Risk Level | Required Approval | Treatment Plan SLA |
|---|---|---|
| Critical | VP+ | Within 7 days of decision to mitigate |
| Severe | Director+ | Within 30 days of decision to mitigate |
| High | Director+ | Within 60 days of decision to mitigate |
| Moderate | N/A | Within 90 days of decision to mitigate |
| Low | N/A | Within 180 days of decision to mitigate |

**Acceptance authority by risk level:**

| Risk Level | Required Approval Authority |
|---|---|
| Critical | C-Suite / SVP+ |
| Severe | VP+ |
| High | Director+ |
| Moderate | Senior Manager+ |
| Low | Manager+ |

**Planning:**

- Identify specific treatment actions and link to UCF control IDs
- Determine required resources (personnel, technology, budget)
- Establish timelines and KPIs to measure effectiveness
- Obtain formal stakeholder approval

**Implementation:**

- Execute treatment plan per schedule
- Record all implementation activities, decisions, deviations, and issues
- Update the risk register record to reflect treatment progress and current residual score

---

## 7. Risk Register Management

The risk register is the single source of truth for the security risk programme. Every metric, report, and panel in the GRC platform derives from register records. Keeping it current is the core operational habit.

### Required Fields per Risk Record

| Field | Description |
|---|---|
| Risk ID | Unique identifier (e.g. HULL-2026-0042) |
| Title | Plain-language description of the risk |
| Category | Risk domain (e.g. Third Party, Data Security, Access Control) |
| Asset | System, data, or process at risk |
| Owner | Accountable individual or team |
| Likelihood | Score 1–5 per high water mark rule |
| Impact | Score 1–5 per impact scale |
| Inherent Score | Likelihood × Impact before controls |
| Linked Controls | UCF control IDs (e.g. UCF.01.01, UCF.06.01) |
| Residual Score | Calculated from inherent score and control effectiveness |
| Treatment | Mitigate / Avoid / Transfer / Accept |
| Status | Current workflow state |
| SLA Days | Days until response decision is due |
| Review Date | Next scheduled owner review |

### Risk Intake

1. Gather risk details from sources — audits, threat intelligence, PIRs, tooling outputs
2. Validate, categorise, and enter data into the risk register
3. Assign the risk to a Risk Owner for analysis and treatment
4. Link to relevant UCF control IDs based on the risk category and asset

### Risk Review and Update Process

- Risk Owners review their risks per the monitoring cadence
- Update status, mitigation progress, and changes in severity or impact
- Security GRC checks register fields for accuracy quarterly
- A risk that passes its review due date without an owner update is flagged in the Monthly Risk Review. If unresolved within one additional cycle, the risk is escalated to the Risk Owner's manager.

### Risk Register Workflow States

```
Submitted → In Review → Risk Assessment
                      → Mitigating       → Done
                      → Avoiding         → Done
                      → Transferring     → Done
                      → Accepting/Monitoring
```

| State | Description |
|---|---|
| Submitted | Risk first created in register |
| In Review | Security GRC assesses details and validates information |
| Risk Assessment | Additional data or analysis required before treatment decision |
| Mitigating | Active treatment in progress |
| Avoiding | Risk being eliminated by ceasing the activity or moving assets |
| Transferring | Risk being transferred to a third party |
| Accepting/Monitoring | Risk accepted with ongoing oversight |
| Done | Treatment implemented and verified; evidence collected |

### Risk Closure Criteria

A risk may be marked Done only when:

- Treatment measures are successfully implemented and verified
- Treatment results are documented, including the resulting residual score
- Evidence is collected in the Evidence Locker demonstrating that controls reduced the risk to an acceptable level
- The residual score is within appetite, or formal acceptance has been documented

---

## 8. Risk Monitoring and Review

### Monitoring Frequency

| Risk Level | Review Frequency |
|---|---|
| Critical | Monthly |
| Severe | Monthly |
| High | Quarterly |
| Moderate | Bi-annually |
| Low | Annually |

### Monitoring Activities

At each review cycle, the Risk Owner and Security GRC team:

- Track treatment progress and implementation status against the treatment plan
- Reassess control effectiveness and update UCF control effectiveness scores if changed
- Update risk scores based on changing threat conditions, new vulnerabilities, or incident data
- Scan for new or emerging risks that may affect the recorded asset or category
- Validate that residual risk levels are still accurate
- Escalate risks where conditions have worsened since the last review

---

## 9. Risk Reporting

### Reporting Process

1. Define KRIs and performance metrics aligned with business objectives
2. Capture data in the risk register: assessments, categories, scores, treatment status, ownership, compliance flags
3. Generate visualisations tailored to each audience — executive summary for leadership, operational detail for risk teams
4. Collect feedback to continuously refine reporting formats and relevance

### Leadership Reporting Frequency

| Audience | Report | Frequency | Content |
|---|---|---|---|
| C-Suite / Board | Programme Summary | Monthly | Health score, open Critical/Severe risks, decisions required, appetite status |
| VP / Director | Leadership Risk Briefing | Quarterly | All High and above risks, treatment progress, KRI trends |
| Security GRC | Risk Register Review | Monthly | Full register, SLA status, overdue actions, emerging risks |
| Risk Owners | Owner Summary | Per cadence | Risks owned, next review dates, open treatment actions |

### Key Risk Indicators (KRIs)

| KRI | Description | Target |
|---|---|---|
| Risk Exposure Trends | Number of open risks by severity over time | Decreasing quarter-on-quarter |
| Risk Treatment Timeliness | Percentage of risks treated within SLA | >90% |
| Risk Acceptance Rate | Percentage of risks accepted vs. mitigated | <20% |
| Third-Party Risk Exposure | Number of vendor risks by impact level | Zero unassessed Tier 1 vendors |
| Regulatory Compliance Risks | Number of risks linked to regulatory non-compliance | Zero unmitigated Critical/Severe |
| Unassigned Risks | Number of risks lacking a named Risk Owner | Zero |
| Open Critical / Severe Risks | Current exposure at highest levels | Zero Critical; Severe with active treatment plan |
| Overdue Risk Actions | Treatment plans past due date | Zero |

### Escalation

If an issue with a risk cannot be resolved by the appropriate authority within the owning team, it is escalated to senior leadership with the appropriate level and domain of authority. The escalation path is:

`Risk Owner → Risk Owner's Manager → Security GRC Lead → VP, Security → C-Suite`

---

## 10. Risk Culture and Awareness

### Building a Risk-Aware Culture

The Security GRC team fosters a strong risk culture emphasising:

- **Awareness** — understanding of the risk landscape and individual responsibilities
- **Accountability** — clear ownership of risks and treatment actions
- **Proactive Management** — anticipating and addressing risks before they materialise

### Risk Outreach Methods

- Regular office hours for risk consultations
- Dedicated communication channels (Slack, Teams)
- Team dashboards and self-service reporting via the GRC platform
- Cross-functional working groups
- Risk awareness training sessions

---

## 11. Risk Aggregation

The annual risk report provides an aggregated view across:

- Business functions and risk domains
- Risk trends and volume over time
- Existing and emerging risks
- Mitigation strategies and treatment progress

Where the risk register platform supports it, portfolio-level querying is available continuously for teams requiring on-demand aggregation outside the annual cycle.

The portfolio residual score — the sum of all residual scores across active risk records — is tracked as a top-level health indicator on the GRC dashboard Overview. A rising portfolio score signals that new risks are outpacing treatment progress.

---

## 12. Appendix

### Glossary

| Term | Definition |
|---|---|
| Risk | The potential for loss or damage when a threat exploits a vulnerability, considering both likelihood and impact |
| Threat | A circumstance or event with the potential to cause harm to operations, assets, or individuals |
| Issue | A problem that may not be a vulnerability itself, but could lead to one |
| Vulnerability | A weakness or flaw in a system, application, or process that could be exploited |
| Inherent Risk | The level of risk before any controls or mitigation measures are applied |
| Residual Risk | The risk that remains after controls have been implemented and their effectiveness accounted for |
| Risk Appetite | The amount and type of risk the organisation is willing to pursue or retain |
| Risk Tolerance | The organisation's readiness to bear risk after treatment in order to achieve its objectives |
| Control | A measure that maintains and/or modifies risk |
| UCF Control ID | A Universal Control Framework identifier that maps a single control to multiple compliance frameworks simultaneously |
| Treatment | The process of modifying risk through selection and implementation of appropriate options |
| Asset | An item, tangible or intangible, that if compromised would be damaging to the organisation |
| High Water Mark Rule | The method of scoring likelihood as the highest of three independent dimensions rather than an average |
| Portfolio Residual Score | The sum of all residual scores across active risk records; used as a top-level programme health indicator |

### References and Standards

**Core standards:**

- ISO/IEC 31000:2018 — Risk management guidelines
- ISO/IEC 27005:2022 — Guidance on managing information security risks
- ISO/IEC 27001:2022 — Information security management systems requirements
- ISO/IEC 27002:2022 — Information security controls

**Additional standards (as applicable):**

- NIST SP 800-30 — Guide for conducting risk assessments
- NIST Cybersecurity Framework (CSF) 2.0
- PCI DSS 4.0
- SOC 2 Trust Services Criteria
- GDPR — General Data Protection Regulation
- ISO 27017:2015 — Cloud services
- ISO 27018:2019 — PII in public clouds

### Revision History

| Version | Date | Author | Changes |
|---|---|---|---|
| v1.0 | 2026-06-24 | Security GRC | Initial release |
