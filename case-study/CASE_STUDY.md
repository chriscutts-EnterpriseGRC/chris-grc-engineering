# GRC Engineering Case Study

## Executive Summary

A cloud-native SaaS company running containerised workloads on AWS needed to move from ad-hoc compliance spreadsheets to a systematic, engineering-led risk program. This case study documents the design and implementation of the Resilience Operations Dashboard - a full-stack GRC platform that connects vulnerability data, risk scoring, compliance tracking, and leadership reporting in a single operational system.

**Outcomes:**
- 25 UCF controls mapped across 8 compliance frameworks simultaneously
- Risk register with inherent/residual scoring aligned to ISO 31000 and ISO 27005
- Container supply chain threat model covering 6 STRIDE components
- Vulnerability management program with automated SLA tracking
- Monthly leadership reports delivered per team via shareable URL
- EU AI Act gap identified at 22% - remediation roadmap in place before August 2026 enforcement

---

## Organisation profile

| Attribute | Detail |
|-----------|--------|
| Industry | Cloud-native SaaS |
| Infrastructure | AWS ECS Fargate, RDS PostgreSQL, Lambda |
| Container platform | Docker (Build Cloud, Scout, Registry) |
| Compliance obligations | SOC 2 Type II, ISO 27001, GDPR, EU AI Act, ISO 42001 |
| Team size | 6 risk domains, 5 named risk owners |
| Regulatory pressure | EU AI Act enforcement August 2026, ISO 27001 surveillance audit September 2026 |

### Initial state

- Compliance tracked in spreadsheets - no single source of truth
- Vulnerability scanner (Qualys) output not connected to risk register
- No formal risk scoring methodology - severity was informal and inconsistent
- AI systems deployed without governance policy, risk categorisation, or incident response plan
- Audit preparation took 6-8 weeks of manual evidence gathering
- No visibility into which team owned which controls or risks

---

## Challenges

### 1. Fragmented risk data

Vulnerabilities lived in Qualys. Incidents lived in Jira. Policies lived in Google Drive. Vendor risk lived in a spreadsheet. None of these connected to a risk register, so leadership had no consolidated view of exposure. Critical vulnerabilities could be open for weeks with no escalation path.

### 2. AI governance gap

The organisation had deployed multiple AI systems (LLM-based features, ML training pipelines) before the EU AI Act was enacted. With enforcement starting August 2026, there was no AI usage policy, no risk categorisation process, and no incident response plan for AI-specific events. EU AI Act coverage was 0% when the program started.

### 3. Container supply chain blind spots

Workloads ran on Docker images with no systematic vulnerability scanning, no base image policy, no image signing, and no SBOM. A CVE in a base image (`alpine`, `python`, `node`) could affect dozens of production images with no automated detection or escalation.

### 4. Inconsistent severity classification

Different teams used different definitions of "critical" and "high." A vulnerability rated Critical by one team was rated High by another. Risk acceptance decisions had no documented approval authority. There was no SLA enforcement.

### 5. Leadership reporting overhead

Producing a monthly risk report required manually pulling data from five different systems, reformatting it, and emailing it as a PDF. It took 2-3 days per report cycle. Directors had no self-service view of their team's risk posture.

---

## Solution

### Risk Management Framework (ISO 31000 aligned)

A formal risk scoring methodology was adopted based on a 5x5 likelihood x impact matrix with a high water mark rule across three likelihood dimensions (Frequency, Technical Feasibility, Likelihood Precursor). This produced consistent, auditable scores across all risk types.

**Rating bands:**

| Band | Score | Response SLA | Acceptance authority |
|------|-------|-------------|---------------------|
| Critical | 25 | 7 days | C-Suite / SVP+ |
| Severe | 16-24 | 30 days | VP+ |
| High | 10-15 | 60 days | Director+ |
| Moderate | 5-9 | 90 days | Sr Manager+ |
| Low | 1-4 | 180 days | Manager+ |

