# Third-Party Risk Management Policy

**Program:** Resilience Ops GRC Platform  
**Owner:** GRC  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** ISO 27001 A.5.19–5.22, SOC 2 CC9.2, GDPR Art. 28, NIST SP 800-53 SA-9, EU AI Act Art. 28

---

## Purpose

This policy defines how [Organization] identifies, assesses, monitors, and manages security and compliance risks arising from third-party vendors, suppliers, and service providers. Third-party risk is a significant threat vector — a vendor's security failure can directly compromise [Organization]'s data and systems.

---

## Scope

Applies to all external parties that:
- Process, store, or transmit [Organization] data (including personal data)
- Provide software, services, or infrastructure used in [Organization]'s operations
- Have access to [Organization]'s systems, networks, or premises
- Provide AI models, ML services, or AI infrastructure (subject to additional requirements)

---

## Vendor Tiering

All vendors are classified into risk tiers based on their access to data and systems:

| Tier | Criteria | Assessment rigor | Review frequency |
|------|----------|-----------------|-----------------|
| **Critical** | Processes Restricted data; has privileged system access; provides foundational infrastructure | Full security questionnaire + DPA + contractual security requirements + annual review | Annual + on material change |
| **High** | Processes Confidential data; integration access to production systems | Security questionnaire + DPA + annual review | Annual |
| **Standard** | Processes Internal data only; limited system access | Lightweight questionnaire + DPA if personal data | Bi-annual |
| **Low** | No [Organization] data access; no system access; commodity services | Self-attestation | On contract renewal |

Current vendor inventory with tier assignments is maintained in the GRC Dashboard (Third Party module).

### Current Critical Vendors

| Vendor | Service | Risk concern |
|--------|---------|-------------|
| Supabase | Primary database | Processes all Restricted data |
| AWS | Cloud infrastructure | Hosts all production systems |
| GitHub | Source code + CI/CD | Accesses codebase and deployment pipeline |
| Qualys | Vulnerability scanning | Accesses production scan data |
| Vanta | Compliance monitoring | Reads compliance posture data |

---

## Pre-Onboarding Assessment

Before any new vendor is granted access to [Organization] data or systems:

### Step 1: Risk Classification

GRC classifies the vendor against the tier criteria above. Engineering Lead confirms the intended use and data scope.

### Step 2: Security Assessment

| Tier | Assessment requirements |
|------|------------------------|
| Critical | Full TPRM questionnaire (based on SIG Lite or equivalent); review of SOC 2 Type II report or equivalent; penetration test results (if available); review of sub-processor list |
| High | Standard questionnaire; SOC 2 report or equivalent attestation |
| Standard | Lightweight questionnaire confirming basic security controls |
| Low | Self-attestation against minimum baseline |

Questionnaire responses are reviewed by Security Engineering. Critical findings (no MFA, no encryption, no incident response process) block onboarding until remediated.

### Step 3: Data Protection Requirements

If the vendor will process personal data (GDPR Art. 28):
- **Data Processing Agreement (DPA) is mandatory** — vendor may not process personal data before DPA is signed
- DPA must specify: processing purposes, data types, retention, security measures, sub-processor restrictions, breach notification, deletion on termination
- Legal reviews and signs all DPAs

### Step 4: Contractual Security Requirements

Standard contract security addendum includes:
- Obligation to maintain appropriate technical and organisational security measures
- Breach notification within 24 hours of discovery
- Right to audit (or accept third-party audit evidence)
- Compliance with applicable data protection law
- Sub-processor approval requirement
- Data deletion on contract termination

### Step 5: Approval

Vendor onboarding requires sign-off from:
- Security Engineering (security assessment passed)
- Legal (contract and DPA reviewed)
- GRC (tier assigned, vendor registered)

---

## AI Vendor Requirements

AI vendors (providers of AI models, APIs, or ML infrastructure) have additional requirements per EU AI Act Art. 28:

| Requirement | Detail |
|-------------|--------|
| **Risk tier documentation** | AI vendor must provide documentation on the AI system's risk tier classification |
| **Technical documentation** | Vendor must provide documentation per EU AI Act Art. 11 for high-risk AI systems |
| **Transparency obligations** | For AI-generated output visible to users, vendor must confirm the system meets Art. 13 transparency requirements |
| **Incident reporting** | Vendor must notify [Organization] of any AI safety incidents per EU AI Act Art. 62 obligations |
| **Data usage terms** | Vendor must confirm that [Organization] data is not used to train or fine-tune models without explicit consent |
| **Model versioning** | Vendor must provide version history and change notifications; silent model updates are a prohibited pattern |

**Current gap:** OpenAI — no DPA in place (RSK-004). Personal data must not be sent to OpenAI until DPA is executed. AI vendor gaps are tracked in the GRC Dashboard (Third Party module — AI Vendor Gaps filter).

---

## Ongoing Monitoring

| Activity | Tier | Frequency |
|----------|------|-----------|
| Security posture review (SOC 2 report, penetration test results) | Critical + High | Annual |
| TPRM questionnaire refresh | Critical | Annual |
| Vendor breach or security incident check | All | Ongoing (alert-based) |
| Sub-processor change review | Critical + High | On notification by vendor |
| Contract and DPA renewal | All | Before expiry |
| Vendor financial health check | Critical | Annual |

If a vendor notifies [Organization] of a breach or security incident:
1. Assess whether [Organization] data is affected
2. Treat as a potential personal data breach — GDPR 72-hour clock may apply
3. Engage Legal and follow [Incident Response Policy](./INCIDENT-RESPONSE-POLICY.md)

---

## Vendor Access Controls

Vendors with system access must comply with [Access Control & IAM Policy](./ACCESS-CONTROL-IAM-POLICY.md):
- Access provisioned through SSO — no shared credentials
- MFA mandatory
- Access scoped to minimum required; time-limited
- All vendor access logged at `AUDIT` level
- Access reviewed as part of quarterly access recertification

---

## Offboarding Vendors

When a vendor relationship ends:
1. Revoke all system access on or before contract end date
2. Confirm data deletion or return per the DPA / contractual terms
3. Obtain written confirmation of deletion from vendors that processed Restricted or personal data
4. Archive contract and assessment records for 7 years
5. Remove from vendor register in GRC Dashboard

---

## Metrics

| Metric | Target |
|--------|--------|
| Critical vendors with current DPA | 100% |
| Critical vendors with current SOC 2 report or equivalent | 100% |
| Critical/High vendors with overdue annual review | 0 |
| Vendors processing personal data without DPA | 0 |
| Vendor breach notifications assessed within 24 hours | 100% |

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [Privacy & Data Protection Policy](./PRIVACY-DATA-PROTECTION-POLICY.md)
- [Access Control & IAM Policy](./ACCESS-CONTROL-IAM-POLICY.md)
- [Incident Response Policy](./INCIDENT-RESPONSE-POLICY.md)
- [Security Policy — AI security strategy](./SECURITY.md)
- [PDLC Security Guardrails](./PDLC-SECURITY-GUARDRAILS.md)
