# SCF Control Mapping

## Purpose

This document maps risks in the register to **Secure Controls Framework (SCF)** control IDs. SCF is a meta-framework that crosswalks a single control ID to 100+ regulatory frameworks simultaneously — ISO 27001:2022, SOC 2, NIST 800-53 Rev 5, PCI DSS 4.0, GDPR, and more.

**How to use this doc:**

1. Find the threat ID from `RISK-TAXONOMY.md` in the table below
2. Read across to get the SCF control ID and multi-framework crosswalk
3. Use the SCF control as the treatment target — satisfying it satisfies all mapped frameworks at once
4. Record the SCF control ID in the Jira `Control Gap` issue linked to the risk

This replaces the need to manually maintain separate mappings per framework for the same control.

---

## SCF Domain Reference

| Domain code | Domain name | Relevant to |
|---|---|---|
| **AST** | Asset Management | Asset inventory, classification |
| **BCD** | Business Continuity & Disaster Recovery | Backup, recovery, DR testing |
| **CFG** | Configuration Management | Hardening, baselines, IaC |
| **CLD** | Cloud Security | Cloud-specific controls |
| **CRY** | Cryptography | Encryption at rest and in transit |
| **DCH** | Data Classification & Handling | Data governance, retention |
| **END** | Endpoint Security | EDR, workstation controls |
| **GOV** | Governance | Security programme management |
| **HRS** | Human Resources Security | Onboarding, offboarding, training |
| **IAC** | Identification & Authentication | IAM, MFA, privileged access |
| **IRO** | Incident Response | IR planning, playbooks, SLAs |
| **MON** | Continuous Monitoring | SIEM, logging, alerting |
| **NET** | Network Security | Segmentation, egress, firewall |
| **PRI** | Privacy | Data subject rights, processing records |
| **RSK** | Risk Management | Risk assessment process |
| **SCM** | Supply Chain Risk Management | Software supply chain integrity |
| **SEA** | Secure Engineering & Architecture | SDLC, threat modelling, SAST |
| **THR** | Threat Management | Threat intelligence, hunting |
| **TPM** | Third Party Management | Vendor assessment, contracts |
| **VPM** | Vulnerability & Patch Management | CVE triage, patching SLAs |
| **WEB** | Web Security | WAF, application security |

---

## Technology Risk Mappings

### T-TECH-01 — Unpatched critical vulnerability exploited (T1190)

| Layer | Control |
|---|---|
| **SCF** | `VPM-05` Vulnerability Remediation · `SEA-13` Application Security Testing |
| **ISO 27001:2022** | A.8.8 Management of technical vulnerabilities |
| **SOC 2** | CC7.1 Detects and monitors for new vulnerabilities |
| **NIST 800-53 Rev 5** | SI-2 Flaw Remediation · RA-5 Vulnerability Monitoring and Scanning |
| **PCI DSS 4.0** | Req 6.3.3 All software protected from known vulnerabilities |
| **Our policy** | `CLOUD-SECURITY-POLICY.md` — patching SLAs, WAF · `VULNERABILITY-MANAGEMENT-PROGRAM.md` |

---

### T-TECH-02 — Cloud storage misconfiguration exposes data (T1530)

| Layer | Control |
|---|---|
| **SCF** | `CLD-06` Cloud Storage Security · `CFG-02` Configuration Baselines |
| **ISO 27001:2022** | A.5.23 Information security for use of cloud services · A.8.9 Configuration management |
| **SOC 2** | CC6.6 Implements logical access security measures |
| **NIST 800-53 Rev 5** | CM-6 Configuration Settings · SC-28 Protection of Information at Rest |
| **PCI DSS 4.0** | Req 1.3 Network access controls · Req 3.5 Primary account number protection |
| **Our policy** | `CLOUD-SECURITY-POLICY.md` — S3 bucket policy, IaC validation |

---

### T-TECH-03 — Credential stuffing against admin accounts (T1110)

| Layer | Control |
|---|---|
| **SCF** | `IAC-07` Multi-Factor Authentication · `IAC-10` Authenticator Management |
| **ISO 27001:2022** | A.8.5 Secure authentication · A.8.3 Information access restriction |
| **SOC 2** | CC6.1 Logical access security measures |
| **NIST 800-53 Rev 5** | IA-5 Authenticator Management · AC-7 Unsuccessful Logon Attempts |
| **PCI DSS 4.0** | Req 8.3 All user accounts managed via authentication |
| **Our policy** | `ACCESS-CONTROL-IAM-POLICY.md` — MFA requirement, lockout policy · `CREDENTIAL-PASSWORD-MANAGEMENT-POLICY.md` |

---

### T-TECH-04 — Supply chain compromise via third-party dependency (T1195)

