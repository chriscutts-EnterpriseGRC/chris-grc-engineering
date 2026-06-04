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

## [0.7.0] — 2026-06-04

### Added

- **Leadership approval workflow engine.** Route any decision through a configurable multi-step approval chain (CISO Only, P0 Escalation, EU AI Act Budget, Legal/DPA, Risk Acceptance, Resource Decision). Workflow state persists to `localStorage` (`grc_workflows` key) and survives page refresh. State machine: Draft → Pending → In Review → Approved/Rejected/Deferred across each chain step.

- **ServiceNow-parity workflow enhancements:**
  - Auto-generated reference numbers (`WF-YYYYMM-NNN`) displayed as monospace badges on every in-flight workflow — suitable for cross-referencing in meetings, email, and audit trails.
  - Inline action notes — clicking Approve/Reject/Defer reveals an optional textarea for reviewer rationale before the action is committed; notes stored per step and shown as a tooltip indicator (`✎`) on the step chain.
  - External ticket cross-reference field in the Route modal — paste a ServiceNow, Jira, or other ticketing system reference (`INC-12345`, `RISK-678`); stored on the workflow object and displayed in violet monospace alongside routing metadata.

- **Decision Log persistence.** Approve/Reject/Defer actions from the Leadership Decisions panel are recorded to `localStorage` (`grc_decision_log`) and survive reload. Decision log displays actor, timestamp, and action with a Clear button.

- **Deep-link navigation.** Every alert, AI insight, and decision item navigates to its exact source row in the relevant module. `ModuleTable` accepts a `focusId` prop; matching rows scroll into view and receive an amber outline highlight via `requestAnimationFrame`. `RiskRegister` (custom table) implements the same pattern with `useRef` + `useEffect`.

- **Alert Tray + Decisions Required Today — two-tile layout.** Overview page renders both tiles side-by-side (equal columns, `lg:grid-cols-2`). All items are actionable buttons; dismiss uses `e.stopPropagation()` to avoid triggering navigation.

- **CSV export.** One-click browser download for:
  - Vulnerabilities: ID, title, CVE, priority, status, SLA due, assignee, environment, control.
  - Risk Register: ID, title, category, inherent/residual scores, appetite, status, owner, review date, AI flag.

- **Live sync status.** Each module (`Vulnerabilities`, `Incidents`, `Policy`, `ThirdParty`, `RiskRegister`, `EvidenceLocker`) tracks a `lastSynced` Date in state. `ModuleHeader` shows relative time (`just now`, `5m ago`, `2h ago`) via `relativeTime()` helper, auto-ticking on a 60 s interval. A Refresh button calls `setLastSynced(new Date())`.

- **Predictive SLA breach alerts.** Vulnerabilities with SLA due within 48 hours surface in the Alert Tray and deep-link to the specific row.

- **Business Impact Bands.** Risk Register rows display a colour-coded business impact band alongside inherent/residual scores.

- **AI Copilot.** Contextual AI insights surfaced on Overview, Risk Register, and Compliance modules — each with a navigate-and-focus action.

- **Incident auto-triage.** Incidents panel includes AI-assisted severity classification for new or unclassified incidents.

- **AI-assisted policy draft generation.** Policy module exposes a "Draft with AI" action for overdue or missing policies.

- **Gap Analyser.** Compliance module includes a per-framework gap analysis view.

- **Risk Narrative.** Scorecard AI narrative summarises program risk posture in plain language for leadership briefings.

### Changed

- **`ModuleHeader`** — extended with `syncedAt: Date` and `onRefresh: () => void` props; renders relative time and Refresh button when provided.
- **`ModuleTable`** — extended with `focusId` prop; matching row scrolls into view and receives amber outline highlight.
- **`handleNavClick`** — extended to `(page, itemId?)` signature; stores `focusId` in root state; threads to all five section components.
- **`AlertTray`** — rewritten from `<div>` list to `<button>` rows with `navigate` prop; amber header; always expanded on Overview.
- **Overview layout** — Decisions Required Today and Alert Tray rendered as equal side-by-side tiles.

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
