-- ============================================================
-- OpenBook — Town of Sutton, MA
-- Supabase PostgreSQL Schema
--
-- Run this entire file in the Supabase SQL Editor ONCE to set
-- up all tables, Row-Level Security policies, and triggers.
-- Then run seed.sql to load the initial budget data.
-- ============================================================

-- ── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  updated_at       TIMESTAMPTZ   DEFAULT now()
);

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
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings       ENABLE ROW LEVEL SECURITY;

-- ---- departments ----
-- Everyone (including anonymous) can read all departments
CREATE POLICY "Public read departments"
  ON departments FOR SELECT USING (true);

-- Town Manager can insert new departments
CREATE POLICY "TM inserts departments"
  ON departments FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'town_manager'
  ));

-- Department heads can update only their own department's mutable fields
CREATE POLICY "Dept head updates own dept"
  ON departments FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE dept_id = departments.id AND role = 'dept_head'
  ))
  WITH CHECK (true);

-- Town Manager can update any department
CREATE POLICY "TM updates all depts"
  ON departments FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'town_manager'
  ))
  WITH CHECK (true);

-- ---- line_items ----
CREATE POLICY "Public read line_items"
  ON line_items FOR SELECT USING (true);

CREATE POLICY "Dept head updates own line items"
  ON line_items FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE dept_id = line_items.dept_id AND role = 'dept_head'
  ))
  WITH CHECK (true);

CREATE POLICY "TM updates all line items"
  ON line_items FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'town_manager'
  ))
  WITH CHECK (true);

-- ---- capital_projects ----
CREATE POLICY "Public read capital_projects"
  ON capital_projects FOR SELECT USING (true);

CREATE POLICY "Dept head inserts own capital projects"
  ON capital_projects FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM profiles WHERE dept_id = capital_projects.department AND role = 'dept_head'
  ));

CREATE POLICY "Dept head updates own capital projects"
  ON capital_projects FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE dept_id = capital_projects.department AND role = 'dept_head'
  ))
  WITH CHECK (true);

CREATE POLICY "TM updates all capital projects"
  ON capital_projects FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'town_manager'
  ))
  WITH CHECK (true);

-- ---- enterprise_funds ----
CREATE POLICY "Public read enterprise_funds"
  ON enterprise_funds FOR SELECT USING (true);

CREATE POLICY "TM updates enterprise_funds"
  ON enterprise_funds FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'town_manager'
  ))
  WITH CHECK (true);

-- ---- profiles ----
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile row (needed when
-- the auto-create trigger did not fire for pre-existing auth accounts)
CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (true);

-- TM can read all profiles (to see who is who)
CREATE POLICY "TM reads all profiles"
  ON profiles FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM profiles p2 WHERE p2.role = 'town_manager'
  ));

-- TM can update any profile (for role/dept assignment)
CREATE POLICY "TM updates all profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles p2 WHERE p2.role = 'town_manager'
  ))
  WITH CHECK (true);

-- ---- settings ----
CREATE POLICY "Public read settings"
  ON settings FOR SELECT USING (true);

CREATE POLICY "TM updates settings"
  ON settings FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'town_manager'
  ))
  WITH CHECK (true);
