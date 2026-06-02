# AI-Assisted GRC Roadmap

**Program:** Resilience Ops GRC Platform  
**Owner:** Security Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal — Strategic  
**Phase:** 4 (post-SBOM continuous monitoring)  
**Related:** [DOCKER-INTEGRATION-ROADMAP.md](./DOCKER-INTEGRATION-ROADMAP.md) · [SDLC-SECURITY-GUARDRAILS.md](./SDLC-SECURITY-GUARDRAILS.md)

---

## Vision: AI-Native GRC

Phases 1–3 build the data foundation: a live, instrumented GRC platform with vulnerability tracking, control scoring, compliance coverage, and a Docker supply chain pipeline. Phase 4 puts an AI layer on top of that data — not as a chatbot, but as a set of purpose-built agents that do the routine cognitive work: triaging findings, drafting treatment plans, monitoring SLA clocks, generating reports, and surfacing the right decision at the right time.

The goal is not to replace the security team. It is to eliminate the gap between **data existing in the platform** and **a human acting on it** — a gap that today costs days and is where most program failures actually happen.

---

## Architecture: MCP + Supabase

**Model Context Protocol (MCP)** is Anthropic's open standard for connecting AI models to live tools and data sources. It allows a Claude agent to call defined tools — read from Supabase, write findings, trigger workflows — with the same reliability as a human using the dashboard.

```
┌─────────────────────────────────────────────────────┐
│                  GRC MCP Server                     │
│                                                     │
│  Tools exposed:                                     │
│  ├── get_open_vulnerabilities(priority, limit)      │
│  ├── score_vulnerability_vsrm(cvss, env, exposure,  │
│  │       exploitability) → P0–P4                    │
│  ├── create_risk(title, category, score, owner)     │
│  ├── update_vulnerability(id, status, notes)        │
│  ├── get_control(control_id) → effectiveness, score │
│  ├── get_framework_coverage(framework)              │
│  ├── list_sla_breaches() → overdue findings         │
│  ├── get_team_health(team_id) → score, gaps, trend  │
│  ├── export_oscal_ssp() → NIST OSCAL JSON           │
│  └── create_finding_comment(id, text)               │
│                                                     │
│  Resources exposed:                                 │
│  ├── supabase://vulnerabilities                     │
│  ├── supabase://risks                               │
│  ├── supabase://controls                            │
│  ├── supabase://frameworks                          │
│  └── supabase://incidents                           │
└───────────────────┬─────────────────────────────────┘
                    │ MCP protocol
        ┌───────────▼───────────┐
        │   Claude Agent Layer  │
        │  (Anthropic API)      │
        └───────────┬───────────┘
                    │
     ┌──────────────┼──────────────┐
     ▼              ▼              ▼
 Scheduled      Event-driven    On-demand
 agents         agents          agents
```

---

## Workflow 1: VSRM Auto-Triage

**Trigger:** New CVE ingested from scanner (Scout, Trivy, Grype, AWS Inspector)  
**Agent:** Reads CVE metadata → calls `score_vulnerability_vsrm()` → creates prioritized finding → assigns to owner based on asset map → sets SLA due date automatically

**What it replaces:** Manual triage queue. Today a security engineer reads each finding, looks up the asset tier, decides priority, assigns it. This takes 15–30 minutes per finding at scale.

**Output:**
```
Finding V-012 auto-created:
  Priority: P1 (Production + Public + CVSS 8.1 + Mature Exploit)
  Asset: auth-service (SecTier 0)
  Assigned to: T. Williams
  SLA due: 2026-06-16
  Comment: "Auto-triaged via VSRM. Exploitability confirmed via NVD KEV lookup.
             UCF.03.02 (Vulnerability Scanning) control effectiveness: Partial (55%)."
```

**Audit trail:** Every auto-triage decision is logged with the reasoning, data inputs, and agent version. Reviewable in the finding comment thread.

---

## Workflow 2: Risk Treatment Plan Drafter

**Trigger:** New P0 or P1 finding opens, or risk status changes to "Open"  
**Agent:** Reads finding context → queries similar past risks and their treatments → reads linked control effectiveness → drafts a treatment plan in plain English

