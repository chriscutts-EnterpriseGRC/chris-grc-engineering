# Incident Response Policy

**Program:** Resilience Ops GRC Platform  
**Owner:** Security Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** ISO 27001 A.5.24–5.28, SOC 2 CC7.3–7.5, NIST SP 800-61 Rev 2, GDPR Art. 33–34, EU AI Act Art. 62

---

## Purpose

This policy defines how [Organization] detects, responds to, contains, and recovers from information security incidents. It establishes roles, classification criteria, response timelines, and notification obligations — including the GDPR 72-hour breach notification requirement.

A security incident is any event that compromises or threatens the confidentiality, integrity, or availability of [Organization]'s information assets, systems, or services.

---

## Scope

Applies to all security incidents affecting [Organization] systems, data, personnel, or third-party services managed on behalf of [Organization], regardless of how the incident is discovered or where it originates.

---

## Incident Classification

### Severity Levels

| Severity | Definition | Examples |
|----------|-----------|---------|
| **P0 — Critical** | Active breach or exploitation; confirmed data exfiltration; active service destruction | Confirmed ransomware, production data breach, actively exploited P0 CVE, insider exfiltration |
| **P1 — High** | Significant exposure with confirmed or likely impact; service degraded | Credential compromise, uncontrolled privilege escalation, AI agent unauthorized write, major outage |
| **P2 — Medium** | Potential impact; exposure confirmed but exploitation not confirmed | Misconfiguration exposing internal data, phishing leading to credential exposure, vendor breach affecting [Organization] |
| **P3 — Low** | Limited or theoretical impact; no confirmed data exposure | Isolated policy violation, failed attack with no impact, low-severity vulnerability actively scanned |

### Special Classifications

- **AI Security Incident**: Any incident involving prompt injection, AI agent unauthorized action, model supply chain compromise, or AI-assisted data exfiltration. Treated as P0 or P1 minimum; AI Governance Lead notified in addition to standard IRT.
- **Personal Data Breach**: Any incident where personal data is or may have been exposed. GDPR Art. 33 notification clock starts at time of discovery.

---

## Incident Response Team (IRT)

| Role | Responsibility |
|------|---------------|
| **Incident Commander (IC)** | Security Engineering Lead or CISO on-call; coordinates all response activities; owns stakeholder communication |
| **Technical Lead** | Senior Security Engineer; leads containment, investigation, and eradication |
| **Communications Lead** | Product or Legal; manages internal and external communications |
| **Legal / Privacy Counsel** | Advises on notification obligations; data breach assessment; regulatory engagement |
| **AI Governance Lead** | Engaged for all AI security incidents; advises on model rollback and EU AI Act Art. 62 obligations |
| **Engineering Representative** | Relevant team lead; supports containment and recovery in their systems |

The IC declares the incident and determines the severity. Severity may be upgraded but not downgraded without IC approval.

---

## Incident Lifecycle

### Phase 1: Detection and Reporting

