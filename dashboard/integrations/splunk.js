/**
 * Splunk → Incidents adapter
 *
 * Runs a saved search or ad-hoc SPL query, maps events → incidents.
 * Configure via .env:
 *   SPLUNK_HOST, SPLUNK_TOKEN
 *
 * Set SPLUNK_SEARCH to override the default search query.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const REQUIRED_VARS = ['SPLUNK_HOST','SPLUNK_TOKEN','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'];

const DEFAULT_SEARCH = 'search index=security sourcetype=notable earliest=-7d | head 200 | fields _time,rule_name,urgency,status,count,drilldown_search';

const URGENCY_MAP = {
  critical:'Critical', high:'High', medium:'Medium', low:'Low', informational:'Low',
};

const STATUS_MAP = {
  'new':'Open', 'in progress':'Investigating', 'pending':'Investigating',
  'resolved':'Resolved', 'closed':'Resolved',
};

function mapEvent(event) {
  const isAI = (event.rule_name ?? '').toLowerCase().match(/ai|llm|model|ml|gpt/);
  return {
    id:              `SPL-${Buffer.from(event._time + event.rule_name).toString('base64').slice(0,16)}`,
    title:           event.rule_name ?? 'Security Alert',
    severity:        URGENCY_MAP[event.urgency?.toLowerCase()] ?? 'Medium',
    status:          STATUS_MAP[event.status?.toLowerCase()]   ?? 'Open',
    type:            'Security Alert',
    detected:        new Date(parseFloat(event._time) * 1000).toISOString(),
    resolved:        null,
    mttr:            null,
    control_id:      isAI ? 'UCF.AI.05' : 'UCF.08.01',
    affected_systems: parseInt(event.count ?? '1', 10),
    source:          'splunk',
    external_id:     event._cd ?? null,
    is_ai:           Boolean(isAI),
  };
}

async function runSearch(host, token, search) {
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' };

  // Create search job
  const createRes = await fetch(`${host}/services/search/jobs`, {
    method: 'POST', headers,
    body: new URLSearchParams({ search, output_mode: 'json', exec_mode: 'oneshot', count: 200 }),
  });
  if (!createRes.ok) throw new Error(`Splunk create job ${createRes.status}`);
  const { results } = await createRes.json();
  return results ?? [];
}

async function sync(supabase) {
  const search = process.env.SPLUNK_SEARCH ?? DEFAULT_SEARCH;
  const events = await runSearch(process.env.SPLUNK_HOST, process.env.SPLUNK_TOKEN, search);
  const rows   = events.map(mapEvent);

  const { error } = await supabase.from('incidents').upsert(rows, { onConflict: 'id' });
  if (error) throw error;

  console.log(`[splunk] synced ${rows.length} incidents`);
  return rows.length;
}

if (require.main === module) {
  const missing = REQUIRED_VARS.filter(v => !process.env[v]);
  if (missing.length) { console.error('Missing env vars:', missing.join(', ')); process.exit(1); }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  sync(supabase).then(n => console.log(`Done — ${n} rows upserted`)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = { sync };
