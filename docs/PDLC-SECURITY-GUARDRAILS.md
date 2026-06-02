# PDLC Security Guardrails

**Program:** Resilience Ops GRC Platform  
**Owner:** Security Engineering + Product  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** SOC 2 CC6.1, ISO 27001 A.8.25, NIST CSF GV.OC, EU AI Act Art. 9 & 13, ISO 42001

---

## Purpose

This document defines security and risk guardrails embedded into the Product Development Lifecycle (PDLC) — the strategic layer above the SDLC. Where SDLC guardrails catch vulnerabilities in code, PDLC guardrails prevent insecure product decisions before a line of code is written.

Security enters at every product phase gate: Discovery, Definition, Design, Build, Launch, and Operate. Each gate has mandatory security inputs that must be satisfied before the product team advances.

---

## Why PDLC Security Differs from SDLC

| Dimension | SDLC | PDLC |
|---|---|---|
| Focus | Code and pipeline | Product decisions and design |
| Timing | During development | Before development begins |
| Actors | Engineering, DevSecOps | Product, Engineering, Security, Legal, GRC |
| Output | Secure code | Secure product architecture and requirements |
| Vulnerability type caught | Technical (CVE, misconfig) | Architectural (design flaws, compliance gaps, privacy risks) |

---

## Phase Gate Model

### Gate 0: Discovery

**Trigger:** New product idea, feature request, or initiative enters backlog.

| Guardrail | Activity | Owner | Required? |
|---|---|---|---|
| Risk Triage | Classify initiative risk level (Low / Medium / High / Critical) using standard risk matrix | GRC | Yes |
| Data Sensitivity Screening | Identify if new feature handles PII, financial data, health data, or AI training data | Product + Privacy | Yes |
| Regulatory Scoping | Flag applicable regulations: GDPR, CCPA, EU AI Act, HIPAA, PCI-DSS | Legal + GRC | Yes |
| Third-Party Dependency Check | Identify new vendors, APIs, or OSS components needed | Engineering | Yes (if applicable) |
| AI Feature Triage | If AI/ML involved: classify risk tier per EU AI Act Annex III | AI Governance Lead | Yes (if applicable) |

**Gate Exit Criteria:**
- Risk level documented in product ticket
- Data types identified
- Applicable regulations noted
- No "forbidden" feature patterns (see Prohibited Patterns below)

---

### Gate 1: Definition

**Trigger:** Initiative moves from ideation to requirements definition.

| Guardrail | Activity | Owner | Required? |
|---|---|---|---|
| Security Requirements | Define security acceptance criteria (auth, encryption, logging, access control) as part of story definition | Security Engineering | Yes for Medium+ risk |
| Privacy by Design | Apply data minimisation, purpose limitation, and retention rules to data model | Privacy | Yes if PII involved |
| Threat Model (Initial) | Produce high-level threat model covering trust boundaries and primary attack surfaces | Security Engineering | Yes for High/Critical risk |
| Compliance Checklist | Map feature to relevant control framework requirements (SOC 2, ISO 27001, EU AI Act) | GRC | Yes for regulated features |
| Abuse Case Documentation | Document how the feature could be misused or weaponised | Product + Security | Yes for High/Critical risk |

**Security Acceptance Criteria Template:**
```
Given: [actor] attempts to [action]
When:  [condition or boundary]
Then:  [expected secure outcome — reject, log, rate-limit, etc.]
```

**Gate Exit Criteria:**
- Security requirements in Definition of Done
- Threat model exists (even if draft)
- Compliance mapping complete
- Privacy impact assessed

---

### Gate 2: Design

**Trigger:** Architecture and UX design phase begins.

| Guardrail | Activity | Owner | Required? |
|---|---|---|---|
| Architecture Security Review | Review system design for insecure patterns: overprivileged services, unencrypted data at rest/transit, missing auth layers | Security Engineering | Yes for all new services |
| Threat Model (Final) | Complete STRIDE/LINDDUN threat model with mitigations mapped | Security Engineering | Yes for High/Critical risk |
| API Security Design | Review API contract for authentication, authorisation, rate limiting, input validation, versioning | Security Engineering | Yes for all new APIs |
| Encryption Design | Confirm encryption approach for data at rest, in transit, and in use | Security Engineering | Yes if sensitive data involved |
| Authentication/Authorisation Design | Define auth model: SSO, MFA requirements, RBAC/ABAC, session management | Security Engineering | Yes |
| AI Model Risk Assessment | Document model provenance, training data, bias review, output controls, explainability approach | AI Governance Lead | Yes for AI features |
| Supply Chain Review | Assess new dependencies for maintainership, license, historical CVE frequency | Security Engineering | Yes for new OSS/vendor |

**Gate Exit Criteria:**
- Security architecture approved by Security Engineering
- Threat model signed off
- No open Critical/High design-level risks without accepted mitigations
- AI risk assessment complete (if applicable)

---

### Gate 3: Build

*SDLC security guardrails are the primary mechanism here. See [SDLC-SECURITY-GUARDRAILS.md](./SDLC-SECURITY-GUARDRAILS.md) for full detail.*

| Guardrail | Activity | Owner |
|---|---|---|
| Security Requirements Verification | Confirm security acceptance criteria are covered by tests or code review | Security Engineering |
| Penetration Test Scoping | Define scope for pre-launch pentest if feature is High/Critical risk | Security Engineering |
| Privacy Implementation Review | Verify data minimisation, consent flows, and retention implemented as designed | Privacy |

