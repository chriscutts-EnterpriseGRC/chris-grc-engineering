# Threat Actor Profiles

## Purpose

This document identifies the threat actors most likely to target a SaaS technology company and maps their primary techniques to the risk register. It is the evidence base for likelihood scores — when a risk owner scores a likelihood of 4, this document provides the justification: which group uses this technique, how actively, and against what target profile.

Aligned to: MITRE ATT&CK Enterprise v14 · ISO 27005:2022 §8.3 (Threat Source Identification)

---

## Relevance Tiers

| Tier | Meaning |
|---|---|
| **Primary** | Actively and specifically targets SaaS / cloud-native technology companies. Treat as a near-certain threat source. |
| **Secondary** | Targets the technology sector broadly or is opportunistic. Likely to encounter this org in a campaign sweep. |
| **Emerging** | Lower historical evidence of targeting this profile but growing capability or documented sector interest. |

---

## Primary Threat Actors

### Scattered Spider (UNC3944 / Octo Tempest)

| Field | Detail |
|---|---|
| **ATT&CK Group** | G0114 |
| **Aliases** | UNC3944, Octo Tempest, 0ktapus, Starfraud |
| **Motivation** | Financial — data theft, extortion, ransomware deployment |
| **Nation** | No state affiliation — English-speaking criminal network |
| **Primary targets** | SaaS platforms, cloud identity providers, BPO, telecom, financial services |
| **Why relevant** | This group specifically targets cloud and SaaS environments. Known for attacking Okta, Microsoft 365, and cloud-native organisations. If you run SaaS on AWS/Azure/GCP with Okta or Entra ID, this is the highest-relevance threat actor. |

**Primary techniques:**

| Technique | ID | What they do |
|---|---|---|
| Phishing for Information | T1598 | Vishing and SMS phishing targeting help desks to bypass MFA |
| Valid Accounts | T1078 | SIM swapping and social engineering to obtain credentials |
| MFA Request Generation | T1621 | MFA fatigue attacks — push spam until user approves |
| Phishing | T1566 | Targeted spear phishing with credential harvesting pages |
| Data from Cloud Storage | T1530 | Exfiltrate data from S3, SharePoint, OneDrive after gaining access |
| Transfer Data to Cloud Account | T1537 | Move data to attacker-controlled cloud storage |
| Brute Force | T1110 | Credential stuffing using breached credential lists |

**Likelihood impact on risk register:**

| Risk ID | Default likelihood | Adjusted likelihood | Reason |
|---|---|---|---|
| T-TECH-03 Credential stuffing | 4 | **5** | Scattered Spider's primary initial access method for SaaS targets |
| T-TECH-02 Cloud storage misconfiguration | 3 | **4** | Active exploitation of cloud storage after account compromise |
| T-OPS-04 Phishing / awareness gap | 4 | **5** | Vishing and SMS phishing targeting help desk and end users |

**Defensive priority:** MFA fatigue resistance (number matching, FIDO2), help desk identity verification procedures, cloud storage access logging.

---

### Ransomware Ecosystem (post-LockBit / ALPHV successors)

| Field | Detail |
|---|---|
| **ATT&CK Group** | Multiple — treat as threat class. Key groups: ALPHV/BlackCat successors, Cl0p, Play, Akira |
| **Motivation** | Financial — ransom payment, double extortion (encrypt + threaten to publish) |
| **Nation** | Primarily Eastern European criminal networks |
| **Primary targets** | Opportunistic — any organisation reachable via exposed services or phishing |
| **Why relevant** | Ransomware is the single most likely cause of a material incident for any organisation not specifically hardened against it. Double extortion means backup recovery alone is not a complete defence. |

**Primary techniques:**

