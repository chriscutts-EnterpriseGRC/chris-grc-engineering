# Encryption and Cryptography Policy

**Program:** Resilience Ops GRC Platform  
**Owner:** Security Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** ISO 27001 A.5.33, SOC 2 CC6.7, NIST SP 800-52 / 800-57, PCI DSS 4.0 Req 3–4

---

## Purpose

This policy establishes the minimum cryptographic standards for protecting [Organization] data at rest, in transit, and in use. It defines approved algorithms, key management requirements, and prohibited practices to ensure consistent, strong cryptographic protection across all systems.

---

## Scope

Applies to all systems, applications, integrations, and AI services that store, transmit, or process [Organization] data classified as Confidential or Restricted (see [Data Classification Policy](./DATA-CLASSIFICATION-POLICY.md)).

---

## Approved Algorithms

### Symmetric Encryption

| Algorithm | Key size | Use |
|-----------|---------|-----|
| AES-GCM | 256-bit | Data at rest; preferred authenticated encryption |
| AES-CBC | 256-bit | Acceptable where GCM is not available; requires separate HMAC |
| ChaCha20-Poly1305 | 256-bit | Acceptable for performance-constrained contexts |

### Asymmetric Encryption and Key Exchange

| Algorithm | Key size | Use |
|-----------|---------|-----|
| RSA-OAEP | 2048-bit minimum (4096-bit preferred) | Key wrapping, certificate-based encryption |
| ECDH | P-256 or P-384 | Key agreement; preferred over RSA for new implementations |
| Ed25519 | 256-bit | Digital signatures (code signing, SSH keys) |

### Hashing

| Algorithm | Use |
|-----------|-----|
| SHA-256 | General hashing (log field hashing, integrity checks) |
| SHA-384 / SHA-512 | Higher-assurance contexts |
| bcrypt (cost ≥12) | Password hashing |
| Argon2id | Password hashing — preferred for new implementations |
| BLAKE3 | High-performance integrity checks |

### Transport Security

| Protocol | Requirement |
|----------|------------|
| TLS 1.3 | Required for all new implementations |
| TLS 1.2 | Acceptable for legacy compatibility only; schedule migration to 1.3 |
| TLS 1.1 and below | **Prohibited** |
| SSLv3 and below | **Prohibited** |

Preferred TLS 1.3 cipher suites:
- `TLS_AES_256_GCM_SHA384`
- `TLS_CHACHA20_POLY1305_SHA256`
- `TLS_AES_128_GCM_SHA256`

---

## Prohibited Algorithms

The following algorithms are **prohibited** and must not be used in any new or existing implementation:

| Prohibited | Reason |
|-----------|--------|
| DES / 3DES | Weak; broken |
| RC4 | Broken |
| MD5 | Collision-vulnerable; prohibited for security use |
| SHA-1 | Collision-vulnerable; prohibited for certificates |
| RSA < 2048-bit | Insufficient key size |
| Elliptic curves P-192 | Weak; deprecated |
| ECB mode (any cipher) | Deterministic; leaks patterns |
| Custom / home-grown cryptography | Never implement your own crypto primitives |

Existing implementations using prohibited algorithms must be migrated on a P2 timeline (30 days if Restricted data is involved).

---

## Data at Rest

| System | Requirement | Implementation |
|--------|-------------|---------------|
| Supabase (PostgreSQL) | Encrypted at rest | Supabase provides AES-256 at storage layer |
| S3 buckets | Encrypted at rest | Server-Side Encryption with AWS KMS (SSE-KMS) |
| S3 audit log archive | Encrypted | SSE-KMS with a dedicated CMK |
| Developer laptops | Full disk encryption | FileVault (macOS), BitLocker (Windows) |
| Backups | Encrypted | Same standard as source; backup encryption keys held separately |
| Container images in ECR | Encrypted | ECR encryption enabled per repository |

All Restricted data must be encrypted at rest. Confidential data must be encrypted at rest on all cloud storage.

---

## Data in Transit

| Connection | Requirement |
|-----------|------------|
| All external API traffic | TLS 1.2 minimum (TLS 1.3 preferred) |
| Supabase connections (adapters) | TLS — enforced by Supabase client |
| Inter-service communication (containers) | mTLS required for SecTier 0 services |
| GitHub communication | TLS (enforced by platform) |
| AWS API calls | HTTPS/TLS — enforced by AWS SDK |
| Webhook endpoints | TLS 1.2 minimum; HMAC signature verification required |
| SSH access | Ed25519 keys minimum; RSA-2048 acceptable; RSA-1024 prohibited |

