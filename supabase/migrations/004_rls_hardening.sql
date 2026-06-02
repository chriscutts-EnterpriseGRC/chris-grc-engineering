-- ─── RLS Hardening: Replace open anon_read with authenticated-only read ────────
-- P0 security remediation — applied 2026-06-02
--
-- BEFORE: "anon_read" ON <table> FOR SELECT USING (true)
--   → Any unauthenticated caller with the anon key could read all rows
--
-- AFTER:  "authenticated_read" ON <table> FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL)
--   → Requires a valid Supabase Auth JWT; anonymous callers are denied
--
-- NOTE: Dashboard must be connected to Supabase Auth or Okta SSO before applying
-- this migration in production. Demo mode (no Supabase configured) is unaffected —
-- it uses inline mock data and never touches the database.

DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['controls','vulnerabilities','incidents','policies','vendors','risks']
  LOOP
    -- Drop the open policy
    EXECUTE format('DROP POLICY IF EXISTS "anon_read" ON %I', t);

    -- Replace with an authenticated-only read policy
    EXECUTE format(
      'CREATE POLICY "authenticated_read" ON %I FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL)',
      t
    );
  END LOOP;
END $$;

-- Verify: confirm no anon_read policies remain
DO $$
DECLARE
  cnt INTEGER;
BEGIN
  SELECT COUNT(*) INTO cnt
  FROM pg_policies
  WHERE policyname = 'anon_read';

  IF cnt > 0 THEN
    RAISE EXCEPTION 'anon_read policies still present — migration incomplete';
  END IF;

  RAISE NOTICE 'RLS hardening complete: % tables now require authenticated_read', 6;
END $$;
