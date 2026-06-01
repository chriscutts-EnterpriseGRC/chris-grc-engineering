# Quick Start

## Run the dashboard (demo mode - no credentials needed)

```bash
git clone https://github.com/9snxz8htcw-netizen/chris-grc-engineering
cd chris-grc-engineering/dashboard
npm install
npm start
```

Open `http://localhost:3000`. The dashboard runs on inline demo data automatically when no Supabase credentials are set.

---

## Connect live data (optional)

**1. Provision Supabase**

Create a free project at [supabase.com](https://supabase.com), then apply the schema:

```bash
# Option A - Supabase CLI
supabase db push

# Option B - paste into Supabase SQL editor
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_risks_table.sql
```

Seed demo data:
```bash
# Paste supabase/seed.sql into the SQL editor, or:
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node plugins/risk-agent/scripts/seed-risks.js
```

**2. Set environment variables**

```bash
cp dashboard/.env.example dashboard/.env
# Fill in REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
```

The header badge switches from **○ Demo** to **● Live** automatically.

**3. Enable integrations (optional)**

Add credentials to `.env` for any integration - the adapter is skipped if credentials are absent:

| Adapter | Env vars | Target |
|---------|----------|--------|
| `jira.js` | `JIRA_HOST`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY` | incidents |
| `qualys.js` | `QUALYS_API_URL`, `QUALYS_USERNAME`, `QUALYS_PASSWORD` | vulnerabilities |
| `splunk.js` | `SPLUNK_HOST`, `SPLUNK_TOKEN` | incidents |
| `aws-security-hub.js` | `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | vulnerabilities |
| `servicenow.js` | `SERVICENOW_INSTANCE`, `SERVICENOW_USER`, `SERVICENOW_PASSWORD` | incidents / policy |
| `notion.js` | `NOTION_TOKEN`, `NOTION_POLICY_DB_ID` | policy |
| `vanta.js` | `VANTA_API_TOKEN` | compliance / controls |

Run all enabled adapters:
```bash
cd dashboard && node integrations/sync.js
```

---

## Project structure

```
chris-grc-engineering/
├── README.md
├── dashboard/
│   ├── src/
│   │   ├── GRCDashboard.jsx        # All dashboard modules
│   │   └── lib/
│   │       ├── supabase.js         # Supabase client (null if unconfigured → demo mode)
│   │       └── api.js              # Data layer with per-table mock fallback
│   ├── integrations/               # Node.js adapters - each is self-contained
│   │   ├── jira.js
│   │   ├── qualys.js
│   │   ├── splunk.js
│   │   ├── aws-security-hub.js
│   │   ├── servicenow.js
│   │   ├── notion.js
│   │   ├── vanta.js
│   │   └── sync.js                 # Runs all enabled adapters
│   └── .env.example
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql  # controls, vulns, incidents, policies, vendors
│   │   └── 002_risks_table.sql     # risks table (risk.schema.json v1)
│   └── seed.sql
├── docs/
│   ├── ARCHITECTURE.md
│   ├── METHODOLOGY.md
│   ├── RISK-METHODOLOGY.md         # Scoring model, bands, SLAs, approval authority
│   ├── Risk-Management-Framework.docx
│   ├── METRICS.md
│   ├── QUICKSTART.md               # This file
│   └── FAQ.md
├── plugins/
│   ├── connectors/                 # 16 tool connectors (AWS, GCP, Okta, Wiz, etc.)
│   ├── frameworks/                 # 33 compliance framework plugins
│   │   ├── soc2/  iso27001/  gdpr/  nist-800-53/  nist-csf-20/
│   │   ├── nist-ai-rmf/  eu-ai-act/  iso42001/
│   │   └── pci-dss/  us-hipaa-security/  cmmc/  ... (25 more)
│   ├── risk-agent/                 # Risk assessment + Supabase integration
│   ├── grc-tprm/                   # Third-party risk management
│   ├── grc-reporter/               # Report generation
│   ├── oscal/                      # OSCAL SSP export
│   └── trust-center/               # Public-facing trust portal
├── schemas/                        # JSON schemas (risk, finding, vendor, policy, etc.)
└── tests/fixtures/                 # Test data aligned to schemas
```

---

## Dashboard modules

| Module | Purpose |
|--------|---------|
| Overview | Resilience score, all control gaps by category, open risk snapshot |
| Risk Register | 5×5 heat matrix, inherent/residual scoring, SLA tracking, workflow states |
| Vulnerabilities | CVE register, CVSS scores, AI/LLM vulns, control linkage |
| Incidents | Active incidents, MTTR, AI data leaks, IR control effectiveness |
| Policy | Policy library, overdue reviews, missing AI policies |
| Third Party | Vendor risk scores, contract expiry, AI vendor gaps |
| Control Alignment | UCF crosswalk across 8 frameworks, OSCAL export |
| Compliance | Framework progress - SOC 2, ISO 27001, NIST, GDPR, EU AI Act, ISO 42001 |
| Audit Management | Audit schedule, readiness scores, findings tracking |
| Evidence Locker | Control evidence, expiry tracking, upload history |
| Scorecard | Per-team health %, gamification levels, leaderboard, badges |
| Monthly Report | Per-leader report - filtered controls, issues, risks, actions |
| Architecture | Signal pipeline, integrations, domain reviewer status |

---

## Key documents

- [ARCHITECTURE.md](ARCHITECTURE.md) - system design and data flow
- [RISK-METHODOLOGY.md](RISK-METHODOLOGY.md) - scoring model, bands, SLAs, approval authority
- [METHODOLOGY.md](METHODOLOGY.md) - GRC engineering approach and health score
- [METRICS.md](METRICS.md) - KPIs, KRIs, and targets
- [DOCKER-INTEGRATION-ROADMAP.md](DOCKER-INTEGRATION-ROADMAP.md) - Docker Scout, Build Cloud, Registry, runtime scanning roadmap
- [THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md](THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md) - STRIDE threat model for the container supply chain
- [FAQ.md](FAQ.md) - common questions
- [../deployment/AWS_DEPLOYMENT.md](../deployment/AWS_DEPLOYMENT.md) - AWS infrastructure (RDS, ECS, Lambda)
