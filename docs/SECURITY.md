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
