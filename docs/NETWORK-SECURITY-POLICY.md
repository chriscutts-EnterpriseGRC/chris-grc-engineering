# Network Security Policy

**Program:** Resilience Ops GRC Platform  
**Owner:** Security Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** ISO 27001 A.8.20–8.23, SOC 2 CC6.6–6.7, NIST SP 800-53 SC-1–SC-7, PCI DSS 4.0 Req 1

---

## Purpose

This policy defines the network security requirements for [Organization]'s cloud infrastructure and any on-premises networks. It establishes standards for network segmentation, traffic control, monitoring, and access that minimise the attack surface and limit the blast radius of any network-based compromise.

---

## Scope

Applies to all [Organization] network infrastructure including:
- AWS VPC networks, subnets, security groups, and network ACLs
- Load balancers and API gateways
- Corporate office networks (if applicable)
- Remote access (VPN / ZTNA)

---

## Network Segmentation

All production workloads must operate in a segmented network architecture with clearly defined trust boundaries.

### AWS VPC Segmentation

| Network zone | Contents | Allowed inbound | Allowed outbound |
|-------------|----------|----------------|-----------------|
| **Public subnet** | Load balancers, NAT gateways, bastion hosts | Internet traffic on approved ports (80, 443) | Internal subnets only |
| **Application subnet** | ECS tasks, Lambda, API services | From public subnet only; no direct internet | Specific internal services + NAT for egress |
| **Data subnet** | Supabase / RDS / ElastiCache | From application subnet only | No internet egress |
| **Management subnet** | Monitoring, logging agents, bastion | From VPN/ZTNA only; no internet | Specific management targets |

### Security Group Standards

- Security groups follow default-deny — no rules permitted unless explicitly justified
- Inbound rules specify source as a specific security group or CIDR — no `0.0.0.0/0` except for public-facing load balancers on ports 80/443
- Outbound rules are restrictive — application containers may only egress to specific required endpoints
- Security group changes are reviewed and approved by Security Engineering; applied via IaC only (no console edits in production)
- All security group configurations are defined in Terraform and validated by OPA/checkov before deployment

### East-West Traffic Controls

- Container-to-container communication is restricted to explicitly required service pairs
- Service mesh (AWS App Mesh or equivalent) enforces mTLS between internal services
- Network policies deny all lateral traffic by default; explicit allow rules required

---

## Firewall and Access Control Lists

| Layer | Tool | Standard |
|-------|------|---------|
| VPC perimeter | AWS Network ACL | Stateless; deny all by default; specific allows per subnet pair |
| Instance/container | AWS Security Group | Stateful; default deny; minimum required rules |
| Web application | AWS WAF (CloudFront) | Block OWASP Top 10 patterns; rate limiting; geo-block if applicable |
| DNS | Route 53 Resolver DNS Firewall | Block known malicious domains |

### WAF Requirements

AWS WAF is required for all public-facing web applications and API endpoints:
- Enable AWS Managed Rule Groups (Core rule set, Known bad inputs)
- Enable rate-based rules: 2,000 requests per 5 minutes per IP (adjust per application)
- Enable IP reputation lists (Amazon IP reputation list managed rules)
- Log all WAF decisions to CloudWatch; alerts on block rate spikes
- Review custom rules quarterly

---

## Remote Access

### VPN / ZTNA

- Remote access to [Organization] internal systems requires VPN or Zero Trust Network Access (ZTNA)
- MFA is mandatory for all remote access — no exceptions
- Split tunnelling is disabled — all traffic routes through the VPN when connected
- VPN sessions are logged; idle sessions disconnected after 60 minutes

### Bastion / Session Manager

- Production SSH/RDP is proxied through AWS Systems Manager Session Manager — no direct key-based SSH to production
- Bastion hosts (where used) are hardened minimal images; direct internet exposure prohibited
- All session manager sessions are logged to CloudWatch

---

## DNS Security

- All DNS is served via AWS Route 53 or equivalent managed DNS
- DNSSEC is enabled for all external-facing domains
- DNS Firewall blocks resolution of known malicious domains for all VPC workloads
- DNS query logs are enabled and forwarded to CloudWatch
- No public DNS records should expose internal IP addresses or infrastructure topology

---

## Load Balancer Security

| Requirement | Detail |
|-------------|--------|
| TLS termination | ALB/NLB terminates TLS; minimum TLS 1.2; preferred TLS 1.3 |
| Security policy | AWS ELBSecurityPolicy-TLS13-1-2-2021-06 or equivalent |
| Access logs | Enabled; forwarded to S3 and CloudWatch |
| Deletion protection | Enabled on production load balancers |
| HTTP redirect | HTTP (port 80) redirects to HTTPS (port 443) — no plaintext traffic |

---

## DDoS Mitigation

- AWS Shield Standard is enabled on all deployments (included at no additional cost)
- AWS Shield Advanced is evaluated for any public-facing SecTier 0 services
- WAF rate-based rules provide application-layer DDoS protection
- CloudWatch alarms trigger on connection count anomalies (> 3× baseline)
- ECS tasks have CPU and memory hard limits to prevent resource exhaustion from incoming traffic

---

## Intrusion Detection

| Tool | Coverage |
|------|---------|
| AWS GuardDuty | Threat detection on CloudTrail, VPC Flow Logs, DNS logs — enabled in all regions used |
| VPC Flow Logs | Enabled for all VPCs; retained for 90 days in CloudWatch |
| Falco | Container-level behavioral monitoring; detects unexpected network connections |
| CloudWatch anomaly detection | Baseline network traffic; alert on deviations |

GuardDuty findings at HIGH severity trigger the P1 response SLA per the [Incident Response Policy](./INCIDENT-RESPONSE-POLICY.md). CRITICAL triggers P0.

---

## Network Monitoring and Logging

The following network-layer events are logged and forwarded to CloudWatch:
- VPC Flow Logs (all accepted and rejected traffic)
- WAF allow/block decisions
- Load balancer access logs
- GuardDuty findings
- DNS Firewall block events

Log retention: 90 days in CloudWatch; 1 year in S3.

---

## Network Change Management

- All network configuration changes (security groups, NACLs, routing) are defined in Terraform
- Changes are reviewed by Security Engineering before merge
- OPA/checkov validates against network security policies in CI
- Emergency network changes (blocking an active attack) may be applied manually but must be codified in Terraform within 24 hours
- Network changes that increase exposure (opening new ports, broadening source ranges) require Security Engineering sign-off

---

## Metrics

| Metric | Target |
|--------|--------|
| Security groups with unrestricted inbound (`0.0.0.0/0`) on non-80/443 | 0 |
| GuardDuty enabled in all active regions | 100% |
| VPC Flow Logs enabled for all VPCs | 100% |
| WAF enabled on all public-facing services | 100% |
| TLS 1.1 or below in use | 0 |

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [Cloud Security Policy](./CLOUD-SECURITY-POLICY.md)
- [Encryption & Cryptography Policy](./ENCRYPTION-CRYPTOGRAPHY-POLICY.md)
- [Security Monitoring Policy](./SECURITY-MONITORING-POLICY.md)
- [Incident Response Policy](./INCIDENT-RESPONSE-POLICY.md)
- [Threat Model: Docker Supply Chain](./THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md)
