---
description: Analyze vendor security questionnaire responses
---

# Analyze Questionnaire

Reviews and analyzes completed vendor security questionnaires.

## Arguments

- `$1` - Questionnaire file path (required)
- `$2` - Questionnaire type (optional: SIG, CAIQ, custom)

## Supported Questionnaires

- **SIG** - Standardized Information Gathering
- **CAIQ** - Consensus Assessments Initiative Questionnaire
- **VSAQ** - Vendor Security Assessment Questionnaire
- **Custom** - Organization-specific questionnaires

## Analysis Includes

- Response completeness check
- Red flag identification
- Gap analysis against requirements
- Comparison to industry standards
- Follow-up questions needed

## Output

- Questionnaire analysis report
- Risk findings summary
- Follow-up question list
- Evidence request list

## Example

```bash
/grc-tprm:analyze-questionnaire ./vendor-responses/acme-sig-lite.xlsx SIG
```
