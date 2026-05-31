---
name: GCP Inspector Collect
description: Query GCP for compliance-relevant configuration across IAM, Cloud Storage, audit logs, KMS, and Compute; emit findings conforming to the v1 contract.
---

# /gcp-inspector:collect

Scans a GCP project for compliance-relevant resources and configurations.

## How to run

```bash
node plugins/connectors/gcp-inspector/scripts/collect.js [options]
```

## Arguments

- `--project=<id>` — override the configured project
- `--services=<csv>` — subset of `iam,storage,logging,kms,compute` (default: all)
- `--output=<fmt>` — `silent` | `summary` (default) | `json`
- `--refresh` — ignore any cached data; re-query GCP
- `--quiet` — no stderr progress

## What it evaluates

**Project-level (IAM)**:

| SCF | Check | Severity |
|---|---|---|
| IAC-07.2 | No user accounts with primitive roles (`roles/owner`, `roles/editor`) | high |
| IAC-15.1 | Service account key rotation (< 90 days) | medium |
| IAC-15.1 | No unused service account keys | medium |
| IAC-01.2 | Organization policy service enabled | low |

**Storage (Cloud Storage)**:

| SCF | Check | Severity |
|---|---|---|
| CRY-05 | Bucket encryption (default or CMEK) | pass if any encryption; medium if only Google-managed for sensitive buckets |
| DCH-01.2 | Uniform bucket-level access enabled | medium |
| DCH-01.2 | Public access prevention enforced | critical if bucket is public |
| MON-01.2 | Bucket logging enabled | low |

**Audit logs (Logging)**:

| SCF | Check | Severity |
|---|---|---|
| MON-02 | Admin Activity logs going to a retained sink | high |
| MON-02 | Data Access logs enabled for sensitive services (Storage, IAM) | medium |
| MON-02.1 | Log sink destination is not publicly accessible | high |

**KMS**:

| SCF | Check | Severity |
|---|---|---|
| CRY-09 | All CMEK keys have rotation period ≤ 90 days | medium |

**Compute**:

| SCF | Check | Severity |
|---|---|---|
| IAC-02 | OS Login enabled at project level | medium |
| CFG-03 | Default encryption on disks (usually automatic but verified) | low |

## Output

- `~/.cache/claude-grc/findings/gcp-inspector/<run_id>.json` — array of Findings
- `~/.cache/claude-grc/runs.log` — run manifest appended
- stdout summary unless `--quiet`:

  ```
  gcp-inspector: 18 resources, 64 evaluations, 7 failing (1 critical, 3 high, 3 medium).
  ```

## Exit codes

- `0` success
- `2` credentials invalid or project inaccessible
- `3` rate-limited (GCP quota exhausted)
- `4` partial (some services inaccessible; report still written)
- `5` config missing — run setup

## Minimum IAM role

```
roles/iam.securityReviewer        # IAM policies, service accounts
roles/cloudkms.viewer             # KMS keys + rotation
roles/logging.viewer              # log sinks
roles/compute.viewer              # instance + metadata
roles/storage.objectViewer        # bucket settings
roles/resourcemanager.folderViewer  # (optional; multi-project)
```

Alternatively, `roles/viewer` covers the basics.

## Examples

```bash
# Current project, all services
/gcp-inspector:collect

# Multi-project scan
for p in prod-01 prod-02 stage-01; do
  /gcp-inspector:collect --project=$p
done

# Storage only
/gcp-inspector:collect --services=storage
```

## CI/CD usage

```bash
gcloud auth activate-service-account --key-file=sa.json
node plugins/connectors/gcp-inspector/scripts/collect.js --quiet
node plugins/grc-engineer/scripts/gap-assessment.js FedRAMP-Moderate --sources=gcp-inspector --output=sarif --quiet > gcp-gap.sarif
```
