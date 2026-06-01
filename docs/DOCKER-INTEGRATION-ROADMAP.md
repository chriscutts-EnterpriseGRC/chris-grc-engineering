# Docker Integration Roadmap

## Overview

This document outlines the integration of Docker's native tools (Scout, Build Cloud, Registry, Snyk, Falco) into the risk management system to create container-specific risk visibility and enforcement.

The current system is production-ready and generic. This roadmap shows how to make it Docker-specific - transforming it from "enterprise risk management" into "container supply chain risk engine."

---

## Current State: Phase 1 (Production-Ready)

**Generic risk management system with integrations:**
- Jira (incident management)
- Qualys (vulnerability scanning)
- Splunk (security events)
- AWS Security Hub (infrastructure vulnerabilities)
- Wiz (cloud and container risk findings) - connector available in `plugins/connectors/wiz-inspector`
- Extensible adapter pattern for new sources

**Governance:** 12-section framework (ISO 31000 aligned)
**Deployment:** AWS (RDS + ECS + Lambda) - see [AWS_DEPLOYMENT.md](../deployment/AWS_DEPLOYMENT.md)
**Scalability:** Designed for 14K+ risks and 300+ assessments per year

---

## Phase 2: Docker Scout Integration (Month 2-3)

### What Scout Provides
- Image vulnerability scanning (CVE detection)
- Base image risk assessment
- Supply chain provenance tracking
- Automatic recurrence scanning

### System Integration Points

**1. Scout API - Orchestrator**

The Scout adapter follows the same pattern as existing connectors in `dashboard/integrations/`. On each image push to ECR, Scout scans the image and the Lambda adapter ingests findings into the `vulnerabilities` table, tagged with the source image digest and base image reference.

**2. Risk Scoring**
- Inherent: CRITICAL (12 production images affected)
- Treatment options:
  - Mitigate: Rebuild all images with patched base, re-scan, redeploy
  - Transfer: Move to managed image service (Docker Official Images)
  - Accept: Document justification and monitor

**3. Dashboard View**
- Image health score (CVE count + age + signature status)
- Supply chain risk heatmap (5x5: likelihood x impact by image)
- Remediation tracking (rebuild progress by team)
- Image lineage (code commit - image - deployment)

### Example Workflow

**Scenario:** Scout detects critical CVE in `alpine:3.18`

**Automated flow:**
1. Scout API - Orchestrator ingests CVE
2. Orchestrator queries RDS: "Which images use alpine:3.18?"
3. Result: 47 images, 12 in production
4. Risk created:
   - Title: "Base Image Vulnerability: alpine:3.18"
   - Impact: 5 (affects production deployments)
   - Likelihood: 5 (already in production)
   - Score: 25 (CRITICAL)
5. Domain reviewers evaluate:
   - InfoSec: "Exploitation risk is high"
   - Platform Team: "Affects 4 core services"
   - Service Reliability: "Rebuild = brief deployment window"
6. Consensus: CRITICAL, must mitigate - 7-day SLA per Risk Management Framework
7. Treatment assigned to Platform Team
8. Dashboard shows:
   - "8 images rebuilt and re-scanned"
   - "4 images pending rebuild"
   - "0 images overdue (SLA: 7 days)"
9. Closure: All images rebuilt, re-scanned by Scout, verified
   - Health score: GREEN
   - Risk closed with evidence

### Key Metrics
- Supply chain risk exposure trend (CVE count over time)
- Remediation velocity (avg days to rebuild per severity)
- Base image age distribution (% of images using EOL bases)
- Signature adoption (% of images signed in registry)

---

## Phase 3: Build Cloud & Registry Integration (Month 3-4)

### What Build Cloud Provides
- Continuous image building and signing
- Build artifact tracking (code commit - image tag)
- Attestation and SBOM generation
- Distributed build execution

### What Registry Provides
- Image provenance (who built, when, from what code)
- Signature verification (cryptographic proof)
- Compliance metadata (SBOM, attestations, build logs)
- Access control and audit logs

