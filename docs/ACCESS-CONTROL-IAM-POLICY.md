# Access Control and Identity & Access Management Policy

**Program:** Resilience Ops GRC Platform  
**Owner:** Security Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** ISO 27001 A.5.15–5.23, SOC 2 CC6.1–6.3, NIST SP 800-53 AC-1–AC-17, PCI DSS 4.0 Req 7–8

---

## Purpose

This policy defines how [Organization] manages digital identities and controls access to systems, data, and infrastructure. It establishes the minimum requirements for identity lifecycle management, authentication, authorisation, and privileged access.

---

## Scope

Applies to all users, systems, services, and non-human identities (service accounts, API keys, automated pipelines) with access to [Organization] systems or data.

---

## Core Principles

| Principle | Description |
|-----------|------------|
| **Least Privilege** | Every identity is granted the minimum access required to perform its defined function — no more |
| **Need-to-Know** | Access to data is restricted to those with a demonstrated business need |
| **Default Deny** | Access is denied unless explicitly granted |
| **Separation of Duties** | No single individual controls an entire sensitive workflow end-to-end |
| **Zero Standing Privilege** | Privileged access is time-limited and just-in-time where technically feasible |

---

## Identity Lifecycle

### Provisioning

Access requests require:
1. Business justification from the requestor's manager
2. Confirmation the role requires the specific access
3. Security Engineering approval for Restricted data access or privileged roles
4. CISO approval for production write access to SecTier 0 systems

Access is provisioned via the SSO system (Okta or Supabase Auth). Direct database credentials are not issued to individuals.

Role-based access profiles (RBAC) define the standard access set for each job function. Requestors should be mapped to the closest matching profile; exceptions require additional justification.

### Review and Recertification

| Asset tier | Review frequency |
|------------|----------------|
| SecTier 0 (Restricted) | Quarterly |
| SecTier 1 (Confidential) | Semi-annually |
| SecTier 2 (Internal) | Annually |

Data Owners and Engineering Leads conduct access reviews for their systems. Stale or unnecessary access is revoked within 5 business days of review completion.

### Deprovisioning

- Voluntary departure: all access revoked on final working day
- Involuntary departure: all access revoked within 2 hours of notification (simultaneously)
- Role change: excess access from prior role revoked within 5 business days

See [HR Security Policy](./HR-SECURITY-POLICY.md) for full offboarding requirements.

---

## Authentication Requirements

### Multi-Factor Authentication (MFA)

MFA is **mandatory** for all users accessing [Organization] systems. No exceptions.

| System | MFA requirement |
|--------|----------------|
| SSO (Okta / Supabase Auth) | Required — blocks login without MFA |
| AWS Console | Required — enforced via IAM policy |
| GitHub | Required — enforced via organisation policy |
| Supabase dashboard | Required |
| VPN / ZTNA | Required |

Approved MFA factors:
- Hardware security key (FIDO2/WebAuthn) — preferred
- Authenticator app (TOTP) — acceptable
- Push notification (Duo, Okta Verify) — acceptable
- SMS OTP — **not permitted** for accounts with access to Restricted data (SIM-swap risk)

### Password Requirements

Refer to the [Credential & Password Management Policy](./CREDENTIAL-PASSWORD-MANAGEMENT-POLICY.md) for full requirements. Summary:
- Minimum 16 characters
- No maximum length
- MFA required — complexity alone is insufficient
- Stored using bcrypt or Argon2 only

### Session Management

| Session type | Maximum duration | Inactivity timeout |
|-------------|-----------------|-------------------|
| Web application | 8 hours | 30 minutes |
| API token (user) | 24 hours (refreshable) | — |
| CI/CD OIDC token | Per-job (short-lived) | — |
| Admin session | 4 hours | 15 minutes |

Sessions are invalidated on password change, MFA change, or suspected compromise. All session termination events are logged.

---

## Authorisation and RBAC

### Role Definitions