**Sources of detection:**
- CloudWatch alarms (P0 finding, auth failure spike, security alert — per [Logging Strategy](./LOGGING-STRATEGY.md))
- Employee report (Slack #security-incidents, email security@[organization].com)
- External report (vulnerability disclosure, bug bounty, third-party notification)
- Automated scanner finding (GuardDuty, Wiz, vulnerability scanner)
- Customer or partner notification

**Reporting obligation:** All personnel who observe or suspect a security incident must report it immediately. There is no minimum threshold — if it looks wrong, report it.

**Response SLA from first detection:**

| Severity | Acknowledge | Triage | Containment |
|----------|------------|--------|-------------|
| P0 | 15 minutes | 1 hour | 4 hours |
| P1 | 1 hour | 4 hours | 24 hours |
| P2 | 4 hours | 24 hours | 72 hours |
| P3 | 24 hours | 72 hours | 30 days |

### Phase 2: Triage and Assessment

The IC and Technical Lead assess:
1. **Scope**: Which systems, data, and users are affected?
2. **Severity**: Apply the classification table above
3. **Personal data involvement**: Is personal data exposed? If yes, GDPR clock starts
4. **Containment options**: Can the system be isolated without destroying evidence or causing greater impact?
5. **Notification triggers**: Do regulatory, customer, or partner notification obligations apply?

All triage decisions are documented in the incident record in the GRC Dashboard.

### Phase 3: Containment

Containment strategy is selected based on severity and nature of the incident:

| Strategy | When to use |
|----------|------------|
| **Immediate isolation** | Active exploitation, P0 — isolate affected systems from network |
| **Credential rotation** | Compromised credentials — rotate immediately, revoke all sessions |
| **Traffic blocking** | Active attack — block attacker IP/ASN at WAF or firewall |
| **Service suspension** | Data exfiltration risk — suspend affected API endpoint or service |
| **AI agent suspension** | AI security incident — disable affected agent; revert any unauthorized writes |

Evidence preservation takes priority over cleanup:
- Take memory snapshots and log exports before rebooting or terminating instances
- Preserve CloudTrail and CloudWatch logs for the incident time window
- Do not delete or modify any artefact without IC approval

### Phase 4: Eradication

After containment, the Technical Lead removes the root cause:
- Patch or rebuild affected systems
- Remove malware or backdoors
- Revoke and rotate all compromised credentials
- Remediate the vulnerability that enabled the incident
- Verify integrity of affected data and systems

For AI security incidents:
- Roll back affected AI model to the last known-good version if compromised
- Re-validate all decisions made by the AI agent during the incident window
- Update prompt injection detection rules

### Phase 5: Recovery

The Technical Lead and Engineering Representative restore normal operations:
- Restore systems from verified clean backups
- Gradually re-enable services with enhanced monitoring
- Confirm no residual attacker presence before full restoration
- Verify data integrity with checksums or database consistency checks

### Phase 6: Post-Incident Review

A post-incident review (PIR) is mandatory for all P0 and P1 incidents, and recommended for P2:

| Activity | Timeline |
|----------|---------|
| PIR meeting (IC, Technical Lead, affected teams) | Within 5 business days of incident closure |
| Written PIR report | Within 10 business days |
| Action items assigned and tracked | Within PIR report; tracked in GRC Dashboard |
| Lessons learned shared with broader team | Within 30 days |

PIR reports are stored in the Evidence Locker and retained for 5 years.

---

## Notification and Communication

### Internal Communication

| Audience | When to notify | Channel |
|----------|---------------|---------|
| CISO | All P0 and P1 immediately | Direct call + Slack |
| Executive Team | P0 immediately; P1 within 4 hours | CISO-initiated briefing |
| Affected team leads | When containment actions affect their systems | Slack #security-incidents |
| All staff | If operational impact affects all users | Email from CISO |

### External Notification

#### GDPR Personal Data Breach (Art. 33–34)

If a personal data breach is confirmed or reasonably suspected:

| Obligation | Deadline | Trigger |
|------------|----------|--------|
| Notify supervisory authority (ICO/DPA) | **72 hours from discovery** | Breach is confirmed or cannot be ruled out |
| Notify affected individuals (Art. 34) | **Without undue delay** | Breach likely results in high risk to individuals |

The 72-hour clock starts at the moment the incident is identified as a potential personal data breach — not when it is confirmed. If uncertain, notify and refine.

**Notification must include:**
- Nature of the breach and categories of data affected
- Approximate number of individuals affected
- Likely consequences of the breach
- Measures taken or proposed to address the breach
- Data Protection Officer contact details

Legal / Privacy Counsel drafts all regulatory notifications. CISO approves before sending.

#### Customer Notification

- P0 incidents with confirmed customer data exposure: notify within 24 hours of confirmation
- P1 incidents with potential customer impact: notify within 72 hours
- Draft by Communications Lead; approved by CISO and Legal

#### EU AI Act Art. 62 — AI Incident Reporting

Serious AI incidents (those causing significant harm or involving high-risk AI systems) must be reported to the relevant market surveillance authority. AI Governance Lead owns this obligation and is engaged on all AI security incidents.

#### Regulatory Breach Notification Summary

| Regulation | Obligation | Deadline | Owner |
|------------|------------|---------|-------|
| GDPR Art. 33 | Notify supervisory authority | 72 hours | Legal / Privacy |
| GDPR Art. 34 | Notify affected individuals | Without undue delay | Legal / Privacy |
| EU AI Act Art. 62 | Notify market surveillance authority | Per regulation | AI Governance Lead |
| PCI DSS | Notify card brands + acquiring bank | Immediately on discovery | Legal |
| SOC 2 | Notify impacted customers | Per contract terms | Communications Lead |

---

## Evidence Handling

All incident evidence must be handled to maintain its integrity for potential legal proceedings:

- Evidence is collected and stored with chain-of-custody documentation
- Log files are exported and hashed (SHA-256) immediately on collection
- Cloud forensic images are taken before instances are terminated
- All evidence handling is documented in the incident record

---

## Incident Response Testing

| Activity | Frequency |
|----------|-----------|
| Tabletop exercise (IR team) | Annual — minimum |
| AI incident tabletop exercise | Annual — separate scenario |
| Full IR simulation (red team) | Bi-annual for P0 scenarios |
| Breach notification drill (includes 72-hour GDPR workflow) | Annual |

Test results and action items are tracked in the GRC Dashboard and inform updates to this policy.

---

## Metrics

| KRI | Target |
|-----|--------|
| Mean time to acknowledge P0 | < 15 minutes |
| Mean time to contain P0 | < 4 hours |
| P0/P1 PIR completion rate | 100% within 10 business days |
| GDPR breach notification on time (72 hours) | 100% |
| Open IR action items > 30 days | 0 |

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [Logging Strategy](./LOGGING-STRATEGY.md)
- [Vulnerability Management Program](./VULNERABILITY-MANAGEMENT-PROGRAM.md)
- [Security Monitoring Policy](./SECURITY-MONITORING-POLICY.md)
- [Business Continuity & DR Policy](./BUSINESS-CONTINUITY-DISASTER-RECOVERY-POLICY.md)
- [Privacy & Data Protection Policy](./PRIVACY-DATA-PROTECTION-POLICY.md)
- [HR Security Policy](./HR-SECURITY-POLICY.md)
