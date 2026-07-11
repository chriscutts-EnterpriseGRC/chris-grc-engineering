# GRC Engineering Portfolio

A production-grade Governance, Risk, and Compliance engineering portfolio — built to demonstrate how GRC is practised as an engineering discipline: automated, measurable, and traceable from policy to control to risk register.

---

## What's in this repo

| Folder | What it contains |
|---|---|
| `dashboard/` | React 19 + Tailwind risk and compliance monitoring dashboard |
| `docs/` | Policy library, risk methodology, ATT&CK coverage map, Jira build guide |
| `plugins/` | Autonomous agents: risk-agent, connectors (14 tools), framework assessors (30+ frameworks), trust center |
| `schemas/` | JSON schemas for risks, findings, policies, metrics, vendors, exceptions |
| `supabase/` | PostgreSQL schema and seed data |
| `tests/` | Fixture data for all connectors and schemas |
| `case-study/` | End-to-end implementation case study |

---

## Start here

### Risk methodology

The risk scoring model follows **ISO 27005:2022** and **ISO 31000:2018**.

- **Inherent risk** = Likelihood × Impact (5×5 matrix, 1–25)
- **Residual risk** = Inherent × (1 − 0.5 × control effectiveness)
- **Risk appetite thresholds**: Within (1–11) · Approaches (12–19) · Exceeds (20–24) · Significantly Exceeds (25)

Full methodology: [`docs/RISK-METHODOLOGY.md`](docs/RISK-METHODOLOGY.md)  
Risk management framework: [`docs/Risk-Management-Framework.md`](docs/Risk-Management-Framework.md)

### Policy library

13 security policies mapped to MITRE ATT&CK Enterprise v14. Each policy covers specific tactics and techniques — the coverage map shows which techniques remain ungoverned.

Key policies:
- [`docs/INFORMATION-SECURITY-POLICY.md`](docs/INFORMATION-SECURITY-POLICY.md) — master policy
- [`docs/ACCESS-CONTROL-IAM-POLICY.md`](docs/ACCESS-CONTROL-IAM-POLICY.md)
- [`docs/SECURITY-MONITORING-POLICY.md`](docs/SECURITY-MONITORING-POLICY.md)
- [`docs/INCIDENT-RESPONSE-POLICY.md`](docs/INCIDENT-RESPONSE-POLICY.md)
- [`docs/DATA-CLASSIFICATION-POLICY.md`](docs/DATA-CLASSIFICATION-POLICY.md)

Full list: all 13 policies in [`docs/`](docs/)

### ATT&CK coverage

Policies mapped to 80 techniques across all 14 enterprise tactics. Two full coverage gaps (Reconnaissance, Resource Development) with recommended closures documented.

- Coverage map: [`docs/ATTACK-COVERAGE.md`](docs/ATTACK-COVERAGE.md)
- Navigator layer: [`docs/attack-coverage-layer.json`](docs/attack-coverage-layer.json) — load directly into [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/)

### Jira risk project

Step-by-step build guide for a company-managed Jira project: 3 issue types, 26 custom fields, ISO 27005 threat fields, workflow with Pending Validation state, 12 JQL filters, dashboard, and 7 automation rules. Includes Notion risk register migration steps.

- Field configuration: [`docs/JIRA-RISK-PROJECT-SETUP.md`](docs/JIRA-RISK-PROJECT-SETUP.md)
- Build guide: [`docs/JIRA-BUILD-GUIDE.md`](docs/JIRA-BUILD-GUIDE.md)

### Policy hierarchy

Maps the OSI 7-layer policy model to actual repo artefacts — from physical layer access controls through to GRC as the translator (Layer 8). Includes 5 derivation chains and a gap register.

- [`docs/POLICY-HIERARCHY.md`](docs/POLICY-HIERARCHY.md)

---

## Dashboard

React monitoring dashboard — runs on demo data out of the box, connects to Supabase and live integrations when credentials are added.

```bash
cd dashboard
npm install
npm start
# Opens at http://localhost:3000
```

| Module | What it tracks | Control layer |
|---|---|---|
| **Overview** | Resilience Score (0–100), Alert Tray, Decisions Required Today, AI control gaps, top risks — all items deep-link to the exact row they reference | Cross-module |
| **Risk Register** | Inherent/residual scoring (likelihood × impact), business impact bands, risk appetite, treatment plans, AI-flagged risks — CSV export | Cross-module |
| **Vulnerabilities** | CVE register, VSRM priority bands (P0–P4), CVSS scores, SLA tracking, AI/LLM vulns, predictive SLA breach alerts — CSV export | UCF.03.02 Patch Mgmt, UCF.AI.03 AI Security |
| **Incidents** | Active incidents, MTTR, AI data leaks, auto-triage severity classification | UCF.04.01 IR Plan, UCF.AI.05 AI IR |
| **Policy** | Policy library, overdue reviews, missing AI policies, AI-assisted policy draft generation, live document links | UCF.07.01 Policy Review, UCF.AI.01–02 |
| **Third Party** | Vendor risk scores, contracts, AI vendor gaps, DPA tracking | UCF.06.01 TP Assessment, UCF.AI.04 |
| **Control Alignment** | 25 UCF controls cross-mapped to all frameworks, gap analyser | SOC 2, ISO 27001, NIST, GDPR, PCI DSS, EU AI Act |
| **Compliance** | Framework progress including EU AI Act & ISO 42001, gap analysis per framework | Per-framework progress |
| **Audit Management** | Active audits, readiness scores, scope and timeline tracking | All frameworks |
| **Evidence Locker** | Control evidence register, expiry tracking, upload history, live sync status | Linked to UCF controls |
| **Scorecard** | Per-team health scores, gamification, leaderboard, AI risk narrative summary | Leadership visibility |
| **Leadership Decisions** | Real-time decisions requiring CISO/Board sign-off, approval workflow engine with multi-step chains, decision log (persisted), ServiceNow-compatible ticket ref numbers and action notes | CISO / Board |
| **Monthly Report** | Per-leader monthly GRC report, filterable by team | Director / VP views |
| **Architecture** | Signal pipeline, domain reviewers, integrations, live status per stage | Operational |

