/**
 * Integration sync runner
 *
 * Runs all configured integrations and reports results.
 * Usage:
 *   node integrations/sync.js              — run all enabled integrations
 *   node integrations/sync.js jira         — run one integration by name
 *   node integrations/sync.js jira qualys  — run multiple
 *
 * An integration is "enabled" when its required env vars are present.
 * Missing vars → integration is skipped (not an error).
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const INTEGRATIONS = {
  jira:               { module: './jira.js',             requires: ['JIRA_HOST','JIRA_API_TOKEN','JIRA_PROJECT_KEY'] },
  qualys:             { module: './qualys.js',           requires: ['QUALYS_API_URL','QUALYS_USERNAME','QUALYS_PASSWORD'] },
  splunk:             { module: './splunk.js',           requires: ['SPLUNK_HOST','SPLUNK_TOKEN'] },
  notion:             { module: './notion.js',           requires: ['NOTION_TOKEN','NOTION_POLICY_DB_ID'] },
  servicenow:         { module: './servicenow.js',       requires: ['SERVICENOW_INSTANCE','SERVICENOW_USER','SERVICENOW_PASSWORD'] },
  'aws-security-hub': { module: './aws-security-hub.js', requires: ['AWS_REGION','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY'] },
  vanta:              { module: './vanta.js',            requires: ['VANTA_API_TOKEN'] },
};

function isEnabled(cfg) {
  return cfg.requires.every(v => process.env[v]);
}

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const requested = process.argv.slice(2);
  const toRun = requested.length
    ? requested.filter(k => INTEGRATIONS[k])
    : Object.keys(INTEGRATIONS).filter(k => isEnabled(INTEGRATIONS[k]));

  if (!toRun.length) {
    console.log('No integrations enabled. Add credentials to .env to activate them.');
    console.log('Available:', Object.keys(INTEGRATIONS).join(', '));
    return;
  }

  console.log(`Running: ${toRun.join(', ')}\n`);
  const results = {};

  for (const name of toRun) {
    const cfg = INTEGRATIONS[name];
    if (!isEnabled(cfg) && !requested.includes(name)) {
      console.log(`[${name}] skipped — missing env vars: ${cfg.requires.filter(v => !process.env[v]).join(', ')}`);
      results[name] = 'skipped';
      continue;
    }
    try {
      const { sync } = require(cfg.module);
      const count = await sync(supabase);
      results[name] = `${count} rows`;
    } catch (err) {
      console.error(`[${name}] failed:`, err.message);
      results[name] = `error: ${err.message}`;
    }
  }

  console.log('\n── Summary ──────────────────────────────');
  Object.entries(results).forEach(([k, v]) => console.log(`  ${k.padEnd(10)} ${v}`));
}

main().catch(err => { console.error(err); process.exit(1); });
