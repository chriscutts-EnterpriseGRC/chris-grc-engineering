---
description: Calculate vendor risk score and rating
---

# Score Risk

Calculates comprehensive vendor risk scores based on multiple factors.

## Arguments

- `$1` - Vendor name or assessment data (required)
- `$2` - Scoring model (optional: standard, financial, healthcare)

## Risk Scoring Factors

### Inherent Risk (Business Context)

- Data sensitivity (what data do they access?)
- Integration depth (how connected are they?)
- Business criticality (can we operate without them?)
- Regulatory exposure (what regulations apply?)

### Control Risk (Security Posture)

- Security certifications
- Questionnaire responses
- Audit findings
- Incident history

## Risk Rating Scale

- **Critical** (Score 80-100): Requires immediate attention
- **High** (Score 60-79): Significant risk, enhanced monitoring
- **Medium** (Score 40-59): Moderate risk, standard monitoring
- **Low** (Score 0-39): Acceptable risk, periodic review

## Output

- Risk score breakdown
- Rating justification
- Comparison to peer vendors
- Recommended risk treatment

## Example

```bash
/grc-tprm:score-risk "Acme Cloud Services" standard
```
