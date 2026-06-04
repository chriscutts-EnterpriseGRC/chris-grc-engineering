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
| Overview | Resilience score ring, Alert Tray, Decisions Required Today (two-tile layout), AI control gaps, top risks — all items deep-link to source row |
| Risk Register | 5×5 heat matrix, inherent/residual scoring, business impact bands, risk appetite, AI-flagged risks, CSV export |
| Vulnerabilities | CVE register, VSRM priority bands (P0–P4), CVSS scores, predictive SLA breach alerts, AI/LLM vulns, CSV export |
| Incidents | Active incidents, MTTR, AI data leaks, auto-triage severity classification |
| Policy | Policy library, overdue reviews, missing AI policies, AI-assisted policy draft generation, live document links |
| Third Party | Vendor risk scores, contract expiry, AI vendor gaps, DPA tracking |
| Control Alignment | UCF crosswalk across 8 frameworks, gap analyser, OSCAL SSP export |
| Compliance | Framework progress - SOC 2, ISO 27001, NIST CSF, GDPR, EU AI Act, ISO 42001 — per-framework gap analysis |
| Audit Management | Audit schedule, readiness scores, scope, findings tracking |
| Evidence Locker | Control evidence register, expiry tracking, upload history, live sync status |
| Scorecard | Per-team health %, Bronze/Silver/Gold/Platinum levels, leaderboard, achievement badges, AI risk narrative |
| Leadership Decisions | Real-time decisions requiring CISO/Board sign-off; multi-step approval workflow engine; decision log (persisted); ServiceNow-compatible ref numbers, action notes, external ticket cross-reference |
| Monthly Report | Per-leader filtered report — controls, vulns, incidents, risks, actions. Shareable via `?leader=<id>` URL |
| Architecture | Signal pipeline, integration status, domain reviewer summary |

**Frontend patterns:**

| Pattern | Description |
|---------|-------------|
| `focusId` deep-link | `handleNavClick(page, itemId?)` stores `focusId` in root state; `ModuleTable` scrolls matching row into view via `requestAnimationFrame` and applies amber outline highlight; `RiskRegister` custom table implements same pattern with `useRef` + `useEffect` |
| `ModuleTable` | Shared table component accepting `columns`, `rows`, `emptyMsg`, `focusId` — handles scroll/highlight for any focused item |
| `ModuleHeader` | Accepts `syncedAt: Date` and `onRefresh: () => void`; renders relative time (`relativeTime()` helper, 60 s auto-tick) and Refresh button |
| `localStorage` persistence | Three keys: `grc_decision_log` (array of decision records), `grc_workflows` (array of workflow objects), `grc_dismissed_alerts` (set of dismissed alert IDs) |
| Workflow state machine | Draft → Pending → In Review → Approved/Rejected/Deferred; multi-step chains defined in `APPROVAL_CHAINS` constant; each step stores `status`, `actedAt`, and optional `note`; workflows carry `refNo` (WF-YYYYMM-NNN) and optional `externalRef` |
| `downloadCSV` | `Blob` → anchor click pattern; headers and rows passed as arrays; used by Vulnerabilities and Risk Register export buttons |
| `relativeTime(date)` | Computes human-readable relative time from a `Date` object; returns `just now` / `Xm ago` / `Xh ago` / `Xd ago` |

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

---

## AI security architecture

The Phase 4 AI layer (see [AI-GRC-ROADMAP.md](./AI-GRC-ROADMAP.md)) introduces a distinct security boundary between the AI agent layer and the GRC data plane. The following controls apply across all AI-assisted workflows.

### Trust boundary: AI agents ↔ GRC data

```
Claude Agent Layer
        │  MCP protocol (tool calls only)
        ▼
GRC MCP Server  ──► Rate limiter ──► Input validator ──► Supabase (read/write)
        │
        ▼
AUDIT log stream ──► CloudWatch ──► S3 Glacier (3-year retention)
```

All AI agent access to GRC data flows through the MCP server — agents never hold direct Supabase credentials.

### AI security controls

| Concern | Implementation |
|---------|----------------|
| Prompt injection prevention | Input validation and pattern detection at MCP server boundary; blocked attempts logged as `AUDIT` security alerts |
| Sensitive data isolation | Agents receive hashed context or summaries of SecTier 0/1 data — never raw PII; all AI data access logged at `AUDIT` level |
| AI output validation | All AI-generated content validated and scrubbed before rendering in dashboard or writing to Supabase |
| Human-in-the-loop for writes | Write tools require `approved_by` field; AI agents cannot commit data changes without human approval |
| Model version control | Exact model version pinned per agent; version changes logged as `AUDIT` events and reviewed before promotion |
| Rate limiting | Per-tool and per-agent rate limits enforced at MCP server layer; token counts and duration logged per call |
| AI audit trail | Every AI decision produces an `AUDIT` log with `reasoning_summary`, `model_version`, `input_hash`, and `approved_by` — satisfying EU AI Act Art. 12 & 13 |

### AI compliance posture

| Framework | Requirement | Architecture response |
|-----------|------------|----------------------|
| EU AI Act Art. 9 | Risk management system | AI risk tier classification at Gate 0 (PDLC); UCF.AI.06 |
| EU AI Act Art. 12 | Automatic logging | `AUDIT` log on every MCP tool call; 3-year S3 retention |
| EU AI Act Art. 13 | Transparency | `reasoning_summary` and `model_version` in every AI decision log |
| ISO 42001 9.1 | AI monitoring | MCP tool call metrics; model performance monitoring |
| NIST AI RMF | Govern / Map / Measure / Manage | UCF.AI.01–10 controls tracked in GRC dashboard |

For full AI security requirements see [SECURITY.md — AI security strategy](./SECURITY.md) and [LOGGING-STRATEGY.md — AI security logging](./LOGGING-STRATEGY.md).
