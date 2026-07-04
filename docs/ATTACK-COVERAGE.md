# ATT&CK Policy Coverage
## Docker Hull — MITRE ATT&CK Enterprise v14 Overlay

This document maps Docker Hull's governance documents to MITRE ATT&CK Enterprise tactics and techniques. It answers the question: if an adversary uses this technique against us, which policy governs our response or prevention?

The companion file `attack-coverage-layer.json` can be loaded directly into the ATT&CK Navigator to render this as an interactive coverage heatmap.

---

## Coverage Summary

| Tactic | Techniques covered | Primary governing policies | Gap |
|---|---|---|---|
| Reconnaissance | 0 of 9 | — | Full gap — no governing policy |
| Resource Development | 0 of 6 | — | Full gap — no governing policy |
| Initial Access | 7 of 9 | Security Awareness, Access Control, Network Security, Cloud Security, Third-Party Risk | Partial |
| Execution | 6 of 14 | Endpoint Security, Acceptable Use, Change Management | Partial |
| Persistence | 5 of 19 | Access Control, Change Management, Endpoint Security | Partial |
| Privilege Escalation | 4 of 13 | Access Control | Partial |
| Defense Evasion | 5 of 42 | Logging & Monitoring, Access Control | Partial |
| Credential Access | 6 of 17 | Credential & Password, Access Control, Network Security, Endpoint Security | Partial |
| Discovery | 6 of 32 | Access Control, Logging & Monitoring, Network Security | Partial |
| Lateral Movement | 5 of 9 | Network Security, Access Control, Security Awareness | Partial |
| Collection | 6 of 17 | Data Classification, Cloud Security, Logging & Monitoring, Endpoint Security | Partial |
| Command and Control | 5 of 19 | Network Security, Logging & Monitoring | Partial |
| Exfiltration | 5 of 9 | Data Classification, Network Security, Cloud Security | Partial |
| Impact | 6 of 14 | BC/DR, Incident Response, Network Security | Partial |

---

## Policy Colour Key

| Policy | File | Tactic coverage |
|---|---|---|
| Logging & Monitoring | `SECURITY-MONITORING-POLICY.md` | Defense Evasion, Discovery, Collection, C2 |
| Access Control & IAM | `ACCESS-CONTROL-IAM-POLICY.md` | Initial Access, Persistence, Privilege Escalation, Discovery, Lateral Movement |
| Endpoint Security | `ENDPOINT-SECURITY-POLICY.md` | Execution, Persistence, Credential Access, C2 |
| Data Classification | `DATA-CLASSIFICATION-POLICY.md` | Collection, Exfiltration |
| Credential & Password | `CREDENTIAL-PASSWORD-MANAGEMENT-POLICY.md` | Credential Access |
| Network Security | `NETWORK-SECURITY-POLICY.md` | Lateral Movement, C2, Exfiltration, Impact |
| Acceptable Use | `ACCEPTABLE-USE-POLICY.md` | Execution |
| Change Management | `CHANGE-MANAGEMENT-POLICY.md` | Execution, Persistence |
| Incident Response | `INCIDENT-RESPONSE-POLICY.md` | Impact |
| BC/DR | `BUSINESS-CONTINUITY-DISASTER-RECOVERY-POLICY.md` | Impact |
| Cloud Security | `CLOUD-SECURITY-POLICY.md` | Initial Access, Collection, Exfiltration |
| HR Security / Security Awareness | `HR-SECURITY-POLICY.md` | Initial Access, Lateral Movement |
| Third-Party Risk | `THIRD-PARTY-RISK-MANAGEMENT-POLICY.md` | Initial Access |

---

## Tactic-by-Tactic Coverage

### TA0043 — Reconnaissance

**Coverage: 0 / 9 techniques. Full gap.**

No Docker Hull policy currently governs how the organisation detects, limits, or responds to adversary reconnaissance activity. Techniques in this tactic (active scanning, OSINT, credential harvesting) are precursors to attack — a policy gap here means there is no defined response when reconnaissance is detected.

**Recommended closure:** Extend `SECURITY-MONITORING-POLICY.md` to include a threat intelligence section covering external attack surface monitoring and OSINT exposure. Alternatively, create a standalone Threat Intelligence Policy.

| Technique | ID | Gap |
|---|---|---|
| Active Scanning | T1595 | No policy |
| Gather Victim Host Information | T1592 | No policy |
| Gather Victim Org Information | T1591 | No policy |
| Gather Victim Identity Information | T1589 | No policy |
| Search Open Websites / Domains | T1593 | No policy |
| Search Open Technical Databases | T1596 | No policy |
| Search Closed Sources | T1597 | No policy |
| Phishing for Information | T1598 | No policy |
| Gather Victim Network Information | T1590 | No policy |

