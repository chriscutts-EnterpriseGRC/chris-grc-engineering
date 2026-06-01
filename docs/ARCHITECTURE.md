# Architecture

## System overview

The Resilience Operations Dashboard is a three-layer system: a React frontend, a Supabase (PostgreSQL) backend, and Node.js integration adapters that pull from external data sources. A separate CI/CD pipeline enforces preventive infrastructure compliance using Open Policy Agent before any changes reach production.

---

## Layers

### 1. Frontend - React dashboard

- **Framework**: React 19, Tailwind CSS v3, Recharts, Lucide icons
- **Entry point**: `dashboard/src/GRCDashboard.jsx` - 13 modules rendered from a single component tree
- **Data access**: `dashboard/src/lib/api.js` - fetches from Supabase when live, falls back to inline mock data per-table when uncredentialed
- **Supabase client**: `dashboard/src/lib/supabase.js` - returns `null` when env vars are absent, keeping the dashboard in demo mode with no code change

**Dashboard modules:**

| Module | Description |
|--------|-------------|
| Overview | Resilience score ring, all control gaps by category, open risk register snapshot |
| Risk Register | 5×5 heat matrix, inherent/residual scoring, response SLA, approval authority, workflow states |
| Vulnerabilities | CVE register, CVSS scores, AI/LLM vulns, UCF control linkage |
| Incidents | Active incidents, MTTR, AI data leaks, IR control effectiveness |
| Policy | Policy library, overdue reviews, missing AI policies, document links |
| Third Party | Vendor risk scores, contract expiry, AI vendor gaps |
| Control Alignment | UCF crosswalk across 8 frameworks, OSCAL SSP export |
| Compliance | Framework progress - SOC 2, ISO 27001, NIST CSF, GDPR, EU AI Act, ISO 42001 |
| Audit Management | Audit schedule, readiness scores, scope, findings tracking |
| Evidence Locker | Control evidence register, expiry tracking, upload history |
| Scorecard | Per-team health %, Bronze/Silver/Gold/Platinum levels, leaderboard, achievement badges |
| Monthly Report | Per-leader filtered report - controls, vulns, incidents, risks, actions. Shareable via `?leader=<id>` URL |
| Architecture | Signal pipeline, integration status, domain reviewer summary |

### 2. Backend - Supabase (PostgreSQL)

- **Tables**: `controls`, `vulnerabilities`, `incidents`, `policies`, `vendors`, `risks`
- **RLS**: Row Level Security on all tables - `anon_read` for the React frontend, `auth_write` for integration scripts
- **Indexes**: on `control_id`, `severity`, `status`, `risk_score`, `inherent->>'score'` across tables
- **Migrations**:
  - `001_initial_schema.sql` - controls, vulns, incidents, policies, vendors with RLS and `set_updated_at()` trigger
  - `002_risks_table.sql` - risks table conforming to `schemas/risk.schema.json` v1

### 3. Integration adapters - Node.js

Located in `dashboard/integrations/`. Each adapter pulls data from an external source and upserts into Supabase using the service role key. Adapters activate only when their required env vars are present - missing credentials skip the adapter silently.

| Adapter | Source | Target table |
|---------|--------|--------------|
| `jira.js` | Jira Cloud REST API | `incidents` |
| `qualys.js` | Qualys VMDR API | `vulnerabilities` |
| `splunk.js` | Splunk REST API | `incidents` |
| `aws-security-hub.js` | AWS Security Hub | `vulnerabilities` |
| `servicenow.js` | ServiceNow REST API | `incidents`, `policies` |
| `notion.js` | Notion API | `policies` |
| `vanta.js` | Vanta API | `controls` |
| `sync.js` | Orchestrator - runs all enabled adapters | all |

### 4. Preventive control layer - OPA + CircleCI

Defined in [circleci-aws-opa-lab](https://github.com/9snxz8htcw-netizen/circleci-aws-opa-lab). Enforces compliance-as-code in CI/CD before infrastructure is deployed:

| OPA Rule | Control | Frameworks |
|----------|---------|------------|
| Encryption at rest | UCF.02.01 | NIST SC-28, SOC2 CC6.1, ISO A.10.1.1 |
| Versioning / backup | UCF.09.01 | NIST CP-9, SOC2 A1.2, ISO A.12.3.1 |
| Public access block | UCF.05.01 | NIST AC-3, SOC2 CC6.6, ISO A.9.4.1 |
| Asset tagging | UCF.08.02 | NIST CM-8, SOC2 CC7.1, ISO A.8.1.1 |

This layer provides **preventive** controls. The dashboard provides **detective and corrective** controls. Together they span the full control lifecycle.

### 5. Plugin layer - Claude Code plugins

Located in `plugins/`. Framework and connector plugins extend the dashboard with AI-assisted GRC workflows, assessable via Claude Code slash commands.

| Plugin category | Count | Examples |
|-----------------|-------|---------|
| Framework plugins | 33 | soc2, iso27001, nist-ai-rmf, eu-ai-act, iso42001, gdpr, pci-dss |
| Connector plugins | 16 | aws-inspector, gcp-inspector, okta-inspector, wiz-inspector |
| GRC tools | 6 | risk-agent, grc-tprm, grc-reporter, oscal, trust-center |

---

## Data flow

```
External sources                  Integration layer              Backend          Frontend
─────────────────                 ─────────────────              ───────          ────────
Jira Cloud          ──────────►  jira.js                    ──►
Qualys VMDR         ──────────►  qualys.js                  ──►
Splunk              ──────────►  splunk.js                  ──►  Supabase    ──►  React
AWS Security Hub    ──────────►  aws-security-hub.js        ──►  PostgreSQL       Dashboard
ServiceNow          ──────────►  servicenow.js              ──►
Notion              ──────────►  notion.js                  ──►
Vanta               ──────────►  vanta.js                   ──►
Manual / seed SQL   ──────────►  (direct SQL / seed-risks)  ──►
```

```
IaC (Terraform)  ──►  OPA policy-validation (CircleCI)  ──►  deploy-compliant-infrastructure
                       [blocks non-compliant resources]
```

---

## Demo vs. live mode

| Condition | Mode | Data source |
|-----------|------|-------------|
| No `REACT_APP_SUPABASE_URL` set | **Demo** | Inline mock data in `GRCDashboard.jsx` |
| Valid URL + anon key set | **Live** | Supabase - falls back per-table if a fetch fails |

The header badge shows **○ Demo** or **● Live** accordingly.

---

## Security architecture

| Concern | Implementation |
|---------|----------------|
| Frontend credentials | Supabase anon key - read-only scope enforced by RLS |
| Write credentials | `SUPABASE_SERVICE_ROLE_KEY` - server-side only, never in browser |
| Secret storage | macOS Keychain (dev), secrets manager (prod) - never plaintext `.env` committed |
| Auth (P0 before production) | Supabase Auth or Okta SSO before connecting real data |
| RLS hardening (P0) | Current `anon_read` policy is open - must be scoped per user before real data |
| Preventive controls | OPA pipeline blocks non-compliant infrastructure before deployment |