**Key capabilities:**
- **Deep-link navigation** — every alert, decision, and AI insight links directly to its source row
- **Approval workflow engine** — configurable multi-step chains with auto-generated reference numbers, action notes, and optional ServiceNow/Jira cross-reference
- **CSV export** — one-click export for Risk Register and Vulnerabilities
- **localStorage persistence** — decision log, workflow state, and dismissed alerts survive page refresh

Integrations: Jira · Qualys · Splunk · Notion · ServiceNow · AWS Security Hub · Vanta

Full dashboard docs: [`dashboard/README.md`](dashboard/README.md)

---

## Plugins

### Risk agent (`plugins/risk-agent/`)

Autonomous agent that assesses findings from connectors, scores inherent and residual risk, and writes structured records to Supabase.

Commands: `/assess-risk` · `/score-risk` · `/triage-risks` · `/generate-report` · `/write-description`

### Connectors (`plugins/connectors/`)

14 security tool connectors: AWS Inspector · Azure · CrowdStrike · Datadog · Drata · GCP · GitHub · Okta · POAM Automation · Slack · Snowflake · Splunk · Tenable · TestSSL · Wiz

Each connector exposes `/collect`, `/setup`, and `/status` commands.

### Framework assessors (`plugins/frameworks/`)

30+ compliance frameworks including: SOC 2 · ISO 27001 · NIST CSF 2.0 · NIST 800-53 · PCI DSS · GDPR · HIPAA · FedRAMP · CMMC · DORA · EU AI Act · ISO 42001 · CIS Controls · HITRUST · and more.

### Trust center (`plugins/trust-center/`)

Deployable customer-facing trust portal with admin dashboard, policy document hosting, and AWS Lambda backend.

---

## Schemas

JSON Schema definitions for the core data model:

| Schema | Purpose |
|---|---|
| `schemas/risk.schema.json` | Risk register records |
| `schemas/finding.schema.json` | Connector findings |
| `schemas/policy.schema.json` | Policy documents |
| `schemas/metric.schema.json` | GRC metrics |
| `schemas/vendor.schema.json` | Third-party risk records |
| `schemas/exception.schema.json` | Risk exceptions and acceptances |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS v3, Recharts, Lucide icons |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Integrations | Node.js adapters, one file per source system |
| Auth (planned) | Supabase Auth / Okta SSO |
| Deployment (planned) | Vercel / Netlify / internal nginx |
| Risk methodology | ISO 27005:2022, ISO 31000:2018 |
| Threat coverage | MITRE ATT&CK Enterprise v14 |
| Control framework | Unified Compliance Framework (UCF) |

---

## UCF Controls

All 25 controls follow the **Unified Compliance Framework** model — one control ID maps to multiple regulatory frameworks simultaneously. A single remediation effort satisfies requirements across SOC 2, ISO 27001, NIST, GDPR, PCI DSS 4.0, EU AI Act, and OWASP LLM Top 10 at once.

Core controls (UCF.01–09) cover access, data protection, vulnerability management, incident response, network security, vendor management, policy, detection, and BCM.

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
- **Before connecting real data:** tighten the `anon_read` RLS policy and add an auth layer — the current open policy is suitable for demo only
- For production: store the service role key in a secrets manager (AWS Secrets Manager, HashiCorp Vault) rather than a plain `.env` file

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

## Related work

| Repository | Role |
|---|---|
| [circleci-aws-opa-lab](https://github.com/9snxz8htcw-netizen/circleci-aws-opa-lab) | Preventive control layer — OPA/Rego policies enforce encryption, versioning, access, and tagging on IaC before deployment |

---

## Next steps

**Production hardening (P0 before connecting real data)**
- [ ] Tighten RLS — restrict `anon_read` policy so unauthenticated users cannot read security data
- [ ] Add authentication — Supabase Auth or Okta SSO
- [ ] Provision Supabase and run migrations — see [QUICKSTART.md](docs/QUICKSTART.md)

**Docker integration (see [DOCKER-INTEGRATION-ROADMAP.md](docs/DOCKER-INTEGRATION-ROADMAP.md))**
- [ ] Phase 2 — Docker Scout image scanning on every ECR push
- [ ] Phase 3 — Registry compliance scoring, deployment block for non-compliant images
- [ ] Phase 4 — Snyk runtime scanning, Falco behavioral monitoring

**Vulnerability program (see [VULNERABILITY-MANAGEMENT-PROGRAM.md](docs/VULNERABILITY-MANAGEMENT-PROGRAM.md))**
- [ ] Improve UCF.03.02 Patch Management (currently 41% — primary program gap)
- [ ] Add Docker Scout credentials to activate container scanning track
- [ ] Resolve EOL asset risks (Node.js 16, Python 3.8 in ML pipeline)

---

## License

MIT — see [LICENSE](LICENSE).