Certificate validation must be enabled. Disabling certificate validation (e.g., `rejectUnauthorized: false`) is prohibited in production.

---

## Key Management

### Key Generation

- Cryptographic keys are generated using a cryptographically secure random number generator (CSPRNG)
- Keys are generated in the environment where they will be used, not generated elsewhere and transported
- AWS KMS is the primary key management service for cloud workloads
- Key generation events are logged at `AUDIT` level

### Key Storage

| Key type | Storage |
|----------|---------|
| AWS CMKs | AWS KMS — never exported unless backup recovery |
| Application secrets and API keys | AWS Secrets Manager or HashiCorp Vault |
| Developer SSH keys | Local keychain; private key never transmitted |
| Code signing keys | Sigstore Cosign / AWS KMS; never in plaintext files |
| Database encryption keys | AWS KMS CMK; managed by Supabase for Supabase-managed encryption |

Keys must never be:
- Stored in source code, config files, or `.env` files committed to git
- Transmitted in plaintext via email, Slack, or ticketing systems
- Stored in browser local storage or cookies

### Key Rotation

| Key type | Rotation schedule |
|----------|-----------------|
| AWS KMS CMKs | Annual (automatic via KMS rotation policy) |
| Supabase anon key | Annually, or immediately on suspected exposure |
| Supabase service role key | Annually, or immediately on suspected exposure |
| Integration API keys (Jira, Qualys, etc.) | Annually, or immediately on suspected exposure |
| CI/CD OIDC tokens | Per-job (short-lived by design) |
| TLS certificates | Before expiry — alert at 30 days, rotate at 14 days |
| SSH keys | Every 2 years; immediately on suspected compromise |

Rotation events are logged at `AUDIT` level. Rotation confirmation is verified before the old key is revoked.

### Key Destruction

- Keys are destroyed when no longer required (service decommission, key compromise)
- AWS KMS key deletion has a minimum 7-day waiting period — schedule accordingly
- Destruction events are logged with the key identifier, destruction date, and authorising individual
- Certificates are revoked (not just expired) when a private key is compromised

---

## Certificate Management

| Requirement | Detail |
|-------------|--------|
| Certificate Authority | Use trusted public CA (Let's Encrypt, DigiCert, AWS ACM) for external-facing services |
| Internal CA | For internal mTLS; managed via AWS Private CA or equivalent |
| Minimum key size | RSA 2048-bit or ECDSA P-256 |
| Maximum validity | 1 year for TLS certificates (align with CA/B Forum requirements) |
| Expiry monitoring | Alert at 30 days remaining; auto-renewal preferred (AWS ACM, Let's Encrypt) |
| Wildcard certificates | Permitted for appropriate domains; private key protected as Restricted |
| Certificate pinning | For high-value internal services; not required for general external APIs |

---

## Secrets Management in CI/CD

- No long-lived static credentials in CI/CD pipelines
- GitHub Actions and CircleCI use OIDC federation with AWS for keyless authentication
- Short-lived OIDC tokens are scoped to the specific job and repository
- Any required static secrets are stored in GitHub Secrets or CircleCI Environment Variables — not in code
- Pre-commit hooks scan for accidentally committed secrets (`detect-secrets`, `trufflehog`)

---

## AI System Cryptographic Requirements

AI agents in the GRC Platform handle potentially sensitive GRC data. Additional requirements:
- All AI agent communication with the MCP server uses TLS 1.3
- Input and output hashes in AI decision logs use SHA-256
- Any AI model artefacts (weights, configuration) stored at rest use AES-256 encryption
- Prompt content and model outputs are never stored in plaintext — hash-only logging per [Logging Strategy](./LOGGING-STRATEGY.md)

---

## Metrics

| Metric | Target |
|--------|--------|
| TLS certificates expiring within 14 days without renewal in progress | 0 |
| Systems using TLS 1.1 or below | 0 |
| API keys unrotated beyond schedule | 0 |
| Secrets found in source code scans | 0 |

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [Credential & Password Management Policy](./CREDENTIAL-PASSWORD-MANAGEMENT-POLICY.md)
- [Cloud Security Policy](./CLOUD-SECURITY-POLICY.md)
- [SDLC Security Guardrails](./SDLC-SECURITY-GUARDRAILS.md)
- [Logging Strategy](./LOGGING-STRATEGY.md)
- [Data Classification Policy](./DATA-CLASSIFICATION-POLICY.md)