| Technique | ID | What they do |
|---|---|---|
| Exploit Public-Facing Application | T1190 | Exploit unpatched VPN, web app, or API gateway for initial access |
| External Remote Services | T1133 | Abuse exposed RDP, VPN, or SSH with valid credentials |
| Valid Accounts | T1078 | Use phished or purchased credentials for initial access |
| Data Encrypted for Impact | T1486 | Encrypt production data and backups |
| Inhibit System Recovery | T1490 | Delete shadow copies, disable backup agents |
| Exfiltration Over C2 | T1041 | Steal data before encrypting — leverage for double extortion |

**Likelihood impact on risk register:**

| Risk ID | Default likelihood | Adjusted likelihood | Reason |
|---|---|---|---|
| T-TECH-05 Ransomware | 2 | **3** | Active threat to any internet-facing organisation; immutable backups and tested recovery are the key differentiator |
| T-TECH-01 Unpatched vulnerability | 3 | **4** | Ransomware groups actively scan for and exploit known CVEs within hours of publication |
| T-TECH-03 Credential stuffing | 4 | **4** | Unchanged — valid credential access is a common initial vector |

**Defensive priority:** Patching velocity (CISA KEV list as mandatory triage input), immutable backups with tested restore, network segmentation to limit blast radius.

---

## Secondary Threat Actors

### APT41 (Double Dragon)

| Field | Detail |
|---|---|
| **ATT&CK Group** | G0096 |
| **Aliases** | Barium, Winnti, Bronze Atlas, Earth Baku |
| **Motivation** | Dual — state-sponsored espionage (IP theft) and financially motivated intrusions |
| **Nation** | China (PRC) |
| **Primary targets** | Technology, healthcare, telecom, video games, manufacturing |
| **Why relevant** | Technology companies with valuable IP, source code, or large customer datasets are a documented APT41 target. Supply chain compromise is a core capability. |

**Primary techniques:**

| Technique | ID | What they do |
|---|---|---|
| Supply Chain Compromise | T1195.002 | Compromise software build pipelines or third-party libraries |
| Exploit Public-Facing Application | T1190 | Zero-day and N-day exploitation of internet-facing services |
| Valid Accounts | T1078 | Credential theft and reuse across cloud and on-prem |
| Obfuscated Files | T1027 | Malware and tooling designed to evade detection |
| Data from Local System | T1005 | Targeted data collection from compromised hosts |

**Likelihood impact on risk register:**

| Risk ID | Default likelihood | Adjusted likelihood | Reason |
|---|---|---|---|
| T-TECH-04 Supply chain compromise | 3 | **4** | APT41 has demonstrated software supply chain compromise capability |
| T-TECH-01 Unpatched vulnerability | 3 | **4** | Active exploitation of public-facing applications |
| T-TECH-06 Secrets in code | 4 | **4** | Unchanged — APT41 does collect credentials but this risk is already driven by internal process gaps |

**Defensive priority:** Software supply chain integrity (dependency pinning, build pipeline access controls), application patching velocity.

---

### FIN7 (Carbanak)

| Field | Detail |
|---|---|
| **ATT&CK Group** | G0046 |
| **Aliases** | Carbon Spider, ITG14, Sangria Tempest |
| **Motivation** | Financial — payment card theft, ransomware (via Clop partnership) |
| **Nation** | Eastern European criminal organisation |
| **Primary targets** | Technology, retail, hospitality, financial services |
| **Why relevant** | FIN7 has expanded beyond point-of-sale targets into technology companies. Documented use of spear phishing and LNK-based initial access. |

**Primary techniques:**

| Technique | ID | What they do |
|---|---|---|
| Spear Phishing Attachment | T1566.001 | Malicious Office documents or LNK files targeting employees |
| PowerShell | T1059.001 | Post-exploitation scripting and lateral movement |
| Boot Autostart Execution | T1547 | Persistence via registry run keys |
| Data Encrypted for Impact | T1486 | Ransomware deployment in later campaign stages |
| Exfiltration Over C2 | T1041 | Financial and credential data exfiltration |

**Likelihood impact on risk register:**

