---
description: Determine required CMMC level based on contract and data types
---

# CMMC Level Selection

Helps determine the appropriate CMMC level required for your organization based on DoD contract types and data sensitivity.

## Arguments

- `$1` - Contract type (optional: prime, subcontractor, service-provider)
- `$2` - Data type (optional: FCI, CUI, classified)

## Selection Criteria

### Data Types

**FCI (Federal Contract Information)**:

- Contract details, pricing, technical data
- Minimum: CMMC Level 1
- Self-assessment acceptable

**CUI (Controlled Unclassified Information)**:

- Technical data, export-controlled info, ITAR
- Required: CMMC Level 2 or 3
- Third-party assessment (C3PAO) required

**Classified Information**:

- Beyond CMMC scope
- Requires NISPOM/ICD 503 compliance

### Contract Types

**Prime Contractor**:

- Direct contract with DoD
- Level determined by data sensitivity
- Full CMMC compliance required

**Subcontractor**:

- Inherits prime's requirements
- Must meet same CMMC level
- Flow-down requirements apply

**Service Provider**:

- Cloud/IT services to DoD contractors
- Level 2+ typically required
- FedRAMP alignment beneficial

## Selection Matrix

| Data Type | Contract Type | Minimum Level | Assessment Type |
|-----------|---------------|---------------|-----------------|
| FCI only | Any | Level 1 | Annual self-assessment |
| CUI | Prime/Sub | Level 2 | Triennial C3PAO |
| CUI (critical) | Prime | Level 3 | Triennial Government |

## Output

1. **Recommended CMMC Level**: Based on inputs
2. **Justification**: Why this level is required
3. **Assessment Requirements**: Self vs third-party
4. **Timeline Considerations**: Assessment frequency
5. **Cost Implications**: Estimated assessment costs

## Examples

```bash
# Determine level for prime contractor with CUI
/cmmc:level-select prime CUI

# Assess requirements for subcontractor
/cmmc:level-select subcontractor CUI

# Evaluate service provider needs
/cmmc:level-select service-provider
```
