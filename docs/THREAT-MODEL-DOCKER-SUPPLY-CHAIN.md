# Threat Model: Docker Container Supply Chain

**Scope:** Docker image build, registry, and runtime pipeline
**Method:** STRIDE per component
**Author:** Chris Cutts
**Version:** v1.0
**Last reviewed:** June 2026
**Related documents:**
- [DOCKER-INTEGRATION-ROADMAP.md](DOCKER-INTEGRATION-ROADMAP.md)
- [RISK-METHODOLOGY.md](RISK-METHODOLOGY.md)
- [../deployment/AWS_DEPLOYMENT.md](../deployment/AWS_DEPLOYMENT.md)

---

## System overview

The container supply chain covers five stages from source code to running workload. Each stage introduces distinct trust boundaries and attack surfaces.

```
[Developer] --> [Source Repo] --> [Build Cloud] --> [Registry] --> [Orchestrator] --> [Runtime]
                                        |                |                               |
                                   Signs image     Stores SBOM                    Falco / Snyk
                                   Generates SBOM  Verifies sig                   monitor here
```

### Trust boundaries

| Boundary | Description |
|----------|-------------|
| TB-1 | Developer workstation to source repository |
| TB-2 | Source repository to Build Cloud |
| TB-3 | Build Cloud to Registry |
| TB-4 | Registry to Orchestrator (ECS / Kubernetes) |
| TB-5 | Orchestrator to running container |
| TB-6 | External base image registries (Docker Hub, GHCR) to Build Cloud |

---

## STRIDE analysis by component

### Component 1: Source code repository

| STRIDE | Threat | Example | Mitigations |
|--------|--------|---------|-------------|
| **S** Spoofing | Attacker commits malicious code under a legitimate developer identity | Stolen PAT used to push to main | Branch protection, required PR reviews, signed commits (Gittuf / SSH signing) |
| **T** Tampering | Malicious dependency injected via compromised `package.json` or `requirements.txt` | Dependency confusion attack replaces internal package | Private registry with `--prefer-offline`, lockfile integrity checks, Snyk dependency scan in CI |
| **R** Repudiation | No record of who approved a change | Force-push rewrites history | Protect main from force-push, immutable audit log in GitHub, CODEOWNERS enforcement |
| **I** Info disclosure | Secrets committed to repo | API key in `.env` file committed | Pre-commit hooks (gitleaks), GitHub secret scanning, `.gitignore` enforcement |
| **D** DoS | CI pipeline overwhelmed by large PR volume | Automated PR spam exhausts build minutes | Rate limiting on PR creation, build quotas per branch |
| **E** Elevation of privilege | CI/CD pipeline token with write scope to registry | Leaked `DOCKER_SCOUT_TOKEN` allows image push | Least-privilege tokens, short-lived OIDC tokens, Secrets Manager rotation |

**Linked risks:** RSK-002 (AI model training data exfiltration), RSK-009 (prompt injection)
**UCF controls:** UCF.02.01 (Data Encryption), UCF.08.02 (Change Management)

---

### Component 2: Build Cloud (Docker Build Cloud)

| STRIDE | Threat | Example | Mitigations |
|--------|--------|---------|-------------|
| **S** Spoofing | Attacker injects a malicious base image by mimicking an official image name | `alpine:3.18` pulled from attacker-controlled registry | Pin base images by digest (`FROM alpine@sha256:...`), Docker Scout base image verification |
| **T** Tampering | Build cache poisoned to produce a different image from the same Dockerfile | Shared cache layer contains backdoor | Use isolated build caches per project, verify image digest post-build before push |
| **R** Repudiation | No provenance linking build output to source commit | "We don't know which commit this image came from" | SLSA provenance attestation via Build Cloud, link image digest to git commit SHA in SBOM |
| **I** Info disclosure | Build logs contain secrets passed as build arguments | `--build-arg API_KEY=...` exposed in layer metadata | Use BuildKit secrets (`--secret`), never pass secrets as ARG, scan image layers for leaked secrets |
| **D** DoS | Build Cloud unavailable blocks all deployments | Provider outage halts release pipeline | Fallback to local build + push with manual sign step, runbook documented |
| **E** Elevation of privilege | Build process runs as root inside build container, escapes to host | Container escape during `docker build` | Rootless BuildKit, no privileged build containers, BuildKit sandbox hardening |

**Linked risks:** RSK-003 (Critical vulnerabilities unpatched), RSK-009 (Prompt injection in public AI endpoint)
**UCF controls:** UCF.03.01 (Vulnerability Scanning), UCF.08.02 (Change Management)

---

### Component 3: Container registry (Docker Registry / ECR)

