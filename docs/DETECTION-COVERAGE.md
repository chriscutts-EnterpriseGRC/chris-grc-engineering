# Detection Coverage Map

## Purpose

This document maps the highest-priority ATT&CK techniques — those used by threat actors in `THREAT-ACTORS.md` against SaaS targets — to detection logic, log sources, and alert thresholds. It answers the question: if an adversary executes this technique against us, would we see it?

A technique with no detection rule is an unobserved risk. The likelihood score for any risk mapped to an undetected technique should be scored one level higher than the default — the adversary can operate without triggering a response.

**How to use this document:**

1. For each technique, assess whether your SIEM/EDR has a rule matching the detection logic
2. If no rule exists, that is a monitoring gap — log it as an open item in the Detection Gap Register below
3. As rules are implemented and tested, mark coverage as `Active`
4. Review quarterly alongside the threat actor profile review

---

## Coverage Status Key

| Status | Meaning |
|---|---|
| `Active` | Detection rule exists, has been tested, and is alerting |
| `Partial` | Detection rule exists but covers only some sub-techniques or log sources |
| `Gap` | No detection rule exists |
| `N/A` | Technique not applicable to current architecture |

---

## Priority 1 — Techniques Used by Primary Threat Actors

These techniques are actively used by Scattered Spider and the ransomware ecosystem against SaaS targets. Detection coverage here is the highest priority.

---

### T1621 — Multi-Factor Authentication Request Generation (MFA Fatigue)

**Threat actor:** Scattered Spider  
**Risk register:** T-TECH-03, T-OPS-04

| Layer | Detail |
|---|---|
| **What to detect** | Abnormal volume of MFA push notifications sent to a single user in a short window |
| **Log source** | Identity provider (Okta, Entra ID, Duo) — authentication event logs |
| **Detection logic** | Alert when: >3 MFA push requests for a single user within 10 minutes AND none approved |
| **Alert threshold** | 3 pushes / 10 min — page on-call; 5 pushes / 10 min — auto-suspend account |
| **False positive profile** | Low — legitimate users do not generate this pattern |
| **SIEM query pattern (Okta)** | `eventType=system.push.send_factor_verify_push GROUP BY actor.id HAVING count > 3 WITHIN 10m` |
| **Mitigation if detected** | Suspend account, contact user out-of-band, investigate originating IP |
| **Coverage status** | `Gap` |

---

### T1110 — Brute Force / Credential Stuffing

**Threat actor:** Scattered Spider, Ransomware ecosystem  
**Risk register:** T-TECH-03

| Layer | Detail |
|---|---|
| **What to detect** | High-volume failed authentication attempts against one or many accounts |
| **Log source** | Identity provider, application load balancer, WAF |
| **Detection logic** | Alert when: >10 failed logins for a single account within 5 minutes OR >100 failed logins across >20 accounts within 15 minutes (distributed stuffing) |
| **Alert threshold** | Single-account: page security; Distributed: page on-call + auto-block source IPs |
| **False positive profile** | Medium — legitimate users lock themselves out; distributed pattern has low false positives |
| **SIEM query pattern** | `event=failed_login GROUP BY src_ip HAVING count > 100 WITHIN 15m` |
| **Mitigation if detected** | Block source IPs at WAF, enforce account lockout, trigger identity verification |
| **Coverage status** | `Gap` |

---

### T1078 — Valid Accounts (Impossible Travel / Anomalous Login)

**Threat actor:** Scattered Spider, APT41, Ransomware ecosystem  
**Risk register:** T-TECH-03, T-TECH-07

| Layer | Detail |
|---|---|
| **What to detect** | Authentication from a new geography, impossible travel, or first-seen ASN for a privileged account |
| **Log source** | Identity provider, cloud trail (AWS CloudTrail / Azure Activity Log / GCP Audit Log) |
| **Detection logic** | Alert when: privileged account login from country not in user's login history OR two successful logins from different countries within 2 hours (impossible travel) |
| **Alert threshold** | Any — alert on every occurrence for privileged accounts; weekly digest for standard users |
| **False positive profile** | Medium — VPN use and travel generate noise; tuning by user baseline reduces this |
| **SIEM query pattern** | `event=successful_login AND user.role=admin GROUP BY user.id, geo.country — alert on first-seen country` |
| **Mitigation if detected** | Terminate session, force re-authentication with FIDO2, notify user |
| **Coverage status** | `Gap` |

