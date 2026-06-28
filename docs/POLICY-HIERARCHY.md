# Policy Hierarchy
## Docker Hull — How the seven meanings of "policy" connect

Inspired by the OSI Model of Policy framing (GRC Engineer). This document maps each layer to the actual artefacts in this repo and shows the derivation chain — how a rule in a Rego file traces back to a sentence in a governance document.

The problem this solves: "policy" means different things to a CISO, an engineer, a lawyer, and an auditor. GRC's job is to read across the whole stack and make sure the layers are consistent. If Layer 1 enforces a rule that Layer 7 never mandated, that's a control with no policy parent. If Layer 7 mandates something that Layer 1 never enforces, that's a policy with no teeth.

---

## The Stack

| Layer | Name | What it actually is | Docker Hull artefact |
|---|---|---|---|
| 7 | Public Policy | The parent governance document | `INFORMATION-SECURITY-POLICY.md` |
| 6 | Code of Conduct | HR and acceptable use | `ACCEPTABLE-USE-POLICY.md`, `HR-SECURITY-POLICY.md` |
| 5 | Privacy Policy | Data handling obligations | `PRIVACY-DATA-PROTECTION-POLICY.md`, `DATA-CLASSIFICATION-POLICY.md` |
| 4 | Password Policy | Specific technical requirements | `CREDENTIAL-PASSWORD-MANAGEMENT-POLICY.md` |
| 3 | Group Policy (GPO) | Endpoint and environment configuration | `ENDPOINT-SECURITY-POLICY.md` |
| 2 | IAM Policy | Access control rules (Effect: Deny) | `ACCESS-CONTROL-IAM-POLICY.md`, `tests/fixtures/policies/001-access-control-policy.json` |
| 1 | Policy-as-Code | Rego rules that fail the pipeline | `services/llm-gateway/src/policies/tool-calls.rego` |
| 8 | GRC | The translator — reads up and down the whole stack | Risk register, UCF control map, this document |

---

## Derivation Chains

A derivation chain shows how a runtime enforcement rule (Layer 1) traces to a business obligation (Layer 7). Each link must exist or the stack has a gap.

### Chain A — LLM Tool Call Access Control

```
Layer 7 — INFORMATION-SECURITY-POLICY.md
  "Access to systems and data is granted on a least-privilege basis."

    ↓ implements

Layer 2 — ACCESS-CONTROL-IAM-POLICY.md
  Roles permitted write access: admin, security_engineer, mcp_server
  Human approval required for all write operations

    ↓ enforced by

Layer 1 — services/llm-gateway/src/policies/tool-calls.rego
  allow if { input.write_operation == true
             input.approved_by != null
             input.caller_role in {"admin", "security_engineer", "mcp_server"} }
```

**Control linkage:** UCF.01.01 (Identity and Access Management), UCF.04.01 (Security in SDLC)

**Gap check:** The Rego policy enforces roles and approval. The IAM policy document defines which roles exist. The Information Security Policy mandates least-privilege. All three layers are consistent.

---

### Chain B — Credential and Password Requirements

```
Layer 7 — INFORMATION-SECURITY-POLICY.md
  "Authentication credentials must meet minimum strength requirements."

    ↓ specifies

Layer 4 — CREDENTIAL-PASSWORD-MANAGEMENT-POLICY.md
  Minimum 12 characters, complexity requirements, rotation cadence,
  prohibition on credential reuse, MFA required for privileged access

    ↓ enforced by

Layer 3 — ENDPOINT-SECURITY-POLICY.md
  MDM configuration enforces password policy on managed endpoints

    ↓ enforced by

Layer 2 — ACCESS-CONTROL-IAM-POLICY.md
  MFA required for all production system access
  Service account credentials rotated per credential policy cadence
```

**Control linkage:** UCF.01.01 (IAM), UCF.01.02 (MFA), UCF.05.01 (Endpoint Security)

**Gap check:** Layer 1 (Rego) does not currently enforce password strength — this is expected, as authentication happens upstream of the LLM gateway. The enforcement gap is intentional and documented.

---

### Chain C — Data Handling and Privacy

```
Layer 7 — INFORMATION-SECURITY-POLICY.md
  "Data must be classified, handled, and protected according to its sensitivity."

    ↓ classifies

Layer 5 — DATA-CLASSIFICATION-POLICY.md
  Four tiers: Public / Internal / Confidential / Restricted
  Handling requirements per tier

    ↓ operationalises

Layer 5 — PRIVACY-DATA-PROTECTION-POLICY.md
  GDPR Article 28 obligations, processor agreements,
  data subject rights, retention and deletion schedules

    ↓ enforced by

Layer 1 — services/llm-gateway/src/policies/tool-calls.rego
  Read operations allowed for authenticated callers only.
  Write operations require approval — prevents unreviewed data writes
  through the LLM gateway.
```