---

### Gate 4: Launch

**Trigger:** Feature ready for production release.

| Guardrail | Activity | Owner | Required? |
|---|---|---|---|
| Pre-Launch Security Sign-off | Security Engineering confirms no open Critical/High findings | Security Engineering | Yes |
| Penetration Test (if scoped) | Independent pentest of new feature in staging | External / Internal Red Team | Yes for High/Critical risk |
| Runbook and IR Playbook | Confirm incident response playbook exists for new attack surfaces | Security Operations | Yes for customer-facing features |
| Disclosure and Communication | Prepare security disclosure language for release notes if feature changes security posture | Security + Product | Yes if user-visible security change |
| Compliance Evidence Package | Assemble audit evidence: threat model, scan results, review records, SBOM | GRC | Yes for regulated features |
| EU AI Act Conformity Check | Verify AI feature meets transparency, logging, and human oversight requirements before release | AI Governance Lead | Yes for AI features |

**Gate Exit Criteria:**
- Security sign-off documented
- Pentest report reviewed and findings remediated or accepted
- IR playbook exists
- Compliance evidence package complete

---

### Gate 5: Operate

**Trigger:** Feature is live in production.

| Guardrail | Activity | Cadence |
|---|---|---|
| Continuous Vulnerability Monitoring | VSRM tracks CVEs in production components; SLA enforcement active | Ongoing |
| Security Metrics Review | Review MTTR, open P0/P1 vulns, SLA breach rate in GRC dashboard | Monthly |
| Threat Model Refresh | Re-run threat model when feature changes significantly or new threats emerge | On major change or annually |
| Compliance Audit Support | Provide evidence for SOC 2, ISO 27001, EU AI Act audits | On audit cycle |
| Privacy Review | Assess data retention compliance; confirm deletion flows working | Quarterly |
| AI Model Performance Monitoring | Monitor for model drift, unexpected outputs, and adversarial inputs | Ongoing for AI features |
| Third-Party Risk Re-assessment | Re-assess vendor security posture for critical integrations | Annually |

---

## Prohibited Patterns

The following product decisions require escalation to the CISO before proceeding. No feature may launch with these unresolved:

| Pattern | Risk | Escalation Path |
|---|---|---|
| Storing plaintext credentials in any form | Credential exposure | Security Engineering + CISO |
| Collecting biometric data without explicit consent | GDPR Art. 9 violation | Legal + Privacy + CISO |
| Using an AI model in a high-risk EU AI Act Annex III category without conformity assessment | Regulatory breach | AI Governance Lead + Legal + CISO |
| Building authentication from scratch (not using established IAM) | Auth bypass risk | Security Engineering |
| Sending PII to a third-party without a DPA in place | GDPR Art. 28 violation | Legal + Privacy |
| Hard-coding secrets in source code or container images | Secret exposure | Security Engineering |
| Logging PII to observability tooling without masking | Data exposure | Privacy + Security Engineering |
| Deploying AI-generated output directly to users without human review (high-risk context) | Liability + EU AI Act | AI Governance Lead + Legal |

---

## AI Governance Integration

For all features involving AI/ML, the following EU AI Act and ISO 42001 checkpoints apply across the PDLC:

| Phase | AI Governance Checkpoint |
|---|---|
| Discovery | Risk tier classification (Prohibited / High / Limited / Minimal) |
| Definition | Define intended purpose, known limitations, foreseeable misuse |
| Design | Data governance plan, bias mitigation approach, explainability design |
| Build | Training data provenance documented, model card drafted |
| Launch | Transparency notice for users, human oversight mechanism confirmed |
| Operate | Ongoing monitoring for accuracy, bias, and adversarial misuse |

**Current AI Compliance Posture (as of 2026-06-02):**
- EU AI Act: 22% coverage — enforcement gap
- ISO 42001: 18% coverage — gap
- See Compliance module in GRC Dashboard for live status

---

## Risk Acceptance Process

When a security finding cannot be remediated before launch, formal risk acceptance is required:

1. **Document** the finding, its severity, and the business reason for acceptance
2. **Mitigating controls** must be identified and implemented
3. **Approval** required from: Engineering Lead (Medium), Security Lead (High), CISO (Critical)
4. **Expiry** set — accepted risks must be reviewed within 90 days
5. **Tracked** in VSRM as an accepted risk with owner and expiry date

---

## Metrics and KPIs

| Metric | Target | Tracked In |
|---|---|---|
| % features with threat model (High/Critical risk) | 100% | GRC Dashboard |
| % launches with security sign-off | 100% | GRC Dashboard |
| Mean days security review adds to launch | < 3 days | Engineering metrics |
| Open design-level risks (High/Critical) | 0 at launch | VSRM |
| AI features with conformity assessment | 100% | Compliance module |
| Privacy impact assessments completed | 100% for PII features | GRC Dashboard |

---

## Related Documents

- [SDLC Security Guardrails](./SDLC-SECURITY-GUARDRAILS.md)
- [Vulnerability Management Program](./VULNERABILITY-MANAGEMENT-PROGRAM.md)
- [Threat Model: Docker Supply Chain](./THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md)
- [Risk Methodology](./RISK-METHODOLOGY.md)
- [Security Policy](./SECURITY.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Logging Strategy](./LOGGING-STRATEGY.md)
