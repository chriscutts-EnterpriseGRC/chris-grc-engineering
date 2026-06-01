// VSRM — Vulnerability Severity Rating Matrix (VMP §6)
// Inputs: environment + exposure + CVSS + exploitability → P0–P4 priority

const EXPLOITABILITY_IDX = {
  'Actively Exploited': 0,
  'Mature Exploit':     1,
  'POC':                2,
  'No Exploit':         3,
};

function cvssBand(cvss) {
  const n = Number(cvss);
  if (n >= 9.0) return 'high';
  if (n >= 7.0) return 'med-high';
  if (n >= 5.0) return 'med';
  return 'low';
}

// Each row: [Actively Exploited, Mature Exploit, POC, No Exploit]
const TABLE = {
  Production: {
    Public: {
      high:      ['P0','P1','P2','P3'],
      'med-high':['P1','P1','P2','P3'],
      med:       ['P2','P2','P3','P3'],
      low:       ['P2','P3','P4','P4'],
    },
    Internet: {
      high:      ['P1','P1','P2','P3'],
      'med-high':['P1','P2','P3','P3'],
      med:       ['P2','P2','P3','P4'],
      low:       ['P1','P2','P3','P4'],
    },
    Internal: {
      high:      ['P1','P2','P3','P4'],
      'med-high':['P2','P3','P3','P4'],
      med:       ['P3','P3','P4','P4'],
      low:       ['P4','P4','P4','P4'],
    },
  },
  'Dev/Stage': {
    Any: {
      high:      ['P2','P3','P3','P4'],
      'med-high':['P3','P3','P4','P4'],
      med:       ['P3','P4','P4','P4'],
      low:       ['P4','P4','P4','P4'],
    },
  },
};

// SLA days per priority — VMP §7 Baseline SLAs
export const SLA_DAYS = { P0: 1, P1: 14, P2: 30, P3: 60, P4: 90 };

// Total SLA cap after max extension — VMP §7 Extension Policy
export const MAX_TOTAL_DAYS = { P0: 1, P1: 28, P2: 60, P3: 120, P4: 365 };

export const PRIORITY_NAMES = {
  P0: 'Incident', P1: 'Blocker', P2: 'Critical', P3: 'Major', P4: 'Minor',
};

export const PRIORITY_COLOR = {
  P0: { bg: 'bg-red-50',    text: 'text-red-800',    border: 'border-red-200',    dot: '#EF4444' },
  P1: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', dot: '#F97316' },
  P2: { bg: 'bg-amber-50',  text: 'text-amber-800',  border: 'border-amber-200',  dot: '#EAB308' },
  P3: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  dot: '#22C55E' },
  P4: { bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200',  dot: '#94A3B8' },
};

export function calculatePriority(environment, exposure, cvss, exploitability) {
  const env = TABLE[environment];
  if (!env) return 'P4';
  const expMap = env[exposure] ?? env['Any'];
  if (!expMap) return 'P4';
  const band = expMap[cvssBand(cvss)];
  if (!band) return 'P4';
  const idx = EXPLOITABILITY_IDX[exploitability] ?? 3;
  return band[idx] ?? 'P4';
}

export function getDueDate(discoveredDate, priority) {
  const d = new Date(discoveredDate);
  d.setDate(d.getDate() + (SLA_DAYS[priority] ?? 90));
  return d.toISOString().slice(0, 10);
}

// Positive = days remaining, negative = days overdue
export function daysFromToday(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}
