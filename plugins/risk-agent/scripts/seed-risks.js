#!/usr/bin/env node
// Seeds the Supabase risks table from tests/fixtures/risks/*.json
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node seed-risks.js

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const fixturesDir = path.resolve(__dirname, '../../../tests/fixtures/risks');
const files = fs.readdirSync(fixturesDir).filter(f => f.endsWith('.json'));

(async () => {
  for (const file of files) {
    const risk = JSON.parse(fs.readFileSync(path.join(fixturesDir, file), 'utf8'));
    const res = await fetch(`${SUPABASE_URL}/rest/v1/risks?on_conflict=risk_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(risk),
    });
    if (!res.ok) {
      console.error(`Failed ${file}: ${res.status} ${await res.text()}`);
    } else {
      console.log(`Seeded ${risk.risk_id} (${file})`);
    }
  }
})();
