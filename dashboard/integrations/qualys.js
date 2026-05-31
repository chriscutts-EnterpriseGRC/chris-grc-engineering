/**
 * Qualys → Vulnerabilities adapter
 *
 * Pulls host detections from Qualys VMDR API and upserts into `vulnerabilities`.
 * Configure via .env:
 *   QUALYS_API_URL, QUALYS_USERNAME, QUALYS_PASSWORD
 *
 * Maps Qualys severity (1-5) → Critical/High/Medium/Low.
 * Extend CONTROL_MAP to link vulnerability categories to UCF controls.
 */

const { createClient } = require('@supabase/supabase-js');
const { parseStringPromise } = require('xml2js');
require('dotenv').config();

const REQUIRED_VARS = ['QUALYS_API_URL','QUALYS_USERNAME','QUALYS_PASSWORD',
                       'SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'];

const SEVERITY_MAP = { 5:'Critical', 4:'High', 3:'Medium', 2:'Low', 1:'Low' };

// Map Qualys QID categories → UCF controls
const CATEGORY_CONTROL_MAP = {
  'Windows':       'UCF.03.02',
  'Linux':         'UCF.03.02',
  'Web Server':    'UCF.03.02',
  'Database':      'UCF.03.02',
  'Network':       'UCF.05.01',
  'Firewall':      'UCF.05.01',
  'Authentication':'UCF.01.02',
  'Encryption':    'UCF.02.01',
  'default':       'UCF.03.01',
};

function categoryToControl(category = '') {
  return Object.entries(CATEGORY_CONTROL_MAP).find(([k]) =>
    category.toLowerCase().includes(k.toLowerCase())
  )?.[1] ?? CATEGORY_CONTROL_MAP.default;
}

function mapDetection(host, detection) {
  const severity  = parseInt(detection.SEVERITY?.[0] ?? '3', 10);
  const qid       = detection.QID?.[0] ?? 'UNKNOWN';
  const cve       = detection.CVE_LIST?.[0]?.CVE?.[0]?.ID?.[0] ?? null;
  const title     = detection.RESULTS?.[0]?.slice(0, 120) ?? `QID ${qid}`;
  const status    = detection.STATUS?.[0] === 'Fixed' ? 'Patched' : 'Open';
  const category  = detection.CATEGORY?.[0] ?? '';

  return {
    id:         `Q-${host.IP?.[0]?.replace(/\./g,'-')}-${qid}`,
    cve:        cve ?? `QID-${qid}`,
    title,
    severity:   SEVERITY_MAP[severity] ?? 'Medium',
    cvss:       parseFloat(detection.CVSS_BASE?.[0] ?? detection.CVSS3_BASE?.[0] ?? '0') || null,
    status,
    asset:      host.DNS?.[0] ?? host.IP?.[0] ?? 'unknown',
    control_id: categoryToControl(category),
    discovered: detection.FIRST_FOUND_DATETIME?.[0]?.slice(0, 10) ?? null,
    source:     'qualys',
    external_id:`${qid}`,
    is_ai:      false,
  };
}

async function sync(supabase) {
  const creds = Buffer.from(`${process.env.QUALYS_USERNAME}:${process.env.QUALYS_PASSWORD}`).toString('base64');
  const headers = {
    Authorization: `Basic ${creds}`,
    'X-Requested-With': 'resilience-ops-dashboard',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  // Request host detections (severity 4-5 only to limit volume)
  const res = await fetch(`${process.env.QUALYS_API_URL}/api/2.0/fo/asset/host/vm/detection/`, {
    method: 'POST',
    headers,
    body: 'action=list&severities=4,5&status=New,Active,Re-Opened&truncation_limit=200',
  });
  if (!res.ok) throw new Error(`Qualys API ${res.status}: ${await res.text()}`);

  const xml  = await res.text();
  const json = await parseStringPromise(xml, { explicitArray: true });
  const hosts = json?.HOST_LIST_VM_DETECTION_OUTPUT?.RESPONSE?.[0]?.HOST_LIST?.[0]?.HOST ?? [];

  const rows = hosts.flatMap(host =>
    (host.DETECTION_LIST?.[0]?.DETECTION ?? []).map(d => mapDetection(host, d))
  );

  const { error } = await supabase.from('vulnerabilities').upsert(rows, { onConflict: 'id' });
  if (error) throw error;

  console.log(`[qualys] synced ${rows.length} vulnerabilities`);
  return rows.length;
}

if (require.main === module) {
  const missing = REQUIRED_VARS.filter(v => !process.env[v]);
  if (missing.length) { console.error('Missing env vars:', missing.join(', ')); process.exit(1); }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  sync(supabase).then(n => console.log(`Done — ${n} rows upserted`)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = { sync };
