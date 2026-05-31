-- ─── Resilience Operations Dashboard — Initial Schema ────────────────────────
-- Apply with: supabase db push  OR  paste into Supabase SQL editor

-- UCF Controls Library
CREATE TABLE IF NOT EXISTS controls (
  id                TEXT PRIMARY KEY,          -- e.g. UCF.01.01
  name              TEXT NOT NULL,
  category          TEXT,
  frameworks        TEXT[]  DEFAULT '{}',      -- ['SOC2 CC6.1','NIST IA-5',...]
  effectiveness     TEXT    NOT NULL DEFAULT 'not_tested'
                    CHECK (effectiveness IN ('effective','partial','ineffective','not_tested')),
  score             INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  owner             TEXT,
  last_tested       DATE,
  is_ai             BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Vulnerabilities
CREATE TABLE IF NOT EXISTS vulnerabilities (
  id                TEXT PRIMARY KEY,          -- e.g. V-001
  cve               TEXT,                      -- CVE-2024-1234 or LLM-2024-001
  title             TEXT NOT NULL,
  severity          TEXT CHECK (severity IN ('Critical','High','Medium','Low')),
  cvss              NUMERIC(3,1),
  status            TEXT DEFAULT 'Open',
  asset             TEXT,
  control_id        TEXT REFERENCES controls(id),
  discovered        DATE,
  source            TEXT DEFAULT 'manual',     -- 'qualys','aws_security_hub','manual'
  external_id       TEXT,                      -- ID in source system
  is_ai             BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Incidents
CREATE TABLE IF NOT EXISTS incidents (
  id                TEXT PRIMARY KEY,
  title             TEXT NOT NULL,
  severity          TEXT CHECK (severity IN ('Critical','High','Medium','Low')),
  status            TEXT DEFAULT 'Open',
  type              TEXT,
  detected          TIMESTAMPTZ,
  resolved          TIMESTAMPTZ,
  mttr              TEXT,
  control_id        TEXT REFERENCES controls(id),
  affected_systems  INTEGER DEFAULT 0,
  source            TEXT DEFAULT 'manual',     -- 'jira','splunk','servicenow','manual'
  external_id       TEXT,
  is_ai             BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Policy Library
CREATE TABLE IF NOT EXISTS policies (
  id                TEXT PRIMARY KEY,
  title             TEXT NOT NULL,
  category          TEXT,
  owner             TEXT,
  status            TEXT DEFAULT 'Current',
  review_date       DATE,
  exceptions        INTEGER DEFAULT 0,
  control_id        TEXT REFERENCES controls(id),
  version           TEXT,
  document_url      TEXT,                      -- link to SharePoint/Confluence/Drive
  is_ai             BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Third Party Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  category          TEXT,
  tier              INTEGER CHECK (tier IN (1,2,3)),
  risk_score        INTEGER CHECK (risk_score BETWEEN 0 AND 100),
  status            TEXT DEFAULT 'Review Pending',
  contract_expiry   DATE,
  data_shared       TEXT,
  control_id        TEXT REFERENCES controls(id),
  last_assessed     DATE,
  is_ai             BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_vulns_control      ON vulnerabilities(control_id);
CREATE INDEX IF NOT EXISTS idx_vulns_severity     ON vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_vulns_status       ON vulnerabilities(status);
CREATE INDEX IF NOT EXISTS idx_incidents_control  ON incidents(control_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status   ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_policies_control   ON policies(control_id);
CREATE INDEX IF NOT EXISTS idx_policies_status    ON policies(status);
CREATE INDEX IF NOT EXISTS idx_vendors_control    ON vendors(control_id);
CREATE INDEX IF NOT EXISTS idx_vendors_risk       ON vendors(risk_score);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['controls','vulnerabilities','incidents','policies','vendors']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t);
  END LOOP;
END $$;

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Enable RLS and allow anon read (dashboard), authenticated write (integrations).
ALTER TABLE controls        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors         ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['controls','vulnerabilities','incidents','policies','vendors']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "anon_read" ON %I', t);
    EXECUTE format('CREATE POLICY "anon_read" ON %I FOR SELECT USING (true)', t);
    EXECUTE format('DROP POLICY IF EXISTS "auth_write" ON %I', t);
    EXECUTE format('CREATE POLICY "auth_write" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
  END LOOP;
END $$;
