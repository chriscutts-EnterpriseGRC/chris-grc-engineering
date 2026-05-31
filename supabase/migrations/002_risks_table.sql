-- ─── Risk Register Table ─────────────────────────────────────────────────────
-- Conforms to schemas/risk.schema.json v1.0.0
-- Apply with: supabase db push  OR  paste into Supabase SQL editor

CREATE TABLE IF NOT EXISTS risks (
  risk_id           TEXT PRIMARY KEY,                   -- e.g. RISK-20260531-cloud-misc
  schema_version    TEXT NOT NULL DEFAULT '1.0.0',
  title             TEXT NOT NULL,
  statement         TEXT,
  category          TEXT,                               -- Security | Compliance | Privacy | Operational
  status            TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open','watching','mitigating','accepted','transferred','closed')),
  owner             JSONB NOT NULL,                     -- { name, email, team }
  treatment         TEXT NOT NULL DEFAULT 'mitigate'
                    CHECK (treatment IN ('mitigate','accept','transfer','avoid','monitor')),
  treatment_plan    TEXT,
  inherent          JSONB NOT NULL,                     -- { likelihood, impact, score, notes }
  residual          JSONB,                              -- { likelihood, impact, score, notes }
  linked_findings   TEXT[] DEFAULT '{}',                -- connector finding IDs
  linked_controls   TEXT[] DEFAULT '{}',                -- references controls.id
  tags              TEXT[] DEFAULT '{}',
  reviewed_at       TIMESTAMPTZ,
  target_close_at   TIMESTAMPTZ,
  metadata          JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_risks_status      ON risks(status);
CREATE INDEX IF NOT EXISTS idx_risks_category    ON risks(category);
CREATE INDEX IF NOT EXISTS idx_risks_target      ON risks(target_close_at);
CREATE INDEX IF NOT EXISTS idx_risks_inherent    ON risks((inherent->>'score'));
CREATE INDEX IF NOT EXISTS idx_risks_tags        ON risks USING GIN(tags);

-- ─── updated_at trigger ───────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_updated_at ON risks;
CREATE TRIGGER trg_updated_at
  BEFORE UPDATE ON risks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read" ON risks;
CREATE POLICY "anon_read" ON risks FOR SELECT USING (true);

DROP POLICY IF EXISTS "auth_write" ON risks;
CREATE POLICY "auth_write" ON risks FOR ALL TO authenticated USING (true) WITH CHECK (true);