| Risk ID | Default likelihood | Adjusted likelihood | Reason |
|---|---|---|---|
| T-OPS-04 Phishing / awareness gap | 4 | **4** | Unchanged — FIN7 reinforces baseline phishing likelihood |
| T-TECH-05 Ransomware | 3 | **3** | Unchanged — lower confidence FIN7 targets this specific profile |

**Defensive priority:** Email security controls, user awareness training, endpoint detection for PowerShell abuse.

---

## Emerging Threat Actors

### APT29 (Cozy Bear / NOBELIUM)

| Field | Detail |
|---|---|
| **ATT&CK Group** | G0016 |
| **Aliases** | The Dukes, NOBELIUM, Midnight Blizzard |
| **Motivation** | State-sponsored espionage — intelligence collection |
| **Nation** | Russia (SVR — Foreign Intelligence Service) |
| **Primary targets** | Government, think tanks, healthcare, technology (when IP or government customer data is involved) |
| **Why relevant** | Lower relevance for most SaaS companies unless significant government contracts or sensitive research data exist. Elevated if the company serves government, defence, or critical infrastructure customers. |

**Primary techniques:**

| Technique | ID | What they do |
|---|---|---|
| Supply Chain Compromise | T1195.002 | SolarWinds-style attacks on software build and distribution |
| Phishing | T1566 | Targeted spear phishing against high-value individuals |
| Valid Accounts | T1078 | Long-term persistent access via compromised identities |
| Account Manipulation | T1098 | Adding credentials to existing accounts for persistence |
| Unsecured Credentials | T1552 | Collection of stored credentials and tokens |

**Likelihood impact on risk register:**

APT29 does not change default likelihood scores for a standard SaaS company. Revisit if government contracts are added to the customer base or if the company handles classified/sensitive data.

---

## Likelihood Adjustment Summary

Apply these adjustments on top of the default likelihood scores in `RISK-TAXONOMY.md` when the organisation's threat profile matches the description above.

| Risk ID | Default | Adjusted | Driving actor |
|---|---|---|---|
| T-TECH-01 Unpatched vulnerability exploited | 3 | **4** | Ransomware ecosystem + APT41 |
| T-TECH-02 Cloud storage misconfiguration | 3 | **4** | Scattered Spider |
| T-TECH-03 Credential stuffing | 4 | **5** | Scattered Spider |
| T-TECH-04 Supply chain compromise | 3 | **4** | APT41 |
| T-TECH-05 Ransomware | 2 | **3** | Ransomware ecosystem |
| T-OPS-04 Phishing / awareness gap | 4 | **5** | Scattered Spider + FIN7 |

All other threat IDs in `RISK-TAXONOMY.md` retain their default likelihood scores pending threat intelligence that changes the actor landscape.

---

## How to Use This Document in Risk Reviews

**Quarterly likelihood review:** For each risk in the register, check whether the driving threat actor has published new activity in the last 90 days (CISA advisories, vendor threat intel, ISAC feeds). If yes, reassess whether the adjusted likelihood still holds.

**New risk creation:** When adding a new risk, identify the most likely threat actor from this document. Record the actor name and their primary technique in the Jira `Threat Event` field. This makes the likelihood score auditable — it's no longer a judgment call, it's tied to a specific documented group.

**Escalation trigger:** If a threat actor in this document is observed actively exploiting a technique in your sector (via CISA KEV update, vendor advisory, or threat intel feed), immediately review all risks linked to that technique and assess whether likelihood scores need to increase.

---

## Reference Sources

- MITRE ATT&CK Groups: [attack.mitre.org/groups](https://attack.mitre.org/groups/)
- CISA Known Exploited Vulnerabilities: [cisa.gov/known-exploited-vulnerabilities-catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog)
- CISA Advisories: [cisa.gov/news-events/cybersecurity-advisories](https://www.cisa.gov/news-events/cybersecurity-advisories)

---

*Aligned to MITRE ATT&CK Enterprise v14. Last reviewed 2026-07-07. Reassess quarterly or when a relevant threat advisory is published.*
