# Supply Chain Security: Anti-Malware Enforcement Policy (npm based)

**Program:** Resilience Ops GRC Platform  
**Owner:** Security Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Enforcement:** Quarterly security audits  
**Frameworks:** SOC 2 CC8.1, ISO 27001 A.8.25, NIST SSDF, SLSA Level 2

This document outlines the enforceable controls required to protect the organization from automated supply chain attacks and credential-stealing worms (e.g., Mini Shai-Hulud).

---

## 1. JFrog Curation: The First Line of Defense

JFrog Curation acts as an automated gateway at the edge of the network, intercepting requests before they ever enter internal repositories or developer environments.

### Malicious Package Blocking

- **Enforcement:** Enable the "Malicious Package" condition. Any version identified as malware by JFrog Security Research (including known Shai-Hulud carriers) is blocked at the perimeter.

### New Package Creation Block (14-Day Rule)

- **Enforcement:** Apply a mandatory **14-day block on brand-new packages**.
- **Purpose:** Prevents "Typosquatting" and "Brandjacking" (newly created malicious placeholder packages that mimic legitimate ones before the community can flag them).

### Cooldown Policy (The 12-Hour Version Rule)

- **Enforcement:** Apply a mandatory **12-hour cooldown** for new versions of existing trusted packages.
- **Purpose:** Allows the community time to flag compromised updates (hijacked maintainer accounts) before they reach our environment.

### Explicit Block Strategy (No Silent Fallbacks)

- **Enforcement:** Compliant Version Selection (CVS) must be **DISABLED** (TBD).
- **Rationale:** The system must fail and provide an explicit error. Silent downgrades (CVS) can cause unexpected application behavior. Developers must make an informed decision to wait for the cooldown or use an older known-good version.

---

### Configuration as Code (JFrog Curation)

Curation policies are managed via Terraform (`xray_curation_policy`) to ensure global consistency across all regions.

```hcl
# Policy for blocking brand-new, untrusted packages (14-day window)
resource "xray_curation_policy" "new_package_block" {
  name          = "block-new-untrusted-packages"
  policy_action = "block"
  scope         = "specific_repos"
  repo_include  = ["npm-remote-proxy"]

  condition {
    type = "catalog"
    criteria {
      package_creation_age_days = 14
    }
  }
}

# Policy for version cooldown of existing packages (12-hour window)
resource "xray_curation_policy" "version_cooldown" {
  name          = "enforce-12h-version-cooldown"
  policy_action = "block"
  scope         = "specific_repos"
  repo_include  = ["npm-remote-proxy"]

  condition {
    type = "catalog"
    criteria {
      min_age_days     = 0.5   # 12-hour version cooldown (0.5 days)
      block_malicious  = true
    }
  }

  compliances {
    auto_version_selection = false  # Forces explicit failure
  }
}
```

---

## 2. Infrastructure & Buildkite Hardening

All build environments must be isolated from the public internet and forced to use JFrog Artifactory.

### Network-Level Registry Lockdown (Transparent Egress Proxy)

- **Enforcement:** Buildkite agents must reside in a private VPC with **no direct route** to the public internet.
- **Enforcement:** Outbound traffic is intercepted by a **Transparent Proxy (like Squid)** which only allows connections to the internal JFrog Endpoint and a limited domain allowlist (e.g., Buildkite, ReportPortal). Alternatively implement AWS Firewall outbound rules.
- **Result:** Commands like `npm install --registry=https://registry.npmjs.org` will time out at the network layer.

### Buildkite Agent Isolation

- **Enforcement:** Use the environment hook in Buildkite agents to strictly set the registry URL:

```bash
export NPM_CONFIG_REGISTRY="https://jfrog.company.com/artifactory/api/npm/npm-virtual/"
```

### CI/CD Pipeline Hardening

- **Enforcement:** All central CI templates must use `npm ci --ignore-scripts` to prevent pre/post-install malware execution in the build environment.

---

## 3. Dependency & Identity Governance

### Lockfile Integrity

- **Enforcement:** CI builds must fail if `package-lock.json` is out of sync with `package.json`.

### Zero-Static-Secrets (JFrog OIDC)

- **Enforcement:** All CI/CD runners must use **JFrog OIDC Integration**. Static `NPM_TOKEN` secrets are strictly prohibited.
- **Rationale:** OIDC provides short-lived (ephemeral) tokens, making stolen credentials useless to an attacker once the build job completes.

### Exact Versioning

- **Enforcement:** CI linting must verify `save-exact=true` is present in the repository's `.npmrc`.
- **Enforcement:** CI linting must block any Pull Request that introduces floating versions (`^` or `~`) in `package.json`.
- **Recommendation:** Use automated behavioral scanners (**Socket** or **Aikido**) to analyze pinned versions during the PR phase.

---

## 4. Local Development & Employee Laptop Configuration

### Global NPM Configuration

- **Enforcement:** `npm config set ignore-scripts true --global` pushed via MDM (Jamf/InTune).

### Granular Script Allowlisting

- **Recommendation:** Use `@lavamoat/allow-scripts` for projects that require specific native binaries (e.g., `esbuild`) to allow only specific, verified scripts to run.

---

## Recommendations for Developers

- **Self-Service Auditing:** Use `jf curation-audit` to identify why a package was blocked.
- **Waiver Requests:** If a new package/version is mission-critical and blocked by the 14-day or 12-hour rule, submit a **Security Waiver** ticket to the SSC team for manual audit.
- **Manual Rebuilds:** If a tool fails because scripts are disabled, use `npm rebuild <package-name>` after manually inspecting the package code.

> **Enforcement Notice:** Compliance is verified during quarterly security audits.

---

## Compliance Mapping

| Control | Framework | Requirement |
|---|---|---|
| JFrog Curation malicious block | SOC 2 CC8.1 | Change management — only approved software deployed |
| 14-day new package block | NIST SSDF PW.4 | Reuse existing, well-secured software |
| Lockfile integrity | ISO 27001 A.8.25 | Secure development lifecycle |
| `npm ci --ignore-scripts` | SLSA Level 2 | Build integrity — scripted, reproducible build |
| OIDC zero-static-secrets | ISO 27001 A.9.4 | Secure log-on procedures, access control |
| Exact versioning enforcement | NIST SSDF PW.7 | Review and/or analyze human-readable code |
| Egress proxy lockdown | ISO 27001 A.8.20 | Network security — controlled outbound access |

---

## Related Documents

- [SDLC-SECURITY-GUARDRAILS.md](./SDLC-SECURITY-GUARDRAILS.md) — full pipeline phase controls
- [VULNERABILITY-MANAGEMENT-PROGRAM.md](./VULNERABILITY-MANAGEMENT-PROGRAM.md) — VMP with SCA tooling stack
- [THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md](./THREAT-MODEL-DOCKER-SUPPLY-CHAIN.md) — STRIDE analysis including dependency confusion (TB-2)
- [DOCKER-INTEGRATION-ROADMAP.md](./DOCKER-INTEGRATION-ROADMAP.md) — container supply chain roadmap