| STRIDE | Threat | Example | Mitigations |
|--------|--------|---------|-------------|
| **S** Spoofing | Attacker pushes a malicious image under a legitimate tag | `myorg/api:latest` overwritten with backdoored image | Immutable tags in ECR, image signing (Docker Content Trust / Sigstore Cosign), signature verification at pull |
| **T** Tampering | Image layers modified after push | Registry storage tampered to swap a layer | Enforce `latest` tag immutability, verify image digest at deploy time, Scout re-scan on pull |
| **R** Repudiation | No record of who pushed an image | Image pushed anonymously, no audit trail | Registry audit logs (ECR CloudTrail), push events logged with IAM identity, SBOM attestation links push to build identity |
| **I** Info disclosure | Private images exposed | Public ECR repo accidentally configured | ECR private by default, IAM policy review, no public repos in production account |
| **D** DoS | Registry unavailable blocks all deployments | ECR outage prevents image pull during scale-out | Multi-region ECR replication, pull-through cache for base images, ECS task retry policy |
| **E** Elevation of privilege | Registry credentials allow push to any repo | Overly broad ECR `*` policy on push role | Per-repo push permissions, separate read and write roles, OIDC-based short-lived tokens for CI |

**Linked risks:** RSK-004 (OpenAI vendor - no contract or DPA, analog for registry vendors)
**UCF controls:** UCF.01.02 (Privileged Access Management), UCF.02.01 (Data Encryption at Rest)

---

### Component 4: Orchestrator (ECS Fargate / Kubernetes)

| STRIDE | Threat | Example | Mitigations |
|--------|--------|---------|-------------|
| **S** Spoofing | Attacker deploys an unsigned image by bypassing admission control | Direct `kubectl apply` with unsigned image digest | OPA admission controller blocks unsigned images, ECS task definition requires signed image digest, deploy pipeline enforces Scout scan pass |
| **T** Tampering | Task definition modified to mount host path or add dangerous capability | ECS task definition edited to add `SYS_PTRACE` | IaC-managed task definitions only, no console edits in production, OPA policy on ECS task definition updates |
| **R** Repudiation | No record of what image ran in production at a given time | "We can't tell which image version was running at incident time" | ECS task metadata logged to CloudWatch, image digest in CloudTrail, full audit trail from registry push to container start |
| **I** Info disclosure | Container reads host secrets from mounted volumes or env vars | Secrets injected as plain-text env vars accessible to any process in container | AWS Secrets Manager injection (not env vars), read-only filesystems, no host volume mounts in production |
| **D** DoS | Malicious image consumes all node resources | CPU/memory bomb in compromised image | ECS task CPU/memory hard limits, CloudWatch alarms on resource exhaustion, auto-scaling with circuit breaker |
| **E** Elevation of privilege | Container breakout to host | Exploited CVE allows escape from Fargate container | Fargate provides hypervisor-level isolation, no privileged containers, no `--pid=host`, regular CVE scanning via Scout |

**Linked risks:** RSK-001 (Privileged accounts without MFA), RSK-003 (Critical vulnerabilities unpatched)
**UCF controls:** UCF.01.02 (PAM), UCF.05.01 (Network Segmentation), UCF.03.02 (Patch Management)

---

### Component 5: Runtime (running containers)

| STRIDE | Threat | Example | Mitigations |
|--------|--------|---------|-------------|
| **S** Spoofing | Process inside container impersonates another service | Compromised container calls internal API as trusted service | mTLS between services, service mesh identity (Istio / App Mesh), network policy restricts east-west traffic |
| **T** Tampering | Attacker modifies container filesystem after start | Webshell written to `/tmp`, persists across requests | Read-only root filesystem, `tmpfs` for writable paths, Falco detects unexpected file writes |
| **R** Repudiation | Malicious activity in container leaves no trace | Attacker exfiltrates data, clears app logs | Falco syscall audit log, CloudWatch log agent sidecar, immutable log stream, container logs shipped before container termination |
| **I** Info disclosure | Application logs contain PII or secrets | Stack trace logs API key or customer data | Structured logging with field scrubbing, log scanning in pipeline, GDPR Art.32 / UCF.02.01 |
| **D** DoS | Container exploited to exhaust network bandwidth | Compromised container used for DDoS relay | VPC flow logs, CloudWatch anomaly detection, ECS task network bandwidth limits, Falco network anomaly rules |
| **E** Elevation of privilege | CVE in running application allows privilege escalation inside container | Log4Shell-style RCE leads to container root | Snyk/Wiz continuous runtime scanning, non-root user in Dockerfile (`USER 1000`), seccomp profile, capability drop (`--cap-drop ALL`) |

**Linked risks:** RSK-002 (AI model training data exfiltration), RSK-005 (DLP controls ineffective), RSK-007 (AI IR plan never tested)
**UCF controls:** UCF.04.01 (Incident Response), UCF.08.01 (Log Monitoring), UCF.AI.03 (AI Security Controls)

---

### Component 6: Base image supply chain (external registries)

This is the highest-risk trust boundary - external base images are the most common vector for supply chain compromise.

