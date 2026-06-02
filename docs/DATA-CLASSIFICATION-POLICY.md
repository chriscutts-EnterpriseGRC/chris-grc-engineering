# Data Classification Policy

**Program:** Resilience Ops GRC Platform  
**Owner:** GRC  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** ISO 27001 A.5.12–5.14, SOC 2 CC6.1, GDPR Art. 5, NIST SP 800-53 RA-2, PCI DSS 9.5

---

## Purpose

This policy establishes a consistent classification scheme for all information assets created, received, stored, or transmitted by [Organization]. Classification determines the level of protection applied to data throughout its lifecycle — creation, storage, transmission, use, and disposal.

All data owners and custodians are responsible for classifying data under their control and handling it accordingly.

---

## Scope

Applies to all data in any format — digital, printed, or verbal — held by employees, contractors, or systems on behalf of [Organization].

---

## Classification Levels

[Organization] uses four classification levels. When in doubt, classify at the higher level.

### Restricted

> Unauthorised disclosure would cause severe legal, financial, or reputational harm.

**Examples:**
- Customer PII (names, emails, payment data, health data)
- Authentication credentials, API keys, private keys, secrets
- Security vulnerability details not yet patched
- Pending M&A, legal proceedings, or regulatory filings
- Biometric or special category data under GDPR Art. 9
- AI model training data containing personal information
- SOC 2 / ISO 27001 audit findings prior to public disclosure

**Handling requirements:**
| Control | Requirement |
|---------|------------|
| Storage | Encrypted at rest (AES-256 minimum); access controlled by IAM role |
| Transmission | Encrypted in transit (TLS 1.3); no email without encryption |
| Access | Need-to-know; explicit authorisation required; logged at AUDIT level |
| Printing | Prohibited unless operationally necessary; shredded immediately after use |
| Disposal | Cryptographic erasure or certified destruction; certificate retained |
| AI tools | Never input into AI tools unless the tool is approved and operates on [Organization] infrastructure |
| Logging | Never log in plaintext; hash or redact before any log entry |

---

### Confidential

> Unauthorised disclosure would cause significant harm to operations, competitive position, or individuals.

**Examples:**
- Internal financial data, revenue figures, headcount
- Internal architecture diagrams, network topology
- Risk register contents and vulnerability details (pre-remediation)
- Employee personal data (salary, performance, HR records)
- Business strategy, product roadmap
- Vendor contracts and pricing
- GRC compliance posture details (pre-publication)

**Handling requirements:**
| Control | Requirement |
|---------|------------|
| Storage | Encrypted at rest; access controlled to authorised teams |
| Transmission | Encrypted in transit; approved collaboration tools only |
| Access | Team or role-based; authorisation required for sharing outside team |
| Printing | Permitted for business use; marked "Confidential"; secured when not in use |
| Disposal | Secure deletion or shredding |
| AI tools | Permitted in approved AI tools; never in public AI services |

---

### Internal

> Approved for use by all [Organization] personnel and authorised contractors; not intended for public disclosure.

**Examples:**
- Internal process documentation
- Meeting notes and internal communications
- GRC Dashboard demo data
- Employee directory (name, role, team — not contact details)
- General policy documents

**Handling requirements:**
| Control | Requirement |
|---------|------------|
| Storage | Standard access controls; no special encryption required |
| Transmission | Standard [Organization] communication channels |
| Access | All authorised [Organization] personnel |
| Disposal | Standard deletion; no special procedure required |
| AI tools | Permitted in approved tools |

---

### Public

> Approved for release to the general public; no disclosure risk.

**Examples:**
- Published product documentation
- Marketing materials
- Open-source code
- Public compliance attestations (SOC 2 Type II summary report)
- Job postings

**Handling requirements:**
| Control | Requirement |
|---------|------------|
| Review | Must be reviewed and approved before public release |
| Accuracy | Must accurately represent [Organization]'s security posture |

---

## Classification and the SecTier Framework

The asset SecTier (from the [Vulnerability Management Program](./VULNERABILITY-MANAGEMENT-PROGRAM.md)) maps to data classification as follows:

