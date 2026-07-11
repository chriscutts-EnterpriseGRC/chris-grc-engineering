# Risk Taxonomy and Threat Library

## Purpose

This document defines how risks are categorised in the register and how likelihood scores are assigned. It is the reference for anyone creating a new risk record — in Jira, Notion, or directly in Supabase.

Aligned to: ISO 27005:2022 · ISO 31000:2018 · MITRE ATT&CK Enterprise v14

---

## Risk Categories

Five top-level categories. Every risk in the register belongs to exactly one.

| Category | Definition | Primary Jira value |
|---|---|---|
| **Technology** | Failures, vulnerabilities, or misconfigurations in systems, infrastructure, or software | `Technology` |
| **Operational** | Process failures, human error, or breakdowns in day-to-day execution | `Operational` |
| **Compliance** | Failure to meet legal, regulatory, or contractual obligations | `Compliance` |
| **Third-Party** | Risks introduced by vendors, suppliers, or partners | `Third-Party` |
| **Strategic** | Risks that affect the organisation's direction, reputation, or ability to compete | `Strategic` |

---

## Likelihood Scoring

Likelihood is scored 1–5. The **High Water Mark Rule** applies across three dimensions: choose the single highest score from the three dimensions below — that becomes the likelihood score for the risk.

| Score | Label | Dimensions |
|---|---|---|
| **5** | Almost Certain | Historical precedent at this organisation OR active threat intelligence indicating imminent targeting OR critical control absent for >90 days |
| **4** | Likely | Occurred at a peer organisation in the last 12 months OR multiple control weaknesses present OR threat actor has demonstrated capability and intent |
| **3** | Possible | Plausible given the threat landscape OR single control gap identified OR publicly known vulnerability exists in used technology |
| **2** | Unlikely | No known precedent in sector OR controls are operational but not independently tested OR theoretical attack path only |
| **1** | Rare | Requires multiple simultaneous failures OR threat actor capability not credibly demonstrated OR mitigating architecture makes exploitation implausible |

**High Water Mark Rule**: score each dimension independently. The final likelihood score is the maximum of the three, not an average.

---

## Impact Scoring

Impact is scored 1–5 across four dimensions. Take the highest score.

| Score | Label | Operational | Financial | Regulatory | Reputational |
|---|---|---|---|---|---|
| **5** | Critical | Service unavailable >24h or data destroyed | >$5M or existential threat | Regulatory action, licence suspension | National media, lasting brand damage |
| **4** | High | Service degraded >4h or significant data loss | $500K–$5M | Regulatory investigation, fines likely | Industry-wide coverage, customer churn |
| **3** | Medium | Service degraded <4h or limited data exposure | $50K–$500K | Regulatory inquiry or breach notification | Trade press, isolated customer complaints |
| **2** | Low | Minor disruption, no data loss | $5K–$50K | Internal policy violation only | Internal only, no external visibility |
| **1** | Negligible | No operational impact | <$5K | No regulatory relevance | No external impact |

---

## Risk Appetite Thresholds

Inherent risk score = Likelihood × Impact (1–25).

| Score range | Label | Required action |
|---|---|---|
| 1–11 | Within appetite | Monitor quarterly. No treatment plan required unless trending upward. |
| 12–19 | Approaches appetite | Treatment plan required within 30 days. Assign owner. Review monthly. |
| 20–24 | Exceeds appetite | Treatment plan required within 14 days. CISO visibility. Review bi-weekly. |
| 25 | Significantly exceeds appetite | Immediate escalation to CISO and CRO. Treatment or acceptance within 7 days. |

Residual risk = Inherent × (1 − 0.5 × control effectiveness), where control effectiveness is expressed as a decimal (0.0–1.0).

---

## Threat Library

### Technology Threats

| Threat ID | Threat | Asset at risk | ATT&CK reference | Default likelihood |
|---|---|---|---|---|
| T-TECH-01 | Unpatched critical vulnerability exploited | Production services, customer data | T1190 Exploit Public-Facing Application | 3 |
| T-TECH-02 | Cloud storage misconfiguration exposes data | S3/Blob storage, sensitive records | T1530 Data from Cloud Storage | 3 |
| T-TECH-03 | Credential stuffing against admin accounts | Identity platform, all downstream systems | T1110 Brute Force | 4 |
| T-TECH-04 | Supply chain compromise via third-party dependency | Application build pipeline, production artefacts | T1195 Supply Chain Compromise | 3 |
| T-TECH-05 | Ransomware encrypts production data | Databases, file stores, backups | T1486 Data Encrypted for Impact | 2 |
| T-TECH-06 | Secrets exposed in source code or logs | API keys, database credentials, tokens | T1552 Unsecured Credentials | 4 |
| T-TECH-07 | Privilege escalation via misconfigured IAM role | Cloud management plane, all resources | T1548 Abuse Elevation Control Mechanism | 3 |
| T-TECH-08 | Lateral movement through overly permissive network segmentation | Internal services, databases | T1021 Remote Services | 2 |
| T-TECH-09 | Log tampering or deletion covering adversary activity | SIEM, audit trails | T1070 Indicator Removal | 2 |
| T-TECH-10 | Denial of service against customer-facing infrastructure | API gateway, web application | T1498 Network Denial of Service | 2 |

### Operational Threats

