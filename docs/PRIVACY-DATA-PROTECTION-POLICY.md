# Privacy and Data Protection Policy

**Program:** Resilience Ops GRC Platform  
**Owner:** Legal / Privacy  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** GDPR Art. 5–34, ISO 27001 A.5.34, SOC 2 P1–P8, CCPA, EU AI Act Art. 10

---

## Purpose

This policy defines how [Organization] collects, uses, stores, transfers, and disposes of personal data, and how it fulfils its obligations to data subjects. It applies the data protection principles of the GDPR and equivalent regulations as the minimum standard for all personal data processing.

[Organization]'s current GDPR compliance posture is 91% (tracked in the GRC Dashboard, Compliance module).

---

## Scope

Applies to all processing of personal data by [Organization], including:
- Data processed by the GRC platform (user identifiers, usage logs, contact data)
- Data held in Supabase, GitHub, integration adapters, and third-party SaaS tools
- Personal data processed by AI agents and the MCP server (Phase 4)
- Data processed by contractors or vendors on [Organization]'s behalf

---

## Data Protection Principles (GDPR Art. 5)

All personal data processing must comply with these principles:

| Principle | Requirement |
|-----------|------------|
| **Lawfulness, fairness, transparency** | Processing has a lawful basis; individuals are informed |
| **Purpose limitation** | Data collected for specified, explicit, and legitimate purposes; not processed incompatibly |
| **Data minimisation** | Only data that is adequate, relevant, and limited to what is necessary |
| **Accuracy** | Reasonable steps taken to keep data accurate and up to date |
| **Storage limitation** | Not kept longer than necessary; retention periods defined in [Data Classification Policy](./DATA-CLASSIFICATION-POLICY.md) |
| **Integrity and confidentiality** | Processed securely using appropriate technical and organisational measures |
| **Accountability** | [Organization] can demonstrate compliance with these principles |

---

## Lawful Bases for Processing

Processing personal data requires a documented lawful basis. [Organization] primarily relies on:

| Basis | When used | GDPR Article |
|-------|----------|-------------|
| **Legitimate interests** | Processing necessary for platform operations (security monitoring, GRC workflow) | Art. 6(1)(f) |
| **Contract** | Processing necessary to deliver services to customers | Art. 6(1)(b) |
| **Legal obligation** | Processing required by law (regulatory reporting, audit) | Art. 6(1)(c) |
| **Consent** | Where no other basis applies; e.g., optional analytics | Art. 6(1)(a) |

Special category data (Art. 9) requires explicit consent or another specific basis. Use of special category data requires Privacy approval.

Legitimate interests assessments (LIA) are conducted and documented for all processing based on legitimate interests. LIAs are stored in the Evidence Locker.

---

## Privacy by Design

Privacy considerations are embedded into product development from inception:

- **Gate 0 (Discovery)**: Data Sensitivity Screening identifies PII and special category data
- **Gate 1 (Definition)**: Privacy by Design applied — data minimisation, purpose limitation, retention rules
- **Gate 2 (Design)**: Privacy Impact Assessment (PIA) completed for features involving new personal data processing
- **Gate 3 (Build)**: Privacy implementation reviewed — consent flows, deletion mechanisms, data minimisation
- **Gate 5 (Operate)**: Quarterly privacy review; deletion flows verified

See [PDLC Security Guardrails](./PDLC-SECURITY-GUARDRAILS.md) for full gate requirements.

### Privacy Impact Assessment (PIA)

A PIA is mandatory for any new feature or system that:
- Introduces new categories of personal data processing
- Uses personal data in AI/ML models or training
- Shares personal data with new third parties
- Involves cross-border transfer of personal data

PIA template is available in the Evidence Locker. Completed PIAs are reviewed by Legal / Privacy and stored with the feature's compliance evidence package.

---

## Data Subject Rights

[Organization] must fulfil data subject requests within 30 days (extendable to 90 days for complex requests, with notification).

| Right | Obligation | Process |
|-------|-----------|---------|
| **Right of access** (Art. 15) | Provide a copy of personal data held and information about processing | Submit via privacy@[organization].com; Engineering extracts and reviews within 25 days |
| **Right to rectification** (Art. 16) | Correct inaccurate or incomplete personal data | Privacy submits correction to Engineering; update confirmed in writing |
| **Right to erasure** (Art. 17) | Delete personal data where no lawful basis for retention | Privacy and Legal review; Engineering executes deletion; confirmation issued |
| **Right to restriction** (Art. 18) | Restrict processing where accuracy is contested or objection is pending | Data flagged in system; processing suspended pending resolution |
| **Right to data portability** (Art. 20) | Provide data in structured, machine-readable format | Engineering exports in JSON/CSV; delivered securely |
| **Right to object** (Art. 21) | Object to processing based on legitimate interests | Privacy conducts LIA review; cease or justify processing |
| **Rights related to automated decision-making** (Art. 22) | Ensure meaningful human oversight where automated decisions produce significant effects | AI Governance Lead reviews; human review gate confirmed |

