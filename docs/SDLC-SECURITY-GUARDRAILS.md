# SDLC Security Guardrails

**Program:** Resilience Ops GRC Platform  
**Owner:** Security Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** SOC 2 CC8.1, ISO 27001 A.8.25–A.8.29, NIST SSDF, EU AI Act Art. 9

---

## Purpose

This document defines the mandatory security controls embedded into the Software Development Lifecycle (SDLC). Controls are shift-left by design — vulnerabilities are detected and resolved at the cheapest point in the pipeline, before they reach production.

---

## Guardrail Map by Phase

### Phase 1: Plan

| Control | Activity | Owner | Gate |
|---|---|---|---|
| Threat Modeling | STRIDE analysis for new features and integrations | Security Engineering | Required before architecture sign-off |
| Data Classification | Identify data types handled (PII, secrets, AI training data) | Engineering Lead | Required in design ticket |
| Compliance Scoping | Determine applicable frameworks (SOC 2, ISO 27001, EU AI Act) | GRC | Required for features touching regulated data |
| Attack Surface Review | Review new endpoints, auth changes, third-party integrations | Security Engineering | Required for architecture review |

**Vulnerability Detection Methods:**
- Threat model workshops (STRIDE, LINDDUN for privacy)
- Architecture Threat Review (ATR) checklist
- Data flow diagrams reviewed against trust boundaries

---

### Phase 2: Develop

| Control | Activity | Tool | Enforcement |
|---|---|---|---|
| Secrets Scanning | Block commits containing API keys, tokens, credentials | `detect-secrets`, `trufflehog` | Pre-commit hook (blocking) |
| SAST | Static analysis for injection flaws, insecure patterns | `semgrep`, `bandit` (Python), `eslint-security` (JS) | Pre-commit + CI gate |
| Dependency Review | Flag known-vulnerable packages (CVE/GHSA match) | `npm audit`, `pip-audit`, `dependabot` | CI gate (fail on critical/high) |
| License Compliance | Block GPL/copyleft in proprietary services | `license-checker` | CI gate |
| IaC Scanning | Detect misconfigured cloud resources before deploy | `tfsec`, `checkov` | CI gate on Terraform/CloudFormation changes |
| Code Review | Peer review with security checklist | GitHub PR review | Required: 1 approver minimum |

**Vulnerability Detection Methods:**
- SAST findings surfaced inline in PR via GitHub Checks
- `dependabot` alerts auto-opened as issues
- Pre-commit hooks block secrets from entering version control

**Developer Checklist (PR Template):**
```
- [ ] No secrets or credentials in code or config files
- [ ] Input validation present for all user-supplied data
- [ ] SQL queries use parameterized statements / ORM
- [ ] Auth checks applied to all new endpoints
- [ ] New dependencies reviewed for known CVEs
- [ ] Logging does not emit PII or sensitive values
- [ ] AI model inputs/outputs validated and logged (if applicable)
```

---

### Phase 3: Build / CI

| Control | Activity | Tool | Enforcement |
|---|---|---|---|
| Container Image Scanning | Scan base images and layers for OS/package CVEs | `trivy`, `grype` | CI gate (fail on critical) |
| SBOM Generation | Generate Software Bill of Materials for every build | `syft` | Automated on merge to main |
| DAST (Dynamic) | Run automated attack probes against staging API | `OWASP ZAP`, `nuclei` | CI pipeline on staging deploy |
| Artifact Signing | Sign build artifacts to verify provenance | `cosign` (Sigstore) | Required before production promotion |
| Secret Rotation Check | Verify no long-lived credentials in environment config | Custom policy check | CI gate |

**Vulnerability Detection Methods:**
- Container scan results published as CI annotations
- SBOM diff alerts when new CVE-matched components appear
- DAST report auto-opened as issues when severity >= High

---

### Phase 4: Deploy

