---
name: iso42001-expert
description: ISO/IEC 42001:2023 clause-level expertise covering all 10 main sections, Annex A (organizational controls for AI), and crosswalks to NIST AI RMF, EU AI Act, and ISO 27001. Maps to UCF controls in chris-grc-engineering.
allowed-tools: Read, Write, Glob
---

# ISO/IEC 42001 Expert

## Standard structure (140 controls across 10 clauses + Annex A)

### Clause 4 — Context of the organisation
- 4.1 Understanding the organisation and its context
- 4.2 Understanding needs and expectations of interested parties
- 4.3 Determining the scope of the AIMS
- 4.4 AI management system

### Clause 5 — Leadership
- 5.1 Leadership and commitment
- 5.2 AI policy
- 5.3 Organizational roles, responsibilities and authorities

### Clause 6 — Planning
- **6.1** Actions to address risks and opportunities → UCF.AI.06
- 6.2 AI objectives and planning to achieve them

### Clause 7 — Support
- 7.1 Resources | 7.2 Competence | 7.3 Awareness | 7.4 Communication | 7.5 Documented information

### Clause 8 — Operation
- **8.3** AI system lifecycle management → UCF.AI.10
- **8.4** Data management for AI systems → UCF.AI.09
- 8.5 AI system impact assessment
- 8.6 AI system risk treatment

### Clause 9 — Performance evaluation
- **9.1** Monitoring, measurement, analysis, evaluation → UCF.AI.07
- 9.2 Internal audit
- 9.3 Management review

### Clause 10 — Improvement
- 10.1 Continual improvement
- 10.2 Nonconformity and corrective action

### Annex A — Organisational controls for AI
- A.2 Policies for AI (→ UCF.AI.01)
- A.3 Internal organisation
- A.4 Resources for AI systems
- A.5 Assessing impacts of AI systems
- A.6 AI system lifecycle (→ UCF.AI.10)
- A.7 Data for AI systems (→ UCF.AI.09)
- A.8 Information for interested parties about AI system use (→ UCF.AI.08)
- A.9 Use of AI systems
- A.10 Third-party and customer relationships (→ UCF.AI.04)

## UCF control mapping (chris-grc-engineering)

| Clause | UCF Control | Current Effectiveness |
|--------|-------------|----------------------|
| §6.1 | UCF.AI.06 (AI Risk Categorization) | Not Tested |
| §8.3 | UCF.AI.10 (AI Model Lifecycle) | Partial (45) |
| §8.4 | UCF.AI.09 (AI Data Provenance) | Not Tested |
| §9.1 | UCF.AI.07 (AI Model Monitoring) | Not Tested |
| A.2 / A.6 | UCF.AI.01 (AI Model Governance) | Ineffective (29) |
| A.7 | UCF.AI.03 (AI Security Controls) | Not Tested |
| A.8 | UCF.AI.08 (AI Explainability) | Not Tested |
| A.10 | UCF.AI.04 (AI Vendor Risk) | Partial (51) |

## Current posture
- 18% coverage (8/44 controls passing)
- Status: **Gap**
- Blocking clauses: §6.1, §8.3, §8.4, §9.1 + most of Annex A

## Crosswalks
- NIST AI RMF: GV-1→A.2, MP-3→§6.1, MS-3→§9.1, MG-3→§8.3, MP-4→§8.4
- EU AI Act: Art.9→§6.1+§8.6, Art.10→§8.4, Art.13→A.8, Art.72→§9.1
- ISO 27001: A.10→ISO A.15.1, A.7→ISO A.8.3, §9.1→ISO A.12.4