---

### TA0042 — Resource Development

**Coverage: 0 / 6 techniques. Full gap.**

Resource Development covers adversary actions taken before attack — acquiring infrastructure, developing tools, compromising upstream accounts. Docker Hull has no policy governing detection of or response to these activities. Supply chain compromise (T1195) is the closest risk we track, governed by `THIRD-PARTY-RISK-MANAGEMENT-POLICY.md`, but that covers vendor risk assessment, not adversary infrastructure development.

**Recommended closure:** Threat Intelligence Policy or an extension to `SECURITY-MONITORING-POLICY.md` covering threat actor infrastructure indicators and supply chain integrity verification.

| Technique | ID | Gap |
|---|---|---|
| Acquire Infrastructure | T1583 | No policy |
| Compromise Infrastructure | T1584 | No policy |
| Establish Accounts | T1585 | No policy |
| Compromise Accounts | T1586 | No policy |
| Develop Capabilities | T1587 | No policy |
| Obtain Capabilities | T1588 | No policy |

---

### TA0001 — Initial Access

**Coverage: 7 / 9 techniques.**

| Technique | ID | Governing policy |
|---|---|---|
| Phishing | T1566 | `HR-SECURITY-POLICY.md` — security awareness and phishing training |
| Valid Accounts | T1078 | `ACCESS-CONTROL-IAM-POLICY.md` — MFA, least privilege, account lifecycle |
| External Remote Services | T1133 | `NETWORK-SECURITY-POLICY.md` — VPN/ZTNA requirements, remote access controls |
| Exploit Public-Facing Application | T1190 | `CLOUD-SECURITY-POLICY.md` — WAF, patching SLAs, IaC validation |
| Drive-by Compromise | T1189 | `ENDPOINT-SECURITY-POLICY.md` — EDR, browser controls, OS patching |
| Replication Through Removable Media | T1091 | `ENDPOINT-SECURITY-POLICY.md` + `ACCEPTABLE-USE-POLICY.md` — removable media prohibition |
| Supply Chain Compromise | T1195 | `THIRD-PARTY-RISK-MANAGEMENT-POLICY.md` — vendor assessment, software integrity |
| Trusted Relationship | T1199 | `THIRD-PARTY-RISK-MANAGEMENT-POLICY.md` — third-party access governance |

---

### TA0002 — Execution

**Coverage: 6 / 14 techniques.**

| Technique | ID | Governing policy |
|---|---|---|
| Command and Scripting Interpreter | T1059 | `ENDPOINT-SECURITY-POLICY.md` — script execution controls, application allowlisting |
| User Execution | T1204 | `ACCEPTABLE-USE-POLICY.md` + `HR-SECURITY-POLICY.md` — security awareness, permitted software |
| Software Deployment Tools | T1072 | `CHANGE-MANAGEMENT-POLICY.md` — deployment approval, IaC-only production changes |
| Scheduled Task / Job | T1053 | `ENDPOINT-SECURITY-POLICY.md` — endpoint hardening, task auditing |
| Windows Management Instrumentation | T1047 | `ENDPOINT-SECURITY-POLICY.md` — endpoint hardening |
| Native API | T1106 | `ENDPOINT-SECURITY-POLICY.md` — OS-level execution controls |

---

### TA0003 — Persistence

**Coverage: 5 / 19 techniques.**

| Technique | ID | Governing policy |
|---|---|---|
| Create Account | T1136 | `ACCESS-CONTROL-IAM-POLICY.md` — account provisioning requires approval |
| Account Manipulation | T1098 | `ACCESS-CONTROL-IAM-POLICY.md` — access review, change auditing |
| Create or Modify System Process | T1543 | `CHANGE-MANAGEMENT-POLICY.md` — system change approval process |
| Valid Accounts | T1078 | `ACCESS-CONTROL-IAM-POLICY.md` — account lifecycle, offboarding |
| Boot or Logon Autostart Execution | T1547 | `ENDPOINT-SECURITY-POLICY.md` — startup controls, MDM enforcement |

---

### TA0004 — Privilege Escalation

**Coverage: 4 / 13 techniques.**

