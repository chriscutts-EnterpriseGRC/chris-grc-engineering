# Security Policy

## Reporting a vulnerability

Please do not open public GitHub issues for security vulnerabilities.

Report privately via GitHub security advisories:
`https://github.com/9snxz8htcw-netizen/chris-grc-engineering/security/advisories/new`

When reporting, please include:

- A short summary of the issue and the affected surface
- Steps to reproduce or validate the problem
- Any proof-of-concept material that helps confirm impact safely
- Suggested mitigations, if you have them

## Supported versions

| Version | Supported |
|---|---|
| `main` | Yes |
| Earlier branches | Best effort only |

## Known open security items

The following items are documented and tracked — do not report them as new findings:

| Item | Status | Notes |
|---|---|---|
| `anon_read` RLS policy allows unauthenticated reads | P0 — open | Demo-only; must be scoped before connecting real data |
| No auth layer | P0 — open | Supabase Auth / Okta SSO planned before production use |
| `SUPABASE_SERVICE_ROLE_KEY` in `.env` | By design | Never committed — `.env` is git-ignored; use a secrets manager in production |

## Secure usage guidance

- **Never commit `.env`** — credentials are git-ignored by default; verify with `git status` before any commit
- **Service role key** — store in macOS Keychain (dev) or a secrets manager (AWS Secrets Manager, HashiCorp Vault) for production use; never paste into the browser or frontend code
- **Supabase anon key** — safe to expose in the React frontend only when RLS policies are properly scoped; the current open `anon_read` policy is suitable for demo only
- **Integration adapters** — run server-side only; never import `sync.js` or any integration adapter into the frontend bundle

---

## AI security strategy

The platform deploys AI agents for vulnerability triage, risk treatment drafting, SLA monitoring, and compliance gap analysis (see [AI-GRC-ROADMAP.md](./AI-GRC-ROADMAP.md)). AI systems introduce security risks beyond conventional application vulnerabilities.

### AI threat surface

| Threat | Description | Mitigation |
|--------|-------------|-----------|
| **Prompt injection** (OWASP LLM01) | Malicious input redirects AI agent behaviour | Input validation at MCP server boundary; inject-pattern detection; all attempts logged as `AUDIT` security alerts |
| **Sensitive data disclosure** (OWASP LLM06) | AI agent leaks SecTier 0/1 data in output | Agents read hashed/summarized context only; outputs scrubbed before rendering; access logged at `AUDIT` level |
| **Insecure output handling** (OWASP LLM02) | AI-generated content rendered without sanitization | Output validation before any DB write or user display; no AI output rendered as raw HTML |
| **Model supply chain** | Compromised or silently-updated model version | Model version pinned in SBOM; version change logged as `AUDIT` event; reviewed before promotion |
| **Unbounded consumption** | AI agent consumes excessive resources (token DoS) | Rate limiting on every MCP tool call; token count and duration logged per call; CloudWatch alarm on anomalous usage |
| **Unauthorized AI writes** | AI agent writes to production without human approval | All write tools require `approved_by` field; AI agents blocked from direct writes without a human-in-the-loop approval step |

### AI governance checkpoints

Before deploying any AI feature on this platform, the following must be completed. These derive from the PDLC guardrails and EU AI Act obligations:

1. **Risk tier classification** — classify the feature per EU AI Act Annex III (Prohibited / High / Limited / Minimal)
2. **Threat model** — include AI-specific STRIDE analysis covering prompt injection, data leakage, and model misuse
3. **Audit logging** — every AI decision must produce an `AUDIT`-level log with `reasoning_summary`, `model_version`, and `input_hash` (see [LOGGING-STRATEGY.md](./LOGGING-STRATEGY.md))
4. **Human oversight** — no AI agent may write to production data without a human approval gate
5. **Transparency** — users must be informed when a recommendation or action was AI-assisted

### AI-specific compliance requirements

| Regulation | Requirement | Status |
|------------|------------|--------|
| EU AI Act Art. 9 | Risk management system for AI | 22% coverage — gap (enforcement Aug 2026) |
| EU AI Act Art. 12 | Automatic logging for high-risk AI | Not implemented — pre-requisite for Phase 4 |
| EU AI Act Art. 13 | Transparency and traceability | Not implemented — pre-requisite for Phase 4 |
| ISO 42001 9.1 | AI monitoring and measurement | 18% coverage — gap |
| NIST AI RMF | Map, measure, manage, govern AI risks | Tracked via UCF.AI.01–10 controls |

Current AI compliance posture is tracked live in the GRC Dashboard (Compliance module — EU AI Act and ISO 42001 filters).

### Reporting AI security vulnerabilities

AI security findings (prompt injection, model misuse, data leakage via AI output) follow the same disclosure process as all other vulnerabilities — report privately via GitHub security advisories at the link above.
