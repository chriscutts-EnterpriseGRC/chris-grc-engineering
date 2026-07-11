---
name: risk-description-writer
description: Generates plain-English risk descriptions for the GRC dashboard. Takes a raw risk record and produces a whyItMatters narrative and a formal risk statement, both aligned to the Risk Management Framework v1.0 tone and structure.
allowed-tools: Read
---

# Risk Description Writer

Produces two human-readable text fields for a given risk record:

1. **`whyItMatters`** — plain-English explanation for the risk register and dashboard. Written for a practitioner or senior manager, not a lawyer or auditor. No jargon, no fine amounts, no fear language.
2. **`riskStatement`** — formal structured statement for governance documentation, following the standard threat-asset-impact-consequence format.

---

## Input contract

Expects a risk object with at minimum:

```json
{
  "id": "HULL-2026-0042",
  "title": "Ungoverned Third-Party Access (No Formal Vendor Risk Program)",
  "category": "Third Party",
  "asset": "Production Systems, Customer Data, Internal Infrastructure",
  "likelihood": 4,
  "impact": 4,
  "inherentScore": 16,
  "residualScore": 6,
  "controlIds": ["UCF.01.02", "UCF.06.01", "UCF.07.01"],
  "treatment": "Mitigate",
  "status": "Open"
}
```

Optional enrichment fields that improve output quality:

- `signalSource` — origin of the risk (e.g. `supply_chain`, `audit`, `incident`, `vulnerability_scan`)
- `linkedVulnerabilities` — array of linked CVE or vuln IDs
- `linkedVendors` — array of vendor names or IDs
- `linkedPolicies` — array of policy IDs with gap descriptions

---

## Writing rules

### whyItMatters

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

### riskStatement

Follow this format exactly:

> If [threat or threat actor] exploits [vulnerability or gap], then [asset] could be [impact action], resulting in [business consequence].

- Keep to one sentence
- Use active, concrete language
- [asset] should match the `asset` field from the risk record
- [business consequence] should reflect the impact score level: Low/Moderate/High/Severe/Critical

**Example:**
> If an unvetted third party with production access is compromised or acts maliciously, then customer data and internal infrastructure could be exfiltrated or disrupted, resulting in a severe operational and reputational impact.

---

## Scoring context

Use the inherent and residual scores to calibrate consequence severity in the risk statement:

| Score | Level | Business consequence language |
|---|---|---|
| 20–25 | Critical / Severe | total service disruption, critical data loss, material regulatory breach |
| 10–19 | High / Severe | significant operational disruption, customer data exposure, reputational damage |
| 5–9 | Moderate | noticeable disruption, limited data exposure, manageable compliance gap |
| 1–4 | Low | minimal operational impact, contained within standard oversight |

---

## Category-specific guidance

| Category | whyItMatters focus |
|---|---|
| Third Party | Who has access, what oversight exists, what the onboarding gap is |
| Access Control | What is exposed if access is misused, what controls are absent |
| Data Security | What data is at risk, under which regulatory scope, what the gap is |
| AI / ML | What the model does, what the misuse or drift risk is, what guardrails are missing |
| Infrastructure | What the attack surface is, what the blast radius of exploitation would be |
| Compliance | Which obligation, what the current gap is, when enforcement applies |
| Vulnerability | What the CVE affects, whether it is exploited in the wild, what patch coverage exists |

---

## Output contract

```json
{
  "id": "HULL-2026-0042",
  "whyItMatters": "You cannot manage vendor risk you cannot see. Docker has no inventory of who has access to what. That is the starting point, and it is fixable with a repeatable lightweight process.",
  "riskStatement": "If an unvetted third party with production access is compromised or acts maliciously, then customer data and internal infrastructure could be exfiltrated or disrupted, resulting in a severe operational and reputational impact.",
  "wordCount": {
    "whyItMatters": 42,
    "riskStatement": 34
  },
  "toneCheck": {
    "jargonFree": true,
    "noFineAmounts": true,
    "noEmDashes": true,
    "practitionerTone": true
  }
}
```

The `toneCheck` block is self-assessed by the agent. Flag `false` on any field where the output does not meet the rule and include a note in a `toneCheckNotes` field explaining the exception.

---

## Batch mode

If passed an array of risk records, process each independently and return an array of output objects in the same order. Do not blend context between records — each description must stand alone.

---

## Quality bar

Before returning output, review each `whyItMatters` against these questions:

1. Could a non-technical senior manager read this and understand what is at risk?
2. Does it state what is missing or broken — not just that a risk exists?
3. Does it end on something actionable or fixable?
4. Is it free of hedging language ("may", "could potentially", "it is possible that")?

If any answer is no, rewrite before returning.