| Technique | ID | Governing policy |
|---|---|---|
| Valid Accounts | T1078 | `ACCESS-CONTROL-IAM-POLICY.md` — least privilege, no standing admin access |
| Abuse Elevation Control Mechanism | T1548 | `ACCESS-CONTROL-IAM-POLICY.md` — sudo/admin controls, just-in-time access |
| Access Token Manipulation | T1134 | `ACCESS-CONTROL-IAM-POLICY.md` — IAM role boundaries, token lifecycle |
| Domain or Tenant Policy Modification | T1484 | `ACCESS-CONTROL-IAM-POLICY.md` — change approval for IAM policy modifications |

---

### TA0005 — Defense Evasion

**Coverage: 5 / 42 techniques.**

| Technique | ID | Governing policy |
|---|---|---|
| Impair Defenses | T1562 | `SECURITY-MONITORING-POLICY.md` — monitoring continuity, alert on agent disable |
| Indicator Removal | T1070 | `SECURITY-MONITORING-POLICY.md` — log immutability, CloudTrail write protection |
| Obfuscated Files or Information | T1027 | `SECURITY-MONITORING-POLICY.md` — log analysis, threat hunting |
| Masquerading | T1036 | `SECURITY-MONITORING-POLICY.md` — process and binary monitoring |
| Hide Artifacts | T1564 | `SECURITY-MONITORING-POLICY.md` — filesystem and configuration monitoring |

---

### TA0006 — Credential Access

**Coverage: 6 / 17 techniques.**

| Technique | ID | Governing policy |
|---|---|---|
| Brute Force | T1110 | `CREDENTIAL-PASSWORD-MANAGEMENT-POLICY.md` — lockout policy, MFA requirement |
| OS Credential Dumping | T1003 | `CREDENTIAL-PASSWORD-MANAGEMENT-POLICY.md` + `ENDPOINT-SECURITY-POLICY.md` — EDR, no credential caching |
| Unsecured Credentials | T1552 | `CREDENTIAL-PASSWORD-MANAGEMENT-POLICY.md` — secrets management, no plaintext storage |
| Steal Application Access Token | T1528 | `ACCESS-CONTROL-IAM-POLICY.md` — token scope, expiry, rotation |
| Input Capture | T1056 | `ENDPOINT-SECURITY-POLICY.md` — EDR monitoring, keylogger detection |
| Network Sniffing | T1040 | `NETWORK-SECURITY-POLICY.md` — mTLS enforcement, encrypted transit |

---

### TA0007 — Discovery

**Coverage: 6 / 32 techniques.**

| Technique | ID | Governing policy |
|---|---|---|
| Account Discovery | T1087 | `ACCESS-CONTROL-IAM-POLICY.md` — least privilege limits blast radius of discovery |
| Network Service Discovery | T1046 | `NETWORK-SECURITY-POLICY.md` — default-deny security groups limit scan results |
| File and Directory Discovery | T1083 | `ACCESS-CONTROL-IAM-POLICY.md` — filesystem access controls |
| Permission Groups Discovery | T1069 | `ACCESS-CONTROL-IAM-POLICY.md` — IAM policy scoping |
| Process Discovery | T1057 | `SECURITY-MONITORING-POLICY.md` — process monitoring, anomaly detection |
| System Information Discovery | T1082 | `SECURITY-MONITORING-POLICY.md` — GuardDuty, host-based monitoring |

---

### TA0008 — Lateral Movement

**Coverage: 5 / 9 techniques.**

| Technique | ID | Governing policy |
|---|---|---|
| Remote Services | T1021 | `NETWORK-SECURITY-POLICY.md` — network segmentation, mTLS, no direct DB access |
| Internal Spearphishing | T1534 | `HR-SECURITY-POLICY.md` — security awareness, phishing simulation |
| Use Alternate Authentication Material | T1550 | `ACCESS-CONTROL-IAM-POLICY.md` + `CREDENTIAL-PASSWORD-MANAGEMENT-POLICY.md` |
| Remote Service Session Hijacking | T1563 | `NETWORK-SECURITY-POLICY.md` — session controls, ZTNA |
| Taint Shared Content | T1080 | `ACCESS-CONTROL-IAM-POLICY.md` — write access scoping on shared resources |

---

### TA0009 — Collection

**Coverage: 6 / 17 techniques.**

| Technique | ID | Governing policy |
|---|---|---|
| Data from Local System | T1005 | `DATA-CLASSIFICATION-POLICY.md` — data handling requirements per tier |
| Data from Network Shared Drive | T1039 | `DATA-CLASSIFICATION-POLICY.md` — access controls on shared storage |
| Data from Cloud Storage Object | T1530 | `CLOUD-SECURITY-POLICY.md` — S3 bucket policy, encryption at rest |
| Data from Information Repositories | T1213 | `DATA-CLASSIFICATION-POLICY.md` — repository access controls |
| Data Staged | T1074 | `DATA-CLASSIFICATION-POLICY.md` — data movement monitoring |
| Email Collection | T1114 | `SECURITY-MONITORING-POLICY.md` — email security monitoring |

