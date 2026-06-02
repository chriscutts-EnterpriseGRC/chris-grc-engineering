# HR Security Policy

**Program:** Resilience Ops GRC Platform  
**Owner:** People / Security Engineering  
**Last Reviewed:** 2026-06-02  
**Classification:** Internal  
**Frameworks:** ISO 27001 A.6.1–6.8, SOC 2 CC1.4, NIST SP 800-53 PS-1–PS-8

---

## Purpose

This policy defines security requirements that apply throughout the employee and contractor lifecycle — from pre-hire screening through offboarding. It ensures that [Organization] personnel understand their security obligations, that access rights are appropriately provisioned and removed, and that insider risk is managed systematically.

---

## Scope

Applies to all employees, contractors, consultants, interns, and any individual with access to [Organization] systems, data, or premises.

---

## Pre-Employment

### Background Screening

| Requirement | Scope | Notes |
|-------------|-------|-------|
| Identity verification | All roles | Government-issued ID verified before start date |
| Employment history verification | All roles | Last 3 years or most recent 2 positions |
| Criminal background check | All roles with system access | Per applicable local law; results reviewed by People + Legal |
| Education verification | Roles requiring specific qualifications | Engineering, GRC, Legal, Security |
| Reference checks | All employees | Minimum 2 professional references |

Elevated screening applies to:
- Security Engineering, GRC, and AI Governance roles — additional technical and ethics reference check
- Finance roles — credit check where legally permitted

Screening must be completed before any system access is granted.

### Confidentiality and Acceptable Use Agreements

Before system access is provisioned, all personnel must sign:
- Confidentiality / NDA agreement
- Acknowledgment of the [Acceptable Use Policy](./ACCEPTABLE-USE-POLICY.md)
- Acknowledgment of the [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)

Signed agreements are stored in the HR system and renewed annually or on material policy change.

---

## Onboarding

### Security Onboarding Checklist

Completed by Security Engineering and People within the first 5 business days:

| Task | Owner | Timeline |
|------|-------|---------|
| Provision accounts (SSO, email, GitHub) with minimum required access | Security Engineering | Day 1 |
| Assign role-based access profile | Security Engineering | Day 1 |
| Enrol in MFA — mandatory before first login to any system | Security Engineering | Day 1 |
| Complete security awareness training (initial) | Employee | Within 5 days |
| Complete AI security awareness module | Employee (if accessing AI tools) | Within 5 days |
| Verify NDA and AUP signatures on file | People | Day 1 |
| Assign security contact / buddy for first 30 days | Security Engineering | Day 1 |

### Initial Security Training

All new personnel complete the following before gaining access beyond email:

- Information security fundamentals (phishing, social engineering, password hygiene)
- Data classification and handling requirements
- Incident reporting procedure (how to report a security event)
- Acceptable use of company systems
- AI tool usage and risks (applicable to all staff using AI assistants)

Training is tracked in the HR system. Access is not fully provisioned until training completion is confirmed.

---

## During Employment

### Annual Security Training

All personnel complete annual refresher training covering:
- Updated threat landscape and common attack vectors
- Policy changes in the prior year
- Simulated phishing test (pass/fail tracked per team)
- AI security awareness (prompt injection, data handling)

Managers are notified of non-completion after 30 days overdue. Non-completion escalates to People and the CISO after 60 days.

### Role-Based Security Training

| Role | Additional Training |
|------|-------------------|
| Security Engineering | Annual advanced security topics; OWASP, cloud security, AI security |
| GRC / Compliance | Annual compliance framework updates; EU AI Act, ISO 27001, SOC 2 |
| Engineering | Secure coding (OWASP Top 10); annual refresh + on new SDLC guardrail changes |
| AI / ML Engineers | AI security (OWASP LLM Top 10); EU AI Act obligations; model governance |
| People / HR | Data privacy (GDPR subject rights); HR data handling requirements |

### Security Awareness Programme

- Monthly phishing simulations — results shared with managers
- Quarterly security newsletter — threat intelligence, policy updates, incidents (anonymised)
- Annual tabletop exercise for Security Engineering and GRC roles

### Role Change

