# CISO Security Briefing — Docker Supply Chain & GRC Program
**Date:** 2026-06-02  
**Prepared by:** Security Engineering  
**Classification:** Internal — Executive  
**Duration:** 15 minutes  
**Supporting platform:** Resilience Ops GRC Dashboard

---

## Executive Summary

Every service we ship is a container. That makes our attack surface not just our code, but the entire path from a developer's commit to a running workload in production — six distinct trust boundaries, 30+ mapped threats, and a growing set of EOL runtime risks with no patch path. We have built a production-grade GRC platform to manage this exposure, and we are mid-execution on a Docker-specific integration roadmap that will give us image-level supply chain visibility. This briefing covers current posture, active risks requiring your decision, and the roadmap ahead.

---

## Current Program at a Glance

| KRI | Current | Target | Status |
|---|---|---|---|
| Open P0 Vulnerabilities | 1 | 0 | 🔴 Breach — 22d overdue |
| Open P1 Vulnerabilities | 1 | 0 open >14d | 🟡 In SLA |
| SLA Compliance (P1/P2) | Tracked live | >90% | Dashboard |
| EOL Components (no patch path) | 2 | 0 in production | 🔴 Action required |
| CISA KEV Open | 1 | 0 | 🔴 Action required |
| EU AI Act Coverage | 22% | 100% | 🔴 Budget decision needed |
| ISO 42001 Coverage | 18% | 100% | 🔴 Gap |
| AI Vendor DPA Gaps | 3 vendors | 0 | 🟡 Legal action pending |
| Program Health (avg) | 52% | 80%+ | 🟡 Improving +4pp MoM |

---

## Act 1 — The Docker Supply Chain Problem

Docker is the delivery mechanism for every production service. The attack surface spans six trust boundaries:

```
Developer → Source Repo → Build Cloud → Registry → Orchestrator → Runtime
                               |              |                        |
                          Signs image    Stores SBOM           Falco / Snyk
                          Generates SBOM Verifies sig           monitor here
```

| Trust Boundary | Description | Highest Risk |
|---|---|---|
| TB-1 | Developer to source repo | Stolen PAT, malicious commit |
| TB-2 | Repo to Build Cloud | Dependency confusion, poisoned lockfile |
| TB-3 | Build Cloud to Registry | Secrets in build args, cache poisoning |
| TB-4 | Registry to Orchestrator | Unsigned image, tag overwrite |
| TB-5 | Orchestrator to Runtime | Container escape, privileged workload |
| TB-6 | External base image registries to Build Cloud | Base image poisoning |

Each boundary is an injection point. We have a complete STRIDE threat model across all six.

> **Full detail:** [THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md](./THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md)

---

## Act 2 — Threat Model: What We Found (STRIDE)

We applied STRIDE analysis per component across the full pipeline. Key findings:

| Component | Highest Threat | Current Mitigation | Gap |
|---|---|---|---|
| Source Repo | Stolen PAT → malicious push | Branch protection, PR reviews | Signed commits not enforced |
| Build Cloud | Base image poisoning (TB-6) | Scout base image verification (planned) | Not yet active |
| Registry | Tag overwrite → backdoored image | ECR immutable tags | Signature verification at pull not enforced |
| Runtime | Container escape | Rootless containers (partial) | Falco runtime monitoring not deployed |

**UCF control linkage:** Every threat maps to UCF.03.01 (Vulnerability Scanning), UCF.08.02 (Change Management), UCF.02.01 (Data Encryption), and UCF.01.02 (Access Management). Effectiveness scores are live in the dashboard Control Alignment module.

> **Full STRIDE analysis:** [THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md](./THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md)

---

## Act 3 — Vulnerability Posture: KRI Panel + EOL

**Live in the GRC Dashboard → Vulnerabilities module.**

### Active Critical Items

| ID | Title | Priority | Status | Days |
|---|---|---|---|---|
| V-001 | Log4Shell RCE (CVE-2024-1234) | P0 · CISA KEV | Open — SLA breached | 22d overdue |
| V-002 | OpenSSL buffer overflow | P1 | In Progress | In SLA |
| V-010 | **Node.js 16 — EOL (Apr 2024)** | P1 | Open — Unassigned | No patch path |
| V-011 | **Python 3.8 — EOL (Oct 2024)** | P2 | Open — Unassigned | No patch path |

