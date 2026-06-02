# Physical and Environmental Security Policy

**Program:** Resilience Ops GRC Platform  
**Owner:** Facilities / Security Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** ISO 27001 A.7.1–7.14, SOC 2 CC6.4, NIST SP 800-53 PE-1–PE-20

---

## Purpose

This policy defines the physical security requirements for [Organization]'s offices, premises, and the data processing equipment within them. For cloud-hosted infrastructure (AWS, Supabase), physical security of data centres is governed by the AWS Shared Responsibility Model and Supabase's infrastructure controls — these are assessed as part of vendor due diligence.

---

## Scope

Applies to:
- [Organization] office premises and co-working spaces
- Physical devices (laptops, servers, removable media) used for [Organization] work
- Any location where [Organization] Restricted or Confidential data is processed outside of cloud infrastructure

For cloud infrastructure: AWS maintains physical data centre security (SOC 2 Type II, ISO 27001 certified). [Organization] relies on these certifications, reviewed annually as part of vendor due diligence per the [Third-Party Risk Management Policy](./THIRD-PARTY-RISK-MANAGEMENT-POLICY.md).

---

## Office Physical Access Controls

### Access Control System

- Entry to [Organization] office space requires a badge/keycard or biometric authentication
- Access badges are issued to employees and approved contractors only — not visitors
- Access rights are configured per area (general office vs. server room vs. finance vs. secure meeting rooms)
- Badge access is deactivated within 2 hours of involuntary departure, and on final working day for voluntary departure
- Access logs are retained for 90 days and reviewed in the event of a security incident

### Visitor Management

| Requirement | Detail |
|-------------|--------|
| Registration | All visitors sign in at reception; identity verified (photo ID) |
| Escort | Visitors are escorted at all times in areas with access to equipment or data |
| Visitor badge | Temporary badge issued; must be visibly worn; returned on departure |
| Restricted areas | Visitors never permitted in server rooms or secure processing areas |
| Log retention | Visitor log retained for 90 days |

---

## Clean Desk and Screen Policy

### Clean Desk

- All physical documents containing Confidential or Restricted information must be secured when unattended — locked drawer or cabinet
- No Restricted documents are left on desks overnight
- Printed documents containing Restricted data must be collected from printers immediately and not left unattended
- Whiteboards and shared screens used for sensitive discussions must be cleared after the meeting

### Screen Lock

- Screen lock must activate after 5 minutes of inactivity on all devices
- Devices must be manually locked when leaving the workstation for any reason
- Laptop screens must not be visible to unauthorised individuals in open-plan office spaces or public locations — privacy screens are recommended for travel

---

## Secure Areas

### Server Room / Equipment Areas

If [Organization] operates any on-premises servers or network equipment:
- Access restricted to authorised IT/Security personnel only — no general staff or visitor access
- Two-factor physical access (badge + PIN, or badge + biometric)
- Access log reviewed monthly
- Environmental monitoring: temperature and humidity alarms
- UPS and power conditioning for critical equipment
- CCTV coverage of all entry/exit points; footage retained 30 days

For the GRC platform: all compute and storage is hosted on AWS. Physical server room requirements apply only if [Organization] deploys on-premises hardware in future.

---

## Equipment Security

### Laptops and Portable Devices

- All company-issued laptops have full disk encryption enabled (see [Endpoint Security Policy](./ENDPOINT-SECURITY-POLICY.md))
- Laptops must not be left unattended in unsecured public locations (cars, cafes, airports)
- Lost or stolen devices must be reported immediately (see [Endpoint Security Policy](./ENDPOINT-SECURITY-POLICY.md) — report within 1 hour)
- Power adapters and accessories may be lost freely — report devices only

### Removable Media

- Removable media (USB drives, external hard drives) containing Restricted data must be encrypted
- USB drives are disabled by default on managed devices via MDM
- Removable media approved for use is registered and tracked in the asset inventory
- Lost removable media containing Restricted data triggers an incident response

### Cabling and Infrastructure

- Network cables and telecommunications infrastructure are protected from unauthorised interception
- No cable patching or infrastructure changes are made by non-authorised staff
- Structured cabling in secure areas is labelled and inventoried

---

## Secure Disposal of Media and Equipment

All media and equipment containing [Organization] data must be disposed of securely:

| Media type | Disposal method |
|-----------|----------------|
| HDD (magnetic) | Physical destruction or certified degaussing; certificate retained |
| SSD / Flash storage | Cryptographic erasure (AES encryption then key destruction) + physical destruction for Restricted data |
| Paper documents (Restricted/Confidential) | Cross-cut shredding (DIN 66399 Level P-4 minimum) |
| Printed circuit boards / devices | Certified WEEE disposal with certificate of destruction |

Disposal certificates are retained for 3 years and provided to auditors on request.

Before any device is returned to a vendor, resold, or donated:
1. Data is securely erased per the above standards
2. MDM device record is wiped
3. Disposal documented in the asset register

---

## Environmental Controls

For any on-premises equipment:

| Control | Requirement |
|---------|------------|
| Temperature | Server areas maintained at 18–27°C (64–80°F) |
| Humidity | 40–60% relative humidity |
| Fire suppression | Clean agent (Novec, CO₂) — not water in equipment areas |
| Flood protection | Equipment not placed at floor level; flood detection sensors |
| Power protection | UPS providing minimum 30 minutes runtime; generator for extended outages (if critical) |
| Redundant power feeds | Dual power paths from separate circuits for critical equipment |

---

## CCTV and Surveillance

Where CCTV is deployed in [Organization] premises:
- Coverage: all entry/exit points; server rooms; areas housing sensitive equipment
- Retention: minimum 30 days; encrypted storage
- Access: restricted to Security Engineering and authorised management
- Notices: clearly displayed at all monitored locations (GDPR transparency requirement)
- Data handling: CCTV footage is personal data — handled per [Privacy & Data Protection Policy](./PRIVACY-DATA-PROTECTION-POLICY.md)

---

## Remote Working

Employees working remotely are responsible for the physical security of their workspace:
- Devices must not be left unattended with an unlocked screen
- Confidential or Restricted printed materials must be stored securely and not left visible
- Home office printers may not be used to print Restricted documents unless the printer is directly connected to the company device and not networked
- Public spaces (cafes, trains, airports) should not be used for work involving Restricted data or sensitive calls

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [Endpoint Security Policy](./ENDPOINT-SECURITY-POLICY.md)
- [Acceptable Use Policy](./ACCEPTABLE-USE-POLICY.md)
- [HR Security Policy](./HR-SECURITY-POLICY.md)
- [Data Classification Policy](./DATA-CLASSIFICATION-POLICY.md)
- [Third-Party Risk Management Policy](./THIRD-PARTY-RISK-MANAGEMENT-POLICY.md)
