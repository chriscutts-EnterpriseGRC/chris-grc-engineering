# Risk Appetite & Threshold Statement
**Organisation:** RedLine Resilience
**Domain:** Container & AI Security
**Prepared by:** Chris Cutts, Security Engineering
**Date:** June 2026
**Status:** DRAFT — Pending Leadership Sign-off

---

## Purpose

This statement defines the level of security risk RedLine Resilience is willing to accept in the course of operating container-based and AI-integrated workloads. It provides the quantitative thresholds used in the GRC platform risk register and establishes the escalation triggers that require CISO, VP, or board-level action.

---

## 1. Qualitative Appetite Statement

> RedLine Resilience has **low appetite** for container security risks that could result in unauthorised code execution, data exfiltration, or service outage. We have **near-zero appetite** for supply chain compromise of production images or unchecked AI data exposure. We accept that some residual risk is unavoidable during active remediation, provided it is owned, time-boxed, and visible.

---

## 2. Per-Risk Thresholds (Residual Score)

Residual score = inherent score after control effectiveness is applied. Scale: 2–25.

| Band | Residual Score | Meaning | Required Action |
|---|---|---|---|
| **Within Appetite** | ≤ 11 | Acceptable — monitor on standard cadence | Owner review quarterly |
| **Approaches** | 12–19 | Elevated — treatment plan required | Owner review monthly; CISO informed |
| **Exceeds** | 20–24 | Over appetite — active remediation required | VP Engineering sign-off; 30-day treatment deadline |
| **Significantly Exceeds** | 25 | Capacity breach | Board-level sign-off required within 5 business days |

### Acceptance authority by band

| Band | Who can accept residual risk |
|---|---|
| Within / Approaches | Risk Owner (named in register) |
| Exceeds | CISO |
| Significantly Exceeds | CEO / Board |

---

## 3. Portfolio Appetite (Aggregate Residual Score)

The **portfolio residual score** is the sum of all open risk residual scores. It reflects the total unmitigated exposure carried by the organisation at any point in time.

| Portfolio Score | Status | Action |
|---|---|---|
| ≤ 40 | Within appetite | No escalation required |
| 41–55 | Approaches threshold | CISO reviews monthly; treatment plans confirmed active |
| 56–70 | Exceeds appetite | CISO escalates to leadership; resource allocation reviewed |
| > 70 | Capacity breach | Board briefing required; programme investment decision needed |

### Current portfolio position (June 2026)

| Risk | Inherent | Residual | Band |
|---|---|---|---|
| HULL-2026-0042 · Docker Engine AuthZ Bypass | 25 | 13 | Approaches |
| HULL-2026-0043 · npm/PyPI Supply Chain Worm | 20 | 9 | Within |
| LEAK-2026-0044 · AI Agent Unrestricted Docker Socket | 12 | 9 | Within |
| LEAK-2026-0045 · LLM API Data Leakage | 12 | 7 | Within |
| LEAK-2026-0046 · Unsigned Container Image Provenance | 16 | 11 | Within |
| LEAK-2026-0047 · Policy Exception — Legacy Publisher | 12 | 5 | Within |
| **Portfolio Total** | **97** | **54** | **Approaches** |

**Current status: Approaches (54/55 threshold).** One risk (HULL-2026-0042) is individually above the Approaches boundary. No board escalation is required today, but the portfolio is one untreated risk away from exceeding appetite. Active treatment of HULL-2026-0042 is the highest-priority action to bring the portfolio back to Within.

---

## 4. Key Risk Indicators (KRIs)

These are the early-warning signals monitored in the GRC platform. Breaching a KRI does not mean risk appetite is breached — it means the conversation needs to happen.

| KRI | Current | Warning | Breach |
|---|---|---|---|
| Risks individually above Approaches (residual ≥ 12) | 1 | 2 | 3+ |
| Portfolio residual score | 54 | 55 | 70 |
| Risks with no named owner | 0 | 1 | 2+ |
| Critical risks (inherent ≥ 20) with no active treatment | 0 | 1 | 2+ |
| Policy exceptions open past expiry | 0 | 1 | 2+ |
| Controls with effectiveness = 0 and open risks dependent | 2 | 2 | 3+ |

---

## 5. Review Cadence

| Trigger | Action |
|---|---|
| Quarterly (standard) | Risk owner reviews all assigned risks; updates residual scores |
| New critical risk identified | CISO review within 5 business days |
| Portfolio score crosses 56 | Leadership briefing scheduled within 10 business days |
| Policy exception approaching expiry (30 days) | Owner notified; renewal or closure required |
| Material change to infrastructure or AI usage | Threat model refresh; risk register reviewed |

---

## 6. Sign-off

By signing, leadership confirms they have reviewed the current risk portfolio and approve the appetite thresholds above.

| Role | Name | Signature | Date |
|---|---|---|---|
| CISO / Security Lead | | | |
| VP Engineering | | | |
| CEO / COO | | | |

---

*Generated from live risk register data · RedLine Resilience GRC Platform · June 2026*