| Role | Access scope | Systems |
|------|-------------|---------|
| **GRC Analyst** | Read all modules; write own team's data | GRC Dashboard (read/write own scope) |
| **Security Engineer** | Full read across all systems; write to security tooling | All — including vulnerability scanner APIs |
| **Engineering Lead** | Read GRC data for their team; write to team code repositories | GitHub, GRC Dashboard (team scope) |
| **Platform Admin** | Full admin on infrastructure | AWS, Supabase, GitHub admin |
| **AI Agent (automated)** | Read GRC data per tool scope; write requires `approved_by` | GRC MCP server tools only |
| **Auditor (external)** | Read-only access to evidence and compliance modules | GRC Dashboard (read only), Evidence Locker |
| **Read-only (demo)** | Read demo data only — no real data | GRC Dashboard (demo mode) |

Custom roles require Security Engineering approval and must be documented before provisioning.

### ABAC for Sensitive Resources

For SecTier 0 data access, attribute-based access control (ABAC) applies additional conditions:
- Time of day restrictions (business hours for non-emergency access)
- Device compliance check (managed device required)
- MFA session freshness (MFA within last 2 hours)

---

## Privileged Access Management (PAM)

### Definition of Privileged Access

Privileged access includes:
- Production database admin (Supabase service role)
- AWS root account or admin IAM roles
- GitHub organisation owner
- Ability to modify CI/CD pipelines or OPA policies
- Access to secrets management systems (AWS Secrets Manager, Vault)
- Ability to modify security tooling or logging configuration

### PAM Requirements

- Privileged access is never granted permanently — just-in-time (JIT) access is preferred
- All privileged sessions are logged at `AUDIT` level with full session duration
- Shared privileged accounts (e.g., AWS root) are vaulted in a PAM tool — checked out, used, checked in
- AWS root account credentials are used only for emergency recovery; MFA is mandatory; usage triggers immediate alert
- Production SSH/RDP access is proxied through a bastion or session manager — no direct key-based access

### Break-Glass Procedures

Emergency privileged access (break-glass) when JIT is not available:
1. Incident Commander declares a P0 or P1 incident requiring emergency access
2. Security Engineering issues time-limited emergency credentials (< 4-hour validity)
3. All actions taken under emergency credentials are logged and reviewed within 24 hours
4. Emergency credentials are immediately revoked on incident containment

---

## Service Accounts and Non-Human Identities

| Identity type | Requirements |
|---------------|-------------|
| Service accounts (Node.js adapters) | Scoped to minimum required permissions; credentials stored in AWS Secrets Manager; no human login |
| CI/CD pipeline tokens | OIDC-based short-lived tokens preferred; no long-lived static credentials in CI secrets |
| AI agents (MCP server) | Read-only by default; write tools require `approved_by` field; never hold direct DB credentials |
| API keys (external integrations) | Scoped per integration; rotated at least annually; rotated immediately on suspected compromise |
| AWS Lambda roles | IAM roles scoped to specific resources and actions; no `*` resource or action |

Service accounts are inventoried, owned by a named team, and included in quarterly access reviews.

---

## Third-Party and Vendor Access

Vendor and contractor access requirements:
- Provisioned through the same SSO system as employees
- Scoped to the minimum required for the contracted work
- Time-limited — access expires at contract end and is not automatically renewed
- MFA required — no exceptions
- Vendor access is logged and included in access reviews
- Remote access only via approved VPN or ZTNA

---

## Metrics

| Metric | Target |
|--------|--------|
| Access reviews completed on time | 100% |
| Accounts with MFA disabled | 0 |
| Privileged access without PAM controls | 0 |
| Dormant accounts (no login > 90 days) | Reviewed and revoked monthly |
| Offboarding access revocation time | < 2 hours (involuntary), same day (voluntary) |

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [Credential & Password Management Policy](./CREDENTIAL-PASSWORD-MANAGEMENT-POLICY.md)
- [HR Security Policy](./HR-SECURITY-POLICY.md)
- [Cloud Security Policy](./CLOUD-SECURITY-POLICY.md)
- [Logging Strategy](./LOGGING-STRATEGY.md)
- [Third-Party Risk Management Policy](./THIRD-PARTY-RISK-MANAGEMENT-POLICY.md)
