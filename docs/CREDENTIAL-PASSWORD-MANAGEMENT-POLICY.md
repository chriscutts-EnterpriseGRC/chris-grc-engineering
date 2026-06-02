# Credential and Password Management Policy

**Program:** Resilience Ops GRC Platform  
**Owner:** Security Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** ISO 27001 A.5.17, SOC 2 CC6.1, NIST SP 800-63B, PCI DSS 4.0 Req 8

---

## Purpose

This policy defines the requirements for creating, storing, using, rotating, and revoking credentials across all [Organization] systems. It covers human passwords, API keys, service account credentials, secrets, and certificates.

---

## Scope

Applies to all credentials used to access [Organization] systems — by employees, contractors, automated services, or CI/CD pipelines.

---

## Password Requirements

### Human Account Passwords

| Requirement | Standard |
|-------------|---------|
| Minimum length | 16 characters |
| Maximum length | No maximum — do not truncate |
| Complexity | Mix of character types strongly recommended; not enforced if MFA is active and length is ≥ 16 |
| MFA | Mandatory — passwords alone are insufficient |
| Expiry | No forced expiry (NIST SP 800-63B guidance); rotate on suspected compromise only |
| History | Prevent reuse of last 12 passwords |
| Lockout | 10 consecutive failed attempts triggers a 15-minute lockout; 30 failed attempts triggers account lock requiring admin reset |

Passwords must not be:
- A username or variation of a username
- A word from the [banned password list](#banned-password-list) (common passwords, dictionary words)
- Previously breached (check against HIBP or equivalent on change)

### Password Manager

Use of an approved password manager is **required** for all employees. Password managers:
- Generate random, unique passwords per service
- Never require memorising passwords
- Store encrypted vaults locally or in approved cloud storage

Approved password managers: [List approved tools here — e.g., 1Password, Bitwarden].

### Banned Password List

The following pattern categories are prohibited:
- Organisation name or common variations (`company`, `company123`, `Company2026`)
- Common passwords (`password`, `admin`, `letmein`, `qwerty`, and any password in the HIBP top 10,000)
- Sequential or keyboard patterns (`123456`, `qwerty`, `abcdef`)
- Seasonal patterns (`Winter2026`, `Summer2026`)

---

## Shared Account Management

Shared accounts are **strongly discouraged**. Where unavoidable:
- Must be registered with Security Engineering before use
- Credentials must be stored in an approved vault (AWS Secrets Manager, PAM tool) — never in shared documents or chat
- All users of the shared account must have individual accountability (e.g., use a team SSO role, not a shared password)
- Rotated immediately when any user with access leaves the organisation or changes role
- Subject to quarterly review to confirm ongoing business need

---

## API Key and Secret Management

### Credential Types and Requirements

| Type | Storage | Rotation | Max lifetime |
|------|---------|---------|-------------|
| AWS access keys | AWS Secrets Manager only | Annual; immediately on exposure | 1 year |
| Supabase service role key | AWS Secrets Manager | Annual; immediately on exposure | 1 year |
| Supabase anon key | `.env` (never committed); Secrets Manager in production | Annual | 1 year |
| Third-party API keys (Jira, Qualys, Vanta, etc.) | AWS Secrets Manager | Annual; immediately on exposure | 1 year |
| GitHub PATs | GitHub Secrets or Secrets Manager | Annual; fine-grained scoped only | 1 year |
| CI/CD secrets | GitHub Secrets / CircleCI env vars | Annual; OIDC preferred (no static) | 1 year |
| Webhook secrets (HMAC) | AWS Secrets Manager | Annual | 1 year |
| JWT signing keys | AWS Secrets Manager or KMS | Annual | 1 year |

### Secret Creation

- Generate with a CSPRNG — never use guessable values
- Minimum entropy: 128 bits (e.g., 32 hex chars, 22 Base64 chars)
- Never create secrets that embed human-readable information (service name, date, etc.)
- Register new secrets in the secrets inventory immediately on creation

### Secret Distribution

- Secrets are delivered via AWS Secrets Manager or a secure sharing mechanism (e.g., 1Password sharing)
- Never distribute secrets via:
  - Email
  - Slack or Teams messages
  - Code review comments
  - Plain-text documents or wikis
  - `.env` files committed to git

### Secret Rotation

Automated rotation via AWS Secrets Manager is preferred. Where manual:
1. Generate new secret
2. Update all consuming applications
3. Verify all consumers are using the new secret
4. Revoke the old secret
5. Log rotation at AUDIT level in the secrets inventory

Rotation is triggered immediately (within 1 hour) on:
- Suspected or confirmed compromise
- Employee departure who had access to the secret
- Third-party breach notification from the secret's platform
- Discovery of the secret in an unintended location (log file, code, Slack)

### Secrets Inventory

Security Engineering maintains an inventory of all production secrets:
- Secret identifier (name — not value)
- System or service it authenticates to
- Owner (team)
- Last rotation date
- Rotation schedule
- Users/services with access

Inventory is reviewed quarterly. Any unregistered secrets discovered in audits are treated as a security finding.

---

## Prohibited Practices

The following are prohibited regardless of context:

- Hardcoding any credential value in source code, configuration files, or Dockerfiles
- Committing `.env` files to version control
- Passing credentials as environment variables in container image builds (`--build-arg` with secret values)
- Logging any credential value at any log level
- Storing credentials in browser local storage, cookies, or `localStorage`
- Using the same credential across multiple environments (dev credentials in production, or vice versa)
- Creating credentials with no expiry and no rotation plan

Pre-commit hooks (`detect-secrets`, `trufflehog`) enforce these requirements automatically. CI pipeline also scans on every build.

---

## Emergency Credential Revocation

In the event of confirmed or suspected credential compromise:

1. Revoke the credential immediately — do not wait for a replacement to be ready
2. Notify Security Engineering via Slack #security-incidents
3. Rotate within 1 hour (provision replacement → update consumers → verify → revoke old)
4. Open a security incident if the compromise scope is unclear
5. Audit all systems accessible by the compromised credential for unauthorised access
6. Log revocation event at AUDIT level

---

## Metrics

| Metric | Target |
|--------|--------|
| Secrets overdue for rotation | 0 |
| Secrets discovered in code scans | 0 |
| Shared accounts without PAM controls | 0 |
| Emergency rotations completed within 1 hour | 100% |
| Secrets not in inventory | 0 |

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [Encryption & Cryptography Policy](./ENCRYPTION-CRYPTOGRAPHY-POLICY.md)
- [Access Control & IAM Policy](./ACCESS-CONTROL-IAM-POLICY.md)
- [Cloud Security Policy](./CLOUD-SECURITY-POLICY.md)
- [SDLC Security Guardrails](./SDLC-SECURITY-GUARDRAILS.md)
- [Logging Strategy](./LOGGING-STRATEGY.md)