See [docs/RISK-METHODOLOGY.md](../docs/RISK-METHODOLOGY.md) for the full framework.

### UCF control library

25 controls were assigned Universal Control Framework (UCF) IDs, each mapped across multiple frameworks simultaneously. A single control remediation satisfies requirements across SOC 2, ISO 27001, NIST CSF, GDPR, PCI DSS, EU AI Act, and ISO 42001 at once - eliminating duplicate audit effort.

Key gaps identified at program start:
- UCF.01.02 Privileged Access Management: 38% effective
- UCF.03.02 Patch Management Process: 41% effective
- UCF.AI.01 AI Model Governance: 29% effective (Ineffective)
- UCF.AI.03 AI Security Controls: 0% (Not tested)

### Risk register

12 risks were formalised at program launch with inherent and residual scores, treatment plans, owners, and SLA-bound review dates. Three examples:

**RSK-001 - Privileged accounts without MFA** (Score: 20 - Critical)
Okta MFA not enforced on break-glass admin accounts. Treatment: enforce Okta MFA for all admin accounts. Status: Mitigating. SLA: 2026-06-15.

**RSK-003 - Critical vulnerabilities unpatched >30 days** (Score: 16 - Severe)
Patch management process ineffective at 41%. Treatment: deploy automated patch pipeline with 14-day SLA enforcement. Status: Mitigating.

**RSK-009 - Prompt injection in public AI endpoint** (Score: 16 - Severe)
No OWASP LLM Top 10 assessment completed. Treatment: input validation + AI security controls. Status: Open. SLA: 2026-06-15.

### Vulnerability management program

A dedicated vulnerability program was built to bridge scanner output and the risk register. Key design decisions:

- CVSS-to-severity mapping with five escalation rules (CISA KEV, internet-facing, regulated data, EOL asset, active exploitation)
- Any vulnerability scoring 16+ (Critical/Severe) automatically creates a risk register entry
- Remediation SLAs: Critical 7 days, Severe 14 days, High 30 days
- SLA breach without a documented exception triggers automatic risk register escalation
- Exception process with approval authority tiers aligned to the risk framework

Current primary gap: UCF.03.02 (Patch Management) at 41% effectiveness. RSK-003 is the active risk tracking this.

See [docs/VULNERABILITY-MANAGEMENT-PROGRAM.md](../docs/VULNERABILITY-MANAGEMENT-PROGRAM.md).

### Container supply chain threat model

A STRIDE threat model was produced for the full container supply chain across six components: source repository, Build Cloud, Registry, Orchestrator, Runtime, and External base image registries. 8 supply chain risks were identified and scored:

| Risk | Score | Phase that mitigates |
|------|-------|---------------------|
| Base image poisoning via compromised tag | 20 (Critical) | Phase 2 - Scout digest pinning |
| Unsigned image deployed to production | 16 (Severe) | Phase 3 - Registry enforcement |
| Runtime CVE undetected in running container | 20 (Critical) | Phase 4 - Snyk/Wiz runtime |
| Container escape via unpatched CVE | 15 (High) | Phase 4 - Falco + Fargate isolation |

See [docs/THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md](../docs/THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md).

### Docker integration roadmap

A 5-phase roadmap was defined to transform the generic GRC system into a container supply chain risk engine:

- **Phase 2 (Month 2-3):** Docker Scout image scanning on every ECR push
- **Phase 3 (Month 3-4):** Build Cloud signing, SBOM generation, deployment enforcement
- **Phase 4 (Month 4-6):** Snyk runtime scanning, Falco behavioral monitoring
- **Phase 5 (Month 6+):** Hard enforcement - unsigned or CVE-affected images blocked from production

See [docs/DOCKER-INTEGRATION-ROADMAP.md](../docs/DOCKER-INTEGRATION-ROADMAP.md).

### Dashboard and leadership reporting

The Resilience Operations Dashboard provides 13 modules across three navigation groups. Every data point links back to its source UCF control, enabling end-to-end traceability from raw event to risk register entry.

