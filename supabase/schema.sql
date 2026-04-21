-- ============================================================
-- OpenBook — Town of Sutton, MA
-- Supabase PostgreSQL Schema
--
-- This file is safe to re-run (idempotent). Run it in the
-- Supabase SQL Editor to set up or update all tables, RLS
-- policies, and functions.  Then run seed.sql for initial data.
-- ============================================================

-- ── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Helper function: is_town_manager() ───────────────────────────────────────
-- SECURITY DEFINER bypasses RLS so the function can read profiles without
-- triggering the profiles policies — this breaks the infinite-recursion loop
-- that occurred when TM policies did "SELECT id FROM profiles WHERE role='tm'".
CREATE OR REPLACE FUNCTION public.is_town_manager()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'town_manager'
  );
END;
$$;

REVOKE ALL   ON FUNCTION public.is_town_manager() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_town_manager() TO authenticated;

-- ── Tables ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS departments (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  short_name       TEXT,
  category         TEXT,
  head             TEXT,
  phone            TEXT,
  email            TEXT,
  mission          TEXT,
  highlights       TEXT[]        DEFAULT '{}',
  fy25_actual      INTEGER       DEFAULT 0,
  fy26_approved    INTEGER       DEFAULT 0,
  fy27_request     INTEGER       DEFAULT 0,
  fy27_recommended INTEGER,
  fy27_approved    INTEGER,
  request_status   TEXT          DEFAULT 'not_started'
                                 CHECK (request_status IN ('not_started','draft','submitted','under_review','approved')),
  request_note     TEXT          DEFAULT '',
  tm_note          TEXT,
  updated_at       TIMESTAMPTZ   DEFAULT now()
);

CREATE TABLE IF NOT EXISTS line_items (
  id               SERIAL PRIMARY KEY,
  dept_id          TEXT          NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  code             TEXT,
  name             TEXT          NOT NULL,
  fy25_actual      INTEGER       DEFAULT 0,
  fy26_approved    INTEGER       DEFAULT 0,
  fy27_request     INTEGER       DEFAULT 0,
  fy27_recommended INTEGER,
  sort_order       INTEGER       DEFAULT 0,
  updated_at       TIMESTAMPTZ   DEFAULT now()
);

CREATE TABLE IF NOT EXISTS capital_projects (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  department       TEXT          REFERENCES departments(id) ON DELETE SET NULL,
  description      TEXT          DEFAULT '',
  category         TEXT,
  priority         TEXT          DEFAULT 'medium'
                                 CHECK (priority IN ('high','medium','low')),
  funding_source   TEXT          DEFAULT '',
  status           TEXT          DEFAULT 'under_review'
                                 CHECK (status IN ('recommended','funded','planned','under_review','deferred')),
  total            INTEGER       DEFAULT 0,
  years            JSONB         DEFAULT '[]',
  tm_note          TEXT,
  fy27_final       INTEGER,
  photo_url        TEXT          DEFAULT '',
  updated_at       TIMESTAMPTZ   DEFAULT now()
);

-- Add new columns to capital_projects for existing deployments
ALTER TABLE capital_projects ADD COLUMN IF NOT EXISTS fy27_final  INTEGER;
ALTER TABLE capital_projects ADD COLUMN IF NOT EXISTS photo_url   TEXT DEFAULT '';

CREATE TABLE IF NOT EXISTS enterprise_funds (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  short_name       TEXT,
  head             TEXT,
  mission          TEXT          DEFAULT '',
  stats            JSONB         DEFAULT '[]',
  fy25_actual      INTEGER       DEFAULT 0,
  fy26_approved    INTEGER       DEFAULT 0,
  fy27_request     INTEGER       DEFAULT 0,
  line_items       JSONB         DEFAULT '[]'
);