### EOL Risk: A Different Class of Vulnerability

EOL components receive no security patches from the vendor. Every CVE discovered after the EOL date is permanently unmitigable without an upgrade or migration. Standard patch SLAs do not apply — remediation is an engineering project, not a patch deployment.

- **V-010 Node.js 16** — public-facing API gateway, SecTier 0. P1 mandatory. Every new CVE against Node.js 16 is now a permanent exposure.
- **V-011 Python 3.8** — ML training environment, AI-tagged. P2. Also blocks EU AI Act Article 9 risk management compliance.

> **VSRM methodology and SLA policy:** [VULNERABILITY-MANAGEMENT-PROGRAM.md](./VULNERABILITY-MANAGEMENT-PROGRAM.md)

---

## Act 4 — The VSRM: How We Prioritize

We do not use raw CVSS scores. We use the Vulnerability Severity Rating Matrix (VSRM) — a four-dimensional contextual scoring system:

| Dimension | Options |
|---|---|
| Environment | Production / Dev/Stage |
| Exposure | Public-facing / Internet (IP-restricted) / Internal |
| CVSS v4.0 Temporal | 9.0–10.0 / 7.0–8.9 / 5.0–6.9 / 1.0–4.9 |
| Exploitability | Actively Exploited / Mature Exploit / POC / No Exploit |

**Example:** The same CVSS 9.3 CVE is P0 if actively exploited on a public production server, and P3 if it has no exploit and sits on an internal Dev/Stage system. VSRM output is the authoritative priority — it overrides raw scores.

**SLA enforcement:**

| Priority | SLA | Definition |
|---|---|---|
| P0 | 1 day | Active incident / actively exploited critical on public production |
| P1 | 14 days | Critical with mature exploit on public production |
| P2 | 30 days | Plausible threat, minimal prerequisites |
| P3 | 60 days | Possible threat, moderate prerequisites |
| P4 | 90–120 days | Unlikely, significant prerequisites required |

