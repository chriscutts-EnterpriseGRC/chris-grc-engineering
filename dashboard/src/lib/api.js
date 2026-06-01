import { supabase, isLive } from './supabase';

// ─── Row mappers (Supabase snake_case → camelCase) ────────────────────────────

const mapControl = (r) => ({
  id: r.id, name: r.name, category: r.category,
  frameworks: r.frameworks ?? [],
  effectiveness: r.effectiveness, score: r.score ?? 0,
  owner: r.owner, lastTested: r.last_tested, ai: r.is_ai ?? false,
});

const mapVuln = (r) => ({
  id: r.id, cve: r.cve, title: r.title, severity: r.severity,
  cvss: r.cvss, status: r.status, asset: r.asset,
  controlId: r.control_id, discovered: r.discovered,
  source: r.source, ai: r.is_ai ?? false,
  // VSRM fields
  priority: r.priority,
  secTier: r.sec_tier,
  environment: r.environment,
  exposure: r.exposure,
  exploitability: r.exploitability,
  isCisaKev: r.is_cisa_kev ?? false,
  assignedTo: r.assigned_to,
  dueDate: r.due_date,
  extendedDueDate: r.extended_due_date,
  extensionApprover: r.extension_approver,
  extensionCount: r.extension_count ?? 0,
  closedReason: r.closed_reason,
  relatedRiskId: r.related_risk_id,
});

const mapIncident = (r) => ({
  id: r.id, title: r.title, severity: r.severity, status: r.status,
  type: r.type, detected: r.detected?.slice(0, 10),
  mttr: r.mttr, controlId: r.control_id,
  systems: r.affected_systems, source: r.source, ai: r.is_ai ?? false,
});

const mapPolicy = (r) => ({
  id: r.id, title: r.title, category: r.category, owner: r.owner,
  status: r.status, reviewDate: r.review_date,
  exceptions: r.exceptions ?? 0, controlId: r.control_id,
  version: r.version, documentUrl: r.document_url, ai: r.is_ai ?? false,
});

const mapVendor = (r) => ({
  id: r.id, name: r.name, category: r.category,
  tier: r.tier, riskScore: r.risk_score, status: r.status,
  contractExpiry: r.contract_expiry, dataShared: r.data_shared,
  controlId: r.control_id, lastAssessed: r.last_assessed, ai: r.is_ai ?? false,
});

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function fetchTable(table, mapper) {
  if (!isLive) return null;
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.warn(`[api] ${table} fetch error:`, error.message);
    return null;
  }
  return data.map(mapper);
}

// ─── Public API ───────────────────────────────────────────────────────────────
// Each function returns live data or null (caller falls back to mock).

export const api = {
  getControls:  () => fetchTable('controls',        mapControl),
  getVulns:     () => fetchTable('vulnerabilities', mapVuln),
  getIncidents: () => fetchTable('incidents',       mapIncident),
  getPolicies:  () => fetchTable('policies',        mapPolicy),
  getVendors:   () => fetchTable('vendors',         mapVendor),

  async loadAll() {
    const [controls, vulns, incidents, policies, vendors] = await Promise.all([
      api.getControls(),
      api.getVulns(),
      api.getIncidents(),
      api.getPolicies(),
      api.getVendors(),
    ]);
    // Return null if nothing loaded (keeps demo mode)
    if (!controls && !vulns && !incidents && !policies && !vendors) return null;
    return { controls, vulns, incidents, policies, vendors };
  },
};
