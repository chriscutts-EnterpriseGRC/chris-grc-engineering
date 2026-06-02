# Cloud Security Policy

**Program:** Resilience Ops GRC Platform  
**Owner:** Security Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** ISO 27001 A.8.1, SOC 2 CC6.6, NIST SP 800-144, CIS AWS Foundations Benchmark v2.0, AWS Well-Architected Framework (Security Pillar)

---

## Purpose

This policy establishes the security standards for [Organization]'s use of cloud services — primarily AWS and Supabase. It defines account governance, IAM standards, storage security, logging, and the preventive control layer that enforces compliance before infrastructure is deployed.

---

## Scope

Applies to all cloud accounts, services, and resources managed by [Organization], including AWS, Supabase, and any other cloud providers used for production, staging, or development workloads.

---

## Approved Cloud Providers

| Provider | Approved use | Data classification allowed |
|----------|-------------|----------------------------|
| AWS | All infrastructure, compute, storage, logging | All including Restricted |
| Supabase (PostgreSQL) | Primary database (GRC platform) | All including Restricted (with production RLS hardening) |
| GitHub | Source code, CI/CD, secrets | Internal, Confidential (no Restricted) |
| Vercel / Netlify | Frontend hosting (planned) | Public, Internal only |

New cloud providers require Security Engineering approval and a vendor security assessment before any data is processed.

---

## AWS Account Governance

### Account Structure

| Account | Purpose | Data classification |
|---------|---------|---------------------|
| Production | Live customer and operational data | All including Restricted |
| Staging | Pre-production testing | Anonymised or synthetic data only — no real Restricted data |
| Development | Developer sandboxes | Internal/Confidential test data only |
| Security / Audit | CloudTrail aggregation, GuardDuty master, Security Hub | Logs only |

Each account is a separate AWS account under an AWS Organizations hierarchy. SCPs (Service Control Policies) restrict which services and regions are usable per account.

### Root Account Controls

- AWS root account credentials are stored in a PAM vault — never used for day-to-day operations
- Root MFA is enabled with a hardware security key
- No programmatic access keys exist for the root account
- Root account usage triggers an immediate CloudWatch alert to the Security Engineering team
- Root account is only used for: account recovery, enabling AWS services not available via IAM

### AWS Organizations SCPs

SCPs enforce the following baseline across all member accounts:

| SCP | Effect |
|-----|--------|
| Deny unused regions | Deny all actions outside `eu-west-1`, `us-east-1` (or your approved regions) |
| Require MFA for console | Deny all console actions except IAM self-service without MFA |
| Deny root account API calls | Deny programmatic access from root |
| Require encryption | Deny S3 bucket creation without default encryption |
| Deny public S3 | Deny removal of public access block on S3 |
| Deny VPC without Flow Logs | Deny VPC creation without Flow Logs enabled |

---

## IAM Policy Standards

### Principle of Least Privilege

- IAM roles are scoped to the specific resources and actions required
- Wildcards (`*` on resource or action) are prohibited except where technically unavoidable — must be documented and reviewed annually
- IAM policies are attached to roles, not users directly
- No long-lived IAM access keys for human users — use SSO role assumption
- CI/CD pipelines use OIDC federation for short-lived credentials

### IAM Guardrails

| Requirement | Detail |
|-------------|--------|
| MFA on all IAM users | Enforced via SCP — any console action without MFA is denied |
| No root access keys | Root access keys are prohibited and will be deleted if discovered |
| IAM Access Analyzer | Enabled in all accounts; alerts on external access to resources |
| CloudTrail | Enabled in all regions; management events logged; S3 object-level logging on Restricted buckets |
| IAM Credential Reports | Reviewed monthly — deactivate unused credentials within 30 days |

---

## Storage Security (S3)

| Control | Requirement |
|---------|------------|
| Public access block | Enabled on all buckets and at account level — no exceptions without CISO approval |
| Default encryption | SSE-KMS with a CMK (not SSE-S3) for all Restricted/Confidential data |
| Versioning | Enabled on Restricted data buckets; enables recovery from accidental deletion |
| Object Lock | Enabled on audit log buckets (WORM — write once, read many) |
| Bucket policies | Explicit deny for cross-account access unless specifically required |
| Access logging | Enabled on all Restricted data buckets; logs forwarded to the audit account |
| Lifecycle policies | Configured per data retention schedule; expired data transitioned to Glacier or deleted |

