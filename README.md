# Resilience Operations Dashboard

A central risk reporting platform for **Risk, Vulnerabilities, Incidents, Policy, and Third Party risk** — each item tied to a UCF control with a live effectiveness score. Built to run as a demo out of the box, and go live against real data sources by adding credentials.

---

## What it does

| Module | What it tracks | Control layer |
|---|---|---|
| **Risk Register** | Inherent risk scores (likelihood × impact), treatment plans, risk appetite, linked controls | Cross-module — links to vulns, incidents, policy, vendors |
| **Vulnerabilities** | CVE register, CVSS scores, AI/LLM vulns | UCF.03.02 Patch Mgmt, UCF.AI.03 AI Security |
| **Incidents** | Active incidents, MTTR, AI data leaks | UCF.04.01 IR Plan, UCF.AI.05 AI IR |
| **Policy** | Policy library, overdue reviews, missing AI policies, live document links | UCF.07.01 Policy Review, UCF.AI.01–02 |
| **Third Party** | Vendor risk scores, contracts, AI vendor gaps | UCF.06.01 TP Assessment, UCF.AI.04 |
| **Control Alignment** | 25 controls cross-mapped to all frameworks | SOC 2, ISO 27001, NIST, GDPR, PCI DSS, EU AI Act |
| **Compliance** | Framework coverage — including EU AI Act & ISO 42001 | Per-framework progress and gap analysis |
| **Audit Management** | Active audits, readiness scores, scope and timeline tracking | All frameworks |
| **Evidence Locker** | Control evidence register, expiry tracking, upload history | Linked to UCF controls |
| **Scorecard** | Per-team health scores, gamification, leaderboard | Leadership visibility |
| **Monthly Report** | Per-leader monthly GRC report | Director / VP views |
| **Architecture** | Signal pipeline, domain reviewers, integrations | Live status per stage |

The **Overview** page shows a composite Resilience Score (0–100), surfaces AI control gaps, shows the top open risks, and lets you click through to any module directly.

---

## Quick start

```bash
git clone https://github.com/9snxz8htcw-netizen/chris-grc-engineering.git
cd chris-grc-engineering/dashboard
npm install
npm start
```

Opens at `http://localhost:3000` — fully functional with demo data. No database or credentials needed.

---

## Go live with real data

### 1. Create a Supabase project