| STRIDE | Threat | Example | Mitigations |
|--------|--------|---------|-------------|
| **S** Spoofing | Typosquatted image pulled instead of official base | `alpline:3.18` (extra l) from attacker registry | Allowlist of approved base images, Docker Scout policy to block non-official bases, digest pinning |
| **T** Tampering | Official image tag mutated after initial pull | `ubuntu:22.04` tag updated to include backdoor | Pin by digest not tag (`FROM ubuntu@sha256:...`), Scout re-scan on every build, immutable base image cache |
| **R** Repudiation | Cannot prove which base image version was used | "We used ubuntu:22.04 but don't know which digest" | SBOM records base image digest at build time, provenance attestation |
| **I** Info disclosure | Base image contains embedded secrets from image maintainer | Private key left in a cached layer of official image | Scout scans all layers including base, secret detection in layer analysis |
| **D** DoS | Base image registry (Docker Hub) unavailable | `docker pull alpine` fails, build pipeline blocked | Mirror approved base images to private ECR, pull-through cache, build fails open with last-known-good image |
| **E** Elevation of privilege | Compromised base image grants attacker initial foothold | Backdoor in `alpine:3.18` executes on container start | Scout CVE scan + signature verification before any build, alert on base image change between builds |

**Linked risks:** RSK-003 (Critical vulnerabilities unpatched)
**Mapped to roadmap:** Phase 2 (Scout integration), Phase 3 (Registry provenance)

---

## Risk register mapping

The threats above map to the following risks in the register. Scores use the Risk Management Framework v1.0 (Likelihood x Impact, 1-25).

| Risk ID | Title | Inherent | Residual | Phase that addresses it |
|---------|-------|----------|----------|------------------------|
| RSK-SC-01 | Base image poisoning via compromised upstream tag | 20 (L4 x I5) | 8 | Phase 2 - Scout digest pinning |
| RSK-SC-02 | Unsigned image deployed to production | 16 (L4 x I4) | 4 | Phase 3 - Registry enforcement |
| RSK-SC-03 | Missing SBOM prevents incident response attribution | 12 (L3 x I4) | 4 | Phase 3 - Build Cloud SBOM |
| RSK-SC-04 | Runtime CVE undetected in running container | 20 (L4 x I5) | 6 | Phase 4 - Snyk/Wiz runtime |
| RSK-SC-05 | Container escape via unpatched kernel CVE | 15 (L3 x I5) | 5 | Phase 4 - Falco + Fargate isolation |
| RSK-SC-06 | Build cache poisoning produces backdoored image | 12 (L3 x I4) | 4 | Phase 2 - isolated build caches |
| RSK-SC-07 | Registry credentials allow unauthorized image push | 16 (L4 x I4) | 4 | Phase 3 - per-repo OIDC tokens |
| RSK-SC-08 | Secrets leaked in image layer metadata | 9 (L3 x I3) | 3 | Phase 2 - Scout layer scanning |

---

## Mitigations by phase

| Mitigation | Phase | Owner | UCF Control |
|------------|-------|-------|-------------|
| Digest pinning for all base images | 2 | Platform | UCF.03.02 |
| Docker Scout CVE scan on every build | 2 | Security | UCF.03.01 |
| Scout layer secret scanning | 2 | Security | UCF.02.01 |
| Image signing (Cosign / DCT) | 3 | Platform | UCF.08.02 |
| SBOM generation and storage | 3 | Platform | UCF.08.02 |
| Deployment block for unsigned images | 3 | Security | UCF.01.02 |
| Snyk runtime continuous scanning | 4 | Security | UCF.03.01 |
| Falco behavioral monitoring | 4 | Platform | UCF.08.01 |
| Wiz cloud + container posture (available now) | Now | Security | UCF.03.01 |
| Non-root containers, seccomp, cap-drop | 4 | Platform | UCF.05.01 |
| Hard enforcement rules (no CVE, no sign = blocked) | 5 | Security + Platform | UCF.01.02 |

---

## Assumptions and out of scope

**Assumptions:**
- Docker Hub official images are trusted as base sources unless Scout detects a CVE
- AWS Fargate provides adequate hypervisor-level container isolation
- Developers have no direct production access - all deployments go through the pipeline
- Secrets Manager is the authoritative store for all credentials

**Out of scope:**
- Developer workstation security (covered by endpoint protection program)
- Application-layer business logic vulnerabilities (covered by SAST/DAST in CI)
- Kubernetes cluster hardening (applicable if migrating from Fargate to EKS in a later phase)
- Third-party SaaS supply chain beyond Docker tooling (covered by TPRM module)

---

## Review cadence

| Trigger | Action |
|---------|--------|
| New Docker Scout CVE in a base image we use | Re-evaluate RSK-SC-01, RSK-SC-04 |
| New container escape CVE published | Re-evaluate RSK-SC-05, update Fargate task hardening |
| Phase completion (2, 3, 4, 5) | Reassess residual scores for mitigations delivered |
| Annually | Full STRIDE review of all components |