Data subject requests are logged in the GRC Dashboard (Incidents module or dedicated DSR tracker) and tracked to closure.

---

## AI and Automated Processing

The GRC Platform's AI agents (Phase 4) process data to produce GRC recommendations and decisions. The following safeguards apply:

- **No fully automated decisions with significant effects** without a human approval step (GDPR Art. 22)
- All AI processing of personal data uses hashed or anonymised identifiers where possible
- AI model inputs containing personal data use the minimum necessary data
- Data subjects may request human review of any AI-assisted decision affecting them
- AI data processing is logged at `AUDIT` level per the [Logging Strategy](./LOGGING-STRATEGY.md)
- Training data containing personal data requires explicit consent or a documented lawful basis
- Model training data sources, lineage, and processing purposes are documented per UCF.AI.09

---

## Data Transfers

### Third-Party Processors

All vendors processing personal data on behalf of [Organization] must have an executed **Data Processing Agreement (DPA)** before processing begins.

DPA requirements:
- Processor processes data only on [Organization]'s documented instructions
- Processor maintains appropriate technical and organisational security measures
- Processor notifies [Organization] without undue delay of any personal data breach
- Sub-processors require [Organization] prior written approval
- Data is deleted or returned on contract termination

DPAs are maintained by Legal and listed in the vendor register in the GRC Dashboard.

**Current gap:** OpenAI (AI vendor) does not have a DPA in place — tracked as RSK-004. This is a GDPR Art. 28 violation if personal data is processed. No personal data may be sent to OpenAI until a DPA is executed.

### International Transfers (Cross-Border)

Transfers of personal data outside the EEA require an adequacy decision, Standard Contractual Clauses (SCCs), or another approved transfer mechanism.

| Destination | Mechanism |
|-------------|-----------|
| USA (AWS, GitHub) | EU–US Data Privacy Framework adequacy (or SCCs where not covered) |
| Other non-EEA | SCCs required before transfer; Legal review |

Transfer impact assessments are conducted for all high-risk transfers (large volume, special category, law enforcement risk in destination country).

---

## Personal Data Breach Notification

Personal data breaches are subject to mandatory notification under GDPR Art. 33–34. See the [Incident Response Policy](./INCIDENT-RESPONSE-POLICY.md) for the full breach notification workflow.

Key obligations:
- Notify supervisory authority **within 72 hours** of discovery (Art. 33)
- Notify affected individuals **without undue delay** if high risk (Art. 34)
- Document all breaches regardless of whether notification is required (Art. 33(5))

Legal / Privacy Counsel owns all GDPR breach notification decisions and drafts.

---

## Data Retention and Deletion

| Category | Retention period | Basis | Disposal |
|----------|----------------|-------|---------|
| Customer personal data | Duration of contract + 1 year | Contract obligation | Cryptographic erasure or certified destruction |
| Employee personal data | Employment + 7 years | Legal obligation | Secure deletion |
| AUDIT logs containing user IDs | 3 years | EU AI Act Art. 12; ISO 27001 | Encrypted archive, then deletion |
| Marketing consent records | Until consent withdrawn + 5 years | GDPR accountability | Secure deletion |
| Support/incident records | 5 years | Legal/audit requirement | Secure deletion |

Deletion workflows are verified quarterly to confirm data is actually deleted from primary databases, backups, and any third-party processors.

---

## Consent Management

Where consent is the lawful basis:
- Consent is granular (separate for separate purposes), specific, informed, and unambiguous
- Consent is freely given — services are not conditioned on consent to non-essential processing
- Withdrawal of consent is as easy as giving it
- Consent records include: what was consented to, when, and how
- Consent is refreshed when the purpose or processing changes materially

---

## Privacy Notices

Privacy notices are provided to data subjects at the point of collection and are:
- Written in plain, clear language
- Specific about purposes, lawful bases, and retention periods
- Updated whenever processing changes materially
- Accessible at all times via [Organization]'s privacy policy page

---

## Metrics

| Metric | Target |
|--------|--------|
| Data subject requests completed on time | 100% within 30 days |
| DPAs in place for all vendors processing personal data | 100% |
| PIAs completed for new personal data processing features | 100% |
| Personal data breaches notified on time (72 hours) | 100% |
| GDPR compliance coverage (GRC Dashboard) | > 95% |

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [Data Classification Policy](./DATA-CLASSIFICATION-POLICY.md)
- [Incident Response Policy](./INCIDENT-RESPONSE-POLICY.md)
- [Third-Party Risk Management Policy](./THIRD-PARTY-RISK-MANAGEMENT-POLICY.md)
- [Logging Strategy](./LOGGING-STRATEGY.md)
- [PDLC Security Guardrails](./PDLC-SECURITY-GUARDRAILS.md)
