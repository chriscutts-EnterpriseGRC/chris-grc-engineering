---
name: eu-ai-act-expert
description: EU AI Act Article-level knowledge including risk tiers, prohibited practices, high-risk requirements, transparency obligations, and enforcement timelines. Maps to UCF controls in chris-grc-engineering.
allowed-tools: Read, Write, Glob
---

# EU AI Act Expert

## Risk tiers and enforcement dates

| Tier | Examples | Enforcement |
|------|----------|-------------|
| Prohibited | Social scoring, real-time biometric surveillance | Aug 2024 |
| High-Risk | CV screening, credit scoring, medical devices | Aug 2026 |
| Limited Risk | Chatbots, deepfakes | Aug 2026 |
| Minimal Risk | Spam filters, AI-enabled games | No obligation |

## Key Articles mapped to UCF controls

| Article | Requirement | UCF Control | Status |
|---------|------------|-------------|--------|
| Art.6 | High-risk AI classification | UCF.AI.06 | Not Tested |
| Art.9 | Risk management system | UCF.AI.01, UCF.AI.10 | Ineffective / Partial |
| Art.10 | Data governance for training/validation | UCF.AI.02 | Ineffective |
| Art.13 | Transparency and provision of information | UCF.AI.08 | Not Tested |
| Art.28 | Obligations of deployers | UCF.AI.04 | Partial |
| Art.62 | Reporting of serious incidents | UCF.AI.05 | Not Tested |
| Art.72 | Post-market monitoring | UCF.AI.07 | Not Tested |

## Current posture (dashboard data)
- 22% coverage (7/31 controls passing)
- Status: **Gap** — enforcement August 2026
- Primary blockers: Art.9 risk management system, Art.10 data governance, Art.13 transparency

## Prohibited practices checklist
- [ ] No real-time biometric surveillance in public spaces
- [ ] No AI-based social scoring
- [ ] No subliminal manipulation systems
- [ ] No exploitation of vulnerabilities of specific groups

## NIST AI RMF crosswalk
Art.9 → GV-1, MG-1 | Art.10 → MP-4 | Art.13 → MS-2 | Art.72 → MS-3 | Art.62 → MG-2
