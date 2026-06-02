# Security Monitoring Policy

**Program:** Resilience Ops GRC Platform  
**Owner:** Security Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** ISO 27001 A.8.15–8.17, SOC 2 CC7.2–7.3, NIST SP 800-137, NIST CSF DE.AE, NIST CSF DE.CM

---

## Purpose

This policy defines [Organization]'s approach to continuous security monitoring — including log collection, alert definitions, escalation procedures, and threat hunting. It ensures that security events are detected, investigated, and escalated in a timely manner.

---

## Scope

Applies to all [Organization] systems, including cloud infrastructure, application services, integration adapters, AI agents, and endpoints.

---

## Monitoring Objectives

1. **Detect** threats and anomalies in real time across all system layers
2. **Alert** Security Engineering on events that require investigation or response
3. **Evidence** — maintain an auditable log trail for compliance and forensics
4. **AI oversight** — monitor AI agent decisions and detect AI security threats (prompt injection, unauthorized actions)

---

## Log Sources

The following log sources must be active and forwarding to CloudWatch:

| Source | Log type | Retention in CloudWatch |
|--------|---------|------------------------|
| AWS CloudTrail | Management and data events | 90 days |
| VPC Flow Logs | Network traffic | 90 days |
| AWS WAF | Allow/block decisions | 90 days |
| Application logs (ECS, Lambda) | Structured NDJSON per [Logging Strategy](./LOGGING-STRATEGY.md) | 90 days |
| AWS GuardDuty | Threat intelligence findings | 90 days |
| AWS Config | Resource configuration changes | 90 days |
| ALB access logs | HTTP request/response | 30 days |
| Supabase auth logs | Authentication events | 30 days (or export to CloudWatch) |
| GRC MCP server (Phase 4) | AUDIT-level AI decision logs | 3 years (S3 Glacier for long-term) |

---

## Alert Definitions and Response SLAs

### Critical Alerts (P0 — respond within 15 minutes)

| Alert | Trigger | Source |
|-------|---------|--------|
| Root account used | Any CloudTrail event from root | CloudTrail |
| Production data exfiltration | Unusual outbound data volume from data subnet | VPC Flow Logs |
| GuardDuty CRITICAL finding | Any HIGH-severity+ threat intelligence match | GuardDuty |
| P0 CVE finding created | VSRM auto-triage produces P0 output | GRC Dashboard |
| AI agent unauthorized write | Write tool call without `approved_by` | MCP server AUDIT log |
| Active ransomware indicator | Falco: mass file modification pattern | Falco |
| Credential exfiltration | Secret value detected in outbound traffic | DLP / network monitoring |

### High Alerts (P1 — respond within 1 hour)

| Alert | Trigger | Source |
|-------|---------|--------|
| Auth failure spike | > 10 failed authentications per minute from a single IP | CloudWatch Metric Filter |
| Privilege escalation | IAM policy attached to user directly; admin role assumed outside normal hours | CloudTrail |
| Security group opened | Inbound rule added allowing `0.0.0.0/0` on non-80/443 port | AWS Config |
| Prompt injection detected | `event_type: security_alert, alert_type: prompt_injection` | Application AUDIT log |
| Secrets scanning alert | New secret committed to repository | GitHub secret scanning / trufflehog |
| GuardDuty HIGH finding | HIGH severity threat intelligence | GuardDuty |
| Container escape attempt | Unexpected syscall, privileged process in container | Falco |

### Medium Alerts (P2 — respond within 4 hours)

| Alert | Trigger | Source |
|-------|---------|--------|
| Dormant account login | Account inactive > 90 days has a login event | CloudTrail |
| Unusual API call volume | API call rate > 3× 30-day baseline | CloudWatch Anomaly Detection |
| Auth denial spike | > 20 authorization denials per hour | Application AUDIT log |
| New external principal accessing S3 | IAM Access Analyzer finding | IAM Access Analyzer |
| Config drift detected | Resource configuration deviates from IaC baseline | AWS Config |
| Unencrypted data in transit | TLS 1.1 or below detected | WAF / network monitoring |