| SecTier | Asset risk level | Minimum data classification |
|---------|-----------------|----------------------------|
| SecTier 0 | Highest criticality | Restricted |
| SecTier 1 | High criticality | Confidential |
| SecTier 2 | Standard | Internal |

Data stored on or processed by a SecTier 0 asset is treated as Restricted regardless of its content classification, due to the attack surface value of the asset.

---

## Special Categories

### Personal Data (GDPR)

All personal data (any data that identifies or can identify a natural person) is classified at minimum **Confidential**. Special category data under GDPR Art. 9 (health, biometric, racial/ethnic origin, political opinions, etc.) is classified **Restricted**.

Handling requirements for personal data are governed by the [Privacy & Data Protection Policy](./PRIVACY-DATA-PROTECTION-POLICY.md).

### AI Training Data

Data used to train, fine-tune, or evaluate AI models requires heightened classification:
- If it contains personal data: **Restricted**
- If it contains confidential business information: **Confidential**
- Data provenance and lineage must be documented per UCF.AI.09 (AI Data Provenance & Lineage)

### Security Artefacts

| Artefact | Classification |
|----------|--------------|
| Vulnerability details (pre-patch) | Restricted |
| Penetration test reports | Restricted |
| Threat model documents | Confidential |
| SBOM (Software Bill of Materials) | Confidential |
| Compliance evidence packages | Confidential |
| Published SOC 2 summary | Public |

---

## Data Owner Responsibilities

Every data asset must have a designated **Data Owner** — typically the team lead or product manager responsible for the system that creates or holds the data.

Data Owner responsibilities:
- Assign and maintain the correct classification label for data under their stewardship
- Approve access requests for Restricted and Confidential data
- Review access grants annually as part of the access certification cycle
- Ensure data retention and disposal is executed per this policy
- Notify Security Engineering and Privacy of any reclassification events

---

## Retention and Disposal

| Classification | Minimum retention | Maximum retention | Disposal method |
|----------------|-----------------|------------------|----------------|
| Restricted | Per regulatory requirement (see below) | No unnecessary retention | Cryptographic erasure or certified destruction |
| Confidential | 7 years or per contract | No unnecessary retention | Secure deletion (DoD 5220.22-M or equivalent) |
| Internal | 3 years or until superseded | No unnecessary retention | Standard deletion |
| Public | As long as accurate | — | Standard deletion |

**Retention by regulatory requirement:**
| Data type | Retention period | Basis |
|-----------|-----------------|-------|
| EU personal data | No longer than purpose requires | GDPR Art. 5(1)(e) |
| AUDIT logs (security) | 3 years | EU AI Act Art. 12; ISO 27001 A.8.15 |
| Financial records | 7 years | UK Companies Act / local equivalent |
| SOC 2 evidence | 1 year minimum (2 years recommended) | AICPA guidance |
| SBOM files | 5 years | SDLC guardrails requirement |

---

## Labelling

- **Digital documents**: include the classification level in the document header or footer
- **Emails**: mark subject line with `[RESTRICTED]` or `[CONFIDENTIAL]` where applicable
- **Code repositories**: mark Restricted config files and data files with classification comments
- **Printed materials**: mark with classification label in header or footer; Restricted materials must be marked with destruction instructions

---

## Metrics

| Metric | Target |
|--------|--------|
| % of data assets with assigned classification | 100% |
| % of access reviews completed for Restricted assets | 100% annually |
| Confirmed Restricted data found in logs without redaction | 0 |
| Time to classify new data assets at onboarding | < 5 business days |

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [Privacy & Data Protection Policy](./PRIVACY-DATA-PROTECTION-POLICY.md)
- [Access Control & IAM Policy](./ACCESS-CONTROL-IAM-POLICY.md)
- [Logging Strategy](./LOGGING-STRATEGY.md)
- [Vulnerability Management Program](./VULNERABILITY-MANAGEMENT-PROGRAM.md)
- [Encryption & Cryptography Policy](./ENCRYPTION-CRYPTOGRAPHY-POLICY.md)
