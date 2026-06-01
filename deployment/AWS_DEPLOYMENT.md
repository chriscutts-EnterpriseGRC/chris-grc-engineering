# AWS Deployment

## Architecture overview

The Resilience Operations Platform runs on three core AWS services: RDS for persistent risk and compliance data, ECS for the containerised application tier, and Lambda for event-driven integration adapters.

```
Internet
   │
   ▼
CloudFront (CDN + WAF)
   │
   ▼
ALB (Application Load Balancer)
   │
   ├──► ECS Fargate — Dashboard (React, served via Nginx)
   │
   └──► ECS Fargate — API Service (Node.js)
            │
            ├──► RDS PostgreSQL (Supabase-compatible schema)
            │       ├── controls
            │       ├── vulnerabilities
            │       ├── incidents
            │       ├── policies
            │       ├── vendors
            │       └── risks
            │
            └──► Lambda adapters (event-driven, runs on schedule)
                    ├── jira-sync
                    ├── qualys-sync
                    ├── splunk-sync
                    ├── aws-security-hub-sync
                    ├── docker-scout-sync     (Phase 2)
                    ├── registry-sync         (Phase 3)
                    └── runtime-scan-sync     (Phase 4)
```

---

## Services

### RDS PostgreSQL

- **Instance**: `db.t3.medium` (production), `db.t3.micro` (staging)
- **Multi-AZ**: Enabled in production
- **Storage**: 100GB gp3, auto-scaling to 500GB
- **Backups**: Daily snapshots, 30-day retention
- **Schema**: Applied via `supabase/migrations/` — compatible with both Supabase cloud and self-hosted PostgreSQL
- **RLS**: Row Level Security enforced at database level — anon read, authenticated write

### ECS Fargate

- **Dashboard service**: React app served by Nginx, 2 tasks minimum, auto-scales to 10
- **API service**: Node.js, 2 tasks minimum, auto-scales to 20
- **Task CPU/memory**: 512 CPU / 1GB RAM (dashboard), 1024 CPU / 2GB RAM (API)
- **Networking**: Private subnets, egress via NAT gateway
- **Image registry**: Amazon ECR — images scanned by Docker Scout on push (Phase 2+)

### Lambda

Each integration adapter runs as a standalone Lambda function on a scheduled EventBridge rule.

| Function | Schedule | Source | Target table |
|----------|----------|--------|-------------|
| `jira-sync` | Every 15 min | Jira Cloud | incidents |
| `qualys-sync` | Every hour | Qualys VMDR | vulnerabilities |
| `splunk-sync` | Every 15 min | Splunk | incidents |
| `aws-security-hub-sync` | Every hour | AWS Security Hub | vulnerabilities |
| `docker-scout-sync` | On image push | Docker Scout | vulnerabilities |
| `registry-sync` | On image push | Docker Registry | controls |
| `runtime-scan-sync` | Every 5 min | Snyk / Wiz / Falco | vulnerabilities, incidents |

- **Runtime**: Node.js 20
- **Memory**: 512MB per function
- **Timeout**: 5 minutes
- **Secrets**: Stored in AWS Secrets Manager, injected at runtime via environment variables

---

## Networking

```
VPC (10.0.0.0/16)
├── Public subnets (10.0.1.0/24, 10.0.2.0/24)   - ALB, NAT gateway
└── Private subnets (10.0.10.0/24, 10.0.11.0/24) - ECS tasks, RDS, Lambda
```

- All inter-service traffic stays within the VPC
- RDS accessible only from private subnets
- Lambda functions run inside the VPC for RDS access
- Secrets never passed as CLI arguments — always via Secrets Manager or environment injection

---

## Scaling targets

| Metric | Target |
|--------|--------|
| Risks managed | Designed for 14K+ active records |
| Assessments per year | 300+ automated assessments |
| Dashboard p95 response | <200ms |
| Lambda sync latency | <60s from source event to dashboard |
| RDS connection pool | 50 max connections per service |

---

## Infrastructure as code

Infrastructure is defined in Terraform. OPA policies enforce compliance rules before `terraform apply` runs:

```
terraform plan
   └──► OPA validation (circleci-aws-opa-lab)
           ├── Encryption at rest required (UCF.02.01)
           ├── Versioning / backup enabled (UCF.09.01)
           ├── Public access blocked (UCF.05.01)
           └── Asset tagging enforced (UCF.08.02)
```

See [ARCHITECTURE.md](../docs/ARCHITECTURE.md) for the full preventive control layer.

---

## Secrets management

| Secret | Storage | Rotation |
|--------|---------|----------|
| `SUPABASE_SERVICE_ROLE_KEY` | AWS Secrets Manager | Manual, on breach |
| `JIRA_API_TOKEN` | AWS Secrets Manager | 90 days |
| `QUALYS_PASSWORD` | AWS Secrets Manager | 90 days |
| `DOCKER_SCOUT_TOKEN` | AWS Secrets Manager | 90 days |
| `SNYK_TOKEN` | AWS Secrets Manager | 90 days |
| RDS master password | AWS Secrets Manager | Automated via RDS rotation |

---

## Deployment pipeline

```
git push main
   │
   ├──► GitHub Actions: lint + test
   ├──► OPA: infrastructure policy validation
   ├──► Docker Build Cloud: build + sign + SBOM
   ├──► Docker Scout: image vulnerability scan
   ├──► ECR: push signed image
   └──► ECS: rolling deployment (zero downtime)
```

Images are blocked from deployment if Docker Scout detects a Critical CVE or if the image is unsigned. See [DOCKER-INTEGRATION-ROADMAP.md](../docs/DOCKER-INTEGRATION-ROADMAP.md) for the full enforcement model.

---

## Monitoring

- **CloudWatch**: ECS task metrics, Lambda duration/errors, RDS connections
- **ALB access logs**: All requests logged to S3
- **RDS Performance Insights**: Query-level monitoring
- **Alerts**: SNS notifications for Lambda errors, ECS task failures, RDS CPU >80%