| Control | Activity | Tool | Enforcement |
|---|---|---|---|
| Infrastructure Policy Enforcement | Enforce approved resource types, regions, network ACLs | AWS SCPs, OPA/Gatekeeper | Deployment gate (blocking) |
| Secrets Management | Inject secrets via vault at runtime, not baked into images | AWS Secrets Manager / HashiCorp Vault | Required for all credential types |
| Network Segmentation Review | Validate new services follow least-privilege network rules | VPC security group review | Required for new service deploys |
| Rollback Readiness | Confirm rollback plan exists and tested before go-live | Deployment checklist | Required for production deploys |

---

### Phase 5: Operate / Maintain

| Control | Activity | Tool | Enforcement |
|---|---|---|---|
| Continuous Vuln Scanning | Ongoing scan of running workloads for new CVEs | `AWS Inspector`, `Qualys`, `Wiz` | Automated — alerts to VSRM |
| Patch SLA Enforcement | P0 patch within 24h, P1 within 7d, P2 within 30d | VSRM SLA tracker | Dashboard KRI |
| Dependency Update Automation | Auto-PR for patch/minor version bumps | `dependabot`, `renovate` | Weekly cadence |
| Incident Response Integration | Confirmed exploitable CVEs trigger IR process | VSRM + incident workflow | Automatic on P0 |
| SBOM Monitoring | Alert when new CVEs match components in production SBOM | `grype` continuous mode | Daily scan |

---

## Severity-to-SLA Matrix

| Severity | CVSS Range | Patch SLA | Escalation |
|---|---|---|---|
| P0 Critical | 9.0–10.0 | 24 hours | CISO + Engineering VP |
| P1 High | 7.0–8.9 | 7 days | Security Lead |
| P2 Medium | 4.0–6.9 | 30 days | Engineering Lead |
| P3 Low | 0.1–3.9 | 90 days | Engineering backlog |
| P4 Info | 0.0 | Best effort | Backlog |

---

## AI/ML Specific Controls

For features involving AI models, LLMs, or ML pipelines, the following additional controls apply per EU AI Act Article 9 and emerging NIST AI RMF guidance:

| Control | Requirement |
|---|---|
| Training Data Provenance | Document data sources, licensing, and bias review |
| Model Input Validation | Sanitize and bound-check all inputs to AI inference endpoints |
| Output Filtering | Implement content filtering for AI-generated outputs |
| Prompt Injection Testing | Include prompt injection scenarios in DAST test suite |
| Model Version Pinning | Pin model versions in SBOM; review on every update |
| Explainability Logging | Log model inputs/outputs for audit and incident reconstruction |
| Risk Classification | Classify AI feature risk tier per EU AI Act Annex III |

---

## Evidence and Audit Trail

All gate outcomes are recorded for compliance evidence:

| Evidence Artifact | Storage Location | Retention |
|---|---|---|
| SAST scan results | CI pipeline artifacts | 2 years |
| Dependency audit logs | CI pipeline artifacts | 2 years |
| Container scan reports | Artifact registry | 2 years |
| SBOM files | Artifact registry + S3 | 5 years |
| DAST reports | Security findings repo | 2 years |
| PR review records | GitHub | Indefinite |
| Threat model documents | `docs/threat-models/` | Indefinite |

---

## Metrics and KPIs

| Metric | Target | Current Tracking |
|---|---|---|
| Mean Time to Remediate (P0) | < 24 hours | VSRM Dashboard |
| Mean Time to Remediate (P1) | < 7 days | VSRM Dashboard |
| % PRs with security review | 100% | GitHub Insights |
| Open critical CVEs in production | 0 | VSRM Dashboard |
| SBOM coverage | 100% of production images | CI pipeline |
| SAST gate pass rate | > 95% first-pass | CI metrics |

---

## Related Documents

- [PDLC Security Guardrails](./PDLC-SECURITY-GUARDRAILS.md)
- [Vulnerability Management Program](./VULNERABILITY-MANAGEMENT-PROGRAM.md)
- [Threat Model: Docker Supply Chain](./THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md)
- [Risk Methodology](./RISK-METHODOLOGY.md)
- [Architecture Overview](./ARCHITECTURE.md)
