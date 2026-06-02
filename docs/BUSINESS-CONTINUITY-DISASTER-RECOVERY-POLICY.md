# Business Continuity and Disaster Recovery Policy

**Program:** Resilience Ops GRC Platform  
**Owner:** Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** ISO 27001 A.5.29–5.30, SOC 2 A1.1–A1.3, NIST SP 800-34, ISO 22301

---

## Purpose

This policy ensures that [Organization] can maintain or rapidly restore critical business operations and systems following a disruptive event — including infrastructure failure, ransomware, data corruption, or natural disaster. It defines recovery objectives, backup requirements, and the procedures for declaring and executing continuity and recovery plans.

---

## Scope

Applies to all [Organization] critical systems, services, and the data they process. Covers cloud infrastructure, SaaS dependencies, and the teams responsible for them.

---

## Recovery Objectives

### Definitions

- **Recovery Time Objective (RTO)**: The maximum acceptable time from incident declaration to service restoration
- **Recovery Point Objective (RPO)**: The maximum acceptable age of data restored from backup (i.e., how much data we can afford to lose)

### Objectives by System Tier

| System tier | RTO | RPO | Examples |
|-------------|-----|-----|---------|
| **Tier 1 — Critical** | 4 hours | 1 hour | GRC Dashboard (production), Supabase database, authentication service |
| **Tier 2 — Important** | 24 hours | 4 hours | Integration adapters, CI/CD pipeline, GRC MCP server |
| **Tier 3 — Standard** | 72 hours | 24 hours | Staging environments, non-critical reporting, documentation systems |

Systems are assigned to tiers by Engineering Lead and reviewed annually.

---

## Business Impact Analysis

Critical dependencies for the GRC platform:

| Dependency | Type | Failure impact | Recovery strategy |
|-----------|------|----------------|-----------------|
| Supabase database | SaaS (PostgreSQL) | Data unavailable; dashboard fails | Supabase backup restore; point-in-time recovery |
| AWS ECS Fargate | Cloud compute | Services unavailable | Redeploy from container registry; multi-AZ |
| AWS ECR | Container registry | Deployments blocked | Multi-region replication; pull-through cache |
| GitHub | Source code / CI/CD | Deployments blocked; code inaccessible | Local mirror; documented manual deploy procedure |
| Okta / Supabase Auth | Authentication | Users locked out | Break-glass accounts per [Access Control Policy](./ACCESS-CONTROL-IAM-POLICY.md) |
| AWS Secrets Manager | Credential store | Applications cannot retrieve secrets | Documented emergency credential procedure |
| GRC MCP Server (Phase 4) | AI agent orchestration | AI-assisted workflows unavailable | Manual GRC workflows; AI agents are non-critical path |

---

## Backup Requirements

### Backup Standards

| System | Backup method | Frequency | Retention | Testing |
|--------|--------------|-----------|-----------|---------|
| Supabase (PostgreSQL) | Automated Supabase backups (Point-In-Time Recovery) | Continuous (PITR); daily snapshots | 30 days (PITR); 7 days (snapshots) | Quarterly restore test |
| S3 data (AUDIT logs, SBOM, evidence) | S3 versioning + cross-region replication | Continuous versioning | Per retention schedule | Annual |
| Code repositories (GitHub) | GitHub native + local mirror | On push | Indefinite | Annual |
| Application configuration | IaC (Terraform) in version control | On change | Indefinite | On change |
| Container images | ECR multi-region replication | On push | 90 days | On deployment |

### Backup Security

- Backups are encrypted using the same standards as source data
- Backup encryption keys are stored separately from the backup data itself
- Backup access is restricted to Security Engineering and designated Platform administrators
- Backups are stored in a separate AWS account to protect against account-level compromise

---

## Disaster Recovery Procedures

### DR Trigger Criteria

A disaster is declared when:
- Tier 1 system is unavailable and cannot be restored within 1 hour through normal operations
- Data corruption affects production data that cannot be repaired in-place
- Security incident requires complete environment rebuild (e.g., ransomware, confirmed rootkit)
- The primary AWS region experiences a major outage

The CISO or Engineering Lead may declare a disaster. The declaration activates the DR plan.

### DR Roles

