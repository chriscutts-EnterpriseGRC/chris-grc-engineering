---
description: Generate plain-English risk descriptions for one or more risk records and write them back to the register
---

# Write Description

Invokes the `risk-description-writer` skill to produce two fields per risk, then writes them back to the risk record file.

## Usage

```
/write-description <risk-id>
/write-description <risk-id> <risk-id> ...
/write-description --all
```

## What it produces

- **`why_it_matters`** — 2–4 sentence plain-English narrative for the dashboard and register. Written for a practitioner or senior manager. No jargon, no fine amounts, no em dashes.
- **`risk_statement`** — formal single-sentence governance statement: "If [threat] exploits [gap], then [asset] could be [impact], resulting in [consequence]."
- **`tone_check`** — self-assessed pass/fail on jargon, fine amounts, em dashes, and practitioner tone.

## Arguments

| Argument | Description |
|---|---|
| `<risk-id>` | One or more risk IDs from the register (e.g. `[JIRA_PROJECT_KEY]-2026-0001`) |
| `--all` | Process all open risks in the register without confirmed descriptions |
| `--overwrite` | Re-generate descriptions for risks that already have `why_it_matters` populated |
| `--dry-run` | Output generated descriptions to stdout without writing to any files |

## Storage

By default, writes `why_it_matters`, `risk_statement`, and `tone_check` directly to `reports/risks/{risk-id}.json` and updates the corresponding entry in `reports/risks/risk-register.json`.

With `--dry-run`, prints output to stdout only — no file writes.

## Skill invoked

`plugins/risk-agent/skills/risk-description-writer/SKILL.md`

## Example

```bash
/risk-agent:write-description RSK-SE-2026-001
/risk-agent:write-description RSK-SE-2026-001 RSK-SE-2026-002
/risk-agent:write-description --all --dry-run
```