**What it replaces:** Security engineer writing treatment plans from scratch. Typically 30–60 minutes per plan.

**Output:**
```
Draft treatment plan for RSK-012 (Log4Shell RCE · CVE-2024-1234):

Recommended treatment: Mitigate
Timeline: 1 day (P0 SLA)

Steps:
1. Identify all services using log4j-core — query SBOM for component match
2. Patch log4j-core to 2.17.1+ or remove JndiLookup class via classpath
3. Apply WAF rule to block ${jndi: patterns as immediate compensating control
4. Re-scan with Trivy post-patch to confirm remediation
5. Update UCF.03.02 effectiveness score once patch verified

Similar past treatment: RSK-003 (Spring4Shell, 2026-03-14) — patched in 18h.
Owner suggestion: T. Williams (Infrastructure Security, owns UCF.03.02)
```

---

## Workflow 3: SLA Breach Monitor + Escalation Drafter

**Trigger:** Scheduled — runs every 6 hours  
**Agent:** Calls `list_sla_breaches()` → for each breach, checks if escalation has been sent → drafts Slack/email escalation with full context → flags for human approval before sending

**What it replaces:** Manual SLA tracking. Today SLA breaches surface in the dashboard but someone has to notice them and draft the escalation message.

**Output:**
```
[DRAFT — pending human approval before send]

To: T. Williams (Engineering Lead)
CC: Security Lead
Subject: P0 SLA Breach — V-001 Log4Shell · 22 days overdue

V-001 (Log4Shell RCE, CVE-2024-1234) has breached its 1-day P0 SLA by 22 days.
Asset: prod-api-01 (SecTier 0, Public-facing)
CISA KEV: Yes

Required action: Patch or declare formal incident within 24 hours.
Extension policy: P0 extensions are not permitted — escalate to CISO.

This finding has been escalated to the risk register as RSK-XXX.
```

---

## Workflow 4: OSCAL Continuous Export

**Trigger:** Scheduled — runs on every control effectiveness score change  
**Agent:** Calls `export_oscal_ssp()` → commits updated OSCAL SSP JSON to `/evidence/oscal/` in the repo → creates a GitHub release tag for auditor access

**What it replaces:** Manual OSCAL export button. Today someone has to remember to export before an audit submission.

**Value for auditors:** A continuously maintained, version-controlled OSCAL SSP that auditors can pull at any point. Git history shows when each control's effectiveness changed and who changed it. This is FedRAMP-ready evidence packaging.

**Output:** `evidence/oscal/ssp-2026-06-02.json` — committed automatically, tagged `oscal-evidence-2026-06-02`.

---

## Workflow 5: Compliance Gap Analyst

**Trigger:** On-demand or weekly scheduled  
**Agent:** Reads `get_framework_coverage()` for each framework → identifies the highest-impact controls to address next → ranks remediation actions by compliance coverage improvement per engineering hour

**What it replaces:** Manual gap analysis. Today closing compliance gaps requires a GRC analyst to read the framework mapping and identify overlapping controls.

**Example output for EU AI Act (22% → target 80%):**
```
Top 5 controls to address for EU AI Act coverage improvement:

1. UCF.AI.03 (AI Security Controls) — Not Tested
   Covers: EU AI Act Art. 9, ISO 42001, OWASP LLM Top 10
   Coverage gain: +12% EU AI Act | +8% ISO 42001
   Effort: Medium (OWASP LLM assessment, ~3 days)

2. UCF.AI.05 (AI Incident Response) — Not Tested
   Covers: EU AI Act Art. 9, ISO 42001
   Coverage gain: +9% EU AI Act
   Effort: Medium (IR playbook update, ~2 days)

3. UCF.AI.07 (Model Risk Management) — Ineffective (score: 12)
   Coverage gain: +7% EU AI Act | +6% ISO 42001
   Effort: High (model risk framework, ~2 weeks)

Addressing items 1 and 2 moves EU AI Act from 22% → 43% in approximately 5 engineering days.
```

---

## Workflow 6: AI Incident Response Assistant

