-- ─── VMP Schema Extension ─────────────────────────────────────────────────────
-- Adds VSRM priority fields, SLA tracking, and asset inventory table.
-- Ref: docs/VULNERABILITY-MANAGEMENT-PROGRAM.md §4–§10

-- ─── Vulnerabilities — VSRM & SLA columns ────────────────────────────────────

ALTER TABLE vulnerabilities
  ADD COLUMN IF NOT EXISTS priority            TEXT CHECK (priority IN ('P0','P1','P2','P3','P4')),
  ADD COLUMN IF NOT EXISTS sec_tier            INTEGER CHECK (sec_tier IN (0,1,2)),
  ADD COLUMN IF NOT EXISTS environment         TEXT CHECK (environment IN ('Production','Dev/Stage')),
  ADD COLUMN IF NOT EXISTS exposure            TEXT CHECK (exposure IN ('Public','Internet','Internal')),
  ADD COLUMN IF NOT EXISTS exploitability      TEXT CHECK (exploitability IN ('Actively Exploited','Mature Exploit','POC','No Exploit')),
  ADD COLUMN IF NOT EXISTS is_cisa_kev         BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS assigned_to         TEXT,
  ADD COLUMN IF NOT EXISTS due_date            DATE,
  ADD COLUMN IF NOT EXISTS extended_due_date   DATE,
  ADD COLUMN IF NOT EXISTS extension_approver  TEXT,
  ADD COLUMN IF NOT EXISTS extension_count     INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS closed_reason       TEXT CHECK (closed_reason IN ('resolved','accepted_as_risk','expired')),
  ADD COLUMN IF NOT EXISTS related_risk_id     TEXT REFERENCES risks(risk_id);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_vulns_priority    ON vulnerabilities(priority);
CREATE INDEX IF NOT EXISTS idx_vulns_due_date    ON vulnerabilities(due_date);
CREATE INDEX IF NOT EXISTS idx_vulns_assigned    ON vulnerabilities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_vulns_sec_tier    ON vulnerabilities(sec_tier);
CREATE INDEX IF NOT EXISTS idx_vulns_environment ON vulnerabilities(environment);

-- ─── Asset Inventory ──────────────────────────────────────────────────────────
-- Supports scan coverage KRI: 100% of SecTier 0/1 assets scanned within 7 days.

CREATE TABLE IF NOT EXISTS assets (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL,
  sec_tier       INTEGER CHECK (sec_tier IN (0,1,2)),
  environment    TEXT CHECK (environment IN ('Production','Dev/Stage')),
  exposure       TEXT CHECK (exposure IN ('Public','Internet','Internal')),
  last_scan_date TIMESTAMPTZ,
  scan_tools     TEXT[] DEFAULT '{}',
  owner          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_sec_tier   ON assets(sec_tier);
CREATE INDEX IF NOT EXISTS idx_assets_last_scan  ON assets(last_scan_date);

DROP TRIGGER IF EXISTS trg_updated_at ON assets;
CREATE TRIGGER trg_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read" ON assets;
CREATE POLICY "anon_read" ON assets FOR SELECT USING (true);
DROP POLICY IF EXISTS "auth_write" ON assets;
CREATE POLICY "auth_write" ON assets FOR ALL TO authenticated USING (true) WITH CHECK (true);