> **Full VSRM lookup table and extension policy:** [VULNERABILITY-MANAGEMENT-PROGRAM.md#vsrm](./VULNERABILITY-MANAGEMENT-PROGRAM.md#vulnerability-severity-rating-matrix-vsrm)

---

## Act 5 — Leadership Scorecard: Decisions Required

**Live in the GRC Dashboard → Scorecard module → Leadership Decisions Required panel.**

The following items are surfaced automatically when they require explicit leadership sign-off. Each has a named ask.

| # | Item | Detail | Ask |
|---|---|---|---|
| 1 | **P0 SLA Breach** | V-001 (Log4Shell) 22d overdue on a 1-day SLA | **Escalate or declare incident today** |
| 2 | **EU AI Act — Board Decision** | 22% coverage, enforcement active. Options: fund remediation or formally accept regulatory exposure | **Approve budget or accept risk** |
| 3 | **Data Protection Team Crisis (29%)** | 5 control gaps, 2 unresolved incidents. Resource intervention required | **Assign resources or accept risk** |
| 4 | **AI Vendor DPA Gaps** | 3 AI vendors without Data Processing Agreements — GDPR Art. 28 exposure | **Legal directive to onboard DPAs or offboard vendors** |

**Program trend:** Overall health 52% (+4pp MoM). Control gaps down from prior month. Direction is positive; P0 breach and EU AI Act are the blockers.

---

## Act 6 — Docker Roadmap: What's Coming

**Current state (Phase 1 — Production):**
- Generic GRC platform managing risk, controls, vulns, incidents, third-party, compliance
- Container scanning active in staging (Trivy)
- SBOM generation planned (Syft — not yet wired)
- Existing integrations: AWS Security Hub, Wiz connector

**Phase 2 — Docker Scout Integration (Month 2–3):**
- Every ECR push triggers a Scout scan
- Findings flow into the VSRM, auto-tagged to image digest and base image reference
- P1/P2 findings auto-ticketed within 4 hours
- Dashboard: image health score, supply chain risk heatmap, rebuild progress per team

**Example Scout workflow — CVE in `alpine:3.18`:**
1. Scout detects critical CVE → Lambda adapter ingests finding
2. System queries: which images use this base? → 47 images, 12 in production
3. Risk auto-created: CRITICAL, 7-day SLA
4. Treatment assigned to Platform Team
5. Dashboard tracks: 8 rebuilt, 4 pending, 0 overdue
6. Closure: all images rebuilt, re-scanned, health score → GREEN

**Phase 3 — SBOM + Continuous Monitoring:**
- Syft generates SBOM on every image push
- Grype monitors production SBOMs daily against new CVE feeds
- Alert fires the moment a new CVE matches any component in any production image
- EOL date tracking via endoflife.date API — new EOL finding auto-opens within 24 hours of EOL date

> **Full roadmap with integration architecture:** [DOCKER-INTEGRATION-ROADMAP.md](./DOCKER-INTEGRATION-ROADMAP.md)

---

## Act 7 — SDLC Shift-Left: Catching It Before Production

The GRC platform enforces security at every pipeline stage. Vulnerabilities caught earlier cost less to fix.

| SDLC Phase | Control | Status |
|---|---|---|
| Pre-commit | Secrets scanning (`detect-secrets`), SAST (`semgrep`) | **Active** |
| Pull Request | Dependency review (`npm audit`, Dependabot), license check | **Active** |
| CI Build | Container scanning (Trivy), IaC scanning (Checkov) | **Partial — staging only** |
| Artifact | SBOM generation (Syft), artifact signing (Cosign) | **Planned — Phase 3** |
| Staging | DAST (OWASP ZAP) | **Planned — Phase 2** |
| Production | Continuous CVE scan (Grype), runtime monitoring (Falco) | **Planned — Phase 3** |

The shift-left posture means that by Phase 3, a CVE in a base image will be caught at the PR stage before it ever reaches production — not discovered by a scanner weeks later in a running workload.

> **Full phase-by-phase controls:** [SDLC-SECURITY-GUARDRAILS.md](./SDLC-SECURITY-GUARDRAILS.md) · [PDLC-SECURITY-GUARDRAILS.md](./PDLC-SECURITY-GUARDRAILS.md)

---

## Act 8 — The Ask: Five Decisions

| # | Decision | Urgency | Owner |
|---|---|---|---|
| 1 | **Sign off on P0 incident declaration** for V-001 (Log4Shell, 22d overdue) or escalate to IR | Today | CISO |
| 2 | **Approve EU AI Act remediation budget** or formally accept regulatory exposure on the risk register | This week | CISO + Board |
| 3 | **Resource allocation decision** for Data Protection team (29% health) — additional headcount or formal risk acceptance | This week | CISO + Engineering VP |
| 4 | **Legal directive** to initiate DPA process for 3 AI vendors or offboard | This week | CISO + Legal |
| 5 | **Endorse Docker Scout + SBOM roadmap** (Phase 2/3) for engineering sprint prioritization | This month | CISO + CTO |

---

## Supporting Documents

| Document | Purpose |
|---|---|
| [VULNERABILITY-MANAGEMENT-PROGRAM.md](./VULNERABILITY-MANAGEMENT-PROGRAM.md) | Full VM program: VSRM, SLA policy, EOL management, tool stack |
| [THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md](./THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md) | STRIDE analysis across all 6 Docker trust boundaries |
| [DOCKER-INTEGRATION-ROADMAP.md](./DOCKER-INTEGRATION-ROADMAP.md) | Phase 2/3 Scout + SBOM integration architecture |
| [SDLC-SECURITY-GUARDRAILS.md](./SDLC-SECURITY-GUARDRAILS.md) | Pipeline-level security controls, phase by phase |
| [PDLC-SECURITY-GUARDRAILS.md](./PDLC-SECURITY-GUARDRAILS.md) | Product decision-level security gates |
| [GRC Dashboard](http://localhost:3000) | Live: vulnerability KRIs, Scorecard decisions, compliance posture |