When a personnel member changes role or team:
1. Security Engineering reviews and updates access profile within 5 business days
2. Access no longer required for the old role is revoked immediately
3. New role access is provisioned following the standard access request process
4. If moving to a higher-privilege role, re-screening may be required (assessed case-by-case)

---

## Offboarding

### Offboarding Security Checklist

Completed within 24 hours of departure (or immediately upon involuntary termination):

| Task | Owner | Timeline |
|------|-------|---------|
| Revoke all SSO and application access | Security Engineering | Same day — within 2 hours for involuntary |
| Revoke GitHub and code repository access | Security Engineering | Same day |
| Invalidate all API keys and tokens issued to the individual | Security Engineering | Same day |
| Transfer ownership of critical assets (repos, docs, dashboards) | Engineering Lead | Before last day |
| Return of company-issued equipment | People / IT | Last day |
| Remote wipe of managed devices | Security Engineering | On equipment return |
| Confirm cloud credentials have been rotated if individual had direct cloud access | Security Engineering | Within 24 hours |
| Conduct exit security interview | Security Engineering | On or before last day |

For **involuntary terminations**: access must be revoked at the same time the individual is notified — not before, not after. Coordinate with People and Legal to ensure simultaneous execution.

### Exit Interview (Security Component)

Security Engineering conducts a brief exit interview to:
- Confirm all company data has been returned or deleted from personal devices
- Remind the individual of ongoing confidentiality obligations
- Identify any credentials the individual may have that are not yet known to Security
- Assess any risk factors (disgruntled departure, access to sensitive systems)

Findings are documented and reviewed by the CISO.

### Post-Departure Access Review

Within 7 days of departure, Security Engineering reviews:
- All access revocations completed correctly
- No lingering API keys or tokens in code or config files (scan with `trufflehog`)
- Service accounts or shared credentials the individual may have known are rotated

---

## Insider Threat Programme

[Organization] operates a proportionate insider threat programme focused on detection, not surveillance.

### Risk Indicators

The following are monitored and reviewed by Security Engineering:

| Indicator | Monitoring method |
|-----------|-----------------|
| Bulk data downloads from SecTier 0/1 assets | CloudWatch AUDIT log alerts |
| Off-hours access to sensitive systems | Access log anomaly detection |
| Access pattern deviations (new systems, unusual hours) | CloudWatch log analysis |
| Multiple failed auth attempts | CloudWatch alarm — auth failure spike |
| Resignation or performance concerns (notified by People) | Manual enhanced review |

Monitoring is disclosed in the Acceptable Use Policy. Monitoring data is used only for security purposes and reviewed only by Security Engineering and the CISO.

### Escalation

Suspected insider threat incidents are treated as P0 security incidents per the [Incident Response Policy](./INCIDENT-RESPONSE-POLICY.md). Legal counsel is engaged before any investigative action.

---

## Disciplinary Procedures

Security policy violations are subject to the following disciplinary framework:

| Violation Type | Minimum Response | Maximum Response |
|----------------|-----------------|-----------------|
| Inadvertent policy violation (first offence) | Documented warning + mandatory training | Suspension |
| Repeated inadvertent violations | Suspension | Termination |
| Wilful policy violation | Suspension + security remediation | Termination + legal action |
| Deliberate data exfiltration or sabotage | Immediate suspension pending investigation | Termination + criminal referral |

Disciplinary decisions are made by People in consultation with Legal and the CISO. All disciplinary actions related to security are documented and retained for 7 years.

---

## Metrics

| Metric | Target |
|--------|--------|
| Security training completion rate | 100% within 30 days of hire |
| Annual refresher completion rate | 100% by 30 November each year |
| Offboarding access revocation time (involuntary) | < 2 hours |
| Offboarding access revocation time (voluntary) | Same day as departure |
| Post-departure access review completion | 100% within 7 days |

---

## Related Documents

- [Information Security Policy](./INFORMATION-SECURITY-POLICY.md)
- [Acceptable Use Policy](./ACCEPTABLE-USE-POLICY.md)
- [Access Control & IAM Policy](./ACCESS-CONTROL-IAM-POLICY.md)
- [Incident Response Policy](./INCIDENT-RESPONSE-POLICY.md)
- [Data Classification Policy](./DATA-CLASSIFICATION-POLICY.md)
