# Jira Risk Project — Configuration Guide
## Docker Hull Security Risk Programme

**Alignment:** ISO 27005:2022, ISO 31000:2018, Docker Hull Risk Management Framework v1.0
**Purpose:** Configures a Jira project to support the full risk lifecycle — identification through treatment — with dashboard filters that give leadership the metrics they need without manual reporting.

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Issue Type](#2-issue-type)
3. [Custom Fields](#3-custom-fields)
4. [Field Configuration — Values and Rules](#4-field-configuration--values-and-rules)
5. [Workflow States](#5-workflow-states)
6. [Screens and Field Layout](#6-screens-and-field-layout)
7. [Required Fields by Screen](#7-required-fields-by-screen)
8. [Leadership Dashboard — JQL Filters](#8-leadership-dashboard--jql-filters)
9. [Metric Definitions](#9-metric-definitions)
10. [Automation Rules](#10-automation-rules)
11. [What Not to Configure](#11-what-not-to-configure)

---

## 1. Project Setup

| Setting | Value |
|---|---|
| Project name | Security Risk Register |
| Project key | RISK |
| Project type | Scrum (use sprints as review cycles) or Kanban (use board columns as workflow states) |
| Access | Private — Security GRC team + Risk Owners |
| Notification scheme | Notify Risk Owner on status change; notify Security GRC on SLA breach |

**Recommended board type:** Kanban. Risk treatment is not sprint-based — it is continuous. Kanban columns map directly to workflow states and give a live view of where every risk sits.

---

## 2. Issue Type

Create one custom issue type: **Risk**

Do not use the default Story, Bug, or Task types for risks. Risks have a distinct lifecycle, a scoring model, and SLA obligations that differ from engineering work. Mixing them into a shared project creates noise and breaks metrics.

| Issue type | Icon suggestion | Description |
|---|---|---|
| Risk | Shield / warning icon | A documented exposure with a likelihood, impact, owner, and treatment path |

---

## 3. Custom Fields

### Core Fields (required)

These fields must be completed before a risk moves from Submitted to In Review.

| Field name | Jira field type | Description |
|---|---|---|
| Risk ID | Text field (read-only) | Auto-generated or manual. Format: `HULL-{YYYY}-{####}`. Stable reference across the register, reports, and audit. |
| Risk Category | Select list (single) | Domain classification. See values in §4. |
| Affected Asset | Text field | The system, dataset, process, or service at risk. Be specific. |
| Likelihood | Number field (1–5) | Scored using the high water mark rule across three dimensions: Frequency, Technical Feasibility, Likelihood Precursor. |
| Impact | Number field (1–5) | Single 1–5 scale from Low to Critical. |
| Inherent Score | Number field | Likelihood × Impact. Set manually or via automation rule. Range 1–25. |
| Risk Rating | Select list (single) | Derived from Inherent Score. See score-to-rating mapping in §4. |
| Residual Score | Number field | Score after accounting for control effectiveness. Updated when controls are added or effectiveness changes. |
| Risk Appetite Status | Select list (single) | Derived from Residual Score. See appetite bands in §4. |
| Treatment | Select list (single) | The chosen response: Mitigate, Avoid, Transfer, or Accept / Monitor. |
| Risk Owner | User picker (single) | Accountable for the risk record, review cadence, and escalation. |
| Response Decision Due | Date picker | SLA deadline to select a treatment path. Determined by Risk Rating per the Risk Management Framework. |
| Treatment Plan Due | Date picker | SLA deadline to have a treatment plan approved and in progress. |
| Signal Source | Select list (single) | How the risk was identified. See values in §4. |

### Enrichment Fields (optional — fill in when available)

These fields add context but must not block risk creation.

| Field name | Jira field type | Description |
|---|---|---|
| Mitigation Owner | User picker (single) | The person executing the treatment plan. May differ from Risk Owner. |
| Linked Controls | Text field | UCF control IDs or ISO 27001 Annex A references governing this risk (e.g. `UCF.06.01, UCF.07.01`). |
| Acceptance Authority | Select list (single) | Required approver level if treatment is Accept. See values in §4. |
| Review Date | Date picker | Next scheduled owner review. Defaults to monitoring cadence based on Risk Rating. |
| Why It Matters | Paragraph (text area) | 2–4 sentence plain-English summary. Used in leadership reports. No jargon, no fine amounts. |
| Linked Risk Record | URL field | Link to the corresponding record in the GRC dashboard risk register. |

---

## 4. Field Configuration — Values and Rules

### Risk Category

| Value |
|---|
| Access Control |
| AI / ML |
| Compliance |
| Data Security |
| Infrastructure |
| Operational |
| Third Party |
| Vulnerability |

### Likelihood (1–5) — High Water Mark Rule

Score across all three dimensions. Record the highest of the three as the final score.

| Score | Frequency | Technical Feasibility | Likelihood Precursor |
|---|---|---|---|
| 5 | More than once per year | No specialist skills required | Event is active or unavoidable |
| 4 | Once per year | Moderate effort required | Clear trend — when not if |
| 3 | Once every 2–3 years | Significant effort required | Near-misses observed |
| 2 | Once in 3–5 years | Highly specialised skills required | Theoretical only |
| 1 | Once in 5+ years | State-actor level resources required | Perfect storm required |

### Impact (1–5)

| Score | Level | Description |
|---|---|---|
| 5 | Critical | Total service loss or material breach. Requires immediate action. |
| 4 | Severe | Significantly disrupts core business processes. |
| 3 | High | Substantial impact. Mitigable with focused controls. |
| 2 | Moderate | Noticeable disruption. Manageable through routine oversight. |
| 1 | Low | Unlikely to materially affect operations. |

### Inherent Score → Risk Rating

| Score Range | Risk Rating |
|---|---|
| 25 | Critical |
| 16–24 | Severe |
| 10–15 | High |
| 5–9 | Moderate |
| 1–4 | Low |

### Residual Score → Risk Appetite Status

| Residual Score | Appetite Status |
|---|---|
| 1–11 | Within Appetite |
| 12–19 | Approaches Appetite |
| 20–24 | Exceeds Appetite |
| 25 | Significantly Exceeds Appetite |

### Treatment

| Value | When to use |
|---|---|
| Mitigate | Implement controls to reduce likelihood or impact |
| Avoid | Cease the activity or move assets to a safer environment |
| Transfer | Insurance or outsourcing — shifts accountability |
| Accept / Monitor | Acknowledge and monitor — requires approval authority |

### Response Decision SLA (by Risk Rating)

| Risk Rating | Response Decision Due | Treatment Plan Due |
|---|---|---|
| Critical | 7 days from risk rating | 7 days from decision |
| Severe | 30 days from risk rating | 30 days from decision |
| High | 60 days from risk rating | 60 days from decision |
| Moderate | 90 days from risk rating | 90 days from decision |
| Low | 180 days from risk rating | 180 days from decision |

> **Default acceptance rule:** Any risk that passes its Response Decision Due date without a treatment selection is deemed accepted by default. Flag in the monthly risk review and escalate.

### Acceptance Authority (by Risk Rating)

| Risk Rating | Required Approval |
|---|---|
| Critical | C-Suite / SVP+ |
| Severe | VP+ |
| High | Director+ |
| Moderate | Senior Manager+ |
| Low | Manager+ |

### Signal Source

| Value |
|---|
| Audit finding |
| Incident / PIR |
| Manual — risk owner |
| Penetration test |
| Third-party assessment |
| Threat intelligence |
| Vulnerability scan |

---

## 5. Workflow States

```
Submitted → In Review → Risk Assessment
                      → Mitigating       → Done
                      → Avoiding         → Done
                      → Transferring     → Done
                      → Accepting / Monitoring
```

| State | Description | Who acts |
|---|---|---|
| Submitted | Risk created in the register. Core fields must be completed. | Risk submitter |
| In Review | Security GRC validates the risk details, scoring, and category. | Security GRC |
| Risk Assessment | Additional data or analysis required before treatment decision. | Security GRC + Risk Owner |
| Mitigating | Treatment plan approved and in progress. Controls being implemented. | Mitigation Owner |
| Avoiding | Risk being eliminated by ceasing the activity or moving assets. | Risk Owner |
| Transferring | Risk being transferred to a third party via insurance or contract. | Risk Owner |
| Accepting / Monitoring | Risk formally accepted. Under monitoring at standard cadence. | Risk Owner |
| Done | Treatment implemented and verified. Evidence collected. Residual score confirmed within appetite. | Security GRC |

**Transition rules:**

- Submitted → In Review: requires Likelihood, Impact, Affected Asset, Risk Owner
- In Review → Mitigating / Avoiding / Transferring / Accepting: requires Treatment selection and Response Decision Due date set
- Any state → Accepting / Monitoring: requires Acceptance Authority recorded in a comment with approver name and date
- Any state → Done: requires Residual Score updated and a comment confirming evidence collected

---

## 6. Screens and Field Layout

### Create Screen (what you see when logging a new risk)

```
Section: Risk Identity
  - Summary (Jira default — use as the risk title)
  - Risk Category
  - Affected Asset
  - Signal Source
  - Risk Owner

Section: Scoring
  - Likelihood (1–5)
  - Impact (1–5)
  - Inherent Score
  - Risk Rating

Section: Treatment
  - Treatment
  - Response Decision Due

Section: Description (optional at creation)
  - Why It Matters
```

### Edit / View Screen (full record)

All fields visible. Residual Score, Treatment Plan Due, Mitigation Owner, Linked Controls, Acceptance Authority, and Review Date are added here — they are not required at creation but must be completed as the risk progresses through the workflow.

### Transition Screens

Add a lightweight transition screen on the following state changes:

| Transition | Required fields on screen |
|---|---|
| → Mitigating | Treatment Plan Due, Mitigation Owner |
| → Accepting / Monitoring | Acceptance Authority, comment confirming approver name and date |
| → Done | Residual Score (updated), Review Date (for ongoing monitoring), comment confirming evidence |

---

## 7. Required Fields by Screen

| Field | Create | In Review | Mitigating | Done |
|---|---|---|---|---|
| Summary (title) | Required | — | — | — |
| Risk Category | Required | — | — | — |
| Affected Asset | Required | — | — | — |
| Likelihood | Required | — | — | — |
| Impact | Required | — | — | — |
| Inherent Score | Required | — | — | — |
| Risk Rating | Required | — | — | — |
| Risk Owner | Required | — | — | — |
| Signal Source | Required | — | — | — |
| Treatment | — | Required | — | — |
| Response Decision Due | — | Required | — | — |
| Treatment Plan Due | — | — | Required | — |
| Mitigation Owner | — | — | Required | — |
| Residual Score | — | — | — | Required |
| Acceptance Authority | Only if Accepting | — | — | — |

---

## 8. Leadership Dashboard — JQL Filters

Build these as saved filters and pin them to a Jira dashboard. Each addresses a question leadership asks every month.

```jql
-- 1. Risks exceeding appetite (the number leadership focuses on)
project = RISK
AND "Risk Appetite Status" in ("Exceeds Appetite", "Significantly Exceeds Appetite")
AND status not in (Done)
ORDER BY "Risk Rating" DESC

-- 2. SLA breach — response decision overdue (governance failure indicator)
project = RISK
AND "Response Decision Due" < now()
AND status not in (Done, "Mitigating", "Avoiding", "Transferring", "Accepting / Monitoring")
ORDER BY "Response Decision Due" ASC

-- 3. Treatment plan SLA breach
project = RISK
AND "Treatment Plan Due" < now()
AND status = Mitigating
ORDER BY "Treatment Plan Due" ASC

-- 4. All open Critical and Severe risks
project = RISK
AND "Risk Rating" in (Critical, Severe)
AND status not in (Done)
ORDER BY "Risk Rating" DESC, created ASC

-- 5. Accepted risks register (board visibility)
project = RISK
AND status = "Accepting / Monitoring"
ORDER BY "Risk Rating" DESC

-- 6. Risks by owner — treatment velocity
project = RISK
AND status = Mitigating
AND assignee is not EMPTY
ORDER BY "Treatment Plan Due" ASC

-- 7. Risks due for review this month
project = RISK
AND "Review Date" >= startOfMonth()
AND "Review Date" <= endOfMonth()
ORDER BY "Risk Rating" DESC

-- 8. New risks this quarter (intake volume)
project = RISK
AND created >= startOfQuarter()
ORDER BY created DESC
```

---

## 9. Metric Definitions

These are the metrics that feed the monthly leadership report and the weekly risk stand-up. Define them explicitly so everyone reports from the same numbers.

| Metric | Definition | JQL basis |
|---|---|---|
| Open risks | All risks not in Done | `status != Done` |
| Risks exceeding appetite | Open risks with Appetite Status = Exceeds or Significantly Exceeds | Filter 1 |
| SLA breach rate | % of risks where Response Decision Due has passed and no treatment selected | Filter 2 ÷ total open |
| Treatment velocity | Open risks in Mitigating state / total open risks | Filter 6 ÷ open count |
| Acceptance rate | Risks in Accepting / Monitoring / total closed or accepted | Filter 5 ÷ (Done + Accepting) |
| Risk intake volume | New risks created this quarter | Filter 8 count |
| Mean time to treatment decision | Average days from Created to transition out of In Review | Jira time-in-status report |
| Overdue treatment plans | Risks in Mitigating with Treatment Plan Due in the past | Filter 3 count |

---

## 10. Automation Rules

Configure these in Jira Automation to reduce manual overhead and enforce the Risk Management Framework SLA rules.

| Trigger | Condition | Action |
|---|---|---|
| Issue created with Risk Rating = Critical or Severe | — | Assign Response Decision Due = today + 7 or 30 days; notify Security GRC lead |
| Response Decision Due date reached | Status is Submitted or In Review | Add comment: "Response Decision SLA has been reached. Risk is deemed accepted by default unless treatment is selected today. Escalating to Risk Owner's manager."; notify Risk Owner + manager |
| Treatment Plan Due date reached | Status is Mitigating | Add comment: "Treatment Plan SLA has been reached."; notify Mitigation Owner + Risk Owner |
| Status transitions to Mitigating | Treatment Plan Due is empty | Block transition: "Treatment Plan Due date is required to move to Mitigating." |
| Status transitions to Done | Residual Score is empty | Block transition: "Residual Score must be updated before closing this risk." |
| Residual Score updated | — | Recalculate Risk Appetite Status based on score bands and update field |
| Review Date reached | Status = Accepting / Monitoring | Add comment: "This risk is due for owner review. Update status, residual score, and confirm acceptance is still appropriate." Notify Risk Owner. |

---

## 11. What Not to Configure

These are common additions that create noise without improving reporting or governance.

| Do not add | Why |
|---|---|
| CVSS score field | Vulnerability severity and risk score are different things. Use Residual Score. Mixing creates confusion in metrics. |
| Probability percentage | The 1–5 scale is deliberate. Percentages create false precision and make aggregation harder. |
| More than two SLA date fields | Every additional date is another field that goes stale. Response Decision Due and Treatment Plan Due are sufficient. |
| Risk description as required at creation | It blocks fast risk logging. Log first, describe when you have the context. |
| Epics linking risks to projects | Keep risk tracking separate from engineering delivery. The relationship belongs in a comment or linked issue, not a hierarchy. |
| Separate issue types for threats and vulnerabilities | Threats and vulnerabilities are inputs to a risk record, not risk records themselves. Track them in your vulnerability or threat intelligence tool and link to the RISK issue. |

---

## Related Documents

| Document | Purpose |
|---|---|
| `Risk-Management-Framework.md` | Governance source — scoring model, SLAs, approval authorities |
| `RISK-METHODOLOGY.md` | Inherent vs. residual calculation, rating bands |
| `ATTACK-COVERAGE.md` | ATT&CK technique-to-policy mapping — use Signal Source to link risks to threat categories |
| `SMART-BREVITY-GRC.md` | Writing the Why It Matters field and leadership report commentary |
| `POLICY-HIERARCHY.md` | Policy layer reference — helps populate Linked Controls field |
