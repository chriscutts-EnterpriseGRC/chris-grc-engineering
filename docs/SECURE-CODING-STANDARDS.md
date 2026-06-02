# Secure Coding Standards

**Program:** Resilience Ops GRC Platform  
**Owner:** Security Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** ISO 27001 A.8.28, OWASP Top 10 2021, NIST SSDF PW.5, CWE/SANS Top 25, EU AI Act Art. 9

---

## Purpose

These standards define the minimum secure coding requirements for all software developed or maintained by [Organization]. They translate the OWASP Top 10 and other vulnerability classes into actionable patterns for the languages and frameworks used in this codebase (JavaScript/Node.js, React, Python, SQL).

---

## Scope

Applies to all code in [Organization] repositories — application code, infrastructure-as-code, scripts, configuration, and AI/ML pipeline code.

---

## OWASP Top 10 2021 — Required Mitigations

### A01: Broken Access Control

- Apply authentication and authorisation checks on every API endpoint — never rely on obscurity or URL structure
- Implement Supabase Row Level Security (RLS) policies that enforce data access at the database layer, not just the application layer
- Use principle of least privilege for all database queries — queries must only access required tables and columns
- Validate that the authenticated user is authorised to access the specific resource, not just the resource type (IDOR prevention)
- Never expose internal object IDs directly — use opaque references where appropriate

**Node.js pattern:**
```js
// Always verify the user owns the resource, not just that they're authenticated
const { data, error } = await supabase
  .from('vulnerabilities')
  .select('*')
  .eq('id', id)
  .eq('team_id', user.team_id); // scope to user's team
```

---

### A02: Cryptographic Failures

- Never store secrets, API keys, or passwords in plaintext — see [Credential & Password Management Policy](./CREDENTIAL-PASSWORD-MANAGEMENT-POLICY.md)
- Never commit `.env` files or credentials to source control
- Use HTTPS/TLS for all connections — disable `rejectUnauthorized` is prohibited in production
- Hash passwords with bcrypt (cost ≥12) or Argon2id — never MD5 or SHA-1
- Use approved algorithms per [Encryption & Cryptography Policy](./ENCRYPTION-CRYPTOGRAPHY-POLICY.md)

**Prohibited patterns:**
```js
// NEVER do this
process.env.SUPABASE_KEY = 'hardcoded-key-here';
const password_hash = md5(password);
const client = new Client({ ssl: { rejectUnauthorized: false } }); // in production
```

---

### A03: Injection

**SQL Injection:**
- Never concatenate user input into SQL queries
- Use Supabase's parameterised client methods or ORM — never raw string interpolation in queries
- Validate and sanitise all user-supplied data before use in any query

```js
// CORRECT — parameterised via Supabase client
const { data } = await supabase.from('vulnerabilities').select().eq('id', userInputId);

// NEVER — string interpolation
const { data } = await supabase.rpc(`SELECT * FROM vulns WHERE id = '${userInput}'`);
```

**Command Injection:**
- Never pass user input to `exec`, `spawn`, `eval`, or `child_process` functions
- If shell commands are necessary, use `spawn` with argument arrays (not shell: true), and validate each argument strictly

**Prompt Injection (AI-specific):**
- Sanitise user input before constructing AI prompts — never embed raw user content directly into system instructions
- Apply prompt injection detection patterns at the MCP server input validation layer
- Never trust that an AI model will resist injection from user-supplied content

---

### A04: Insecure Design

- Conduct STRIDE threat modelling for every new feature before writing code (see [PDLC Security Guardrails](./PDLC-SECURITY-GUARDRAILS.md))
- Document abuse cases — not just happy paths
- Apply the security acceptance criteria template from the PDLC guardrails to every security-relevant feature story

---

### A05: Security Misconfiguration

- No default credentials in any deployment
- Remove unused features, endpoints, and dependencies
- Error messages must not expose stack traces, internal paths, or system information to users
- HTTP security headers are required on all web responses:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

---

### A06: Vulnerable and Outdated Components

- All dependencies are tracked in `package.json` / `requirements.txt` with pinned versions
- `npm audit` / `pip-audit` runs in CI — P1 findings block merge
- Dependabot PRs for patch/minor bumps are reviewed and merged within 7 days
- SBOM is generated on every build (`syft`) and tracked for new CVE matches

---

### A07: Identification and Authentication Failures

- Never build authentication from scratch — use Supabase Auth, Okta, or equivalent established IAM
- MFA is required for all production access — see [Access Control & IAM Policy](./ACCESS-CONTROL-IAM-POLICY.md)
- Session tokens must be:
  - Cryptographically random (min 128-bit entropy)
  - Not predictable or sequential
  - Stored securely (httpOnly, Secure, SameSite cookies or bearer tokens — not localStorage)
  - Invalidated on logout and on password/MFA change
- Implement account lockout after 10 failed attempts

---

### A08: Software and Data Integrity Failures

- Verify the integrity of all third-party libraries (subresource integrity for CDN assets)
- Container images are signed (Cosign) and signature verified before deployment
- SBOM is generated for every build to track component provenance
- CI/CD pipeline uses OIDC for keyless authentication — no long-lived secrets in pipelines
- Artifact signing (`cosign sign`) is applied before production promotion

