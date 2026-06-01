# AWS Deployment Architecture

## Overview

This dashboard runs on AWS using managed services:

- RDS PostgreSQL (data layer)
- ECS Fargate (React frontend)
- Lambda + EventBridge (integrations)
- Secrets Manager (credentials)
- CloudWatch (monitoring)

---

## Architecture Diagram

```
Internet
   │
   ▼
CloudFront (CDN + WAF)
   │
   ▼
ALB (Application Load Balancer)
   │
   ├──► ECS Fargate — Dashboard (React SPA via Nginx)
   │
   └──► ECS Fargate — API Service (Node.js)
            │
            ├──► RDS PostgreSQL (private subnet)
            │       ├── controls
            │       ├── vulnerabilities
            │       ├── incidents
            │       ├── policies
            │       ├── vendors
            │       └── risks
            │
            └──► Lambda adapters (EventBridge-triggered)
                    ├── jira-adapter       (every 4 hours)
                    ├── qualys-adapter     (daily)
                    └── splunk-adapter     (daily)

Secrets Manager ──► Lambda / ECS (IAM role injection)
CloudWatch      ──► Logs, Metrics, Alarms (all services)
```

---

## Services Breakdown

### 1. RDS PostgreSQL

- **Database**: PostgreSQL 14+
- **Instance class**: `db.t4g.small` (dev), `db.t4g.large` (prod)
- **Multi-AZ**: Enabled for high availability in production
- **Automated backups**: 7-day retention
- **Credentials**: Stored and rotated via Secrets Manager

### 2. ECS Fargate

- **Task**: React SPA served in a Docker container via Nginx
- **CPU**: 0.25 vCPU (dev), 0.5–1 vCPU (prod)
- **Memory**: 512 MB (dev), 1–2 GB (prod)
- **Auto-scaling**: Based on CloudWatch CPU and memory metrics

### 3. Lambda Functions

| Function | Trigger | Schedule |
|---|---|---|
| `jira-adapter` | EventBridge | Every 4 hours |
| `qualys-adapter` | EventBridge | Daily |
| `splunk-adapter` | EventBridge | Daily |

- Runtime: Node.js 20
- Secrets injected at runtime via IAM role + Secrets Manager

### 4. Secrets Manager

| Secret | Rotation |
|---|---|
| Jira API key | 90 days |
| Qualys API key | 90 days |
| Splunk API key | 90 days |
| RDS master password | Automated via RDS rotation |

- Access granted via IAM roles — no hardcoded secrets in code or config

### 5. CloudWatch

- **Logs**: All ECS tasks and Lambda functions ship logs here
- **Metrics**: CPU, memory, invocation count, error rate
- **Alarms**: SNS notifications on Lambda errors, ECS failures, RDS CPU > 80%

---

## Security

- VPC segmentation — RDS in private subnet, no public endpoint
- IAM least-privilege policies per service
- Row-level security (RLS) enforced in PostgreSQL
- Okta SAML for user authentication
- Secrets Manager for all credential storage — no secrets in environment files or CLI args

---

## Cost Estimation

| Service | Dev (monthly est.) | Prod (monthly est.) |
|---|---|---|
| RDS `db.t4g.small` | ~$25 | — |
| RDS `db.t4g.large` | — | ~$100 |
| ECS Fargate (0.25 vCPU / 512 MB) | ~$10 | — |
| ECS Fargate (1 vCPU / 2 GB) | — | ~$70 |
| Lambda (3 functions, low frequency) | <$1 | <$5 |
| Secrets Manager (4 secrets) | ~$2 | ~$2 |
| CloudWatch (logs + metrics) | ~$5 | ~$15 |
| **Total estimate** | **~$43/mo** | **~$192/mo** |

Costs vary with data volume, request rate, and log retention settings.

---

## Deployment Steps

1. Provision RDS with Terraform (apply VPC, subnets, security groups first)
2. Create ECS task definition (reference ECR image, inject secrets via IAM role)
3. Deploy Lambda functions (zip + upload or via SAM/Terraform)
4. Configure EventBridge rules (schedule expressions per adapter)
5. Set up Okta SAML (configure app integration, map user attributes)
6. Verify security groups (RDS only reachable from ECS/Lambda SGs) and RLS policies

---

## Monitoring & Alerts

- **CloudWatch Dashboards**: ECS task health, Lambda invocation metrics, RDS connections
- **SNS Alerts**: Triggered on Lambda errors, ECS task failures, RDS CPU threshold breaches
- **Lambda error tracking**: CloudWatch Logs Insights queries on ERROR log lines
- **RDS Performance Insights**: Query-level latency and wait event monitoring
