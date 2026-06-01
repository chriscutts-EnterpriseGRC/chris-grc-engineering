# Metrics

Key metrics tracked across the Resilience Operations Dashboard. Risk rating bands, SLAs, and review frequencies align with [RISK-METHODOLOGY.md](RISK-METHODOLOGY.md).

---

## Risk metrics

### Risk score distribution

| Band | Score | Target |
|------|-------|--------|
| Critical | 25 | 0 open — immediate escalation |
| Severe | 16–24 | <5% of total register |
| High | 10–15 | <15% of total register |
| Moderate | 5–9 | Managed through normal cadence |
| Low | 1–4 | Accepted or monitored |

### Response Decision SLA compliance

Percentage of risks where a treatment decision is documented within the required window:

| Band | SLA | Target |
|------|-----|--------|
| Critical | 7 days | 100% |
| Severe | 30 days | 100% |
| High | 60 days | >95% |
| Moderate | 90 days | >90% |
| Low | 180 days | >85% |

### Risk exposure trend

- **Definition**: Change in total residual risk score over time
- **Measurement**: Sum of all residual scores month-over-month
- **Target**: Decreasing trend, >10% reduction quarterly

### Residual vs. inherent gap

- **Definition**: Average reduction between inherent and residual scores
- **Measurement**: `(inherentScore - residualScore) / inherentScore × 100`
- **Target**: >40% reduction — indicates controls are materially effective

---

## Control metrics

### UCF control effectiveness rate

- **Definition**: Percentage of controls rated effective or partial
- **Measurement**: `(effective + partial × 0.5) / total × 100`
- **Target**: >80% overall; >70% per team
- **Frequency**: Monthly (drives team health score and Scorecard levels)

### Control gap by category

Tracked per domain — Access Control, Data Protection, Vulnerability Mgmt, etc. — visible on the Overview page. Target: zero domains with >50% gap rate.

### Evidence freshness

- **Definition**: Percentage of linked evidence not past expiry date
- **Measurement**: `current evidence / total evidence × 100`
- **Target**: >95%
- **Frequency**: Weekly (Evidence Locker module)

---

## Vulnerability metrics

### Vulnerability remediation SLA

| Severity | SLA | Target |
|----------|-----|--------|
| Critical | 7 days | 100% |
| Severe | 14 days | 100% |
| High | 30 days | >95% |
| Moderate | 60 days | >90% |
| Low | 90 days | >85% |

### Mean time to patch (MTTP)

- **Measurement**: Days from discovery to Patched status
- **Target**: <14 days for Critical/Severe

### Average CVSS score (open vulnerabilities)

- **Target**: Trending down month-over-month
- **Dashboard**: Vulnerabilities module KPI strip

---

## Incident metrics

### Mean time to detect (MTTD)

- **Target**: <4 hours for Critical/Severe incidents

### Mean time to respond (MTTR)

- **Target**: <8 hours for Critical, <24 hours for Severe
- **Dashboard**: Incidents module — displayed per incident and as a KPI average

### AI-related incident rate

- **Measurement**: AI incidents as % of total open incidents
- **Target**: Decreasing as AI controls mature (current: AI controls 0% tested)

---

## Compliance metrics

### Framework coverage

| Framework | Current | Target |
|-----------|---------|--------|
| SOC 2 Type II | 94% | >95% |
| ISO 27001 | 87% | >90% |
| GDPR | 91% | >95% |
| NIST CSF | 88% | >90% |
| PCI DSS | 83% | >90% |
| HIPAA | 78% | >85% |
| EU AI Act | 22% | >80% by Aug 2026 |
| ISO/IEC 42001 | 18% | >70% by Dec 2026 |

### Audit readiness score

- **Measurement**: % of controls with current evidence and effective status
- **Target**: >90% before scheduled audits

### Open audit findings

- **Target**: Zero findings past due date; Critical/Severe findings closed within 30 days

---

## Key Risk Indicators (KRIs)

Per the Risk Management Framework v1.0 §9:

| KRI | Description | Monitoring frequency |
|-----|-------------|---------------------|
| Risk Exposure Trends | Open risks by severity over time | Monthly |
| Treatment Timeliness | % risks treated within SLA | Monthly |
| Risk Acceptance Rate | % accepted vs. mitigated | Quarterly |
| Third-Party Risk Exposure | Vendor risks by impact level | Monthly |
| Regulatory Compliance Risks | Risks linked to non-compliance | Monthly |
| Unassigned Risks | Risks lacking an owner | Weekly |
| Open Critical / Severe Risks | Current critical exposure | Monthly |
| Overdue Risk Actions | Treatment plans past due | Weekly |

---

## Team health metrics (Scorecard)

Per-team health scores drive the gamification layer. Thresholds:

| Level | Health % | Target for all teams |
|-------|----------|---------------------|
| Platinum | 85–100% | Program goal |
| Gold | 70–84% | Acceptable |
| Silver | 50–69% | Improvement required |
| Bronze | 0–49% | Urgent remediation |

Monthly improvement target: +5% health score per Bronze/Silver team per quarter.

---

## Risk monitoring cadence

Per Risk Management Framework v1.0 §8:

| Rating | Review frequency | Reporting |
|--------|-----------------|-----------|
| Critical | Monthly | Dashboard + report |
| Severe | Monthly | Dashboard + report |
| High | Quarterly | Dashboard + report |
| Moderate | Bi-annually | Dashboard + report |
| Low | Annually | Dashboard + report |
