-- ============================================================================
-- 4. SITE SETTINGS (Key-value store for admin settings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id         text PRIMARY KEY DEFAULT 'main',
  settings   jsonb       NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- RLS: Only authenticated users can read/modify settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Authenticated users can read settings'
  ) THEN
    CREATE POLICY "Authenticated users can read settings"
      ON site_settings FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_settings' AND policyname = 'Authenticated users can modify settings'
  ) THEN
    CREATE POLICY "Authenticated users can modify settings"
      ON site_settings FOR ALL
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;