-- User role profiles (one row per authenticated user)
CREATE TABLE IF NOT EXISTS profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role             TEXT          NOT NULL DEFAULT 'dept_head'
                                 CHECK (role IN ('town_manager','dept_head')),
  dept_id          TEXT          REFERENCES departments(id) ON DELETE SET NULL,
  display_name     TEXT,
  created_at       TIMESTAMPTZ   DEFAULT now()
);

-- Revenue sources — editable by Town Manager
CREATE TABLE IF NOT EXISTS revenues (
  id               SERIAL PRIMARY KEY,
  fiscal_year      TEXT          NOT NULL DEFAULT 'FY2027',
  source           TEXT          NOT NULL,
  amount           INTEGER       NOT NULL DEFAULT 0,
  percent          NUMERIC(5,1),
  sort_order       INTEGER       DEFAULT 0,
  updated_at       TIMESTAMPTZ   DEFAULT now()
);

-- Application-wide settings (e.g. published flag)
CREATE TABLE IF NOT EXISTS settings (
  key              TEXT PRIMARY KEY,
  value            TEXT          NOT NULL,
  updated_at       TIMESTAMPTZ   DEFAULT now()
);

INSERT INTO settings (key, value) VALUES ('budget_published', 'false')
  ON CONFLICT (key) DO NOTHING;

-- ── Auto-create profile on sign-up ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, dept_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'dept_head'),
    NEW.raw_user_meta_data->>'dept_id',
    NEW.raw_user_meta_data->>'display_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Row-Level Security ────────────────────────────────────────────────────────

ALTER TABLE departments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenues       ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings       ENABLE ROW LEVEL SECURITY;

-- ---- departments ----
-- Everyone (including anonymous) can read all departments
DROP POLICY IF EXISTS "Public read departments"  ON departments;
CREATE POLICY "Public read departments"
  ON departments FOR SELECT USING (true);

-- Town Manager can insert new departments
DROP POLICY IF EXISTS "TM inserts departments" ON departments;
CREATE POLICY "TM inserts departments"
  ON departments FOR INSERT
  WITH CHECK (is_town_manager());

-- Department heads can update only their own department
DROP POLICY IF EXISTS "Dept head updates own dept" ON departments;
CREATE POLICY "Dept head updates own dept"
  ON departments FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE dept_id = departments.id AND role = 'dept_head'
  ))
  WITH CHECK (true);

-- Town Manager can update any department
DROP POLICY IF EXISTS "TM updates all depts" ON departments;
CREATE POLICY "TM updates all depts"
  ON departments FOR UPDATE
  USING (is_town_manager())
  WITH CHECK (true);

-- ---- line_items ----
DROP POLICY IF EXISTS "Public read line_items" ON line_items;
CREATE POLICY "Public read line_items"
  ON line_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Dept head updates own line items" ON line_items;
CREATE POLICY "Dept head updates own line items"
  ON line_items FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE dept_id = line_items.dept_id AND role = 'dept_head'
  ))
  WITH CHECK (true);

DROP POLICY IF EXISTS "TM updates all line items" ON line_items;
CREATE POLICY "TM updates all line items"
  ON line_items FOR UPDATE
  USING (is_town_manager())
  WITH CHECK (true);

DROP POLICY IF EXISTS "Dept head inserts own line items" ON line_items;
CREATE POLICY "Dept head inserts own line items"
  ON line_items FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE dept_id = line_items.dept_id AND role = 'dept_head'
  ));

DROP POLICY IF EXISTS "TM inserts line items" ON line_items;
CREATE POLICY "TM inserts line items"
  ON line_items FOR INSERT
  WITH CHECK (is_town_manager());

DROP POLICY IF EXISTS "TM deletes line items" ON line_items;
CREATE POLICY "TM deletes line items"
  ON line_items FOR DELETE
  USING (is_town_manager());

-- ---- capital_projects ----
DROP POLICY IF EXISTS "Public read capital_projects" ON capital_projects;
CREATE POLICY "Public read capital_projects"
  ON capital_projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Dept head inserts own capital projects" ON capital_projects;
