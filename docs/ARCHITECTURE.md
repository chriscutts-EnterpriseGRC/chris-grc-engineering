# Architecture

## System Overview

The Resilience Operations Dashboard is a three-layer system: a React frontend, a Supabase (PostgreSQL) backend, and a set of Node.js integration adapters that pull from external data sources. A separate CI/CD pipeline enforces preventive infrastructure compliance using Open Policy Agent before any changes reach production.

---

## Layers

### 1. Frontend — React Dashboard

- **Framework**: React 19, Tailwind CSS v3, Recharts, Lucide icons
- **Entry point**: `dashboard/src/GRCDashboard.jsx` — all seven modules (Overview, Vulnerabilities, Incidents, Policy, Third Party, UCF Controls, Compliance, Architecture)
- **Data access**: `dashboard/src/lib/api.js` — fetches from Supabase when live, falls back to inline mock data when uncredentialed
- **Supabase client**: `dashboard/src/lib/supabase.js` — returns `null` when env vars are absent, which keeps the dashboard in demo mode

### 2. Backend — Supabase (PostgreSQL)

- **Tables**: `controls`, `vulnerabilities`, `incidents`, `policies`, `vendors`
- **RLS**: Row Level Security enabled on all tables — `anon_read` for the React frontend, `auth_write` for integration scripts
- **Indexes**: on `control_id`, `severity`, `status`, and `risk_score` across tables
- **Schema**: `supabase/migrations/001_initial_schema.sql`
- **Demo data**: `supabase/seed.sql` — enriched with real content from [GRC-Portfolio](https://github.com/ewelina-kowalska-oneill/GRC-Portfolio) and OPA control mappings from [circleci-aws-opa-lab](https://github.com/9snxz8htcw-netizen/circleci-aws-opa-lab)

### 3. Integration Adapters — Node.js

Located in `dashboard/integrations/`. Each adapter pulls data from an external source and upserts it into Supabase using the service role key.

| Adapter | Source | Target table |
|---|---|---|
| `jira.js` | Jira Cloud REST API | `incidents` |
| `qualys.js` | Qualys VMDR API | `vulnerabilities` |
| `splunk.js` | Splunk REST API | `incidents` |
| `sync.js` | Orchestrator — runs all enabled adapters | all |

Adapters are activated by the presence of their required env vars. Missing credentials → adapter is skipped, not an error.

### 4. Preventive Control Layer — OPA + CircleCI

Defined in [circleci-aws-opa-lab](https://github.com/9snxz8htcw-netizen/circleci-aws-opa-lab). Enforces compliance-as-code in the CI/CD pipeline before infrastructure is deployed:

| OPA Rule | Control | Frameworks |
|---|---|---|
| Encryption at rest | UCF.02.01 | NIST SC-28, SOC2 CC6.1, ISO A.10.1.1 |
| Versioning / backup | UCF.09.01 | NIST CP-9, SOC2 A1.2, ISO A.12.3.1 |
| Public access block | UCF.05.01 | NIST AC-3, SOC2 CC6.6, ISO A.9.4.1 |
| Asset tagging | UCF.08.02 | NIST CM-8, SOC2 CC7.1, ISO A.8.1.1 |

This layer provides **preventive** controls. The dashboard provides **detective and corrective** controls. Together they span the full control lifecycle.

---

## Data Flow

```
External sources                  Integration layer           Backend           Frontend
─────────────────                 ─────────────────           ───────           ────────
Jira Cloud          ──────────►  jira.js                 ──►
Qualys VMDR         ──────────►  qualys.js               ──►  Supabase    ──►  React
Splunk              ──────────►  splunk.js               ──►  PostgreSQL       Dashboard
Manual / CSV        ──────────►  (direct SQL / seed.sql) ──►
```

```
IaC (Terraform)  ──►  OPA policy-validation (CircleCI)  ──►  deploy-compliant-infrastructure
                       [blocks non-compliant resources]
```

---

## Demo vs. Live mode

The dashboard detects its mode at startup:

| Condition | Mode | Data source |
|---|---|---|
| No `REACT_APP_SUPABASE_URL` set | **Demo** | Inline mock data in `GRCDashboard.jsx` |
| Valid URL + anon key set | **Live** | Supabase — falls back per-table if a fetch fails |

The header badge shows **○ Demo** or **● Live** accordingly.

---

## Security Architecture

| Concern | Implementation |
|---|---|
| Frontend credentials | Supabase anon key — read-only scope enforced by RLS |
| Write credentials | `SUPABASE_SERVICE_ROLE_KEY` — server-side only, never in browser |
| Secret storage | macOS Keychain (dev), secrets manager (prod) — never plaintext `.env` in production |
| Auth (planned P0) | Supabase Auth or Okta SSO before connecting real data |
| RLS (P0 hardening) | Current `anon_read` policy is open — must be scoped before real data |
| Preventive controls | OPA pipeline blocks non-compliant infrastructure before deployment |

---

## Planned integrations (not yet implemented)

| Integration | Module | Notes |
|---|---|---|
| ServiceNow | Incidents / Policy | Adapter pattern same as jira.js |
| AWS Security Hub | Vulnerabilities | Adapter pattern same as qualys.js |
| Vanta | Compliance / Controls | Control effectiveness sync |
| Notion | Policy | Policy document store |
| CircleCI webhook | Controls | Live OPA pass/fail → control effectiveness score |
