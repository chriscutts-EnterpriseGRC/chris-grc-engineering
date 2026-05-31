---
name: nist-ai-rmf-expert
description: Deep knowledge of NIST AI RMF 1.0 four-function structure, subcategories, and crosswalks to UCF controls, ISO 42001, EU AI Act, and NIST CSF 2.0.
allowed-tools: Read, Write, Glob
---

# NIST AI RMF Expert

## Framework structure

### GOVERN (GV) — establish AI risk culture and accountability
- GV-1: Policies, processes, and procedures for AI risk management
- GV-2: Organizational roles and responsibilities
- GV-3: Workforce training and competencies
- GV-4: Organizational teams coordinate on AI risk
- GV-5: Organizational risk tolerance guides AI decisions
- GV-6: Policies include AI supply chain risk

### MAP (MP) — context and risk identification
- MP-1: Context established and understood
- MP-2: Scientific and empirical knowledge considered
- MP-3: AI risks are categorized
- MP-4: Risks and benefits are mapped to organizational impact
- MP-5: Likelihood and magnitude of impact are characterized

### MEASURE (MS) — analysis and assessment
- MS-1: AI risk measurement methods defined
- MS-2: Risk metrics and impact evaluated
- MS-3: AI system performance monitored
- MS-4: Risks from third-party components assessed

### MANAGE (MG) — prioritize and address risk
- MG-1: Risks are prioritized based on impact
- MG-2: Mechanisms to respond to and recover from AI risks
- MG-3: Risks are tracked over time
- MG-4: Risk treatments applied and monitored

## UCF control crosswalk (chris-grc-engineering)

| RMF Subcategory | UCF Control | Effectiveness |
|-----------------|-------------|---------------|
| GV-1 | UCF.AI.01 (AI Model Governance) | Ineffective |
| GV-6 | UCF.AI.04 (AI Vendor Risk Mgmt) | Partial |
| MP-3 | UCF.AI.06 (AI Risk Categorization) | Not Tested |
| MS-3 | UCF.AI.07 (AI Model Performance Monitoring) | Not Tested |
| MS-2 | UCF.AI.08 (AI Explainability & Transparency) | Not Tested |
| MP-4 | UCF.AI.09 (AI Data Provenance & Lineage) | Not Tested |
| MG-3 | UCF.AI.10 (AI Model Lifecycle Management) | Partial |
| MG-2 | UCF.AI.05 (AI Incident Response) | Not Tested |

## ISO 42001 crosswalk
GV-1 → 42001 §6.1 | MP-3 → 42001 §6.1 | MS-3 → 42001 §9.1 | MG-3 → 42001 §8.3 | MP-4 → 42001 §8.4

## EU AI Act crosswalk
GV-1 → Art.9 | MP-3 → Art.6 | MS-3 → Art.72 | GV-2 → Art.28 | MS-2 → Art.13