CREATE POLICY "Dept head inserts own capital projects"
  ON capital_projects FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE dept_id = capital_projects.department AND role = 'dept_head'
  ));

DROP POLICY IF EXISTS "Dept head updates own capital projects" ON capital_projects;
CREATE POLICY "Dept head updates own capital projects"
  ON capital_projects FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE dept_id = capital_projects.department AND role = 'dept_head'
  ))
  WITH CHECK (true);

DROP POLICY IF EXISTS "TM updates all capital projects" ON capital_projects;
CREATE POLICY "TM updates all capital projects"
  ON capital_projects FOR UPDATE
  USING (is_town_manager())
  WITH CHECK (true);

DROP POLICY IF EXISTS "TM inserts capital projects" ON capital_projects;
CREATE POLICY "TM inserts capital projects"
  ON capital_projects FOR INSERT
  WITH CHECK (is_town_manager());

DROP POLICY IF EXISTS "TM deletes capital projects" ON capital_projects;
CREATE POLICY "TM deletes capital projects"
  ON capital_projects FOR DELETE
  USING (is_town_manager());

-- ---- enterprise_funds ----
DROP POLICY IF EXISTS "Public read enterprise_funds" ON enterprise_funds;
CREATE POLICY "Public read enterprise_funds"
  ON enterprise_funds FOR SELECT USING (true);

DROP POLICY IF EXISTS "TM updates enterprise_funds" ON enterprise_funds;
CREATE POLICY "TM updates enterprise_funds"
  ON enterprise_funds FOR UPDATE
  USING (is_town_manager())
  WITH CHECK (true);

-- ---- revenues ----
DROP POLICY IF EXISTS "Public read revenues" ON revenues;
CREATE POLICY "Public read revenues"
  ON revenues FOR SELECT USING (true);

DROP POLICY IF EXISTS "TM manages revenues" ON revenues;
CREATE POLICY "TM manages revenues"
  ON revenues FOR ALL
  USING (is_town_manager())
  WITH CHECK (true);

-- ── Get-or-create profile (SECURITY DEFINER bypasses RLS) ───────────────────
-- Called by the login flow so it works even when RLS policies are missing or
-- when the account pre-dates the trigger that normally creates the profile row.
CREATE OR REPLACE FUNCTION public.get_or_create_profile()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, role, display_name)
    VALUES (auth.uid(), 'dept_head', '')
    ON CONFLICT (id) DO NOTHING
    RETURNING * INTO v_profile;

    -- If INSERT did nothing (concurrent insert), fetch the existing row
    IF NOT FOUND THEN
      SELECT * INTO v_profile FROM public.profiles WHERE id = auth.uid();
    END IF;
  END IF;
  RETURN v_profile;
END;
$$;

-- Only authenticated users may call this function
REVOKE ALL ON FUNCTION public.get_or_create_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_profile() TO authenticated;

-- ---- profiles ----
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile row
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (true);

-- TM can read ALL profiles (uses is_town_manager() to avoid infinite recursion)
DROP POLICY IF EXISTS "TM reads all profiles" ON profiles;
CREATE POLICY "TM reads all profiles"
  ON profiles FOR SELECT
  USING (is_town_manager());

-- TM can update any profile (for role/dept assignment)
DROP POLICY IF EXISTS "TM updates all profiles" ON profiles;
CREATE POLICY "TM updates all profiles"
  ON profiles FOR UPDATE
  USING (is_town_manager())
  WITH CHECK (true);

-- TM can delete a profile (removes portal access for that user)
DROP POLICY IF EXISTS "TM deletes profiles" ON profiles;
CREATE POLICY "TM deletes profiles"
  ON profiles FOR DELETE
  USING (is_town_manager());

-- ---- settings ----
DROP POLICY IF EXISTS "Public read settings" ON settings;
CREATE POLICY "Public read settings"
  ON settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "TM updates settings" ON settings;
CREATE POLICY "TM updates settings"
  ON settings FOR UPDATE
  USING (is_town_manager())
  WITH CHECK (true);