### Informational (P3 — review within 24 hours)

| Alert | Trigger |
|-------|---------|
| Successful privileged access (break-glass) | Emergency access used |
| New IAM role created | Any new role in production account |
| Lambda function modified | CloudTrail: UpdateFunctionConfiguration |
| Certificate expiring within 30 days | Certificate Manager notification |

---

## Monitoring Tools and Platform

| Tool | Purpose |
|------|---------|
| **AWS CloudWatch** | Primary log aggregation; metric filters; alarms; dashboards |
| **AWS GuardDuty** | Threat intelligence; ML-based anomaly detection on CloudTrail, VPC, DNS |
| **AWS Security Hub** | Aggregates findings from GuardDuty, Config, Inspector, IAM Access Analyzer |
| **AWS Config** | Configuration compliance; drift detection |
| **Falco** | Container behavioral monitoring; syscall audit |
| **GRC Dashboard** | Operational security KRIs; vulnerability tracking; compliance monitoring |

Future: centralised SIEM (OpenSearch, Datadog) for cross-service correlation and long-term log search.

---

## Alert Escalation

| Step | Action |
|------|--------|
| 1 | Alert fires in CloudWatch; Slack notification to `#security-alerts` |
| 2 | On-call Security Engineer acknowledges within SLA |
| 3 | Triage: confirm genuine event vs false positive |
| 4 | If genuine: open incident per [Incident Response Policy](./INCIDENT-RESPONSE-POLICY.md) |
| 5 | If false positive: document as such; review alert rule to reduce noise |

On-call rotation: Security Engineering team rotates weekly. CISO is the escalation path for P0 events outside of working hours.

---

## Threat Hunting

Beyond reactive alerting, Security Engineering conducts proactive threat hunting:

| Activity | Frequency |
|----------|-----------|
| Review of CloudTrail for anomalous IAM activity | Weekly |
| Review of GuardDuty findings (including LOW severity) | Weekly |
| AUDIT log review for AI decision anomalies | Weekly (automated + manual sample) |
| Hunt for indicators from CISA KEV in production SBOM | On new KEV publication |
| Review of dormant account activity | Monthly |
| Network baseline analysis (VPC Flow Logs) | Monthly |

Threat hunting findings are documented. If a threat is confirmed, the Incident Response process is activated.

---

## AI Monitoring

The GRC Platform's AI agents require additional monitoring per EU AI Act Art. 12 and ISO 42001 9.1:

| Monitoring activity | Frequency | Owner |
|--------------------|-----------|-------|
| Review AI decision AUDIT logs for anomalous patterns | Weekly | Security Engineering |
| Validate AI decision quality (sample review against manual assessment) | Monthly | AI Governance Lead |
| Monitor for prompt injection attempts | Continuous (CloudWatch alarm) | Security Engineering |
| Track model performance drift | Monthly | AI Governance Lead |
| Review AI agent write operations (all instances of `approved_by` populated) | Weekly | Security Engineering + AI Governance Lead |

---

## False Positive Management

- Security Engineering tracks false positive rate per alert rule
- Alert rules with > 20% false positive rate are reviewed and tuned within 30 days
- Alert suppression requires Security Engineering approval and a documented business justification
- Suppressed alerts are reviewed quarterly to confirm they are still appropriate to suppress

---

## Metrics

| KRI | Target |
|-----|--------|
| Mean time to acknowledge P0 alert | < 15 minutes |
| Mean time to acknowledge P1 alert | < 1 hour |
| GuardDuty enabled across all accounts/regions | 100% |
| Alert false positive rate | < 20% per rule |
| Log sources active and forwarding | 100% |
| Threat hunting activities completed on schedule | 100% |

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [Logging Strategy](./LOGGING-STRATEGY.md)
- [Incident Response Policy](./INCIDENT-RESPONSE-POLICY.md)
- [Cloud Security Policy](./CLOUD-SECURITY-POLICY.md)
- [Network Security Policy](./NETWORK-SECURITY-POLICY.md)
- [Vulnerability Management Program](./VULNERABILITY-MANAGEMENT-PROGRAM.md)
