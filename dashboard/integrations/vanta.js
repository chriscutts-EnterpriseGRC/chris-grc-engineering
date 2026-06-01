/**
 * Vanta → Controls adapter
 *
 * Pulls control test results from the Vanta API and updates control
 * effectiveness scores in the `controls` table.
 *
 * Configure via .env:
 *   VANTA_API_TOKEN
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const REQUIRED_VARS = ['VANTA_API_TOKEN','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'];

// Map Vanta control IDs / categories → UCF control IDs
const VANTA_UCF_MAP = {
  'ACCESS_CONTROL':          'UCF.01.01',
  'PRIVILEGED_ACCESS':       'UCF.01.02',
  'ENCRYPTION_AT_REST':      'UCF.02.01',
  'DATA_LOSS_PREVENTION':    'UCF.02.02',
  'VULNERABILITY_MANAGEMENT':'UCF.03.01',
  'PATCH_MANAGEMENT':        'UCF.03.02',
  'INCIDENT_RESPONSE':       'UCF.04.01',
  'NETWORK_SECURITY':        'UCF.05.01',
  'VENDOR_MANAGEMENT':       'UCF.06.01',
  'POLICY_MANAGEMENT':       'UCF.07.01',
  'SECURITY_TRAINING':       'UCF.07.02',
  'LOG_MONITORING':          'UCF.08.01',
  'CHANGE_MANAGEMENT':       'UCF.08.02',
  'BUSINESS_CONTINUITY':     'UCF.09.01',
};

const RESULT_EFFECTIVENESS = {
  PASS:    'effective',
  PARTIAL: 'partial',
  FAIL:    'ineffective',
  UNKNOWN: 'not_tested',
};

function mapControl(vantaControl) {
  const ucfId = VANTA_UCF_MAP[vantaControl.controlId ?? vantaControl.category] ?? null;
  if (!ucfId) return null;

  const result = vantaControl.overallResult ?? vantaControl.result ?? 'UNKNOWN';
  const passingTests = vantaControl.passingTests ?? 0;
  const totalTests   = vantaControl.totalTests   ?? 1;
  const score = totalTests > 0 ? Math.round((passingTests / totalTests) * 100) : 0;

  return {
    id:            ucfId,
    effectiveness: RESULT_EFFECTIVENESS[result] ?? 'not_tested',
    score,
    last_tested:   vantaControl.lastTestedAt?.slice(0, 10) ?? null,
  };
}

async function vantaFetch(path, token) {
  const res = await fetch(`https://api.vanta.com/v1${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept:        'application/json',
    },
  });
  if (!res.ok) throw new Error(`Vanta API ${res.status} ${path}: ${await res.text()}`);
  return res.json();
}

async function sync(supabase) {
  const data = await vantaFetch('/controls', process.env.VANTA_API_TOKEN);
  const controls = data.results ?? data.data ?? data ?? [];

  const rows = controls.map(mapControl).filter(Boolean);

  // Update each control individually to only touch effectiveness + score + last_tested
  const updates = rows.map(row =>
    supabase.from('controls')
      .update({ effectiveness: row.effectiveness, score: row.score, last_tested: row.last_tested, updated_at: new Date().toISOString() })
      .eq('id', row.id)
      .then(r => r.error)
  );
  const errors = (await Promise.all(updates)).filter(Boolean);
  if (errors.length) throw errors[0];

  console.log(`[vanta] updated ${rows.length} controls`);
  return rows.length;
}

if (require.main === module) {
  const missing = REQUIRED_VARS.filter(v => !process.env[v]);
  if (missing.length) { console.error('Missing env vars:', missing.join(', ')); process.exit(1); }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  sync(supabase).then(n => console.log(`Done — ${n} rows upserted`)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = { sync };
