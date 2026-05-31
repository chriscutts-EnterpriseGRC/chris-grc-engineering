---
description: Perform vendor security assessment
---

# Assess Vendor

Conducts security and risk assessment of third-party vendors.

## Arguments

- `$1` - Vendor name or assessment file (required)
- `$2` - Assessment type (optional: initial, annual, incident)

## Assessment Types

- **initial** - New vendor onboarding assessment
- **annual** - Periodic reassessment
- **incident** - Post-incident or breach assessment

## Assessment Areas

- Security program maturity
- Data handling practices
- Compliance certifications (SOC 2, ISO 27001)
- Business continuity capabilities
- Incident response readiness
- Subcontractor management

## Output

Generates vendor risk assessment report with:

- Overall risk rating (Critical/High/Medium/Low)
- Risk factors by category
- Required contractual controls
- Monitoring recommendations
- Approval recommendation

## Example

```bash
/grc-tprm:assess-vendor "Acme Cloud Services" initial
```
