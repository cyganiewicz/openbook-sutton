# OpenBook — Supabase Setup Guide

This folder contains the SQL files needed to connect OpenBook to a Supabase PostgreSQL database, enabling real authentication and persistent data storage.

---

## Prerequisites

- A free account at [supabase.com](https://supabase.com)

---

## Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Name it `openbook-sutton` (or anything you like)
3. Choose a strong database password and keep it safe
4. Select the **US East** region (closest to Massachusetts)
5. Wait ~2 minutes for the project to provision

---

## Step 2 — Run the schema

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Paste the entire contents of `schema.sql` and click **Run**
4. You should see "Success. No rows returned."

---

## Step 3 — Load the seed data

1. In the SQL Editor, click **New query**
2. Paste the entire contents of `seed.sql` and click **Run**
3. This inserts all 18 departments, ~80 line items, 15 capital projects, and 2 enterprise funds

---

## Step 4 — Get your API credentials

1. In your project, click **Project Settings** (gear icon) → **API**
2. Copy the **Project URL** (e.g. `https://abcxyz.supabase.co`)
3. Copy the **anon / public** key (the long JWT string)

---

## Step 5 — Configure index.html

Open `index.html` and find these two lines near the top of the first `<script>` block:

```js
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Replace the placeholder strings with your actual URL and anon key.  
**Important:** The anon key is safe to include in a public HTML file — it is a read-only public key protected by Row-Level Security policies.

---

## Step 6 — Create user accounts

User accounts are created in Supabase Auth, then linked to roles via the `profiles` table.

### Option A — Supabase Dashboard (recommended for initial setup)

1. Go to **Authentication → Users → Invite user**
2. Enter the email address for a department head or the Town Manager
3. They will receive an email invite to set a password

Then, in the **SQL Editor**, assign their role:

```sql
-- For a Town Manager account:
INSERT INTO profiles (id, role, display_name)
SELECT id, 'town_manager', 'Andrew Dowd'
FROM auth.users WHERE email = 'manager@suttonma.org'
ON CONFLICT (id) DO UPDATE SET role = 'town_manager', display_name = 'Andrew Dowd';

-- For a Department Head (e.g. Fire):
INSERT INTO profiles (id, role, dept_id, display_name)
SELECT id, 'dept_head', 'fire', 'Chief Brennan'
FROM auth.users WHERE email = 'fire@suttonma.org'
ON CONFLICT (id) DO UPDATE SET role = 'dept_head', dept_id = 'fire', display_name = 'Chief Brennan';
```

> **Note:** Using `INSERT … ON CONFLICT` (upsert) ensures this works whether or not the auto-create trigger already created a profile row for the account. A plain `UPDATE` will silently do nothing if the profile row does not yet exist, which causes the "no profile found" login error.

Valid `dept_id` values: `tm`, `treasurer`, `accounting`, `assessing`, `clerk`,
`inspectional`, `health`, `communications`, `library`, `hr`, `planning`,
`fire`, `police`, `dpw`, `senior`, `schools`, `debt`, `benefits`

### Option B — Sign-up with metadata (programmatic)

When creating users via the Supabase API you can pass `user_metadata` to auto-populate the profile:

```json
{
  "role": "dept_head",
  "dept_id": "fire",
  "display_name": "Chief Brennan"
}
```

---

## Step 7 — (Optional) Enable GitHub Pages

1. Go to your GitHub repository → **Settings → Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose **main** branch, **/ (root)** folder
4. Click **Save** — your site will be live at `https://cyganiewicz.github.io/openbook-sutton`

---

## Demo Mode

If `SUPABASE_URL` is left as `'YOUR_SUPABASE_URL'`, the app runs in **Demo Mode**:
- All data is read from hardcoded JavaScript arrays
- The login screen uses a role/department dropdown instead of email + password
- Changes are lost on page reload

This is useful for testing the UI before Supabase is configured.

---

## Database Schema Overview

| Table              | Purpose                                              |
|--------------------|------------------------------------------------------|
| `departments`      | Department metadata + budget figures (mutable)       |
| `line_items`       | Per-department budget line items (mutable)           |
| `capital_projects` | Capital plan projects (dept heads can add new ones)  |
| `enterprise_funds` | Water & Sewer fund data                              |
| `profiles`         | Maps Supabase Auth user → role + dept_id             |
| `settings`         | App-wide flags (e.g. `budget_published`)             |

### Row-Level Security summary

| Who              | Can do                                                      |
|------------------|-------------------------------------------------------------|
| Anyone (public)  | SELECT on departments, line_items, capital_projects, enterprise_funds, settings |
| Authenticated    | INSERT own profile row (fallback if trigger didn't fire)    |
| Department head  | UPDATE own department + line items; INSERT + UPDATE own capital projects |
| Town Manager     | UPDATE all departments, line items, capital projects, settings |

---

## Troubleshooting: "Account found but profile could not be loaded"

This error means the user authenticated successfully but no `profiles` row exists for them and the app was unable to create or read one.

**Root cause:** The login flow calls a `get_or_create_profile()` PostgreSQL function (added in `schema.sql`).  If that function does not yet exist in your Supabase database — for example because the schema was not re-applied after the last update — the RPC call fails.

**Fix — run the full `schema.sql` in the SQL Editor**, or at minimum apply just the new function block:

```sql
-- Create (or replace) the get-or-create helper
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

REVOKE ALL ON FUNCTION public.get_or_create_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_or_create_profile() TO authenticated;
```

Because the function is `SECURITY DEFINER` it bypasses RLS and works regardless of whether the INSERT/SELECT policies exist for the `profiles` table.

After applying the function, also create any missing profile rows and assign roles:

```sql
-- Backfill profiles for any accounts that were created before the trigger existed
INSERT INTO profiles (id, role, display_name)
SELECT id, 'dept_head', ''
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;
```

Then assign the correct role to each account using the SQL in Step 6.