### System Integration Points

**1. Image Compliance Scoring**

Each image receives a compliance score based on: signature status, SBOM presence, base image age, and CVE count from Scout. The score is stored as a control effectiveness value against UCF controls in the `controls` table.

**2. Dashboard View**
- Registry compliance scorecard (% signed, % with SBOM, age distribution)
- Image lineage graph (code - build - registry - deployment)
- Deployment blockers (images that cannot be deployed due to compliance)
- Audit trail (who deployed what, when, from which commit)

**3. Deployment Enforcement**

Images that fail compliance checks are blocked at the ECS deployment stage. The OPA policy layer (see [AWS_DEPLOYMENT.md](../deployment/AWS_DEPLOYMENT.md)) enforces signing and SBOM requirements before any image reaches production.

### Example Workflow

**Scenario:** Platform team needs to deploy updated service image

**Manual (old way):**
1. Build image locally or in Build Cloud
2. Push to registry (hope it's signed)
3. Deploy
4. Maybe someday know what's in it (SBOM)

**Automated (new way):**
1. Team pushes code to main branch
2. Build Cloud triggers, signs image, generates SBOM, uploads to registry
3. Image compliance score calculated automatically
4. If compliant: Green light to deploy
5. If non-compliant: Blocked until remediated
6. Dashboard shows: "Awaiting SBOM for deployment clearance"
7. Team adds SBOM in Build Cloud, rebuilds
8. Compliance score updates to 100
9. Deployment proceeds, audit logged

### Key Metrics
- Image compliance rate (% of images meeting standards)
- Deployment blockers (how many deployments are blocked)
- Supply chain velocity (time from code commit to compliant image)
- Audit trail completeness (% of deployments with full lineage)

---

## Phase 4: Runtime Scanning & Continuous Monitoring (Month 4-6)

### What Runtime Provides
- **Wiz** (connector available now - `plugins/connectors/wiz-inspector`): Cloud and container risk findings, already integrated into the vulnerability pipeline
- **Snyk**: Continuous scanning of running containers for application-layer CVEs
- **Falco**: Behavioral monitoring (unauthorized process execution, container escapes)
- **Kubernetes**: Native runtime security hooks

### System Integration Points

**1. Real-Time Container Vulnerability Updates**

The existing Wiz connector ingests cloud risk findings on a scheduled basis. In Phase 4, Snyk runtime scanning extends this to application-layer CVEs inside running containers, feeding the same `vulnerabilities` table with `source: 'snyk-runtime'`.

**2. Behavioral Risk Detection (Falco)**

Falco events are ingested via a new Lambda adapter into the `incidents` table with `type: 'Behavioral Anomaly'`, linked to the relevant UCF controls (UCF.08.01 Log Monitoring, UCF.04.01 Incident Response). High-confidence Falco events auto-create risks with a calculated inherent score.

**3. Dashboard View**
- Runtime risk dashboard (% containers with active CVEs)
- Container age vs. risk (older images carry higher CVE exposure)
- Anomaly feed (behavioral alerts from Falco)
- Incident correlation (CVE detected - related anomalies flagged)

### Example Workflow

**Scenario:** Critical CVE published for popular framework

**Automated flow:**
1. CVE published (e.g., Log4Shell variant)
2. Snyk detects: "X containers running vulnerable version"
3. System updates all affected containers: SEVERE - CRITICAL
4. Alerts go to on-call
5. Dashboard shows: "12 critical containers need immediate action"
6. Team rebuilds images with patched framework
7. Rolls out new images (blue-green deployment)
8. Old containers terminated, new ones verified
9. Risk closes with evidence
10. Health restored

### Key Metrics
- Runtime vulnerability coverage (% of containers continuously scanned)
- MTTR for runtime CVEs
- Behavioral anomaly rate (false positive vs. true incident ratio)
- Deployment velocity (how fast new images can reach production)

---

## Phase 5: Compliance Enforcement & Automation (Month 6+)

### Hard Enforcement Rules
- No unsigned images in production (deploy blocked)
- No images without SBOM (deploy blocked)
- No base images EOL >30 days (deploy blocked)
- No containers with critical CVEs (terminated)
- No unauthorized processes (container quarantined per Falco)

### Compliance Dashboard
- Compliance scorecard by team, product, org
- Blockers preventing compliance
- Audit trail (all compliance decisions)
- Exemptions (approved risks with justification, time-limited)

### Exemption Workflow

Any team requiring an exemption from a hard enforcement rule must:
1. Raise a risk in the register with treatment = Accept
2. Obtain approval from the authority level required by the risk band (see [RISK-METHODOLOGY.md](RISK-METHODOLOGY.md))
3. Set a time-limited expiry - no open-ended exemptions
4. Document the justification and compensating controls
5. Exemption tracked in dashboard until expiry or closure

### Key Metrics
- Compliance rate (% of images meeting all requirements)
- Exemption rate (% exemptions vs. compliant images)
- Time to compliance (avg days from non-compliant to compliant)

---

## System Architecture

See [AWS_DEPLOYMENT.md](../deployment/AWS_DEPLOYMENT.md) for the full infrastructure layout. The Docker integration adds the following to the existing Lambda adapter fleet:

| Phase | Adapter | Trigger | Target |
|-------|---------|---------|--------|
| 2 | `docker-scout-sync` | Image push to ECR | vulnerabilities |
| 3 | `registry-sync` | Image push / webhook | controls (compliance score) |
| 4 | `snyk-runtime-sync` | Scheduled (5 min) | vulnerabilities |
| 4 | `falco-sync` | Event stream | incidents |

---

## Team Dependencies

| Phase | Team | Dependency |
|-------|------|-----------|
| 2 | Security | Scout API credentials |
| 3 | Platform | Build Cloud integration, Registry access |
| 4 | Platform | Kubernetes cluster, Falco deployment |
| 5 | Security + Platform | Policy definitions, enforcement rules |

---

## Implementation Timeline

| Month | Deliverable | Success Metric |
|-------|------------|----------------|
| 1 | Current system live | Generic risk framework operational, all adapters deployable |
| 2-3 | Scout integration | 100% of images scanned, 95% SLA compliance |
| 3-4 | Registry / Build Cloud | 90% of images signed + SBOM |
| 4-6 | Runtime scanning | 100% of containers continuously monitored |
| 6+ | Compliance enforcement | >95% compliance rate, <1% exemptions |

---

## Success Criteria

**Phase 2 (Scout):**
- All Docker images have vulnerability data
- Supply chain risks visible in dashboard
- Remediation SLAs met >95%

**Phase 3 (Registry / Build Cloud):**
- Image provenance tracked (code commit - image - deployment)
- 90%+ of images signed
- 90%+ of images have SBOM

**Phase 4 (Runtime):**
- All running containers continuously scanned
- New CVEs detected and alerted <1 hour
- Behavioral anomalies logged and investigated

**Phase 5 (Enforcement):**
- Deployment blocked if non-compliant
- >95% compliance rate across org
- Exemptions tracked and time-limited

---

## Next Steps

1. Provision Docker Scout test environment
2. Get API credentials (Docker.io account with Scout access)
3. Build first Scout adapter (follows same pattern as `dashboard/integrations/jira.js`)
4. Begin Phase 2 implementation (4-week sprint)
5. Measure and iterate (compliance metrics, user feedback)

---

## References

- [AWS_DEPLOYMENT.md](../deployment/AWS_DEPLOYMENT.md) - Infrastructure architecture
- [ARCHITECTURE.md](ARCHITECTURE.md) - Application architecture and integration layer
- [METHODOLOGY.md](METHODOLOGY.md) - GRC engineering approach
- [RISK-METHODOLOGY.md](RISK-METHODOLOGY.md) - Risk scoring, bands, SLAs
- [CASE_STUDY.md](../case-study/CASE_STUDY.md) - Implementation case study
