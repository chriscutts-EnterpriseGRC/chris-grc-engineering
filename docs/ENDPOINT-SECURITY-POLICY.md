# Endpoint Security Policy

**Program:** Resilience Ops GRC Platform  
**Owner:** Security Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** ISO 27001 A.8.1, SOC 2 CC6.8, NIST SP 800-53 SI-3, CIS Controls v8 (Controls 4–6, 10)

---

## Purpose

This policy defines the security requirements for all endpoints accessing [Organization] systems — including company-issued devices, personal devices (BYOD), mobile devices, and cloud workloads (containers and virtual machines).

---

## Scope

Applies to:
- Company-issued laptops, desktops, and mobile devices
- Personal devices (BYOD) used to access [Organization] systems
- Cloud compute instances and containers running [Organization] workloads

---

## Managed Device Requirements

All company-issued devices must meet the following baseline before connecting to [Organization] systems:

| Control | Requirement |
|---------|------------|
| Operating system | macOS 13+ or Windows 11 (latest patch) only — no EOL OS |
| Disk encryption | FileVault (macOS) or BitLocker (Windows) enabled and verified |
| EDR agent | [Approved EDR — e.g., CrowdStrike Falcon, SentinelOne] installed and active |
| Screen lock | Auto-lock after 5 minutes of inactivity; password/biometric required to unlock |
| Firewall | macOS Application Firewall or Windows Defender Firewall enabled |
| Antivirus | Included in EDR; real-time protection enabled |
| OS patches | Applied within 7 days of critical/high patch release; 30 days for others |
| MDM enrolment | Device enrolled in [Organization] MDM before first use |

Devices failing to meet this baseline are quarantined and blocked from network access until remediated.

---

## BYOD (Bring Your Own Device)

Personal devices may access [Organization] systems only under the following conditions:

| Requirement | Detail |
|-------------|--------|
| MDM enrolment | Device enrolled in MDM — specifically for [Organization] application container |
| OS version | iOS 16+ or Android 13+ (mobile); no EOL operating systems |
| Device passcode | PIN (minimum 6 digits), password, or biometric enabled |
| Remote wipe consent | User must consent to selective remote wipe of [Organization] data |
| Access scope | Limited to approved applications via MDM container — no direct database access |

BYOD devices are not permitted to access SecTier 0 systems. A company-issued managed device is required for any work involving Restricted data.

---

## Software Management

### Approved Software

Only software from the approved software list may be installed on managed devices. Installing unapproved software requires a request to Security Engineering.

Prohibited software categories:
- Peer-to-peer (P2P) file sharing applications
- Remote access tools not approved by Security Engineering
- Unapproved VPN clients
- Hacking tools outside of explicitly authorised security testing
- Applications sourced outside official app stores without Security Engineering review

### Patch Management

| Priority | Scope | Maximum time to apply |
|----------|-------|-----------------------|
| Critical / actively exploited | OS, browser, EDR | 24 hours |
| High | OS, major applications | 7 days |
| Medium | All software | 30 days |
| Low | All software | 90 days |

MDM enforces compliance. Devices overdue for critical patches are flagged and removed from the network until patched.

---

## Removable Media

| Action | Requirement |
|--------|------------|
| USB storage | Blocked by default on managed devices via MDM |
| Approved exceptions | Security Engineering must approve; logged for audit |
| Personal USB on managed devices | Prohibited |
| Data transfer to personal devices | Must use approved cloud collaboration tools only |

---

## Screen and Physical Security

- Screen lock is mandatory when leaving a device unattended (auto-lock + manual lock habit)
- Devices must not be left unattended in public spaces without screen lock active
- Screens should not be visible to unauthorised individuals in public (privacy screen recommended for travel)
- Devices must be stored securely when not in use — locked office, secure bag, or hotel safe when travelling

---

## Device Loss and Theft

Report lost or stolen devices to Security Engineering **immediately** — within 1 hour of discovery.

Security Engineering will:
1. Remotely lock the device immediately
2. Trigger remote wipe within 4 hours if device cannot be recovered
3. Revoke all credentials accessible from that device
4. Assess whether any Restricted data may have been exposed and initiate incident response if so
5. Provide a replacement device within 24 hours

Delayed reporting of lost/stolen devices is a policy violation.

---

## Container and Cloud Workload Endpoints

Cloud workloads (ECS Fargate containers, Lambda functions) are managed as endpoints under the following standards:

| Control | Requirement |
|---------|------------|
| Non-root execution | All containers run as non-root user (`USER 1000` or equivalent) |
| Read-only filesystem | Root filesystem mounted read-only; writable paths use `tmpfs` |
| Minimal base image | Use distroless or minimal images (Alpine, Debian Slim) |
| No SSH in containers | No SSH daemon in production containers |
| Runtime scanning | Falco behavioral monitoring; Snyk/Wiz continuous scanning |
| Capability dropping | `--cap-drop ALL`; add back only required capabilities explicitly |
| Seccomp profile | Apply default or custom seccomp profile |
| Image signing | All production images signed (Cosign/Sigstore) and signature verified at deploy |

Container endpoints are scanned for CVEs at build time (Trivy, Grype) and continuously in production (Wiz, AWS Inspector). P0/P1 findings trigger the vulnerability management SLA.

---

## Endpoint Monitoring

The following endpoint events are monitored and forwarded to the SIEM/CloudWatch:
- EDR alerts (malware detected, suspicious process, lateral movement indicators)
- Failed OS authentication attempts
- New software installation on managed devices
- Device policy compliance status
- Patch compliance violations

See [Security Monitoring Policy](./SECURITY-MONITORING-POLICY.md) for alert thresholds and escalation.

---

## Metrics

| Metric | Target |
|--------|--------|
| Managed devices meeting baseline compliance | 100% |
| Critical patches applied within 24 hours | 100% |
| Devices with EDR active | 100% |
| Overdue patch > 30 days | 0 |
| Lost/stolen device reports > 1 hour late | 0 |

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [Acceptable Use Policy](./ACCEPTABLE-USE-POLICY.md)
- [Access Control & IAM Policy](./ACCESS-CONTROL-IAM-POLICY.md)
- [Vulnerability Management Program](./VULNERABILITY-MANAGEMENT-PROGRAM.md)
- [Security Monitoring Policy](./SECURITY-MONITORING-POLICY.md)
- [Threat Model: Docker Supply Chain](./THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md)
