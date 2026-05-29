-- ============================================================
-- ShopOS — Supabase Database Schema
-- ============================================================
-- Run this entire file in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- IMPORTANT: Create two users in Supabase Auth FIRST (Dashboard → Authentication → Users → Add User):
--   1. owner@shopos.com   / your-password
--   2. frontdesk@shopos.com / your-password
-- The trigger below will auto-create profile rows with 'frontdesk' as the default role.
-- After creating users, promote the owner by running the UPDATE at the bottom.
-- ============================================================

-- ============================================================
-- 0. CLEAN SLATE — Drop everything so this file can be re-run safely
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_user_role();
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.workers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================
-- 1. PROFILES TABLE (linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'frontdesk' CHECK (role IN ('owner', 'frontdesk')),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. HELPER: Function to get the current user's role
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Owner can read all profiles
CREATE POLICY "Owner can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() = 'owner');

-- System handles insert via trigger (see below)
CREATE POLICY "System can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- SECURITY FIX: Users can update their own profile, but the role column
-- must remain unchanged. This prevents privilege escalation where a
-- frontdesk user could promote themselves to owner via the Supabase client.
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Trigger: auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'frontdesk'),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if it exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. WORKERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  is_at_work BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view workers"
  ON public.workers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owner can insert workers"
  ON public.workers FOR INSERT
  WITH CHECK (public.get_user_role() = 'owner');

CREATE POLICY "Owner can update workers"
  ON public.workers FOR UPDATE
  USING (public.get_user_role() = 'owner');

CREATE POLICY "Owner can delete workers"
  ON public.workers FOR DELETE
  USING (public.get_user_role() = 'owner');

-- ============================================================
-- 4. SERVICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  duration_min INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view services"
  ON public.services FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owner can insert services"
  ON public.services FOR INSERT
  WITH CHECK (public.get_user_role() = 'owner');

CREATE POLICY "Owner can update services"
  ON public.services FOR UPDATE
  USING (public.get_user_role() = 'owner');

CREATE POLICY "Owner can delete services"
  ON public.services FOR DELETE
  USING (public.get_user_role() = 'owner');

-- ============================================================
-- 5. SALES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  worker_name TEXT NOT NULL,
  worker_id UUID REFERENCES public.workers(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sales"
  ON public.sales FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert sales"
  ON public.sales FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update sales"
  ON public.sales FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owner can delete sales"
  ON public.sales FOR DELETE
  USING (public.get_user_role() = 'owner');

-- ============================================================
-- 6. EXPENSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL DEFAULT 'Supplies' CHECK (category IN ('Supplies', 'Bills', 'Equipment', 'Rent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view expenses"
  ON public.expenses FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Owner can insert expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (public.get_user_role() = 'owner');

CREATE POLICY "Owner can update expenses"
  ON public.expenses FOR UPDATE
  USING (public.get_user_role() = 'owner');

CREATE POLICY "Owner can delete expenses"
  ON public.expenses FOR DELETE
  USING (public.get_user_role() = 'owner');

-- ============================================================
-- 7. SEED DATA
-- ============================================================

INSERT INTO public.workers (id, name, role, is_at_work) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Sarah Jenkins', 'Hair Stylist', true),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Michael Vance', 'Color Expert', true),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Elena Rostova', 'Nail Artist', false);

INSERT INTO public.services (name, price, duration_min) VALUES
  ('Hair Cut & Style', 75.00, 45),
  ('Balayage & Coloring', 180.00, 120),
  ('Deep Moisture Treatment', 45.00, 30),
  ('Gel Manicure', 60.00, 60);

INSERT INTO public.sales (service_name, worker_name, worker_id, date, price) VALUES
  ('Balayage & Coloring', 'Sarah Jenkins', 'a1b2c3d4-0001-4000-8000-000000000001', CURRENT_DATE, 180.00),
  ('Hair Cut & Style', 'Michael Vance', 'a1b2c3d4-0002-4000-8000-000000000002', CURRENT_DATE, 75.00),
  ('Gel Manicure', 'Elena Rostova', 'a1b2c3d4-0003-4000-8000-000000000003', CURRENT_DATE, 60.00);

INSERT INTO public.expenses (item, amount, date, category) VALUES
  ('Shampoo and Hair Dyes', 410.00, CURRENT_DATE - INTERVAL '4 days', 'Supplies'),
  ('Electricity and Power bill', 320.00, CURRENT_DATE - INTERVAL '5 days', 'Bills'),
  ('Towels and Chairs', 285.00, CURRENT_DATE - INTERVAL '9 days', 'Equipment');

-- ============================================================
-- SETUP COMPLETE. Now create your auth users:
--   1. Go to Authentication → Users → Add User
--   2. Create: owner@shopos.com with a password
--   3. Create: frontdesk@shopos.com with a password
--   4. After users are created, promote the owner:
--      UPDATE public.profiles SET role = 'owner' WHERE id = '<owner-user-uuid>';
--      (The frontdesk user will already have the correct 'frontdesk' role)
-- ============================================================