S3 bucket misconfigurations are caught by `checkov` in CI and by AWS Config rules in the account.

---

## Preventive Control Layer (OPA / IaC)

The [OPA/CircleCI pipeline](https://github.com/9snxz8htcw-netizen/circleci-aws-opa-lab) enforces cloud security before infrastructure is deployed:

| OPA Rule | Control | Frameworks |
|----------|---------|-----------|
| Encryption at rest required | All S3 buckets use SSE-KMS | UCF.02.01, NIST SC-28, SOC 2 CC6.1 |
| Versioning / backup | S3 versioning on critical buckets | UCF.09.01, NIST CP-9 |
| Public access block | No public S3 buckets | UCF.05.01, NIST AC-3 |
| Asset tagging | All resources tagged with Owner, SecTier, Environment | UCF.08.02, NIST CM-8 |

IaC changes that violate OPA policies are blocked before deployment. This is the primary preventive control — detective controls (AWS Config, Security Hub) are the backstop.

---

## Logging and Monitoring

| Service | Requirement |
|---------|------------|
| AWS CloudTrail | Enabled in all regions; management events logged; data events logged for Restricted S3 buckets and Lambda functions; retained 90 days in CloudWatch + 2 years in S3 |
| AWS Config | Enabled; records all resource configuration changes; rules enforced for security baseline |
| AWS GuardDuty | Enabled in all accounts and regions; HIGH/CRITICAL findings trigger P1/P0 incident response |
| AWS Security Hub | Enabled; aggregates GuardDuty, Config, Inspector, IAM Access Analyzer findings; CISA KEV findings auto-escalate to P0 |
| VPC Flow Logs | Enabled for all VPCs; retained 90 days |
| CloudWatch Alarms | Root account usage, unusual API call volume, GuardDuty HIGH findings, unauthorized API calls |

---

## Secrets Management

- AWS Secrets Manager is the authoritative store for all cloud credentials and application secrets
- No secrets are stored in environment variables baked into container images or Lambda deployment packages
- Secrets are injected at runtime via Secrets Manager SDK calls or ECS task secrets configuration
- Automatic rotation is enabled for supported secret types (RDS, IAM)
- Manual rotation is scheduled annually for all other secrets

See [Credential & Password Management Policy](./CREDENTIAL-PASSWORD-MANAGEMENT-POLICY.md) for full rotation requirements.

---

## Supabase-Specific Security

The GRC platform uses Supabase as its primary database.

| Control | Requirement |
|---------|------------|
| Row Level Security (RLS) | Enabled on all tables — currently open `anon_read` policy is a **P0 finding** that must be scoped before production |
| Service role key | Server-side only; never in browser bundle; stored in AWS Secrets Manager |
| Anon key | Read-only scope enforced by RLS; safe in frontend only with correct RLS |
| Auth | Supabase Auth or Okta SSO required before production with real data |
| Connection pooling | Use PgBouncer in transaction mode; limit connections per service |
| Database encryption | Supabase provides AES-256 at rest by default |
| Backups | Supabase automated daily backups; verify restoration quarterly |

---

## Configuration Drift Prevention

- All cloud resources are defined in Terraform — no manual console changes in production
- AWS Config rules alert on deviations from expected configuration (e.g., security group changes, S3 policy changes)
- Configuration drift alerts trigger a P2 security finding in the vulnerability tracker
- Drift from IaC is remediated by re-applying Terraform, not by modifying AWS Config findings

---

## Metrics

| Metric | Target |
|--------|--------|
| AWS accounts with CloudTrail enabled (all regions) | 100% |
| S3 buckets with public access | 0 |
| IAM users with console access (non-SSO) | 0 |
| GuardDuty enabled in all active regions | 100% |
| OPA policy violations blocking production deploys | Monitored; downward trend |

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [Network Security Policy](./NETWORK-SECURITY-POLICY.md)
- [Encryption & Cryptography Policy](./ENCRYPTION-CRYPTOGRAPHY-POLICY.md)
- [Access Control & IAM Policy](./ACCESS-CONTROL-IAM-POLICY.md)
- [Logging Strategy](./LOGGING-STRATEGY.md)
- [SDLC Security Guardrails](./SDLC-SECURITY-GUARDRAILS.md)
- [Threat Model: Docker Supply Chain](./THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md)
