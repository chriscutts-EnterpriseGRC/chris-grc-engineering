#!/usr/bin/env node
// Seeds the local risk register from tests/fixtures/risks/*.json
// Usage: node seed-risks.js
// Usage (dry run): node seed-risks.js --dry-run

const fs = require('fs');
const path = require('path');

const dryRun = process.argv.includes('--dry-run');
const fixturesDir = path.resolve(__dirname, '../../../tests/fixtures/risks');
const reportsDir = path.resolve(__dirname, '../../../reports/risks');
const registerPath = path.join(reportsDir, 'risk-register.json');

if (!fs.existsSync(fixturesDir)) {
  console.error(`Fixtures directory not found: ${fixturesDir}`);
  process.exit(1);
}

if (!dryRun && !fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const files = fs.readdirSync(fixturesDir).filter(f => f.endsWith('.json'));

if (files.length === 0) {
  console.log('No fixture files found.');
  process.exit(0);
}

const register = fs.existsSync(registerPath)
  ? JSON.parse(fs.readFileSync(registerPath, 'utf8'))
  : [];

for (const file of files) {
  const risk = JSON.parse(fs.readFileSync(path.join(fixturesDir, file), 'utf8'));
  const destPath = path.join(reportsDir, `${risk.risk_id}.json`);

  if (dryRun) {
    console.log(`[dry-run] Would write ${risk.risk_id} → ${destPath}`);
    continue;
  }

  fs.writeFileSync(destPath, JSON.stringify(risk, null, 2));

  const idx = register.findIndex(r => r.risk_id === risk.risk_id);
  const summary = {
    risk_id: risk.risk_id,
    title: risk.title,
    category: risk.category,
    status: risk.status,
    treatment: risk.treatment,
    inherent_score: risk.inherent?.score ?? null,
    residual_score: risk.residual?.score ?? null,
    owner_team: risk.owner?.team ?? null,
    updated_at: risk.updated_at,
  };

  if (idx >= 0) {
    register[idx] = summary;
  } else {
    register.push(summary);
  }

  console.log(`Seeded ${risk.risk_id} (${file})`);
}

if (!dryRun) {
  fs.writeFileSync(registerPath, JSON.stringify(register, null, 2));
  console.log(`Register updated: ${registerPath}`);
}