| Layer | Control |
|---|---|
| **SCF** | `SCM-03` Software Supply Chain Integrity · `TPM-04` Third Party Assessments |
| **ISO 27001:2022** | A.5.19 Information security in supplier relationships · A.5.21 Managing IS in the ICT supply chain |
| **SOC 2** | CC9.2 Vendor and business partner risk management |
| **NIST 800-53 Rev 5** | SR-3 Supply Chain Controls and Processes · SA-12 Supply Chain Protection |
| **PCI DSS 4.0** | Req 12.8 Manage third-party service provider risk |
| **Our policy** | `THIRD-PARTY-RISK-MANAGEMENT-POLICY.md` — vendor assessment, software integrity |

---

### T-TECH-05 — Ransomware encrypts production data (T1486)

| Layer | Control |
|---|---|
| **SCF** | `BCD-07` Backup & Recovery · `IRO-02` Incident Handling |
| **ISO 27001:2022** | A.8.13 Information backup · A.5.29 Information security during disruption |
| **SOC 2** | A1.2 Environmental protections and recovery infrastructure |
| **NIST 800-53 Rev 5** | CP-9 System Backup · IR-4 Incident Handling |
| **PCI DSS 4.0** | Req 12.10 Implement incident response plan |
| **Our policy** | `BUSINESS-CONTINUITY-DISASTER-RECOVERY-POLICY.md` — immutable backups, RTO/RPO |

---

### T-TECH-06 — Secrets exposed in source code or logs (T1552)

| Layer | Control |
|---|---|
| **SCF** | `CRY-03` Secret and Key Management · `SEA-14` Secrets Management |
| **ISO 27001:2022** | A.8.24 Use of cryptography · A.8.25 Secure development lifecycle |
| **SOC 2** | CC6.1 Logical access · CC8.1 Change management |
| **NIST 800-53 Rev 5** | SC-28 Protection of Information at Rest · IA-5 Authenticator Management |
| **PCI DSS 4.0** | Req 3.5 Protection of primary account number and SAD |
| **Our policy** | `CREDENTIAL-PASSWORD-MANAGEMENT-POLICY.md` — secrets management, no plaintext storage |

---

### T-TECH-07 — Privilege escalation via misconfigured IAM role (T1548)

| Layer | Control |
|---|---|
| **SCF** | `IAC-02` Privileged Account Management · `IAC-15` Access Enforcement |
| **ISO 27001:2022** | A.8.2 Privileged access rights · A.8.18 Use of privileged utility programs |
| **SOC 2** | CC6.3 Role-based access and least privilege |
| **NIST 800-53 Rev 5** | AC-6 Least Privilege · AC-2 Account Management |
| **PCI DSS 4.0** | Req 7.2 Manage access to system components |
| **Our policy** | `ACCESS-CONTROL-IAM-POLICY.md` — least privilege, JIT access, no standing admin |

---

### T-TECH-08 — Lateral movement via network segmentation gap (T1021)

| Layer | Control |
|---|---|
| **SCF** | `NET-04` Network Segmentation · `NET-01` Network Security Controls |
| **ISO 27001:2022** | A.8.22 Segregation of networks · A.8.20 Networks security |
| **SOC 2** | CC6.6 Network security measures |
| **NIST 800-53 Rev 5** | SC-7 Boundary Protection · AC-17 Remote Access |
| **PCI DSS 4.0** | Req 1.3 Restrict inbound and outbound traffic |
| **Our policy** | `NETWORK-SECURITY-POLICY.md` — default-deny, mTLS, ZTNA |

---

### T-TECH-09 — Log tampering covering adversary activity (T1070)

| Layer | Control |
|---|---|
| **SCF** | `MON-07` Log Integrity · `MON-02` Log Management |
| **ISO 27001:2022** | A.8.15 Logging · A.8.17 Clock synchronisation |
| **SOC 2** | CC7.2 Monitors system components for anomalies |
| **NIST 800-53 Rev 5** | AU-9 Protection of Audit Information · AU-10 Non-repudiation |
| **PCI DSS 4.0** | Req 10.3 Protect audit logs from destruction and modification |
| **Our policy** | `SECURITY-MONITORING-POLICY.md` — log immutability, CloudTrail write protection |

---

### T-TECH-10 — DDoS against customer-facing infrastructure (T1498)

| Layer | Control |
|---|---|
| **SCF** | `NET-01` Network Security Controls · `BCD-03` Continuity of Operations |
| **ISO 27001:2022** | A.8.21 Security of network services · A.5.29 IS during disruption |
| **SOC 2** | A1.1 Capacity planning and availability |
| **NIST 800-53 Rev 5** | SC-5 Denial of Service Protection · SC-7 Boundary Protection |
| **PCI DSS 4.0** | Req 1.2 Network security controls configuration |
| **Our policy** | `NETWORK-SECURITY-POLICY.md` — AWS Shield, DDoS mitigation |

---

## Operational Risk Mappings

### T-OPS-01 — Unauthorised change to production (Change management failure)

| Layer | Control |
|---|---|
| **SCF** | `CHG-03` Change Approval · `CHG-07` Emergency Change Control |
| **ISO 27001:2022** | A.8.32 Change management |
| **SOC 2** | CC8.1 Authorised changes to infrastructure |
| **NIST 800-53 Rev 5** | CM-3 Configuration Change Control · CM-4 Security Impact Analysis |
| **Our policy** | `CHANGE-MANAGEMENT-POLICY.md` — IaC-only production changes |

