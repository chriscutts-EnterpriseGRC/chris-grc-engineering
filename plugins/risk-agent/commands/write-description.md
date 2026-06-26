# /write-description

Generate plain-English risk descriptions for one or more risk records.

## Usage

```
/write-description <risk-id>
/write-description <risk-id> <risk-id> ...
/write-description --all
```

## What it does

Invokes the `risk-description-writer` skill to produce two fields per risk:

- **`whyItMatters`** — 2–4 sentence plain-English narrative for the dashboard and risk register. Written for a practitioner or senior manager. No jargon, no fine amounts, no em dashes.
- **`riskStatement`** — formal single-sentence governance statement in the format: "If [threat] exploits [gap], then [asset] could be [impact], resulting in [consequence]."

## Arguments

| Argument | Description |
|---|---|
| `<risk-id>` | One or more risk IDs from the register (e.g. `HULL-2026-0042`) |
| `--all` | Process all open risks in the register without confirmed descriptions |
| `--overwrite` | Re-generate descriptions for risks that already have `whyItMatters` populated |
| `--dry-run` | Output generated descriptions to stdout without writing to the register |

## Examples

```
/write-description HULL-2026-0042
/write-description HULL-2026-0043 HULL-2026-0045
/write-description --all --dry-run
```

## Output

By default, writes `whyItMatters` and `riskStatement` directly to the matching risk record in `dashboard/src/data/riskRegister.js`.

With `--dry-run`, prints output to stdout only — no file writes.

Each result includes a `toneCheck` block. Any field that fails the tone check is flagged in output and the agent rewrites before finalising.

## Skill invoked

`plugins/risk-agent/skills/risk-description-writer/SKILL.md`