---

### T1190 — Exploit Public-Facing Application

**Threat actor:** Ransomware ecosystem, APT41  
**Risk register:** T-TECH-01

| Layer | Detail |
|---|---|
| **What to detect** | WAF rule triggers (injection attempts, scanner signatures), unusual HTTP response codes (500 spikes, 403 patterns), CVE-specific exploit payloads |
| **Log source** | WAF logs, application load balancer logs, web application logs |
| **Detection logic** | Alert when: WAF blocks >50 requests from single IP in 5 minutes OR application returns >20 HTTP 500s per minute (exploitation in progress) OR known exploit payload strings in request body |
| **Alert threshold** | WAF block spike: alert; HTTP 500 spike: page on-call |
| **False positive profile** | Low for payload matching; medium for 500-code spikes (may be bugs) |
| **SIEM query pattern** | `http.response_code=500 GROUP BY http.uri HAVING count > 20 WITHIN 1m` |
| **Mitigation if detected** | Block source IP at WAF, invoke IR playbook if exploitation confirmed, apply virtual patch |
| **Coverage status** | `Gap` |

---

### T1133 — External Remote Services (VPN / RDP Abuse)

**Threat actor:** Ransomware ecosystem  
**Risk register:** T-TECH-01, T-TECH-08

| Layer | Detail |
|---|---|
| **What to detect** | VPN or remote access authentication from unusual source, failed-then-succeeded pattern, access outside business hours for sensitive roles |
| **Log source** | VPN gateway logs, identity provider, endpoint agent |
| **Detection logic** | Alert when: successful VPN auth after >5 failed attempts from same IP OR VPN auth for privileged account outside working hours from new device |
| **Alert threshold** | All privileged account remote access outside hours — alert; failed-then-succeed pattern — page |
| **False positive profile** | Medium — remote workers and time-zone differences generate noise |
| **SIEM query pattern** | `event=vpn_auth AND status=success PRECEDED_BY event=vpn_auth AND status=fail count>5 WITHIN 10m` |
| **Mitigation if detected** | Terminate session, block source, verify with user out-of-band |
| **Coverage status** | `Gap` |

---

### T1486 — Data Encrypted for Impact (Ransomware)

**Threat actor:** Ransomware ecosystem, FIN7  
**Risk register:** T-TECH-05

| Layer | Detail |
|---|---|
| **What to detect** | Mass file rename/extension change events, sudden spike in disk write operations, shadow copy deletion commands, backup agent process termination |
| **Log source** | Endpoint EDR (CrowdStrike, SentinelOne), file integrity monitoring, cloud storage audit logs |
| **Detection logic** | Alert when: >500 file modifications within 60 seconds on a single host OR `vssadmin delete shadows` or `wbadmin delete` executed OR backup service process terminated by non-standard parent process |
| **Alert threshold** | Any — immediate containment trigger |
| **False positive profile** | Very low — mass file modification and shadow copy deletion are not normal operations |
| **EDR rule** | Block `vssadmin`, `wbadmin`, `bcdedit /set recoveryenabled no` execution from non-admin processes |
| **Mitigation if detected** | Isolate host immediately, invoke ransomware IR playbook, do not pay without CISO authorisation |
| **Coverage status** | `Gap` |

---

### T1490 — Inhibit System Recovery

**Threat actor:** Ransomware ecosystem  
**Risk register:** T-TECH-05

| Layer | Detail |
|---|---|
| **What to detect** | Deletion of shadow copies, modification of boot configuration, backup agent process kills |
| **Log source** | EDR process telemetry, Windows event logs (Event ID 524, 753) |
| **Detection logic** | Alert on any execution of `vssadmin delete shadows /all`, `wmic shadowcopy delete`, or `bcdedit /set {default} recoveryenabled no` |
| **Alert threshold** | Any execution — automatic host isolation |
| **False positive profile** | Near zero — no legitimate business reason to delete all shadow copies |
| **Coverage status** | `Gap` |

