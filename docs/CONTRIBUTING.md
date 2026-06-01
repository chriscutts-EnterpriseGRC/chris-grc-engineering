# Contributing

Contributions to the Resilience Operations Dashboard are welcome. The most useful contributions are **new integration adapters**, **seed data improvements**, and **UCF control mapping refinements**.

## Ground rules

1. **No credentials in the repo.** Adapters rely on env vars documented in `.env.example`. Never add a new secret store.
2. **Adapters follow the existing pattern.** Each adapter exports `{ sync }`, handles missing env vars gracefully, and upserts with `onConflict: 'id'` so re-runs are safe.
3. **Seed data must be idempotent.** All `INSERT` statements in `seed.sql` use `ON CONFLICT DO UPDATE` — maintain that.
4. **UCF control IDs are the join key.** Every vulnerability, incident, policy, and vendor row references a `control_id`. New rows must reference an existing UCF control.

## How to add an integration adapter

Follow the pattern in `dashboard/integrations/jira.js`:

```
dashboard/integrations/
└── your-tool.js       # exports { sync(supabase) }
```

Checklist:

- [ ] `REQUIRED_VARS` array at the top with all needed env vars
- [ ] `sync(supabase)` function — takes a Supabase client, returns row count
- [ ] Standalone runner at the bottom (`if (require.main === module)`)
- [ ] Register in `sync.js` `INTEGRATIONS` object with `module` and `requires`
- [ ] Add env vars to `dashboard/.env.example` with placeholder values
- [ ] Update the integrations table in `README.md`

**Target tables:**

| Data type | Table | Key conflict field |
|---|---|---|
| Vulnerabilities | `vulnerabilities` | `id` |
| Incidents | `incidents` | `id` |
| Policies | `policies` | `id` |
| Vendors | `vendors` | `id` |
| Control effectiveness | `controls` | `id` (update only — don't insert new rows) |

## How to update seed data

`supabase/seed.sql` is the demo dataset. All changes must be backward-compatible:

- Add new rows with new IDs — never change existing IDs
- Update existing rows via the `ON CONFLICT DO UPDATE` clause
- New `document_url` values should point to publicly accessible documents
- AI-flagged rows (`is_ai = true`) must reference a `UCF.AI.*` control

## How to extend UCF controls

Controls are defined in two places:

1. **`supabase/seed.sql`** — the live data source when connected to Supabase
2. **`dashboard/src/GRCDashboard.jsx`** — the inline mock data used in demo mode

Both must stay in sync. When adding a new control:

- Choose an ID that follows the pattern: `UCF.XX.YY` (core) or `UCF.AI.XX` (AI)
- Add it to both the SQL seed and the `controls` array in `GRCDashboard.jsx`
- Map it to at least two frameworks in the `frameworks` array
- Assign an owner from the existing team roster (J. Martinez, A. Patel, T. Williams, K. Thompson, S. Chen)
- Add it to the relevant team's `controls` array in the `teams` definition

## Running locally

```bash
cd dashboard
npm install
npm start          # demo mode — no credentials needed
```

For live mode, copy `.env.example` to `.env` and fill in Supabase credentials. See the [Go live](../README.md#go-live-with-real-data) section in the README.
