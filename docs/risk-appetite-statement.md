# Security Risk Appetite Statement
**RedLine Resilience** · Prepared by Chris Cutts · June 2026 · DRAFT

---

## What We're Agreeing To

This document sets the boundaries for how much security risk we carry. It answers three questions leadership needs to answer once, so the team can operate without escalating every decision:

1. What's acceptable to carry day-to-day?
2. When does something need your attention?
3. When does it need the board?

---

## Our Position in Plain Language

> We have **low appetite** for risks that could result in a container breach, data leak, or service outage. We accept that some risk is unavoidable while we're remediating — as long as it's owned, has a deadline, and is visible here.

---

## When Do We Escalate?

Each risk gets a residual score (1–25) after we account for the controls we have in place. Here's what each band means for leadership:

| Score | Status | What Happens |
|---|---|---|
| 1–11 | **Within appetite** | Monitored. No action needed from leadership. |
| 12–19 | **Approaches** | Treatment plan required. CISO is managing it. |
| 20–24 | **Exceeds** | Needs VP sign-off and a 30-day fix deadline. |
| 25 | **Capacity breach** | Needs board sign-off within 5 business days. |

**Who can accept residual risk:**
- Scores 1–19 → Risk Owner
- Scores 20–24 → CISO
- Score 25 → CEO / Board

---

## Where We Stand Today

| Risk | What It Is | Residual Score | Status |
|---|---|---|---|
| HULL-2026-0042 | Docker Engine — known CVE on 6 prod hosts | 13 | Approaches |
| HULL-2026-0043 | Supply chain — unverified npm/PyPI packages | 9 | Within |
| LEAK-2026-0044 | AI agent with unrestricted container access | 9 | Within |
| LEAK-2026-0045 | LLM API sending data without a signed DPA | 7 | Within |
| LEAK-2026-0046 | Container images without verified signatures | 11 | Within |
| LEAK-2026-0047 | Policy exception — legacy vendor can't sign images | 5 | Within |
| **Portfolio total** | | **54 / 55** | **Approaches** |

**The headline:** Five of six risks are within appetite. HULL-2026-0042 (the Docker CVE) is the one that needs active treatment — it's the only thing keeping us at the edge of the threshold. Treatment is in progress.

---

## The Three Numbers to Watch

| Indicator | Now | Call the CISO | Call the Board |
|---|---|---|---|
| Risks above score 12 | 1 | 2 | 3 |
| Portfolio total score | 54 | 56 | 70 |
| Unowned open risks | 0 | 1 | 2 |

---

## Sign-off

By signing, leadership approves these thresholds as the operating standard for the security programme.

| Role | Name | Signature | Date |
|---|---|---|---|
| Security Lead | | | |
| VP Engineering | | | |
| CEO / COO | | | |

---

*Live data from RedLine Resilience GRC Platform · Refreshes with each risk register update*
