-- Create the initial schema for the Himanshu Jaiswal Digital Studio portfolio site.
-- This migration creates tables for projects, reviews, and contact_messages
-- with appropriate RLS policies.

-- ============================================================================
-- 1. PROJECTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text        NOT NULL,
  slug       text        NOT NULL UNIQUE,
  description text,
  cover_image text,
  images     jsonb       DEFAULT '[]'::jsonb,
  features   jsonb       DEFAULT '[]'::jsonb,
  tools      jsonb       DEFAULT '[]'::jsonb,
  github_url text,
  live_url   text,
  featured   boolean     DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger to auto-update updated_at on project changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS: Anyone can read projects; only authenticated users can modify
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Anyone can read projects'
  ) THEN
    CREATE POLICY "Anyone can read projects"
      ON projects FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Authenticated users can insert projects'
  ) THEN
    CREATE POLICY "Authenticated users can insert projects"
      ON projects FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Authenticated users can update projects'
  ) THEN
    CREATE POLICY "Authenticated users can update projects"
      ON projects FOR UPDATE
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Authenticated users can delete projects'
  ) THEN
    CREATE POLICY "Authenticated users can delete projects"
      ON projects FOR DELETE
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- ============================================================================
-- 2. REVIEWS
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text,
  rating      integer     NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content     text        NOT NULL,
  approved    boolean     DEFAULT false,
  pinned      boolean     DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

-- RLS: Anyone can read approved reviews; anyone can submit (goes to pending);
--       only authenticated users can manage
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Anyone can read approved reviews'
  ) THEN
    CREATE POLICY "Anyone can read approved reviews"
      ON reviews FOR SELECT
      USING (approved = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Anyone can submit reviews'
  ) THEN
    CREATE POLICY "Anyone can submit reviews"
      ON reviews FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Authenticated users can update reviews'
  ) THEN
    CREATE POLICY "Authenticated users can update reviews"
      ON reviews FOR UPDATE
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'Authenticated users can delete reviews'
  ) THEN
    CREATE POLICY "Authenticated users can delete reviews"
      ON reviews FOR DELETE
      USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- ============================================================================
-- 3. CONTACT MESSAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  email      text        NOT NULL,
  message     text        NOT NULL,
  read       boolean     DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- RLS: Anyone can submit (insert); only authenticated users can read/manage
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contact_messages' AND policyname = 'Anyone can submit contact messages'
  ) THEN
    CREATE POLICY "Anyone can submit contact messages"
      ON contact_messages FOR INSERT
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contact_messages' AND policyname = 'Authenticated users can read contact messages'
  ) THEN
    CREATE POLICY "Authenticated users can read contact messages"
      ON contact_messages FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contact_messages' AND policyname = 'Authenticated users can update contact messages'
  ) THEN
    CREATE POLICY "Authenticated users can update contact messages"
      ON contact_messages FOR UPDATE
      USING (auth.role() = 'authenticated')
      WITH CHECK (auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'contact_messages' AND policyname = 'Authenticated users can delete contact messages'
  ) THEN
    CREATE POLICY "Authenticated users can delete contact messages"
      ON contact_messages FOR DELETE
      USING (auth.role() = 'authenticated');
  END IF;
END $$;