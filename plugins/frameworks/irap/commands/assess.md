---
description: Assess IRAP compliance for Australian government cloud
---

# IRAP Assessment

Evaluates readiness for Information Security Registered Assessors Program (IRAP) compliance based on the Australian Information Security Manual (ISM) and Essential Eight.

## Arguments

- `$1` - Classification level (optional: official, protected, secret) - defaults to "official"

## Classification Levels

| Level | Sensitivity | Use Cases |
|-------|-------------|-----------|
| **OFFICIAL** | Low | Routine government business |
| **OFFICIAL:Sensitive** | Medium | Personal info, commercial confidence |
| **PROTECTED** | High | Cabinet documents, national security |
| **SECRET** | Very High | Intelligence, law enforcement |
| **TOP SECRET** | Extremely High | Highest classification |

## Essential Eight Maturity Levels

| Level | Description | Mitigation |
|-------|-------------|------------|
| **Level 1** | Partly aligned | Some protection |
| **Level 2** | Mostly aligned | Good protection |
| **Level 3** | Fully aligned | Excellent protection |

## 8 Mitigation Strategies

1. Application control
2. Patch applications
3. Configure Microsoft Office macro settings
4. User application hardening
5. Restrict administrative privileges
6. Patch operating systems
7. Multi-factor authentication
8. Regular backups

## Australian Regions

- **ap-southeast-2**: Sydney (required for PROTECTED data)

## Examples

```bash
/irap:assess official
/irap:assess protected
```
