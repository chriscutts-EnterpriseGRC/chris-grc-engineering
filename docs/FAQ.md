# FAQ

## General

### What is this system?

A full-stack GRC operations platform that turns compliance data into operational intelligence. It connects framework controls, live risk scoring, team accountability, and leadership reporting in a single dashboard. Built on React, Supabase, and a plugin architecture for connector and framework extensions.

### Who is it for?

- Security and GRC teams managing controls, risks, and audit readiness
- Risk owners who need a clear view of their exposure and treatment status
- Leaders who receive monthly reports filtered to their team's domain
- Auditors who need evidence traceability and framework coverage data

### What compliance frameworks does it support?

**In the dashboard (tracked with live scores):**
SOC 2 Type II, ISO 27001, NIST CSF 2.0, GDPR, PCI DSS, HIPAA, EU AI Act, ISO/IEC 42001

**Available via framework plugins (`plugins/frameworks/`):**
NIST AI RMF, NIST 800-53, CMMC, FedRAMP Rev5, FedRAMP 20x, HITRUST, DORA, CIS Controls, CSA CCM, GLBA, NYDFS, SOX, CCPA, HIPAA Security, NERC-CIP, PBM, StateRAMP, and 15+ international frameworks

---

## Technical

### What are the system requirements?

- **Node.js**: 18+ (for integration adapters and seed scripts)
- **Browser**: Any modern browser (Chrome, Firefox, Safari, Edge)
- **Database**: Supabase free tier is sufficient for demo and small deployments
- **RAM**: 4GB minimum for local development

### Does it work without Supabase?

Yes. With no credentials set, the dashboard runs entirely on inline demo data. The header shows **○ Demo**. Add credentials and it switches to **● Live** automatically - no code change required.

### How do I connect integrations?

Add the relevant credentials to `dashboard/.env` and run:
```bash
cd dashboard && node integrations/sync.js
```

Each adapter (Jira, Qualys, Splunk, AWS Security Hub, ServiceNow, Notion, Vanta) checks for its required env vars and skips itself silently if they're absent.

See [QUICKSTART.md](QUICKSTART.md) for the full credential reference.

### Is the OSCAL export real?

Yes. The Export OSCAL button in Control Alignment downloads a JSON file conforming to the NIST OSCAL System Security Plan schema, with all UCF controls, their effectiveness status, and framework mappings. It can be submitted to FedRAMP reviewers or imported into OSCAL-compatible tools.

---

## Risk methodology

### How are risk scores calculated?

`Risk Score = Likelihood × Impact` (range 1–25).

**Likelihood** uses a high water mark rule across three dimensions - Frequency, Technical Feasibility, and Likelihood Precursor. The final likelihood score is the highest of the three.

**Impact** is a single 1–5 scale.

See [RISK-METHODOLOGY.md](RISK-METHODOLOGY.md) for the full tables.

### What are the risk rating bands?

| Band | Score |
|------|-------|
| Critical | 25 |
| Severe | 16–24 |
| High | 10–15 |
| Moderate | 5–9 |
| Low | 1–4 |

### What are the response SLAs?

| Band | Decision SLA | Acceptance authority |
|------|-------------|---------------------|
| Critical | 7 days | C-Suite / SVP+ |
| Severe | 30 days | VP+ |
| High | 60 days | Director+ |
| Moderate | 90 days | Sr Manager+ |
| Low | 180 days | Manager+ |

Any risk that breaches its SLA without a documented decision is deemed accepted by default.

### How often are risks reviewed?

| Band | Monitoring frequency |
|------|---------------------|
| Critical | Monthly |
| Severe | Monthly |
| High | Quarterly |
| Moderate | Bi-annually |
| Low | Annually |

### What is the difference between inherent and residual risk?

**Inherent** is the risk score with zero controls applied. **Residual** is recalculated after accounting for the effectiveness of linked UCF controls - a control rated 92% effective reduces residual risk more than one rated 38%. The dashboard shows both scores and flags where residual still exceeds the risk appetite threshold.

---

## Leadership and reporting

### How does the monthly report work?

Navigate to LEADERSHIP → Monthly Report, select a team, and the report auto-generates - filtered to that leader's controls, open vulnerabilities, active incidents, policies they own, risk items, and recommended actions for the coming month. Use the Print button for PDF or copy the share link (`?leader=<teamId>`) to send directly to the leader.

### What is the Scorecard?

The Scorecard ranks all 6 teams (Identity & Access, Data Protection, Infrastructure Security, Security Operations, GRC & Vendor Risk, R&D / Product) by health score with Bronze/Silver/Gold/Platinum levels, 3-month trend sparklines, and achievement badges. It makes security posture visible and competitive rather than a compliance checkbox.

### Can I share reports without giving access to the full dashboard?

Yes - each leader report has a shareable URL (`?leader=identity`, `?leader=data`, etc.) that opens directly to their filtered view. The dashboard currently runs in open demo mode; restrict access by enabling Supabase Auth before connecting real data.

---

## Security

### How is data protected?

- Supabase anon key is read-only - Row Level Security enforces this at the database level
- Write credentials (`SUPABASE_SERVICE_ROLE_KEY`) are server-side only, never in the browser
- Preventive controls via OPA block non-compliant infrastructure before it reaches production

### What needs to happen before connecting real data?

Two things are required before production use:

1. **Auth** - Enable Supabase Auth or Okta SSO. Currently `anon_read` is open to any visitor.
2. **RLS hardening** - Scope the `anon_read` policy to authenticated users or specific roles.

Both are documented as P0 items in [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Troubleshooting

### Dashboard shows Demo but I set the env vars

Restart the dev server after adding `.env`. React reads env vars at build time for `REACT_APP_*` variables - a hot reload isn't enough.

### An integration isn't syncing

Check that all required env vars for that adapter are set (see [QUICKSTART.md](QUICKSTART.md)), then run:
```bash
cd dashboard && node integrations/sync.js
```
Errors are logged per adapter. A missing var skips the adapter silently - confirm the var names match `.env.example` exactly.

### Health scores seem wrong

The team health score is `(effective + partial × 0.5) / total_controls × 100`. If a control is `not_tested` it counts as a gap (zero). Run `/risk-agent:triage-risks` to surface which controls are pulling scores down.
