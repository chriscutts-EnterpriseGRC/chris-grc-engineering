// ─── Risk Register Seed ───────────────────────────────────────────────────────
// Four canonical Docker/AI risk records. Single source of truth for all panels.
// Built from public threat intelligence — illustrative / sample data.
//
// signalSource drives panel derivation:
//   "vulnerability"   → Vulnerabilities panel
//   "supply_chain"    → Third-Party / Supply Chain panel
//   "ai_governance"   → AI Governance panel
//   "policy_exception"→ Policy Exceptions panel
//
// UCF controlIds feed the residual scoring formula in GRCDashboard.jsx.
// The controls[] array drives the Compliance hotspot view.

export const riskSeed = [
  // ── RISK-2026-0042 ─────────────────────────────────────────────────────────
  {
    id: 'RISK-2026-0042',
    title: 'Docker Engine Authorization Bypass (CVE-2026-34040)',
    signalSource: 'vulnerability',
    category: 'Vuln Mgmt',
    asset: 'Docker Daemon / Container Hosts',
    owner: 'T. Williams',
    likelihood: 4,
    impact: 5,
    // controlIds fed to CTRL_EFF scoring in GRCDashboard.jsx
    controlIds: ['UCF.03.02', 'UCF.05.01'],
    treatment: 'Mitigate',
    treatmentStrategy: 'mitigate',
    treatmentPlan: 'Upgrade Docker Engine to ≥v27.3; restrict daemon socket access; enable User Namespace Remapping; deploy socket proxy with mTLS for CI/CD',
    status: 'In Review',
    reviewDate: '2026-06-24',
    slaDays: 14,
    ai: false,

    // ISO 27005 identification
    threatAgent: 'External attacker with Docker API reachability; malicious insider; compromised CI/CD identity',
    threatVector: 'HTTP request >1MB padded to exceed AuthZ plugin inspection threshold — daemon processes request before plugin can evaluate it',
    vulnerability: 'Docker daemon socket exposed within prod subnet; AuthZ plugin enforcement inconsistently applied; container-to-host privilege escalation path open',
    assetAtRisk: 'Docker daemon host OS, all container workloads, CI/CD pipeline secrets',
    existingExposure: 'Docker API accessible within prod subnet; no socket proxy; partial network segmentation only',
    whyItMatters: 'A single exploited container becomes a full host takeover — every container on that host is compromised.',

    // Framework control mappings (drives Compliance hotspot view)
    controls: [
      { framework: 'NIST SI-2',              requirement: 'Flaw Remediation',                          gap: 'Docker Engine not patched within 14-day SLA' },
      { framework: 'ISO 27001 A.12.6.1',     requirement: 'Management of technical vulnerabilities',   gap: 'Vulnerability SLA not enforced for container runtime' },
      { framework: 'SOC 2 CC7.1',            requirement: 'Change and risk assessment',                 gap: 'Patch process does not cover container runtime components' },
      { framework: 'CIS Docker Benchmark 2.1', requirement: 'Restrict network traffic',                gap: 'Docker API socket accessible from CI/CD without mTLS' },
    ],

    // Per-control scoring for the detail view
    controlEffectiveness: [
      { control: 'UCF.03.02 Patch Management',    effectiveness: 41, note: 'Pipeline does not cover container runtime' },
      { control: 'UCF.05.01 Network Segmentation', effectiveness: 71, note: 'Partial — Docker socket not network-isolated' },
    ],

    isException: false,
  },

  // ── RISK-2026-0043 ─────────────────────────────────────────────────────────
  {
    id: 'RISK-2026-0043',
    title: 'npm / PyPI Supply Chain Worm (Shai-Hulud class)',
    signalSource: 'supply_chain',
    category: 'Third Party',
    asset: 'CI/CD Pipeline, Developer Workstations, Container Images',
    owner: 'S. Chen',
    likelihood: 4,
    impact: 5,
    controlIds: ['UCF.06.01', 'UCF.06.02'],
    treatment: 'Mitigate',
    treatmentStrategy: 'mitigate',
    treatmentPlan: 'Pin all dependencies with hash-verified lockfiles; enable Sigstore/Rekor signing in CI; deploy SLSA Level 3 build provenance; enable Docker Scout image scanning on every ECR push',
    status: 'Open',
    reviewDate: '2026-06-17',
    slaDays: 7,
    ai: false,

    threatAgent: 'Organised group (TeamPCP) running self-propagating worm; opportunistic toolchain reuse by unrelated actors',
    threatVector: 'Malicious package executes arbitrary code during npm preinstall phase; typosquatted packages inject backdoors at install time into CI containers',
    vulnerability: 'No dependency hash pinning; no build provenance attestation; no package registry monitoring or allowlist; SBOM absent',
    assetAtRisk: 'Build artifacts, developer machines, production container images, secrets in CI environment',
    existingExposure: 'Direct PyPI/npm installs in CI without hash verification; no SBOM; no registry allowlist enforced',
    whyItMatters: '"Latest" is no longer a sufficient answer — supply chain compromise is now the fastest path to code execution in production.',

    controls: [
      { framework: 'ISO 27001 A.15.2.1',    requirement: 'Monitoring and review of supplier services',  gap: 'Package registries not treated as suppliers; no monitoring' },
      { framework: 'NIST SR-4',             requirement: 'Provenance of components, processes, and services', gap: 'No SBOM, no build provenance, no attestation' },
      { framework: 'SOC 2 CC9.2',           requirement: 'Vendor risk management',                      gap: 'Open-source dependencies outside vendor risk scope' },
      { framework: 'OWASP A08:2021',        requirement: 'Software and data integrity failures',         gap: 'No code signing or integrity checks at install time' },
    ],

    controlEffectiveness: [
      { control: 'UCF.06.01 Third Party Risk Assessment', effectiveness: 63, note: 'Covers SaaS vendors only — open-source excluded' },
      { control: 'UCF.06.02 Vendor Questionnaire Process', effectiveness: 62, note: 'No mechanism for open-source package governance' },
    ],

    isException: false,
  },

  // ── RISK-2026-0044 ─────────────────────────────────────────────────────────
  {
    id: 'RISK-2026-0044',
    title: 'Shadow AI: Ungoverned AI Agent Access to Production Systems',
    signalSource: 'ai_governance',
    category: 'AI Governance',
    asset: 'Production Systems, PII Datastores, Codebase',
    owner: 'A. Patel',
    likelihood: 4,
    impact: 4,
    controlIds: ['UCF.AI.01', 'UCF.AI.02', 'UCF.AI.03'],
    treatment: 'Mitigate',
    treatmentStrategy: 'mitigate',
    treatmentPlan: 'Create AI system inventory; deploy DLP on AI API traffic; implement AI identity governance with scoped service accounts; require CISO approval for any AI with production system access',
    status: 'Open',
    reviewDate: '2026-07-10',
    slaDays: 30,
    ai: true,

    threatAgent: 'Efficiency-seeking insider; autonomous agent with unintended over-permissioned access; external actor exploiting over-privileged AI identity',
    threatVector: 'Sensitive data ingested by unauthorised AI platform; AI agent acting under human credential causing audit misattribution; over-privileged agent identity abused for lateral movement',
    vulnerability: 'No AI inventory; no AI-specific DLP; agent identities ungoverned and over-permissioned; no approval workflow for production AI access grants',
    assetAtRisk: 'Customer PII, proprietary source code, production credentials, internal communications',
    existingExposure: 'Multiple AI tools in use without IT oversight; CI/CD integrations granted broad repo access; no outbound AI API monitoring',
    whyItMatters: 'This is a governance gap, not a hacking gap — risk materialises from approved tools used without appropriate controls.',

    controls: [
      { framework: 'EU AI Act Art. 9',          requirement: 'Risk management system',              gap: 'No AI risk register or mandatory impact assessments' },
      { framework: 'ISO/IEC 42001 § 8.4',       requirement: 'AI system data management',           gap: 'No controls restricting what data enters AI systems' },
      { framework: 'NIST AI RMF GOVERN 1.2',    requirement: 'AI policies and accountability',      gap: 'No AI usage policy; no designated AI owner' },
      { framework: 'OWASP LLM06',               requirement: 'Sensitive information disclosure',    gap: 'No DLP on AI API calls; output not filtered' },
    ],

    controlEffectiveness: [
      { control: 'UCF.AI.01 AI Model Governance',    effectiveness: 29, note: 'No formal AI inventory or governance programme' },
      { control: 'UCF.AI.02 AI Data Privacy & Bias', effectiveness: 33, note: 'No DLP specific to AI data flows' },
      { control: 'UCF.AI.03 AI Security Controls',   effectiveness: 0,  note: 'Not tested — no OWASP LLM controls implemented' },
    ],

    isException: false,
  },

  // ── RISK-2026-0045 ─────────────────────────────────────────────────────────
  {
    id: 'RISK-2026-0045',
    title: 'Ungoverned LLM Calls: No API Gateway or Outbound Control',
    signalSource: 'ai_governance',
    category: 'AI Security',
    asset: 'All LLM API Integrations',
    owner: 'A. Patel',
    likelihood: 3,
    impact: 4,
    controlIds: ['UCF.AI.03', 'UCF.AI.04', 'UCF.01.02'],
    treatment: 'Mitigate',
    treatmentStrategy: 'mitigate',
    treatmentPlan: 'Deploy LLM gateway (LiteLLM / Portkey); enforce scoped service accounts for all AI calls; implement model allowlist; add prompt and output DLP; directly remediates RISK-2026-0044',
    status: 'Open',
    reviewDate: '2026-07-10',
    slaDays: 30,
    ai: true,

    threatAgent: 'Efficiency-seeking insider; agent running under human credentials; external actor abusing over-privileged AI integration; malicious model or tool provider',
    threatVector: 'Direct calls to external LLM APIs with no boundary layer; no rate limiting; no prompt or output inspection; no identity audit trail separating human from AI actions',
    vulnerability: 'No LLM gateway; AI calls made under individual human credentials; no approved model allowlist; no cost controls or API usage monitoring',
    assetAtRisk: 'Confidential data in prompts, corporate identity and credentials in API headers, cost exposure from uncontrolled model calls',
    existingExposure: 'Engineers calling OpenAI directly from production code; no API key rotation policy; no centralised usage dashboard',
    whyItMatters: 'Today there is no central boundary — deploying one gateway immediately enforces every AI control across all integrations.',

    controls: [
      { framework: 'EU AI Act Art. 13',          requirement: 'Transparency obligations',              gap: 'No logging of AI decisions or outputs; end-users not informed' },
      { framework: 'ISO/IEC 42001 § 8.5',        requirement: 'AI system operations and monitoring', gap: 'No operational monitoring of LLM API usage or spend' },
      { framework: 'NIST AI RMF MANAGE 2.4',     requirement: 'Third-party AI risks',                 gap: 'No AI vendor gateway or contract enforcement mechanism' },
      { framework: 'OWASP LLM07',               requirement: 'Insecure plugin design',               gap: 'LLM APIs callable without authentication boundary' },
    ],

    controlEffectiveness: [
      { control: 'UCF.AI.03 AI Security Controls',      effectiveness: 0,  note: 'Not tested — LLM gateway not implemented' },
      { control: 'UCF.AI.04 AI Vendor Risk Management',  effectiveness: 51, note: 'Vendor risk assessed but no technical enforcement' },
      { control: 'UCF.01.02 Privileged Access Management', effectiveness: 38, note: 'AI API keys not governed under PAM programme' },
    ],

    isException: false,
  },
];