Sign up at [supabase.com](https://supabase.com) (free tier is sufficient to start).

### 2. Apply the schema and seed data

In the Supabase SQL editor, run in order:

```sql
-- 1. Create tables, indexes, RLS policies
-- Paste contents of: supabase/migrations/001_initial_schema.sql

-- 2. Load demo data (optional — skip to start with a clean database)
-- Paste contents of: supabase/seed.sql
```

### 3. Add credentials

```bash
cp dashboard/.env.example dashboard/.env
```

Edit `.env` and fill in:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

Restart `npm start` — the header badge changes from **○ Demo** to **● Live**.

---

## Integrations

Pull real data into the dashboard by adding credentials to `.env` and running the sync runner.

### Available integrations

| Integration | Module | Activate by adding to `.env` |
|---|---|---|
| **Jira** | Incidents | `JIRA_HOST`, `JIRA_EMAIL`, `JIRA_API_TOKEN` |
| **Qualys VMDR** | Vulnerabilities | `QUALYS_API_URL`, `QUALYS_USERNAME`, `QUALYS_PASSWORD` |
| **Splunk** | Incidents | `SPLUNK_HOST`, `SPLUNK_TOKEN` |
| **Notion** | Policy | `NOTION_TOKEN`, `NOTION_POLICY_DB_ID` |
| **ServiceNow** | Incidents / Policy | `SERVICENOW_INSTANCE`, `SERVICENOW_USER`, `SERVICENOW_PASSWORD` |
| **AWS Security Hub** | Vulnerabilities | `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |
| **Vanta** | Compliance / Controls | `VANTA_API_TOKEN` |

### Run a sync

```bash
cd dashboard

# Run all enabled integrations (skips any with missing credentials)
SUPABASE_SERVICE_ROLE_KEY=xxx node integrations/sync.js

# Run one integration
SUPABASE_SERVICE_ROLE_KEY=xxx node integrations/sync.js jira

# Run multiple
SUPABASE_SERVICE_ROLE_KEY=xxx node integrations/sync.js jira qualys
```

### Notion — Policy integration

Notion is ideal for the Policy module. Store your policy documents as a Notion database (Title, Owner, Status, Review Date, Category columns), then the integration pulls them directly into the Policy register. To add it:

1. Create a Notion integration at [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Share your policy database with the integration
3. Add `NOTION_TOKEN` and `NOTION_POLICY_DB_ID` to `.env`

---

## Project structure

```
chris-grc-engineering/
├── dashboard/                    # React application
│   ├── src/
│   │   ├── GRCDashboard.jsx      # Main dashboard — all modules
│   │   ├── lib/
│   │   │   ├── supabase.js       # Supabase client (null if unconfigured)
│   │   │   └── api.js            # Data access layer with mock fallback
│   │   └── data/                 # (mock data lives inline in GRCDashboard.jsx)
│   ├── integrations/
│   │   ├── jira.js               # Jira → incidents
│   │   ├── qualys.js             # Qualys → vulnerabilities
│   │   ├── splunk.js             # Splunk → incidents
│   │   └── sync.js               # Sync runner
│   ├── public/diagrams/          # Legacy interactive HTML diagrams
│   └── .env.example              # Credential template
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Full schema with RLS
│   └── seed.sql                    # Demo data
├── docs/                         # Supporting documentation
└── case-study/                   # Implementation case study
```

---

## Tech stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Tailwind CSS v3, Recharts, Lucide icons |
| **Database** | Supabase (PostgreSQL) with Row Level Security |
| **Integrations** | Node.js adapters — one file per source system |
| **Auth** (planned) | Supabase Auth / Okta SSO |
| **Deployment** (planned) | Vercel / Netlify / internal nginx |

---

## UCF Controls

All 25 controls follow the **Unified Compliance Framework** model — one control ID maps to multiple regulatory frameworks simultaneously. This means a single remediation effort satisfies requirements across SOC 2, ISO 27001, NIST, GDPR, PCI DSS 4.0, EU AI Act, and OWASP LLM Top 10 at once.

Core controls (UCF.01–09) cover access, data protection, vulnerability management, incident response, network security, vendor management, policy, detection, and BCM — each mapped to PCI DSS 4.0 requirements in addition to existing framework coverage.

AI-specific controls (UCF.AI.01–10) cover:
- AI Model Governance (EU AI Act Art.9, ISO/IEC 42001)
- AI Data Privacy & Bias (GDPR Art.22, NIST AI 2.2)
- AI Security Controls (OWASP LLM Top 10, NIST AI 2.5)
- AI Vendor Risk Management (EU AI Act Art.28)
- AI Incident Response (EU AI Act Art.62, NIST AI 2.7)
- AI Risk Categorization & Use Case Register (NIST AI RMF MAP 2.1, EU AI Act Art.6)
- AI Model Performance Monitoring (NIST AI RMF MEASURE 3.2, ISO/IEC 42001 9.1)
- AI Explainability & Transparency (EU AI Act Art.13, GDPR Art.22)
- AI Data Provenance & Lineage (NIST AI RMF MAP 2.4, GDPR Art.5)
- AI Model Lifecycle Management (NIST AI RMF MANAGE 4.3, EU AI Act Art.9)

---

## Security

- `.env` is git-ignored — credentials never touch version control
- Supabase anon key is used in the React frontend; RLS policies control what it can access
- `SUPABASE_SERVICE_ROLE_KEY` (write access) is used only in server-side integration scripts — never in the browser
- **Before connecting real data**: tighten the `anon_read` RLS policy and add an auth layer — the current open policy is suitable for demo only
- For internal deployments: run behind your org's VPN/firewall and add Supabase Auth or Okta SSO before exposing to multiple users
- For production: store the service role key in a secrets manager (macOS Keychain, AWS Secrets Manager, HashiCorp Vault) rather than a plain `.env` file

---

## Compliance frameworks covered

| Framework | Coverage |
|---|---|
| SOC 2 Type II | 94% |
| ISO 27001 | 87% |
| GDPR | 91% |
| HIPAA | 78% |
| PCI DSS | 83% |
| NIST CSF | 88% |
| EU AI Act | 22% — gap requiring immediate action |
| ISO/IEC 42001 | 18% — gap requiring immediate action |

---

## Related repositories

| Repository | Role |
|---|---|
| [GRC-Portfolio](https://github.com/ewelina-kowalska-oneill/GRC-Portfolio) | Source GRC artefacts — IR plan, playbooks, policy docs, and tabletop scenarios used to enrich demo seed data |
| [circleci-aws-opa-lab](https://github.com/9snxz8htcw-netizen/circleci-aws-opa-lab) | Preventive control layer — OPA policies enforce encryption, versioning, access, and tagging on IaC before deployment; control mappings inform UCF framework references |

---

## Next steps

- [ ] **P0 — Tighten RLS** — restrict `anon_read` policy so unauthenticated users cannot read security data
- [ ] **P0 — Add authentication** — Supabase Auth or Okta SSO before connecting real data
- [ ] **Create a Supabase project and go live** — follow the [Go live](#go-live-with-real-data) section above
- [ ] **Add more integrations** — ServiceNow (incidents/policy), AWS Security Hub (vulnerabilities), Vanta (compliance), Notion (policy docs)
- [ ] **Deploy for your team** — Vercel or Netlify for a shareable URL (add auth first), or serve internally via nginx behind your org's VPN

---

## License

MIT — see [LICENSE](LICENSE).