| Role | Responsibility |
|------|---------------|
| **DR Coordinator** | Engineering Lead or CISO; coordinates all recovery activities |
| **Database Recovery Lead** | Senior engineer; owns Supabase restore and data validation |
| **Infrastructure Lead** | Platform engineer; owns AWS environment restore from IaC |
| **Security Lead** | Security Engineering; verifies integrity of restored environment; checks for persistence mechanisms if security incident |
| **Communications Lead** | Product / Legal; manages customer and stakeholder communications |

### Recovery Sequence

#### Phase 1: Assess (0–30 minutes)
- Confirm the extent of the incident
- Identify which systems and data are affected
- Determine whether DR declaration is required
- Notify DR roles

#### Phase 2: Contain and Isolate (30 minutes–2 hours)
- Isolate affected systems to prevent further damage
- Preserve forensic evidence (per [Incident Response Policy](./INCIDENT-RESPONSE-POLICY.md))
- Activate backup systems or failover environments

#### Phase 3: Restore (2 hours–RTO)
- Restore from the most recent clean backup within RPO
- Rebuild infrastructure from IaC (Terraform) in DR region or account
- Validate data integrity (checksums, record counts, consistency checks)
- Restore authentication and access management
- Restore security controls and monitoring before allowing user traffic

#### Phase 4: Validate
- Confirm all Tier 1 services are operational
- Run smoke tests across GRC platform modules
- Verify logging and monitoring are active
- Confirm RLS and auth are properly enforced before opening to users

#### Phase 5: Resume Normal Operations
- Gradually restore user access
- Monitor closely for the first 24 hours post-recovery
- Document timeline and decisions in the incident record

---

## Recovery for Specific Scenarios

### Supabase Data Corruption or Deletion

1. Identify the last known-good timestamp (before corruption event)
2. Supabase PITR: initiate point-in-time restore to that timestamp
3. Validate: row counts, data integrity, RLS policies intact
4. If PITR unavailable: restore from last daily snapshot
5. Notify affected users of data loss window (RPO gap)

### AWS Region Failure

1. Declare DR
2. Provision Supabase in the secondary region (or failover to Supabase's replica if configured)
3. Re-apply Terraform in the DR region (`terraform apply -var="region=us-east-1"`)
4. Redeploy application from ECR (multi-region replication ensures images are available)
5. Update DNS (Route 53) to point to DR region
6. Validate and resume

### Ransomware / Full Environment Compromise

1. Isolate all affected systems immediately — do not attempt to restore in-place
2. Security Engineering performs forensic triage to determine compromise scope
3. Provision a fresh AWS account — do not reuse the compromised account until forensics complete
4. Restore from off-site backups (cross-account S3 replica)
5. Rebuild all credentials — treat all secrets as compromised
6. Engage Legal and notify affected parties per [Incident Response Policy](./INCIDENT-RESPONSE-POLICY.md)

---

## Testing and Exercises

| Activity | Frequency | Participants |
|----------|-----------|-------------|
| Database restore test (Supabase PITR) | Quarterly | Database Recovery Lead |
| Full DR tabletop exercise | Annual | All DR roles |
| Full DR simulation (production equivalent environment) | Annual | Engineering team |
| AWS region failover test | Annual | Infrastructure Lead |
| Post-incident DR plan review | After every Tier 1 incident | DR Coordinator + Security |

Test results are documented and stored in the Evidence Locker. Failures and action items are tracked in the GRC Dashboard.

---

## Communication During a DR Event

| Audience | Communication | Channel | Timing |
|----------|--------------|---------|--------|
| Engineering team | Technical status updates | Slack #incidents | Every 30 minutes |
| CISO / Executive team | Executive summary | Direct message | On declaration + hourly |
| Customers (if affected) | Service status | Status page + email | Within 1 hour of declaration |
| Regulators | Breach notification if applicable | Per [Incident Response Policy](./INCIDENT-RESPONSE-POLICY.md) | Per obligation |

---

## Metrics

| Metric | Target |
|--------|--------|
| RTO achieved in DR tests (Tier 1) | < 4 hours |
| RPO achieved in DR tests (Tier 1) | < 1 hour |
| DR tests completed on schedule | 100% annually |
| Database restore tests completed | Quarterly |
| Open DR action items > 30 days | 0 |

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [Incident Response Policy](./INCIDENT-RESPONSE-POLICY.md)
- [Cloud Security Policy](./CLOUD-SECURITY-POLICY.md)
- [Access Control & IAM Policy](./ACCESS-CONTROL-IAM-POLICY.md)
- [Architecture Overview](./ARCHITECTURE.md)