---

## Priority 2 — Techniques with Policy Coverage but No Detection Rule

These techniques have a governing policy in `ATTACK-COVERAGE.md` but no detection logic defined. Lower urgency than Priority 1 but should be addressed within 30 days of a SIEM/EDR being operational.

| Technique | ID | Recommended detection approach | Coverage status |
|---|---|---|---|
| Phishing | T1566 | Email gateway: DMARC fail events, link sandbox detonation alerts, first-seen sender domain for exec-targeted mails | `Gap` |
| OS Credential Dumping | T1003 | EDR: LSASS memory access from non-system processes; alert on `procdump`, `mimikatz`, `comsvcs.dll` usage | `Gap` |
| Indicator Removal | T1070 | SIEM: alert on audit log clear events (Windows Event ID 1102, Linux `auditctl -e 0`), CloudTrail logging disabled | `Gap` |
| Account Manipulation | T1098 | Cloud trail: IAM role or group membership changes for privileged accounts; alert on out-of-hours changes | `Gap` |
| Unsecured Credentials | T1552 | SIEM: alert on access to known secrets paths (`.env`, `credentials`, `config.yml`) in source repos; secrets scanner in CI | `Gap` |
| Network Service Discovery | T1046 | Network flow: internal port scan signatures — >20 unique ports from single host within 5 minutes | `Gap` |
| Lateral Movement via Remote Services | T1021 | EDR + network: unusual RDP or SSH connections between workstations; service account lateral movement | `Gap` |

---

## Detection Gap Register

Track open detection gaps as formal items. Each gap increases the effective likelihood of the associated risk by one level until closed.

| Gap ID | Technique | Risk register link | Opened | Target close | Status |
|---|---|---|---|---|---|
| DG-001 | T1621 MFA Fatigue | T-TECH-03, T-OPS-04 | 2026-07-07 | Day 30 | Open |
| DG-002 | T1110 Credential Stuffing | T-TECH-03 | 2026-07-07 | Day 30 | Open |
| DG-003 | T1078 Valid Accounts | T-TECH-03, T-TECH-07 | 2026-07-07 | Day 30 | Open |
| DG-004 | T1190 Public App Exploit | T-TECH-01 | 2026-07-07 | Day 30 | Open |
| DG-005 | T1133 External Remote Services | T-TECH-01, T-TECH-08 | 2026-07-07 | Day 30 | Open |
| DG-006 | T1486 Ransomware Encryption | T-TECH-05 | 2026-07-07 | Day 60 | Open |
| DG-007 | T1490 Inhibit Recovery | T-TECH-05 | 2026-07-07 | Day 60 | Open |

---

## Connecting Detection to Residual Risk

Detection coverage is a control. Its effectiveness feeds directly into the residual risk formula:

```
Residual = Inherent × (1 − 0.5 × control_effectiveness)
```

A detection rule in `Active` status with tested response procedures contributes to control effectiveness. A gap (no rule) means that control dimension is 0.

**Example — T-TECH-03 Credential Stuffing:**

| Scenario | Inherent | Control effectiveness | Residual |
|---|---|---|---|
| MFA enabled, no detection rule | 5 × 4 = 20 | 0.4 (MFA only) | 20 × (1 − 0.5 × 0.4) = **16** |
| MFA enabled + T1110 + T1621 detection rules active | 5 × 4 = 20 | 0.8 (MFA + detection + response) | 20 × (1 − 0.5 × 0.8) = **12** |
| MFA enabled + detection + automated account suspend | 5 × 4 = 20 | 1.0 | 20 × (1 − 0.5 × 1.0) = **10** |

Closing DG-001 and DG-002 moves this risk from **Exceeds appetite (16)** to **Approaches appetite (12)**. Detection rules are not a reporting exercise — they directly change risk posture.

---

*Aligned to MITRE ATT&CK Enterprise v14. Last reviewed 2026-07-07. Review quarterly alongside THREAT-ACTORS.md.*
