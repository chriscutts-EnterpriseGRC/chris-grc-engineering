/**
 * ServiceNow → Incidents + Policy adapter
 *
 * Pulls security incidents from the `sn_si_incident` table and knowledge
 * articles from `kb_knowledge` into the dashboard.
 *
 * Configure via .env:
 *   SERVICENOW_INSTANCE, SERVICENOW_USER, SERVICENOW_PASSWORD
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const REQUIRED_VARS = ['SERVICENOW_INSTANCE','SERVICENOW_USER','SERVICENOW_PASSWORD',
                       'SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'];

const SEVERITY_MAP = { '1':'Critical', '2':'High', '3':'Medium', '4':'Low', '5':'Low' };

const STATE_MAP = {
  '1':'Open', '2':'Open', '3':'Investigating', '6':'Investigating',
  '7':'Contained', '8':'Resolved', '9':'Resolved',
};

const KB_STATUS_MAP = {
  'draft':'Due for Review', 'review':'Due for Review',
  'published':'Current',    'retired':'Overdue',
};

const CATEGORY_CONTROL_MAP = {
  'access':      'UCF.01.01',
  'data':        'UCF.02.01',
  'malware':     'UCF.08.01',
  'phishing':    'UCF.07.02',
  'network':     'UCF.05.01',
  'vendor':      'UCF.06.01',
  'default':     'UCF.04.01',
};

function categoryToControl(category = '') {
  const lower = category.toLowerCase();
  return Object.entries(CATEGORY_CONTROL_MAP).find(([k]) => lower.includes(k))?.[1]
    ?? CATEGORY_CONTROL_MAP.default;
}

function mapIncident(rec) {
  const isAI = (rec.short_description ?? '').toLowerCase().match(/ai|llm|model|ml/);
  return {
    id:               `SNO-${rec.sys_id.slice(0, 12)}`,
    title:            rec.short_description ?? 'Security Incident',
    severity:         SEVERITY_MAP[rec.severity]          ?? 'Medium',
    status:           STATE_MAP[rec.state]                ?? 'Open',
    type:             rec.category                        ?? 'Security Incident',
    detected:         rec.opened_at                       ?? null,
    resolved:         rec.resolved_at                     ?? null,
    mttr:             null,
    control_id:       categoryToControl(rec.category),
    affected_systems: parseInt(rec.cmdb_ci_count ?? '1', 10),
    source:           'servicenow',
    external_id:      rec.number                         ?? null,
    is_ai:            Boolean(isAI),
  };
}

function mapKBArticle(rec) {
  const isAI = (rec.short_description ?? '').toLowerCase().includes('ai');
  return {
    id:           `SNO-KB-${rec.sys_id.slice(0, 10)}`,
    title:        rec.short_description ?? rec.topic ?? 'Untitled Policy',
    category:     rec.kb_category       ?? 'Security',
    owner:        rec.author            ?? null,
    status:       KB_STATUS_MAP[rec.workflow_state] ?? 'Current',
    review_date:  rec.meta_description?.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null,
    exceptions:   0,
    control_id:   categoryToControl(rec.kb_category),
    version:      rec.version           ?? null,
    document_url: `${process.env.SERVICENOW_INSTANCE}/kb?id=kb_article&sys_id=${rec.sys_id}`,
    is_ai:        isAI,
  };
}

async function snFetch(path, creds) {
  const res = await fetch(`${process.env.SERVICENOW_INSTANCE}${path}`, {
    headers: {
      Authorization: `Basic ${creds}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) throw new Error(`ServiceNow API ${res.status} ${path}: ${await res.text()}`);
  return (await res.json()).result ?? [];
}

async function sync(supabase) {
  const creds = Buffer.from(`${process.env.SERVICENOW_USER}:${process.env.SERVICENOW_PASSWORD}`).toString('base64');

  const [incidents, articles] = await Promise.all([
    snFetch('/api/now/table/sn_si_incident?sysparm_limit=200&sysparm_fields=sys_id,number,short_description,severity,state,category,opened_at,resolved_at,cmdb_ci_count', creds),
    snFetch('/api/now/table/kb_knowledge?sysparm_limit=100&sysparm_fields=sys_id,short_description,topic,author,kb_category,workflow_state,meta_description,version', creds),
  ]);

  const incRows = incidents.map(mapIncident);
  const polRows = articles.map(mapKBArticle);

  const [incErr, polErr] = await Promise.all([
    supabase.from('incidents').upsert(incRows, { onConflict: 'id' }).then(r => r.error),
    supabase.from('policies').upsert(polRows,  { onConflict: 'id' }).then(r => r.error),
  ]);
  if (incErr) throw incErr;
  if (polErr) throw polErr;

  console.log(`[servicenow] synced ${incRows.length} incidents, ${polRows.length} policies`);
  return incRows.length + polRows.length;
}

if (require.main === module) {
  const missing = REQUIRED_VARS.filter(v => !process.env[v]);
  if (missing.length) { console.error('Missing env vars:', missing.join(', ')); process.exit(1); }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  sync(supabase).then(n => console.log(`Done — ${n} rows upserted`)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = { sync };
