---
description: CMMC v2.0 readiness assessment by maturity level
---

# CMMC Assessment

Evaluates organizational readiness for Cybersecurity Maturity Model Certification (CMMC) v2.0.

## Arguments

- `$1` - Target CMMC level (required: 1, 2, or 3)
- `$2` - Assessment scope (optional: full, gap-analysis, specific-domain)

## CMMC Levels

| Level | Name | Description | Requirements |
|-------|------|-------------|--------------|
| 1 | Foundational | Basic cyber hygiene | Annual self-assessment, 17 practices |
| 2 | Advanced | Intermediate cyber hygiene | Triennial 3rd party assessment (C3PAO), 110 practices |
| 3 | Expert | Advanced/progressive cybersecurity | Triennial Govt-led assessment, 110+ practices |

## Assessment Output

1. **Readiness Score**: Overall compliance percentage by level
2. **Domain Gaps**: Which of the 14 domains need attention
   - Access Control (AC)
   - Asset Management (AM)
   - Audit and Accountability (AU)
   - Awareness and Training (AT)
   - Configuration Management (CM)
   - Identification and Authentication (IA)
   - Incident Response (IR)
   - Maintenance (MA)
   - Media Protection (MP)
   - Personnel Security (PS)
   - Physical Protection (PE)
   - Recovery (RE)
   - Risk Management (RM)
   - Security Assessment (CA)
   - Situational Awareness (SA)
   - System and Communications Protection (SC)
   - System and Information Integrity (SI)

3. **Practice Implementation Status**: Per-practice compliance
4. **C3PAO Preparation**: Readiness for third-party assessment
5. **Remediation Roadmap**: Prioritized action plan

## Examples

```bash
# Full Level 2 assessment for DoD contractor
/cmmc:assess 2 full

# Gap analysis for Level 1 compliance
/cmmc:assess 1 gap-analysis

# Specific domain assessment
/cmmc:assess 2 "Access Control"
```