---

### A09: Security Logging and Monitoring Failures

- All security-relevant events produce `AUDIT`-level structured logs per [Logging Strategy](./LOGGING-STRATEGY.md)
- Never log sensitive data (passwords, tokens, PII) — apply the scrubber
- Ensure failed authentication and authorisation events are logged with sufficient detail for investigation
- Log AI decision events with `input_hash`, `model_version`, and `reasoning_summary`

---

### A10: Server-Side Request Forgery (SSRF)

- Validate and whitelist all URLs before making server-side HTTP requests
- Never allow user input to directly control the target URL of a server-side request
- For integration adapters: validate that the target endpoint matches the expected configuration — never accept URLs from API responses

---

## Language-Specific Standards

### JavaScript / Node.js

| Requirement | Detail |
|-------------|--------|
| `eval()` | Prohibited — never use |
| `child_process.exec` with shell | Prohibited with user input; use `spawn` with argument arrays |
| `JSON.parse` on untrusted input | Wrap in try/catch; validate schema before use |
| npm packages | Check CVE status with `npm audit`; do not install packages with critical vulnerabilities |
| `process.env` access | Validate required vars at startup; fail fast with clear error if missing |
| `console.log` in production | Replace with structured logger — never log objects that may contain credentials |
| Async error handling | All async functions have try/catch or `.catch()` — uncaught rejections terminate Node |

### React / Frontend

| Requirement | Detail |
|-------------|--------|
| `dangerouslySetInnerHTML` | Prohibited unless the input is explicitly sanitised with DOMPurify |
| URL parameters in queries | Never pass unsanitised URL params to API calls |
| Local storage for sensitive data | Prohibited — use httpOnly cookies or in-memory state only |
| Third-party scripts | CSP policy must restrict script sources; no inline scripts |
| API keys in frontend bundle | Only the Supabase anon key is permitted — never service role keys or third-party secrets |

### Python (Lambda)

| Requirement | Detail |
|-------------|--------|
| `subprocess` with shell=True | Prohibited with user input |
| `pickle` / `marshal` on untrusted data | Prohibited — use JSON |
| SQL via `format()` or `%` | Prohibited — use parameterised queries |
| `eval()` / `exec()` | Prohibited |
| Exception handling | Catch specific exceptions; log error code without stack trace in production |

### SQL

| Requirement | Detail |
|-------------|--------|
| User input in queries | Always via parameterised queries or Supabase client methods |
| Stored procedures | Validate input types; use SECURITY DEFINER with caution |
| Default permissions | Apply least privilege; no `GRANT ALL` on production tables |
| Sensitive data in views | Apply column-level security where supported |

---

## AI / LLM Code Standards

For code that interacts with AI models or the GRC MCP server:

| Requirement | Detail |
|-------------|--------|
| Input validation | Validate all inputs before passing to AI inference endpoints — type, length, content |
| Prompt construction | System prompts are static; user-supplied content is clearly separated from instructions |
| Output handling | Treat AI output as untrusted — validate structure, sanitise before rendering or storing |
| Prompt injection patterns | Reject inputs matching known injection patterns (`ignore previous`, `act as`, `disregard`) |
| Model version pinning | Pin the exact model version in code — never use `latest` or a floating alias |
| Logging | Log `input_hash`, `output_hash`, `model_version` on every AI call — never raw content |
| Rate limiting | Apply per-agent and per-tool rate limits at the MCP server |

---

## Code Review Security Checklist

Every PR must confirm:

- [ ] No secrets or credentials in code or config files
- [ ] Input validation present for all user-supplied data
- [ ] SQL queries use parameterised statements
- [ ] Auth and authorisation checks on all new endpoints
- [ ] New dependencies reviewed for known CVEs (`npm audit`, `pip-audit`)
- [ ] Logging does not emit PII or sensitive values
- [ ] Error messages do not expose internal details to users
- [ ] AI model inputs/outputs validated and logged (if applicable)
- [ ] Prompt injection patterns handled (if AI features)

---

## Tooling

| Tool | Purpose | Enforcement |
|------|---------|-------------|
| `semgrep` | SAST — detects injection, insecure patterns, secrets | Pre-commit + CI gate |
| `eslint-plugin-security` | JavaScript/React security linting | Pre-commit + CI |
| `bandit` | Python SAST | CI gate |
| `detect-secrets` | Secrets detection | Pre-commit (blocking) |
| `trufflehog` | Historical secrets scan in git history | CI gate |
| `npm audit` / `pip-audit` | Dependency CVE checking | CI gate (fail on critical/high) |
| `OWASP ZAP` | Dynamic analysis (DAST) against staging | CI pipeline on staging deploy |

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [SDLC Security Guardrails](./SDLC-SECURITY-GUARDRAILS.md)
- [Encryption & Cryptography Policy](./ENCRYPTION-CRYPTOGRAPHY-POLICY.md)
- [Logging Strategy](./LOGGING-STRATEGY.md)
- [Security Policy — AI security strategy](./SECURITY.md)
- [Vulnerability Management Program](./VULNERABILITY-MANAGEMENT-PROGRAM.md)
