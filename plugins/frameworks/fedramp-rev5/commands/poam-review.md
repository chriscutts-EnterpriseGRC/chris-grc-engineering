---
description: Review and manage Plan of Action & Milestones (POA&M)
---

# POA&M Review

Analyzes and provides guidance on FedRAMP Plan of Action & Milestones.

## Arguments

- `$1` - POA&M file or action (required)
- `$2` - Analysis type (optional: gaps, priorities, aging)

## POA&M Requirements

Each POA&M item must include:

- Weakness description
- Point of contact
- Resources required
- Scheduled completion date
- Milestones with dates
- Status updates
- Risk level (High/Moderate/Low)

## Analysis Types

- **gaps** - Identify missing required fields
- **priorities** - Rank items by risk and due date
- **aging** - Flag overdue items and extensions needed

## FedRAMP POA&M Rules

- High vulnerabilities: 30 days to remediate
- Moderate vulnerabilities: 90 days to remediate
- Low vulnerabilities: 180 days to remediate
- Operational requirements may extend timelines

## Example

```bash
/fedramp-rev5:poam-review ./poam.xlsx priorities
```
