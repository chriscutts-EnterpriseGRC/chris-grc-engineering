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

Modules: Risk Register · Vulnerabilities · Incidents · Policy · Third Party · Compliance · Audit Management · Evidence Locker · Scorecard

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

## Related work

| Repository | Role |
|---|---|
| [circleci-aws-opa-lab](https://github.com/9snxz8htcw-netizen/circleci-aws-opa-lab) | Preventive control layer — OPA/Rego policies enforce encryption, versioning, access, and tagging on IaC before deployment |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS v3, Recharts, Lucide icons |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Integrations | Node.js adapters, one file per source system |
| Risk methodology | ISO 27005:2022, ISO 31000:2018 |
| Threat coverage | MITRE ATT&CK Enterprise v14 |
| Control framework | Unified Compliance Framework (UCF) |

---

## License

MIT — see [LICENSE](LICENSE).
