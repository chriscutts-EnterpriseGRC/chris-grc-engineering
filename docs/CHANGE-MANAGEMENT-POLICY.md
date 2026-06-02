# Change Management Policy

**Program:** Resilience Ops GRC Platform  
**Owner:** Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** ISO 27001 A.8.32, SOC 2 CC8.1, NIST SP 800-53 CM-3, PCI DSS 4.0 Req 6.5

---

## Purpose

This policy ensures that changes to [Organization]'s systems, infrastructure, and code are planned, reviewed, tested, and approved before reaching production — reducing the risk of outages, security regressions, and compliance failures introduced by uncontrolled changes.

---

## Scope

Applies to all changes to:
- Production application code and configuration
- Infrastructure (IaC, Terraform, CloudFormation)
- CI/CD pipeline configuration
- Security controls and policies (OPA rules, security groups, WAF rules)
- Database schema and stored procedures
- Third-party integrations and API contracts
- AI model versions and MCP server configuration (Phase 4)

---

## Change Types

| Type | Definition | Approval required | Examples |
|------|-----------|------------------|---------|
| **Standard** | Pre-approved, low-risk, well-understood change with documented procedure | Automated via pipeline | Dependency patch, config flag change, content update |
| **Normal** | Planned change requiring review and approval | Peer review + Engineering Lead | New feature, schema migration, new integration, security control change |
| **Emergency** | Urgent change required to restore service or contain an active incident | Incident Commander + Engineering Lead (post-facto documentation) | Hotfix for P0 vulnerability, security incident response |

---

## Normal Change Process

### 1. Request

All normal changes are submitted as a pull request (PR) in GitHub with:
- Description of the change and business justification
- Impact assessment (what systems are affected, estimated downtime if any)
- Rollback plan
- Test evidence (unit tests, staging validation, DAST if applicable)
- Security checklist (from the SDLC Security Guardrails PR template)

### 2. Review

| Change scope | Required reviewers |
|-------------|-------------------|
| Application code | Minimum 1 peer + Engineering Lead for security-sensitive changes |
| Infrastructure (Terraform) | Security Engineering required |
| Security controls (OPA, WAF, security groups) | Security Engineering required |
| CI/CD pipeline | Security Engineering required |
| Database schema | Engineering Lead + DBA (or equivalent) |
| AI model version or MCP config | AI Governance Lead + Security Engineering |

Reviewers verify:
- Code correctness and test coverage
- No secrets or credentials introduced
- Security checklist items addressed
- Rollback plan is viable
- Compliance implications (data handling, logging, auth changes)

### 3. Testing

| Environment | Testing required |
|-------------|----------------|
| Development | Unit tests pass; SAST clean |
| Staging | Integration tests pass; DAST scan clean; manual validation for high-impact changes |
| Production | Canary/blue-green deployment preferred for significant changes; rollback plan confirmed |

P0/P1 security findings in SAST or DAST block the PR — changes must not merge until findings are resolved.

### 4. Approval

| Change risk level | Approver |
|------------------|---------|
| Low risk | 1 peer reviewer |
| Medium risk (new features, integration changes) | Engineering Lead |
| High risk (security control changes, auth, encryption) | Engineering Lead + Security Engineering |
| Critical risk (RLS policy, production DB schema, IAM) | Engineering Lead + Security Engineering + CISO sign-off |

### 5. Deployment

- All production deployments go through the CI/CD pipeline — no direct console edits
- OPA/checkov validates IaC changes before deployment
- Deployments are staged: staging → canary → production
- Rollback plan is confirmed and tested before go-live for High/Critical changes

### 6. Post-Change Review

Within 24 hours of a high-risk deployment:
- Confirm monitoring shows no unexpected behaviour
- Verify rollback capability is still intact
- Update documentation if the change modifies architecture or behaviour

---

## Emergency Change Process

Emergency changes may bypass normal review gates to restore service or contain a security incident.

1. **Declare emergency** — Incident Commander authorises the emergency change
2. **Minimum viable review** — at least one other engineer reviews the change before deployment (verbal approval is acceptable in a live P0 incident)
3. **Deploy** — change is applied as quickly as possible
4. **Document within 4 hours** — full PR is created with change description, rationale, and impact
5. **Retrospective** — post-incident review assesses whether the emergency change introduced any new risk and whether the standard process should be updated

Emergency changes are flagged in the change log for audit purposes.

---

## Change Freeze Windows

Change freezes may be declared by the Engineering Lead or CISO during:
- Major compliance audit periods (SOC 2, ISO 27001 — typically 2 weeks before audit start)
- Peak business periods (if applicable)
- Major system migrations

During a change freeze, only emergency changes and pre-approved standard changes are permitted.

---

## AI Model and MCP Server Changes

Changes to AI model versions, agent configuration, or MCP server tool definitions require additional controls:

| Change | Additional requirement |
|--------|----------------------|
| AI model version upgrade | AI Governance Lead sign-off; new model version tested against VSRM auto-triage scenarios in staging |
| New MCP tool added | Security Engineering threat model for new tool; rate limiting configured before deployment |
| Change to AI agent decision logic | AI Governance Lead review; audit trail confirmed for new decision path |
| Model rollback | Treated as emergency change; AI decision logs reviewed for decisions made during affected period |

---

## Change Log

All changes to production are logged:
- GitHub commit history and PR audit trail (indefinite retention)
- CloudTrail (API-level infrastructure changes)
- Deployment logs in CI/CD pipeline (2-year retention)

The change log is available to auditors and reviewed during SOC 2 and ISO 27001 audits as evidence of CC8.1 compliance.

---

## Metrics

| Metric | Target |
|--------|--------|
| Changes deployed without PR review | 0 |
| Emergency changes without post-hoc documentation | 0 |
| High-risk changes without Security Engineering approval | 0 |
| P0/P1 SAST findings merged to production | 0 |
| Rollback plan present on all High/Critical changes | 100% |

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [SDLC Security Guardrails](./SDLC-SECURITY-GUARDRAILS.md)
- [PDLC Security Guardrails](./PDLC-SECURITY-GUARDRAILS.md)
- [Incident Response Policy](./INCIDENT-RESPONSE-POLICY.md)
- [Cloud Security Policy](./CLOUD-SECURITY-POLICY.md)
