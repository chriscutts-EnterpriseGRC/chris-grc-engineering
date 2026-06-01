# Changelog

All notable changes follow the format from [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **Vanta, ServiceNow, AWS Security Hub, Notion integration adapters.** Four new Node.js adapters completing the full integration layer. AWS Security Hub uses native AWS Signature V4 signing with no SDK dependency. Vanta updates `controls.effectiveness` and `controls.score` in place. ServiceNow pulls both `sn_si_incident` → incidents and `kb_knowledge` → policies in a single sync. Notion handles cursor-based pagination and stores page URLs as `document_url`. All four registered in `sync.js`. Closes the gap between the integrations listed in the README and those actually implemented.

- **`docs/SECURITY.md`** — security policy, known open items, and secure usage guidance for this project.

- **`docs/CHANGELOG.md`** — this file.

- **`docs/CONTRIBUTING.md`** — contribution guide covering integration adapters, seed data, and UCF controls.

### Changed

- **`sync.js`** — fixed `JIRA_PROJECT_KEY` as a required variable (was missing, causing silent Jira sync failures).

---

## [0.5.0] — 2026-06-01

### Added

- **Full integration layer.** Jira, Qualys, and Splunk adapters shipped. Notion, ServiceNow, AWS Security Hub, and Vanta adapters added in the same release cycle.

---

## [0.4.0] — 2026-05-31

### Added

- **Enriched seed data.** `supabase/seed.sql` rebuilt with content from [GRC-Portfolio](https://github.com/ewelina-kowalska-oneill/GRC-Portfolio) and OPA control mappings from [circleci-aws-opa-lab](https://github.com/9snxz8htcw-netizen/circleci-aws-opa-lab). Additions: 2 new vulnerabilities, 3 new incidents (drawn from tabletop scenarios), 2 new policies with live `document_url` links, PCI DSS 4.0 framework references across 10 controls.

### Changed

- **Controls** — PCI DSS 4.0 added to 10 core controls; OPA lab framework mappings confirmed (AC-3 on UCF.05.01, CP-9 on UCF.09.01, CM-8 on UCF.08.02).
- **Policies** — `ON CONFLICT` clause updated to sync `document_url` and `frameworks` on re-run.

---

## [0.3.0] — 2026-05-31

### Changed

- **All docs updated** to reflect actual tech stack (React 19 + Supabase + Node.js — not Python/FastAPI/Redis/Kubernetes).
- **README** — control count corrected (20 → 25); Risk Register and all missing modules added to "What it does" table; Related Repositories section added; RLS/auth promoted to P0 in Next Steps.
- **`docs/ARCHITECTURE.md`** — complete rewrite; documents demo vs live mode, data flow, OPA preventive control layer.
- **`case-study/CASE_STUDY.md`** — Technology Stack corrected; roadmap reflects actual planned work.
- **`docs/QUICKSTART.md`** — project structure tree updated to match actual repo layout.
- **`docs/FAQ.md`** — system requirements corrected (Node.js 18+ / Supabase).

---

## [0.2.0] — 2026-05-30

### Added

- **25 UCF controls** — 15 core + 10 AI-specific (UCF.AI.01–10) covering EU AI Act, ISO/IEC 42001, NIST AI RMF.
- **Risk Register** — 12 risks with likelihood × impact scoring, residual risk calculation via control effectiveness, risk appetite thresholds.
- **Audit Management** — 5 audits with readiness scores and finding tracking.
- **Evidence Locker** — 10 evidence items with expiry tracking.
- **Leadership Scorecard** — per-team health scores, Bronze/Silver/Gold/Platinum tiers, leaderboard, monthly reports.

---

## [0.1.0] — 2026-05-29

### Added

- Initial dashboard — Overview, Vulnerabilities, Incidents, Policy, Third Party, Compliance, Architecture modules.
- Supabase schema (`001_initial_schema.sql`) with RLS, indexes, and `updated_at` trigger.
- Demo seed data (`seed.sql`).
- React 19 frontend with Tailwind CSS v3, Recharts, Lucide icons.
- `lib/supabase.js` demo/live detection; `lib/api.js` mock fallback pattern.