| Threat ID | Threat | Asset at risk | Root cause pattern | Default likelihood |
|---|---|---|---|---|
| T-OPS-01 | Change deployed without approval bypasses controls | Production environment, data integrity | Change management failure | 3 |
| T-OPS-02 | Privileged access not revoked after offboarding | All systems the former employee accessed | Joiner-mover-leaver process failure | 4 |
| T-OPS-03 | Backup not tested; recovery fails during incident | Critical business data, RTO/RPO objectives | BC/DR gap | 3 |
| T-OPS-04 | Security awareness gap enables phishing | Email, credentials, internal systems | Training programme gap | 4 |
| T-OPS-05 | Incident response playbook not followed under pressure | Regulatory timeline, evidence chain | IR process maturity gap | 2 |
| T-OPS-06 | Manual error in data handling causes breach | Customer PII, financial records | Insufficient data handling controls | 3 |
| T-OPS-07 | Alert fatigue causes critical signal to be missed | SIEM, EDR alerting | Monitoring tuning gap | 3 |

### Compliance Threats

| Threat ID | Threat | Regulation | Trigger | Default likelihood |
|---|---|---|---|---|
| T-COMP-01 | Personal data retained beyond legal obligation | GDPR Art.5(1)(e), CCPA | No data retention schedule enforced | 3 |
| T-COMP-02 | Breach notification deadline missed | GDPR Art.33 (72h), state breach laws | Incident response playbook gap | 2 |
| T-COMP-03 | Audit evidence not available for control period | SOC 2, ISO 27001 | Evidence collection process gap | 3 |
| T-COMP-04 | Policy not reviewed within required cycle | Internal policy, ISO 27001 A.5 | Policy review schedule not enforced | 4 |
| T-COMP-05 | Data transfer to unsanctioned jurisdiction | GDPR Ch.V, CCPA | Third-party contract gap | 2 |
| T-COMP-06 | AI system deployed without risk classification | EU AI Act Art.6, ISO 42001 | AI governance gap | 3 |

### Third-Party Threats

| Threat ID | Threat | Asset at risk | ISO 27005 threat type | Default likelihood |
|---|---|---|---|---|
| T-3P-01 | Critical vendor suffers breach exposing shared customer data | Customer data, contractual obligations | T.3.4 Supplier failure | 3 |
| T-3P-02 | Vendor sub-processor introduces data residency violation | Customer PII | T.3.6 Third-party non-compliance | 2 |
| T-3P-03 | SaaS vendor discontinues service without notice | Business continuity, data access | T.3.5 Service termination | 2 |
| T-3P-04 | API integration allows over-privileged data access | Customer data, internal systems | T.3.1 Unauthorised access | 3 |
| T-3P-05 | Vendor fails annual security questionnaire reassessment | Vendor risk posture unknown | T.3.3 Inadequate security controls | 3 |

### Strategic Threats

| Threat ID | Threat | Business impact | Indicator | Default likelihood |
|---|---|---|---|---|
| T-STRAT-01 | Security incident causes customer churn | Revenue, ARR | Trust/reputational damage | 2 |
| T-STRAT-02 | Compliance certification lost or not renewed | Enterprise sales, enterprise contracts | Audit failure | 2 |
| T-STRAT-03 | AI product feature creates undisclosed legal liability | Legal, regulatory, brand | AI governance gap | 3 |
| T-STRAT-04 | Competitor breach erodes sector trust in SaaS category | Customer acquisition cost, conversion | Industry-level event | 1 |

---

## Asset Criticality Tiers

Asset criticality is used as one input to impact scoring. Assign before scoring impact.

| Tier | Label | Definition | Examples |
|---|---|---|---|
| **1** | Critical | Loss causes immediate regulatory, financial, or operational failure | Customer PII database, payment processing, authentication systems, production secrets store |
| **2** | High | Loss causes significant operational disruption or breach notification | Internal customer data, SaaS integrations with data access, production infrastructure configs |
| **3** | Medium | Loss causes material internal disruption but limited external impact | Internal tooling, development environments, non-sensitive SaaS accounts |
| **4** | Low | Loss causes minor disruption; no regulatory or customer impact | Marketing assets, public-facing content, internal wikis with no sensitive data |

---

## Threat Source Classification

Used in Jira `Threat Source` field (ISO 27005 §8.3).

| Source | Definition | Examples |
|---|---|---|
| `External — Adversarial` | Motivated attacker with intent and capability | Nation-state, organised crime, hacktivist |
| `External — Environmental` | Non-human external event | Natural disaster, power failure, ISP outage |
| `Internal — Accidental` | Unintentional act by insider | Misconfiguration, accidental deletion, phishing click |
| `Internal — Deliberate` | Malicious insider with intent | Privilege abuse, data theft, sabotage |
| `Third-Party` | Action or failure by a vendor or partner | Vendor breach, SaaS outage, supply chain compromise |
| `Systemic` | Weakness in design or process rather than a specific actor | Architecture flaw, technical debt, absent control |

---

## How to use this document

When creating a new risk record:

1. **Category**: pick the single best-fit category from the five above.
2. **Threat**: find the closest matching threat ID in the library, or create a new one following the same format. Record the threat ID in the risk description.
3. **Likelihood**: score each of the three dimensions (historical, control state, threat actor) independently. Apply the High Water Mark Rule — use the highest score.
4. **Impact**: score across operational, financial, regulatory, and reputational dimensions. Use the highest score.
5. **Asset criticality**: identify the primary asset at risk and assign it a tier (1–4). This informs impact scoring but does not replace it.
6. **Inherent score**: Likelihood × Impact.
7. **Residual score**: apply the control effectiveness formula once treatment controls are identified.

---

*Aligned to ISO 27005:2022 and MITRE ATT&CK Enterprise v14. Last reviewed 2026-07-05.*
