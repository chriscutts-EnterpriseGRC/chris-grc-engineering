---
description: System Security Plan (SSP) documentation guidance
---

# SSP Guidance

Provides guidance for developing FedRAMP System Security Plan documentation.

## Arguments

- `$1` - SSP section or topic (optional)
- `$2` - Impact level (optional: low, moderate, high)

## SSP Sections

1. **System Information** - Name, description, boundaries
2. **System Environment** - Architecture, data flow
3. **System Interconnections** - External connections
4. **Control Implementation** - How each control is satisfied
5. **Continuous Monitoring** - Ongoing assessment plan

## Key Requirements

- Describe all system components within authorization boundary
- Document all data types processed/stored/transmitted
- Map controls to implementation details
- Include diagrams (architecture, network, data flow)
- Reference policies and procedures

## Output

- SSP section templates
- Control implementation guidance
- Common gaps and how to address
- FedRAMP template references

## Example

```bash
/fedramp-rev5:ssp-guidance "control implementation" moderate
```