---

### TA0011 — Command and Control

**Coverage: 5 / 19 techniques.**

| Technique | ID | Governing policy |
|---|---|---|
| Application Layer Protocol | T1071 | `NETWORK-SECURITY-POLICY.md` — egress filtering, approved traffic patterns |
| Non-Application Layer Protocol | T1095 | `NETWORK-SECURITY-POLICY.md` — protocol allowlisting |
| Protocol Tunneling | T1572 | `NETWORK-SECURITY-POLICY.md` — egress controls, VPC flow log alerting |
| Ingress Tool Transfer | T1105 | `ENDPOINT-SECURITY-POLICY.md` — application allowlisting, download controls |
| Encrypted Channel | T1573 | `NETWORK-SECURITY-POLICY.md` — traffic inspection, certificate monitoring |

---

### TA0010 — Exfiltration

**Coverage: 5 / 9 techniques.**

| Technique | ID | Governing policy |
|---|---|---|
| Exfiltration Over C2 Channel | T1041 | `DATA-CLASSIFICATION-POLICY.md` + `NETWORK-SECURITY-POLICY.md` — DLP, egress monitoring |
| Exfiltration Over Alternative Protocol | T1048 | `NETWORK-SECURITY-POLICY.md` — protocol restrictions, VPC flow log alerting |
| Automated Exfiltration | T1020 | `DATA-CLASSIFICATION-POLICY.md` — data movement volume alerting |
| Exfiltration Over Other Network Medium | T1011 | `NETWORK-SECURITY-POLICY.md` — wireless and network controls |
| Transfer Data to Cloud Account | T1537 | `CLOUD-SECURITY-POLICY.md` — cross-account data transfer controls |

---

### TA0040 — Impact

**Coverage: 6 / 14 techniques.**

| Technique | ID | Governing policy |
|---|---|---|
| Data Encrypted for Impact | T1486 | `BUSINESS-CONTINUITY-DISASTER-RECOVERY-POLICY.md` — backup strategy, recovery objectives |
| Inhibit System Recovery | T1490 | `BUSINESS-CONTINUITY-DISASTER-RECOVERY-POLICY.md` — immutable backups, recovery testing |
| Data Destruction | T1485 | `BUSINESS-CONTINUITY-DISASTER-RECOVERY-POLICY.md` — backup integrity verification |
| Service Stop | T1489 | `INCIDENT-RESPONSE-POLICY.md` — P1 response, service restoration procedures |
| Network Denial of Service | T1498 | `NETWORK-SECURITY-POLICY.md` — DDoS mitigation, AWS Shield |
| Disk Wipe | T1561 | `BUSINESS-CONTINUITY-DISASTER-RECOVERY-POLICY.md` — backup coverage, RTO/RPO |

---

## Coverage Gaps — Priority Order

| Priority | Gap | Recommended action | Closes tactic |
|---|---|---|---|
| 1 | No Threat Intelligence Policy | Add external attack surface monitoring and threat actor tracking to `SECURITY-MONITORING-POLICY.md` | Reconnaissance (TA0043) |
| 2 | No supply chain integrity controls | Extend `THIRD-PARTY-RISK-MANAGEMENT-POLICY.md` to cover software supply chain and adversary infrastructure indicators | Resource Development (TA0042) |
| 3 | Defense Evasion coverage thin (5 of 42) | Extend monitoring policy with specific rules for evasion technique detection | Defense Evasion (TA0005) |
| 4 | Discovery coverage thin (6 of 32) | Network and IAM policies partially address this — formalise detection rules for enumeration behaviour | Discovery (TA0007) |
| 5 | Execution coverage thin (6 of 14) | Endpoint policy covers the most critical techniques; extend to cover scripting and application control for remaining gaps | Execution (TA0002) |

---

## How to Use the Navigator Layer

1. Go to [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/)
2. Click **Open Existing Layer** → **Upload from local**
3. Select `docs/attack-coverage-layer.json`
4. The matrix renders with each governed technique coloured by its primary policy document

The layer uses ATT&CK Enterprise v14. To update the layer, edit the JSON and re-upload.

---

*Aligned to MITRE ATT&CK Enterprise v14. Last reviewed 2026-07-04.*
