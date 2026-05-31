---
description: Select and tailor FedRAMP Rev 5 baseline
---

# Baseline Selection

Helps select and tailor the appropriate FedRAMP Rev 5 control baseline.

## Arguments

- `$1` - Impact level (required: low, moderate, high)
- `$2` - System type (optional: saas, paas, iaas)

## Baselines Overview

| Baseline | Controls | Typical Use |
|----------|----------|-------------|
| Low | ~125 | Public data, low risk |
| Moderate | ~325 | CUI, PII, most common |
| High | ~425 | Sensitive, law enforcement |

## Tailoring Guidance

### Scoping

- Identify non-applicable controls
- Document justification for exclusions

### Compensating Controls

- When standard control cannot be implemented
- Must provide equivalent protection
- Requires documented justification

### Organization-Defined Parameters

- Fill in [Assignment] and [Selection] values
- Must meet minimum FedRAMP requirements

## Example

```bash
/fedramp-rev5:baseline-select moderate saas
```