// ─── Computed risk array ───────────────────────────────────────────────────────
// CTRL_EFF subset used for residual computation; full map lives in GRCDashboard.jsx.
const CTRL_EFF_LOCAL = {
  'UCF.01.01':92,'UCF.01.02':38,'UCF.02.02':45,'UCF.03.02':41,
  'UCF.AI.02':33,'UCF.AI.03':0,'UCF.AI.04':51,'UCF.AI.05':0,
  'UCF.04.01':87,'UCF.05.01':71,'UCF.06.01':63,'UCF.06.02':62,
  'UCF.07.01':74,'UCF.09.01':69,'UCF.AI.01':29,
};

// PRD band thresholds: Critical 20-25, High 12-19, Medium 6-11, Low 2-5
const getBand = s => s >= 20 ? 'critical' : s >= 12 ? 'high' : s >= 6 ? 'medium' : 'low';

export const risks = riskSeed.map(r => {
  const inherentScore = r.likelihood * r.impact;
  const reductionFactor = r.controlIds.reduce((f, id) => f * (1 - ((CTRL_EFF_LOCAL[id] ?? 50) / 100) * 0.5), 1);
  const residualScore = Math.max(2, Math.round(inherentScore * reductionFactor));
  const residualBand = getBand(residualScore);
  return { ...r, inherentScore, residualScore, residualBand };
});

// Health score: 100 - (sum of residuals / max possible) × 100
export function computeHealthScore(riskList) {
  if (!riskList || riskList.length === 0) return 0;
  const sum = riskList.reduce((a, r) => a + r.residualScore, 0);
  return Math.max(0, 100 - Math.round((sum / (riskList.length * 25)) * 100));
}
