---
name: risk-description-writer
description: Generates plain-English risk descriptions for the GRC dashboard. Takes a full ISO 27005 risk record and produces a why_it_matters narrative and a formal risk_statement, both aligned to the Risk Management Framework v1.0 tone and structure.
allowed-tools: Read
---

# Risk Description Writer

Produces two human-readable text fields for a given risk record:

1. **`why_it_matters`** — plain-English explanation for the risk register and dashboard. Written for a practitioner or senior manager, not a lawyer or auditor. No jargon, no fine amounts, no fear language.
2. **`risk_statement`** — formal structured statement for governance documentation, following the standard threat-asset-impact-consequence format.

The command layer (`write-description.md`) handles all file writes. This skill generates content only.

---

## Input contract

Expects a full risk record conforming to `schemas/risk.schema.json`. Required fields:

```json
{
  "risk_id": "[JIRA_PROJECT_KEY]-2026-0001",
  "title": "Unenforced allowlists for apps, browsers, and AI tooling",
  "category": "Security",
  "assets": [
    { "name": "Corporate endpoints", "type": "hardware" },
    { "name": "Source code and intellectual property", "type": "information" }
  ],
  "threat_agent": "External attacker via supply chain or malicious package authorship",
  "threat_scenario": "Narrative of how the threat materializes...",
  "threat_vectors": ["Vector one", "Vector two"],
  "vulnerabilities": [
    { "description": "No enforced allowlist for browser extensions", "cve": null }
  ],
  "consequences": ["Credential theft", "Source code exfiltration"],
  "existing_controls": [
    { "name": "VS Code managed extension policy", "effectiveness": "effective" }
  ],
  "affected_parties": "Who is impacted...",
  "blast_radius": "Downstream exposure...",
  "compliance_scope": "Regulatory frameworks implicated...",
  "data_classification": "Restricted",
  "inherent": { "likelihood": 5, "impact": 4, "score": 20 },
  "residual": { "likelihood": 4, "impact": 4, "score": 16 },
  "treatment": "mitigate",
  "status": "mitigating"
}
```

> **`[JIRA_PROJECT_KEY]`** — replace with the Docker risk register Jira project key once the project is created. Update this skill and all example IDs across the plugin when the key is confirmed.

### How to use the enriched fields

| Schema field | How to use it in output |
|---|---|
| `threat_agent` | Name the specific actor in `risk_statement`, not a generic "attacker" |
| `threat_scenario` | Extract the core failure chain for `why_it_matters` context |
| `threat_vectors` | Pick the highest-risk vector to anchor the `risk_statement` |
| `vulnerabilities[]` | Surface the root cause gap in `why_it_matters` — what is missing or broken |
| `consequences[]` | Use the most severe consequence to set the business consequence tone |
| `existing_controls[]` | Note partial coverage in `why_it_matters` only if it materially changes the picture |
| `affected_parties` | Use to confirm the audience for `why_it_matters` framing |
| `blast_radius` | Inform the scope of consequence language in `risk_statement` |
| `compliance_scope` | Reference regulatory scope only if it strengthens the action case — never cite fine amounts |
| `data_classification` | Use to calibrate urgency. Restricted = highest urgency framing |

---

## Writing rules

### why_it_matters

- 2–4 sentences maximum
- Plain language — a CFO should understand it without a glossary
- Lead with the real-world consequence, not the technical mechanism
- State what is missing or broken, not just that a risk exists
- End with what is fixable — the path forward in one sentence
- Do not mention specific fine amounts, regulatory penalties, or breach statistics
- Do not use em dashes
- Do not use phrases like "it is critical that" or "failure to act may result in"
- Tone: direct, matter-of-fact, practitioner-written

**Good example:**
> You cannot manage vendor risk you cannot see. Docker has no inventory of who has access to what. That is the starting point, and it is fixable with a repeatable lightweight process.

**Bad example:**
> Failure to implement a formal vendor risk management programme may result in significant regulatory penalties under GDPR Article 83(4) — potentially up to €10M or 2% of global annual turnover — and could expose the organisation to material third-party breaches.

### risk_statement

Follow this format exactly:

> If [threat or threat actor] exploits [vulnerability or gap], then [asset] could be [impact action], resulting in [business consequence].

- Keep to one sentence
- Use active, concrete language
- `[threat]` draws from `threat_agent` and the highest-risk `threat_vector`
- `[vulnerability]` names the specific gap from `vulnerabilities[]`, not a generic weakness
- `[asset]` names the highest-value asset from `assets[]`
- `[business consequence]` reflects the inherent score level and draws from `consequences[]`

**Example:**
> If an unvetted third party with production access is compromised or acts maliciously, then customer data and internal infrastructure could be exfiltrated or disrupted, resulting in a severe operational and reputational impact.

---

## Scoring context

Use the inherent and residual scores to calibrate consequence severity:

| Score | Level | Business consequence language |
|---|---|---|
| 25 | Critical | total service disruption, critical data loss, material regulatory breach |
| 16–24 | Severe | severe operational disruption, customer data exposure, significant reputational damage |
| 10–15 | High | significant disruption, limited data exposure, reputational impact |
| 5–9 | Moderate | noticeable disruption, limited data exposure, manageable compliance gap |
| 1–4 | Low | minimal operational impact, contained within standard oversight |

---

## Category-specific guidance

| Category | why_it_matters focus |
|---|---|
| Security | What is ungoverned, what a real attacker could do with it today, what closes the gap |
| Endpoint Compromise | What tools have unreviewed access to credentials and code, what the blast radius is from one compromised device |
| Supply Chain | What enters the environment without review, how it gets trust it has not earned, what the detection gap is |
| Third Party | Who has access, what oversight exists, what the onboarding gap is |
| Access Control | What is exposed if access is misused, what controls are absent |
| Data Security | What data is at risk, under which regulatory scope, what the gap is |
| AI / ML | What the model or tool does, what the misuse or data exfiltration risk is, what guardrails are missing |
| Infrastructure | What the attack surface is, what the blast radius of exploitation would be |
| Compliance | Which obligation, what the current gap is, when enforcement applies |
| Vulnerability | What the CVE affects, whether it is exploited in the wild, what patch coverage exists |

---

## Output contract

```json
{
  "risk_id": "[JIRA_PROJECT_KEY]-2026-0001",
  "why_it_matters": "Plain-English narrative for the dashboard.",
  "risk_statement": "If [threat] exploits [vulnerability], then [asset] could be [impact], resulting in [consequence].",
  "word_count": {
    "why_it_matters": 0,
    "risk_statement": 0
  },
  "tone_check": {
    "jargon_free": true,
    "no_fine_amounts": true,
    "no_em_dashes": true,
    "practitioner_tone": true
  }
}
```

The `tone_check` block is self-assessed. Flag `false` on any field where the output does not meet the rule and include a `tone_check_notes` field explaining the exception.

---

## Batch mode

If passed an array of risk records, process each independently and return an array of output objects in the same order. Do not blend context between records — each description must stand alone.

---

## Quality bar

Before returning output, review each `why_it_matters` against these questions:

1. Could a non-technical senior manager read this and understand what is at risk?
2. Does it state what is missing or broken — not just that a risk exists?
3. Does it end on something actionable or fixable?
4. Is it free of hedging language ("may", "could potentially", "it is possible that")?

If any answer is no, rewrite before returning.
