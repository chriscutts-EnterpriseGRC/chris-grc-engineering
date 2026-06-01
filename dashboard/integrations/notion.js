/**
 * Notion → Policy adapter
 *
 * Reads a Notion database where each page is a policy document and upserts
 * into the `policies` table. The database should have these properties:
 *   Name (title), Owner (rich_text), Status (select), Review Date (date),
 *   Category (select), Version (rich_text), Exceptions (number)
 *
 * Configure via .env:
 *   NOTION_TOKEN, NOTION_POLICY_DB_ID
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const REQUIRED_VARS = ['NOTION_TOKEN','NOTION_POLICY_DB_ID',
                       'SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'];

const STATUS_MAP = {
  'Current':         'Current',
  'Due for Review':  'Due for Review',
  'Overdue':         'Overdue',
  'Missing':         'Missing',
  'Draft':           'Due for Review',
  'Archived':        'Overdue',
};

const CATEGORY_CONTROL_MAP = {
  'Access Control':   'UCF.01.01',
  'Data Management':  'UCF.02.01',
  'Security Ops':     'UCF.04.01',
  'Vendor Mgmt':      'UCF.06.01',
  'Policy Mgmt':      'UCF.07.01',
  'HR Security':      'UCF.07.02',
  'AI Governance':    'UCF.AI.01',
  'default':          'UCF.07.01',
};

function prop(page, name, type) {
  const p = page.properties?.[name];
  if (!p) return null;
  switch (type) {
    case 'title':       return p.title?.map(t => t.plain_text).join('') || null;
    case 'rich_text':   return p.rich_text?.map(t => t.plain_text).join('') || null;
    case 'select':      return p.select?.name || null;
    case 'date':        return p.date?.start || null;
    case 'number':      return p.number ?? 0;
    default:            return null;
  }
}

function mapPage(page) {
  const title    = prop(page, 'Name', 'title')     ?? prop(page, 'Title', 'title') ?? 'Untitled Policy';
  const category = prop(page, 'Category', 'select') ?? 'Policy Mgmt';
  const status   = STATUS_MAP[prop(page, 'Status', 'select')] ?? 'Current';
  const isAI     = category.toLowerCase().includes('ai');

  return {
    id:           `NOTION-${page.id.replace(/-/g,'').slice(0,8)}`,
    title,
    category,
    owner:        prop(page, 'Owner', 'rich_text')        ?? null,
    status,
    review_date:  prop(page, 'Review Date', 'date')       ?? null,
    exceptions:   prop(page, 'Exceptions', 'number')      ?? 0,
    control_id:   CATEGORY_CONTROL_MAP[category]          ?? CATEGORY_CONTROL_MAP.default,
    version:      prop(page, 'Version', 'rich_text')      ?? null,
    document_url: page.url                                ?? null,
    is_ai:        isAI,
  };
}

async function queryDatabase(token, dbId) {
  const rows = [];
  let cursor;
  do {
    const body = cursor ? { start_cursor: cursor } : {};
    const res  = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method:  'POST',
      headers: {
        Authorization:    `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type':   'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Notion API ${res.status}: ${await res.text()}`);
    const data = await res.json();
    rows.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return rows;
}

async function sync(supabase) {
  const pages = await queryDatabase(process.env.NOTION_TOKEN, process.env.NOTION_POLICY_DB_ID);
  const rows  = pages.map(mapPage);

  const { error } = await supabase.from('policies').upsert(rows, { onConflict: 'id' });
  if (error) throw error;

  console.log(`[notion] synced ${rows.length} policies`);
  return rows.length;
}

if (require.main === module) {
  const missing = REQUIRED_VARS.filter(v => !process.env[v]);
  if (missing.length) { console.error('Missing env vars:', missing.join(', ')); process.exit(1); }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  sync(supabase).then(n => console.log(`Done — ${n} rows upserted`)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = { sync };
