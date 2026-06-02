# Acceptable Use Policy

**Program:** Resilience Ops GRC Platform  
**Owner:** Security Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** ISO 27001 A.5.10, SOC 2 CC1.3, NIST SP 800-53 PL-4

---

## Purpose

This policy defines acceptable and prohibited use of [Organization]'s information systems, devices, networks, and data. It protects [Organization], its customers, and its personnel from risks arising from inappropriate system use.

All personnel must read, understand, and comply with this policy as a condition of access.

---

## Scope

Applies to:
- All employees, contractors, consultants, interns, and third parties
- All [Organization]-owned, leased, or managed devices and systems
- Personal devices used to access [Organization] systems (BYOD)
- All [Organization] data regardless of where it is stored or processed

---

## Acceptable Use

### General Principles

Use of [Organization] systems is primarily for business purposes. Incidental personal use is permitted where it does not:
- Interfere with business operations or performance
- Violate any provision of this policy
- Consume significant company resources
- Create legal, security, or reputational risk

### Permitted Activities

- Work-related communication, collaboration, and productivity
- Accessing approved SaaS tools and cloud services on the [approved tools list](#approved-cloud-services-and-tools)
- Security and GRC research directly related to job functions
- Using approved AI assistants in accordance with the [AI tool usage requirements](#ai-tool-usage) below

---

## Prohibited Activities

The following are prohibited on all [Organization] systems and networks:

### Data and Confidentiality

- Sharing confidential or Restricted data (see [Data Classification Policy](./DATA-CLASSIFICATION-POLICY.md)) with unauthorised parties
- Storing [Organization] data on personal cloud storage (Dropbox, Google Drive personal, iCloud) unless explicitly approved
- Downloading bulk customer or operational data without business justification and manager approval
- Circumventing data loss prevention (DLP) controls

### Security Violations

- Attempting to access systems or data beyond your authorised scope
- Sharing credentials, passwords, or MFA devices with any other person
- Disabling or bypassing security controls (antivirus, EDR, screen lock, MFA)
- Installing unapproved software on managed devices
- Connecting unapproved devices to [Organization] networks
- Conducting port scans, vulnerability scans, or penetration tests against [Organization] systems without written Security Engineering authorisation

### Inappropriate Content and Communication

- Accessing, downloading, or distributing illegal content
- Harassment, discrimination, or abusive communication via any [Organization] system
- Using [Organization] systems for political campaigning or lobbying
- Misrepresenting your identity or [Organization]'s identity in communications

### AI Tool Misuse

- Inputting Restricted or Confidential data into unapproved AI tools or public LLM services
- Using AI tools to generate content that misrepresents [Organization]'s security posture or compliance status
- Attempting to manipulate or jailbreak AI tools used in the GRC platform
- Using AI-generated output in compliance submissions without human review and sign-off

---

## Device Usage

### Managed Devices

[Organization]-issued devices must:
- Run only approved and up-to-date operating systems
- Have full disk encryption enabled (FileVault on macOS, BitLocker on Windows)
- Have the [Organization] EDR agent installed and active
- Have screen lock activating after ≤ 5 minutes of inactivity
- Never be left unattended in public spaces without screen lock active
- Be reported to Security Engineering immediately if lost or stolen

### BYOD (Bring Your Own Device)

Personal devices may access [Organization] systems only when:
- Enrolled in the [Organization] MDM (Mobile Device Management) system
- Running an approved and current OS version
- Protected by a PIN, password, or biometric lock
- Configured to allow remote wipe of [Organization] data in the event of loss or theft

Personal devices used for [Organization] work are subject to [Organization]'s monitoring of [Organization] data and applications — not of personal data.

---

## Internet and Email

### Internet Access

Internet access is provided for business purposes. [Organization] may monitor and log internet usage on company networks and managed devices. The following are prohibited:
- Accessing sites associated with malware, phishing, or illegal content
- Using web proxies or Tor to anonymise traffic on [Organization] networks
- Streaming high-bandwidth non-work content on [Organization] networks during business hours
- Downloading pirated software, media, or other content

### Email Usage

- Use [Organization]-issued email for all business communications
- Do not forward [Organization] business email to personal email accounts
- Apply appropriate data classification to email attachments — do not email Restricted data without encryption
- Phishing attempts received via email must be reported to Security Engineering immediately via the designated reporting channel

---

## Cloud Services and AI Tools

### Approved Cloud Services and Tools

Use of cloud services and SaaS tools for [Organization] work must be:
1. Reviewed and approved by Security Engineering before first use
2. Listed in the [Organisation] approved tools register
3. Governed by an executed contract and, where data processing is involved, a DPA

Approved services include: Supabase, GitHub, AWS, [list your approved tools here].

Unapproved services must not be used to store, process, or transmit [Organization] data.

### AI Tool Usage

AI tools — including AI coding assistants, LLM chat interfaces, and AI agents — present specific data handling risks.

| Permitted | Prohibited |
|-----------|-----------|
| Using approved AI assistants (e.g., Claude Code) for coding and research | Inputting customer data, PII, or secrets into any AI tool |
| Asking AI tools questions about general technical topics | Inputting unpublished vulnerability details, internal architecture diagrams, or compliance findings into public AI services |
| Reviewing AI-generated output before using it | Publishing AI-generated compliance artifacts without human review |
| Using the GRC Platform's built-in AI agents (Phase 4) per their designed scope | Using personal AI subscriptions for [Organization] business without Security Engineering review |

When in doubt: if you would not email the information to an external party, do not put it into an AI tool.

---

## Remote Access

Remote access to [Organization] systems requires:
- Use of approved VPN or ZTNA (Zero Trust Network Access) solution
- MFA authentication — no exceptions
- Use of a managed or MDM-enrolled device
- Compliance with this policy in all remote environments

Using public Wi-Fi without VPN to access [Organization] internal systems is prohibited.

---

## Monitoring and Privacy

[Organization] systems, devices, and networks are company property. [Organization] reserves the right to monitor, audit, and log activity on these systems for security and compliance purposes.

Monitoring is conducted proportionately for legitimate business purposes:
- Network and application access logs are retained per the [Logging Strategy](./LOGGING-STRATEGY.md)
- Endpoint security tools may record process execution and file access
- Email and collaboration tools may be reviewed in connection with security investigations

Personnel are informed of this monitoring at onboarding and via annual acknowledgment. Monitoring data is accessed only by Security Engineering and, where required, Legal.

---

## Violations and Reporting

Violations of this policy are subject to disciplinary action per the [HR Security Policy](./HR-SECURITY-POLICY.md).

To report a violation or suspected violation:
- Email: security@[organization].com
- Slack: #security-incidents
- For urgent matters: contact your manager and Security Engineering directly

Reporting in good faith is protected — no retaliation against good-faith reporters.

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [HR Security Policy](./HR-SECURITY-POLICY.md)
- [Data Classification Policy](./DATA-CLASSIFICATION-POLICY.md)
- [Endpoint Security Policy](./ENDPOINT-SECURITY-POLICY.md)
- [Privacy & Data Protection Policy](./PRIVACY-DATA-PROTECTION-POLICY.md)
