---
description: Assess FedRAMP Rev 5 authorization readiness
---

# FedRAMP Rev 5 Assessment

Evaluates readiness for traditional FedRAMP authorization under Rev 5.

## Arguments

- `$1` - Impact level (required: low, moderate, high)
- `$2` - Authorization path (optional: agency, jab)

## Impact Levels

### FedRAMP Low (~125 controls)

- Low-impact data (public information)
- Minimal security requirements

### FedRAMP Moderate (~325 controls)

- Controlled unclassified information (CUI)
- Most common authorization level

### FedRAMP High (~425 controls)

- Highly sensitive data
- Law enforcement, emergency services

## Authorization Paths

- **Agency**: Sponsored by single federal agency
- **JAB**: Joint Authorization Board (provisional ATO from GSA, DOD, DHS)

## Assessment Output

- Authorization readiness score
- Control implementation gaps
- Documentation requirements (SSP, SAP, SAR, POA&M)
- 3PAO assessment preparation checklist

## Example

```bash
/fedramp-rev5:assess moderate agency
```
