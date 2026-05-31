/**
 * Jira → Incidents adapter
 *
 * Pulls issues from a Jira project and upserts them into the `incidents` table.
 * Configure via .env:
 *   JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY
 *
 * Maps Jira priority → severity and Jira status → incident status.
 * Extend CONTROL_MAP to auto-assign UCF controls based on issue labels.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const REQUIRED_VARS = ['JIRA_HOST','JIRA_EMAIL','JIRA_API_TOKEN','JIRA_PROJECT_KEY',
                       'SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'];

// ─── Control mapping — extend to match your Jira labels ──────────────────────
const CONTROL_MAP = {
  'access-control':   'UCF.01.01',
  'privileged-access':'UCF.01.02',
  'data-breach':      'UCF.02.02',
  'malware':          'UCF.08.01',
  'phishing':         'UCF.07.02',
  'third-party':      'UCF.06.02',
  'ai-incident':      'UCF.AI.05',
  'default':          'UCF.04.01',
};

const SEVERITY_MAP = {
  Highest: 'Critical', High: 'High', Medium: 'Medium',
  Low: 'Low', Lowest: 'Low',
};

const STATUS_MAP = {
  'To Do': 'Open', 'In Progress': 'Investigating',
  'In Review': 'Investigating', Done: 'Resolved',
  Closed: 'Resolved', Resolved: 'Resolved',
};

function mapIssue(issue) {
  const fields = issue.fields;
  const labels = (fields.labels || []).map(l => l.toLowerCase());
  const controlId = labels.reduce((acc, l) => CONTROL_MAP[l] || acc, CONTROL_MAP.default);
  const isAI = labels.some(l => l.includes('ai') || l.includes('llm') || l.includes('ml'));

  return {
    id:               `JIRA-${issue.key}`,
    title:            fields.summary,
    severity:         SEVERITY_MAP[fields.priority?.name] ?? 'Medium',
    status:           STATUS_MAP[fields.status?.name]     ?? 'Open',
    type:             fields.issuetype?.name              ?? 'Incident',
    detected:         fields.created,
    resolved:         fields.resolutiondate               ?? null,
    mttr:             null,
    control_id:       controlId,
    affected_systems: 1,
    source:           'jira',
    external_id:      issue.key,
    is_ai:            isAI,
  };
}

async function sync(supabase) {
  const auth = Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64');
  const jql  = encodeURIComponent(`project=${process.env.JIRA_PROJECT_KEY} AND issuetype=Incident ORDER BY created DESC`);
  const url  = `${process.env.JIRA_HOST}/rest/api/3/search?jql=${jql}&maxResults=100&fields=summary,priority,status,issuetype,created,resolutiondate,labels`;

  const res  = await fetch(url, { headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Jira API ${res.status}: ${await res.text()}`);

  const { issues } = await res.json();
  const rows = issues.map(mapIssue);

  const { error } = await supabase.from('incidents').upsert(rows, { onConflict: 'id' });
  if (error) throw error;

  console.log(`[jira] synced ${rows.length} incidents`);
  return rows.length;
}

// ─── Standalone runner ────────────────────────────────────────────────────────
if (require.main === module) {
  const missing = REQUIRED_VARS.filter(v => !process.env[v]);
  if (missing.length) { console.error('Missing env vars:', missing.join(', ')); process.exit(1); }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  sync(supabase).then(n => console.log(`Done — ${n} rows upserted`)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = { sync };