---

### T-OPS-02 — Privileged access not revoked after offboarding

| Layer | Control |
|---|---|
| **SCF** | `HRS-06` Employee Termination · `IAC-02` Account Management |
| **ISO 27001:2022** | A.6.5 Responsibilities after termination · A.8.3 Information access restriction |
| **SOC 2** | CC6.2 Registration and deregistration · CC6.3 Access removal |
| **NIST 800-53 Rev 5** | AC-2 Account Management · PS-4 Personnel Termination |
| **Our policy** | `ACCESS-CONTROL-IAM-POLICY.md` — offboarding checklist, same-day revocation |

---

### T-OPS-04 — Phishing (T1566) — security awareness gap

| Layer | Control |
|---|---|
| **SCF** | `HRS-03` Security Awareness Training · `END-05` Email Security |
| **ISO 27001:2022** | A.6.3 Information security awareness, education and training |
| **SOC 2** | CC1.4 Commitment to competence · CC2.2 Internal communication |
| **NIST 800-53 Rev 5** | AT-2 Literacy Training and Awareness · SI-8 Spam Protection |
| **Our policy** | `HR-SECURITY-POLICY.md` — phishing simulation, annual training |

---

## Compliance Risk Mappings

### T-COMP-01 — Personal data retained beyond legal obligation (GDPR Art.5)

| Layer | Control |
|---|---|
| **SCF** | `PRI-08` Data Retention & Disposal · `DCH-09` Data Retention |
| **ISO 27001:2022** | A.5.33 Protection of records |
| **SOC 2** | P4 Personal information is retained for defined periods |
| **NIST 800-53 Rev 5** | SI-12 Information Management and Retention |
| **GDPR** | Art.5(1)(e) Storage limitation |
| **Our policy** | `DATA-CLASSIFICATION-POLICY.md` — retention schedules by data tier |

---

### T-COMP-03 — Audit evidence not available for control period

| Layer | Control |
|---|---|
| **SCF** | `GOV-04` Evidence Management · `MON-01` Continuous Monitoring |
| **ISO 27001:2022** | A.5.36 Compliance with policies · A.5.35 Independent review |
| **SOC 2** | CC4.1 Monitors controls through ongoing activities |
| **NIST 800-53 Rev 5** | AU-2 Event Logging · CA-7 Continuous Monitoring |
| **Our policy** | `SECURITY-MONITORING-POLICY.md` — log retention, evidence collection |

---

## Third-Party Risk Mappings

### T-3P-01 — Critical vendor breach exposing shared customer data (T1195)

| Layer | Control |
|---|---|
| **SCF** | `TPM-01` Third Party Risk Management Programme · `TPM-05` Third Party Incident Reporting |
| **ISO 27001:2022** | A.5.19 IS in supplier relationships · A.5.22 Monitoring and review of supplier services |
| **SOC 2** | CC9.2 Vendor and business partner risk management |
| **NIST 800-53 Rev 5** | SA-9 External Information System Services · CA-3 Interconnection Agreements |
| **Our policy** | `THIRD-PARTY-RISK-MANAGEMENT-POLICY.md` — vendor assessment, breach notification obligations |

---

### T-3P-05 — Vendor fails annual reassessment

| Layer | Control |
|---|---|
| **SCF** | `TPM-04` Third Party Security Assessments · `TPM-03` Third Party Agreements |
| **ISO 27001:2022** | A.5.20 Addressing IS within supplier agreements · A.5.22 Monitoring and review |
| **SOC 2** | CC9.2 Assessment of vendor risk |
| **NIST 800-53 Rev 5** | SA-9 External Information System Services · PS-7 Third-Party Personnel Security |
| **Our policy** | `THIRD-PARTY-RISK-MANAGEMENT-POLICY.md` — annual reassessment requirement |

---

## How to Look Up Any SCF Control

The full SCF spreadsheet is available free at **securecontrolsframework.com**. Download the Excel workbook — each row is a control ID with columns for every mapped framework. To use it:

1. Find the SCF control ID from this doc (e.g., `VPM-05`)
2. Open the SCF workbook, filter by that ID
3. Read across to get the exact clause reference for every framework you're reporting against

The SCF workbook is updated annually. Current version referenced here: **SCF 2024.4**.

---

## Connecting to Jira

When creating a **Control Gap** issue in Jira (the day-30 issue type addition):

- `Summary`: SCF control ID + short description (e.g., `VPM-05 — Vulnerability remediation SLA not enforced`)
- `Description`: paste the crosswalk table from this doc for that control
- `Linked risk`: link to the parent Risk issue
- `Framework references`: list the ISO/SOC 2/NIST clause numbers from the table above

This means a single Jira ticket documents the gap, the risk it creates, and every framework it affects — without duplicate tickets per framework.

---

*Aligned to SCF 2024.4 and MITRE ATT&CK Enterprise v14. Last reviewed 2026-07-07.*