**Control linkage:** UCF.07.01 (Data Classification), UCF.09.01 (Privacy and Data Protection)

---

### Chain D — Acceptable Use and HR Obligations

```
Layer 7 — INFORMATION-SECURITY-POLICY.md
  "All users are responsible for using systems in accordance with
  the organisation's acceptable use requirements."

    ↓ defines

Layer 6 — ACCEPTABLE-USE-POLICY.md
  Permitted and prohibited uses of Docker Hull systems,
  monitoring acknowledgement, consequence framework

    ↓ reinforced by

Layer 6 — HR-SECURITY-POLICY.md
  Background screening, onboarding security briefing,
  offboarding access revocation, disciplinary process
```

**Control linkage:** UCF.08.03 (HR Security), UCF.06.02 (Security Awareness)

---

### Chain E — Endpoint and Environment Hardening

```
Layer 7 — INFORMATION-SECURITY-POLICY.md
  "Systems must be configured securely before connecting to
  production networks or accessing production data."

    ↓ specifies

Layer 3 — ENDPOINT-SECURITY-POLICY.md
  MDM enrolment required, disk encryption mandatory,
  screen lock timeout, approved software list,
  EDR agent installed and reporting

    ↓ enforced by

Layer 2 — ACCESS-CONTROL-IAM-POLICY.md
  Device compliance posture checked at authentication.
  Non-compliant devices denied access to production systems.
```

**Control linkage:** UCF.05.01 (Endpoint Security), UCF.01.01 (IAM)

---

## Gap Register

Known gaps in the derivation chain — where a layer mandates something not yet enforced at a lower layer.

| Gap | Layer missing | Policy parent | Risk record | Status |
|---|---|---|---|---|
| No Rego enforcement of data classification at the LLM gateway boundary | Layer 1 | DATA-CLASSIFICATION-POLICY.md | — | Open |
| Vendor access not gated by IAM policy | Layer 2 | THIRD-PARTY-RISK-MANAGEMENT-POLICY.md | HULL-2026-0042 | Open — mitigating |
| Endpoint compliance posture check not automated | Layer 3 → Layer 2 | ENDPOINT-SECURITY-POLICY.md | — | Open |
| No policy-as-code for SDLC guardrails in CI pipeline | Layer 1 | PDLC-SECURITY-GUARDRAILS.md | — | Planned |

---

## Layer 8 — GRC as the Translator

The seven layers above only hold together if someone is reading across all of them. That is what GRC does.

**In practice, this means:**

1. **When a new policy is written (Layer 7)** — GRC identifies which lower layers need updating and creates linked action items
2. **When a Rego rule is added (Layer 1)** — GRC traces it upward to confirm a policy parent exists; if not, that is a control with no mandate
3. **When an audit finding surfaces** — GRC locates which layer failed and whether the gap is in the rule, the document, or the enforcement
4. **When a risk is accepted** — GRC documents which layers were considered and why enforcement was not extended to Layer 1

**The coherence test:**

For any control or rule in this repo, you should be able to answer:
- Which Layer 7 policy mandates this?
- Which UCF control ID does it satisfy?
- Is it enforced at runtime (Layer 1–3) or only documented (Layer 4–7)?
- If only documented — is that a known and accepted gap?

If the answer to any of these is "I don't know," that is a gap worth logging.

---

## Related Documents

| Document | Layer | Purpose |
|---|---|---|
| `INFORMATION-SECURITY-POLICY.md` | 7 | Parent governance document |
| `ACCEPTABLE-USE-POLICY.md` | 6 | User obligations |
| `HR-SECURITY-POLICY.md` | 6 | Workforce security |
| `PRIVACY-DATA-PROTECTION-POLICY.md` | 5 | GDPR and data handling |
| `DATA-CLASSIFICATION-POLICY.md` | 5 | Data tier definitions |
| `CREDENTIAL-PASSWORD-MANAGEMENT-POLICY.md` | 4 | Credential requirements |
| `ENDPOINT-SECURITY-POLICY.md` | 3 | Device hardening |
| `ACCESS-CONTROL-IAM-POLICY.md` | 2 | Access rules and roles |
| `services/llm-gateway/src/policies/tool-calls.rego` | 1 | Runtime enforcement |
| `RISK-METHODOLOGY.md` | 8 | How GRC evaluates gaps across layers |
| `Risk-Management-Framework.md` | 8 | Governance of the translation process |