**Trigger:** New incident opened with severity Critical or High  
**Agent:** Reads incident metadata → queries similar past incidents and their resolution paths → reads linked control effectiveness → drafts initial IR steps and recommended communications

**What it replaces:** First 30 minutes of IR triage, which today involves manually pulling context from multiple modules.

---

## Workflow 7: CISO Briefing Generator

**Trigger:** On-demand or weekly scheduled  
**Agent:** Reads all live KRI data → pulls VSRM scores, SLA status, framework coverage, team health, decisions required → generates an up-to-date version of the CISO briefing document with current numbers

**What it replaces:** Manually updating the briefing doc before each meeting. Today the numbers in `CISO-BRIEFING-DOCKER-SECURITY.md` are static — they were accurate at time of writing and drift over time.

**Output:** `docs/CISO-BRIEFING-DOCKER-SECURITY.md` regenerated with live KRI data, committed to main, sent to CISO as a Slack digest.

---

## OSCAL: From Export Button to Living Evidence

Today OSCAL is a manual export. The Phase 4 vision:

| Today | Phase 4 |
|---|---|
| Manual button in dashboard | Automated on every control change |
| One-time download | Version-controlled in `/evidence/oscal/` |
| No audit trail | Git history = control change history |
| Point-in-time | Continuously current |
| Submitted manually | Auto-packaged for FedRAMP, SOC 2, ISO 27001 audit submissions |

---

## Implementation Approach

### Step 1: Build the MCP Server (2–3 weeks)

Create `grc-mcp-server/` — a Node.js/Python MCP server that:
- Connects to Supabase via service role key
- Exposes the 10 tools listed in the architecture section
- Implements rate limiting and audit logging on every tool call
- Runs as a separate service (ECS task or Lambda)

### Step 2: VSRM Auto-Triage Agent (1 week)

Wire the auto-triage workflow to the Scout/Trivy ingestion pipeline. Every new finding calls the MCP server → VSRM score → Supabase insert. Validate against 30 days of historical findings.

### Step 3: SLA Monitor + Drafter (1 week)

Scheduled Lambda runs every 6 hours → calls `list_sla_breaches()` → drafts escalations → posts to a Slack approval channel. Human approves → message sends.

### Step 4: OSCAL Continuous Export (3 days)

GitHub Action triggers on Supabase `controls` table update → calls `export_oscal_ssp()` → commits to repo.

### Step 5: Compliance Gap Analyst + Briefing Generator (2 weeks)

On-demand agents available via Slack command (`/grc-briefing`, `/grc-gap-analysis EU AI Act`).

---

## Auditability of AI-Assisted Decisions

Every AI-assisted action must be auditable. Requirements:

| Requirement | Implementation |
|---|---|
| Every auto-triage decision logged | Agent version, inputs, VSRM output stored in finding metadata |
| Human approval for outbound communications | Slack approval channel before any escalation sends |
| No AI agent writes to production without human review | Write tools require `approved_by` field |
| AI reasoning visible | Full agent reasoning stored in finding comment thread |
| Agent version pinned | Model version logged per decision; not silently upgraded |

---

## Compliance Value

AI-assisted GRC directly supports audit evidence requirements:

| Framework | How AI-assisted GRC helps |
|---|---|
| SOC 2 CC7.1 | Continuous VSRM scoring demonstrates systematic vuln management |
| ISO 27001 A.8.8 | Automated SLA tracking and escalation is documented procedure |
| EU AI Act Art. 13 | AI decision logging satisfies transparency and traceability requirements |
| FedRAMP | Continuous OSCAL SSP export provides live authorization package |
| NIST AI RMF | Agent audit trail demonstrates responsible AI deployment |

---

## Related Documents

- [DOCKER-INTEGRATION-ROADMAP.md](./DOCKER-INTEGRATION-ROADMAP.md)
- [SDLC-SECURITY-GUARDRAILS.md](./SDLC-SECURITY-GUARDRAILS.md)
- [VULNERABILITY-MANAGEMENT-PROGRAM.md](./VULNERABILITY-MANAGEMENT-PROGRAM.md)
- [CISO-BRIEFING-DOCKER-SECURITY.md](./CISO-BRIEFING-DOCKER-SECURITY.md)