**Leadership Scorecard** gamifies team accountability with Bronze/Silver/Gold/Platinum health levels, 3-month trend sparklines, and monthly achievement badges (Most Improved, Zero Gaps, Clean Sheet, On A Roll). Current team standings:

| Team | Health | Level | Trend |
|------|--------|-------|-------|
| Identity & Access (J. Martinez) | 67% | Silver | +9% over 3 months |
| Security Operations (K. Thompson) | 65% | Silver | +7% over 3 months |
| GRC & Vendor Risk (S. Chen) | 50% | Silver | +12% over 3 months |
| Infrastructure Security (T. Williams) | 50% | Silver | +10% over 3 months |
| Data Protection (A. Patel) | 29% | Bronze | +9% over 3 months |
| R&D / Product | 40% | Bronze | +10% over 3 months |

**Monthly reports** are generated per leader, filtered to their controls, open vulnerabilities, risk items, and recommended actions. Each report is accessible via a shareable URL (`?leader=<teamId>`) and exportable to PDF.

---

## Technical implementation

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS v3, Recharts, Lucide icons |
| Backend | Supabase (PostgreSQL) with Row Level Security |
| Integration adapters | Node.js - Jira, Qualys, Splunk, AWS Security Hub, ServiceNow, Notion, Vanta |
| Infrastructure | AWS ECS Fargate, RDS PostgreSQL, Lambda + EventBridge |
| Plugin layer | 33 framework plugins, 16 connector plugins (Claude Code) |
| Export | OSCAL SSP JSON for audit submission |

---

## Results

| Metric | Before | After |
|--------|--------|-------|
| Time to produce monthly risk report | 2-3 days | Instant (self-service URL) |
| Risks with documented scores and owners | 0 | 12 active risks |
| Frameworks with live coverage tracking | 0 | 8 frameworks |
| EU AI Act coverage | 0% | 22% (roadmap to 80% by Aug 2026) |
| Vulnerability SLA enforcement | Manual, inconsistent | Automated - SLA breach triggers risk escalation |
| Container image vulnerability visibility | None | Planned (Phase 2 - Scout integration) |
| Audit evidence collection | 6-8 weeks manual | Continuous (Evidence Locker) |

---

## Lessons learned

**Score everything consistently from day one.** The most valuable change was adopting a single scoring methodology across all risk types. Once every vulnerability, incident, and policy gap used the same 5x5 matrix, leadership could compare risk exposure across domains without context-switching between tools.

**The vulnerability program needs to be a program, not a scanner.** Deploying Qualys was not a vulnerability management program. The program only existed when there were SLAs, an escalation path, a defined exception process, and a bridge between scanner output and the risk register. The scanner is just one input.

**AI governance needs to start before enforcement.** The EU AI Act gap was 0% when AI systems were already in production. The 22% current coverage and the gap to August 2026 enforcement creates genuine urgency. Governance frameworks take time to implement - waiting for regulation to arrive is too late.

**Container supply chain is a separate risk domain.** Image vulnerabilities, base image policies, SBOM requirements, and behavioral anomalies in running containers do not fit cleanly into the existing vulnerability or incident categories. They need their own track, their own threat model, and a dedicated integration roadmap.

---

## Related documents

- [docs/RISK-METHODOLOGY.md](../docs/RISK-METHODOLOGY.md) - full scoring model and SLA framework
- [docs/VULNERABILITY-MANAGEMENT-PROGRAM.md](../docs/VULNERABILITY-MANAGEMENT-PROGRAM.md) - vulnerability program design
- [docs/DOCKER-INTEGRATION-ROADMAP.md](../docs/DOCKER-INTEGRATION-ROADMAP.md) - container supply chain roadmap
- [docs/THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md](../docs/THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md) - STRIDE threat model
- [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - system architecture
- [deployment/AWS_DEPLOYMENT.md](../deployment/AWS_DEPLOYMENT.md) - AWS infrastructure
