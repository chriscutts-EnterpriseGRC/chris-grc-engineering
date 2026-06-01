/**
 * AWS Security Hub → Vulnerabilities adapter
 *
 * Pulls active findings from Security Hub and upserts into `vulnerabilities`.
 * Uses AWS Signature V4 auth — no SDK dependency required.
 *
 * Configure via .env:
 *   AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 *   AWS_SESSION_TOKEN  (optional — for temporary credentials)
 */

const { createClient } = require('@supabase/supabase-js');
const { createHmac, createHash } = require('crypto');
require('dotenv').config();

const REQUIRED_VARS = ['AWS_REGION','AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY',
                       'SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'];

const SEVERITY_MAP = {
  CRITICAL: 'Critical', HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low', INFORMATIONAL: 'Low',
};

const CONTROL_MAP = {
  'iam':          'UCF.01.02',
  'access':       'UCF.01.02',
  's3':           'UCF.02.01',
  'encryption':   'UCF.02.01',
  'kms':          'UCF.02.01',
  'guardduty':    'UCF.08.01',
  'ec2':          'UCF.03.02',
  'patch':        'UCF.03.02',
  'network':      'UCF.05.01',
  'vpc':          'UCF.05.01',
  'container':    'UCF.05.01',
  'sagemaker':    'UCF.AI.03',
  'bedrock':      'UCF.AI.03',
  'default':      'UCF.03.01',
};

function findingToControl(finding) {
  const text = [
    finding.ProductName ?? '',
    finding.Title ?? '',
    ...(finding.Types ?? []),
  ].join(' ').toLowerCase();
  return Object.entries(CONTROL_MAP).find(([k]) => text.includes(k))?.[1] ?? CONTROL_MAP.default;
}

function mapFinding(f) {
  const isAI = /sagemaker|bedrock|ai|ml|llm/i.test([f.ProductName, f.Title, ...(f.Types ?? [])].join(' '));
  const cve   = f.Vulnerabilities?.[0]?.Id ?? null;
  const cvss  = f.Vulnerabilities?.[0]?.Cvss?.[0]?.BaseScore
              ?? f.FindingProviderFields?.Severity?.Original
              ?? null;

  return {
    id:         `ASH-${f.Id.split('/').pop().slice(0, 20)}`,
    cve:        cve ?? `ASH-${f.Id.split('/').pop().slice(0, 12)}`,
    title:      f.Title ?? 'Security Hub Finding',
    severity:   SEVERITY_MAP[f.Severity?.Label] ?? 'Medium',
    cvss:       cvss ? parseFloat(cvss) : null,
    status:     f.RecordState === 'ARCHIVED' ? 'Patched' : 'Open',
    asset:      f.Resources?.[0]?.Id?.split(':').pop() ?? 'aws-resource',
    control_id: findingToControl(f),
    discovered: f.CreatedAt?.slice(0, 10) ?? null,
    source:     'aws_security_hub',
    external_id:f.Id ?? null,
    is_ai:      isAI,
  };
}

// ─── AWS Signature V4 ─────────────────────────────────────────────────────────

function hmac(key, data) {
  return createHmac('sha256', key).update(data).digest();
}

function sha256(data) {
  return createHash('sha256').update(data).digest('hex');
}

function sign(region, service, secretKey, date, stringToSign) {
  const kDate    = hmac(`AWS4${secretKey}`, date);
  const kRegion  = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  return createHmac('sha256', kSigning).update(stringToSign).digest('hex');
}

async function securityHubFetch(body) {
  const region    = process.env.AWS_REGION;
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionTok= process.env.AWS_SESSION_TOKEN ?? '';
  const host      = `securityhub.${region}.amazonaws.com`;
  const endpoint  = `https://${host}/findings`;
  const payload   = JSON.stringify(body);

  const now        = new Date();
  const amzDate    = now.toISOString().replace(/[:-]|\.\d{3}/g, '').slice(0, 15) + 'Z';
  const dateStamp  = amzDate.slice(0, 8);
  const payHash    = sha256(payload);

  const headers = {
    'content-type':        'application/json',
    'host':                host,
    'x-amz-date':          amzDate,
    'x-amz-content-sha256':payHash,
    ...(sessionTok ? { 'x-amz-security-token': sessionTok } : {}),
  };

  const signedHeaders = Object.keys(headers).sort().join(';');
  const canonicalHeaders = Object.entries(headers).sort(([a],[b]) => a.localeCompare(b))
    .map(([k,v]) => `${k}:${v}`).join('\n') + '\n';

  const canonicalRequest = ['POST', '/findings', '', canonicalHeaders, signedHeaders, payHash].join('\n');
  const credScope  = `${dateStamp}/${region}/securityhub/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credScope, sha256(canonicalRequest)].join('\n');
  const signature  = sign(region, 'securityhub', secretKey, dateStamp, stringToSign);

  const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { ...headers, Authorization: authHeader },
    body:    payload,
  });
  if (!res.ok) throw new Error(`Security Hub ${res.status}: ${await res.text()}`);
  return res.json();
}

async function sync(supabase) {
  const rows = [];
  let nextToken;

  do {
    const body = {
      Filters: {
        RecordState:   [{ Value: 'ACTIVE',   Comparison: 'EQUALS' }],
        WorkflowStatus:[{ Value: 'NEW',       Comparison: 'EQUALS' },
                        { Value: 'NOTIFIED',  Comparison: 'EQUALS' }],
        SeverityLabel: [{ Value: 'CRITICAL', Comparison: 'EQUALS' },
                        { Value: 'HIGH',     Comparison: 'EQUALS' },
                        { Value: 'MEDIUM',   Comparison: 'EQUALS' }],
      },
      MaxResults: 100,
      ...(nextToken ? { NextToken: nextToken } : {}),
    };

    const data = await securityHubFetch(body);
    rows.push(...(data.Findings ?? []).map(mapFinding));
    nextToken = data.NextToken;
  } while (nextToken);

  const { error } = await supabase.from('vulnerabilities').upsert(rows, { onConflict: 'id' });
  if (error) throw error;

  console.log(`[aws-security-hub] synced ${rows.length} findings`);
  return rows.length;
}

if (require.main === module) {
  const missing = REQUIRED_VARS.filter(v => !process.env[v]);
  if (missing.length) { console.error('Missing env vars:', missing.join(', ')); process.exit(1); }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  sync(supabase).then(n => console.log(`Done — ${n} rows upserted`)).catch(err => { console.error(err); process.exit(1); });
}

module.exports = { sync };
