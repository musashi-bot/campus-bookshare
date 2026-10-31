-- ==========================================================
-- Campus BookShare: Initial Database Schema & RLS Policies
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  college TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  college_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. BOOKS (NOVELS) TABLE
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  edition TEXT,
  category TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('New', 'Good', 'Fair')),
  description TEXT,
  rent_per_week NUMERIC(10, 2) NOT NULL CHECK (rent_per_week > 0),
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'rented', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. RENTALS TABLE
CREATE TABLE IF NOT EXISTS public.rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE RESTRICT,
  borrower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  weeks INTEGER NOT NULL CHECK (weeks >= 1 AND weeks <= 4),
  start_date DATE,
  due_date DATE,
  return_date DATE,
  rent_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 10,
  commission_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  late_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'awaiting_confirmation', 'paid')),
  upi_reference TEXT,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'payment_pending', 'active', 'returned', 'overdue', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. REMINDERS TABLE
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id UUID NOT NULL REFERENCES public.rentals(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('due_in_2_days', 'due_today', 'overdue')),
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'in_app')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  sent_date DATE NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT unique_rental_reminder_per_day UNIQUE (rental_id, type, sent_date)
);

-- 5. PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rental_id UUID NOT NULL REFERENCES public.rentals(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id UUID NOT NULL REFERENCES public.rentals(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. PREMIUM INTEREST TABLE
CREATE TABLE IF NOT EXISTS public.premium_interest (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. NOTIFICATIONS TABLE (for in-app bell)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==========================================================
-- INDEXES
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_books_owner ON public.books(owner_id);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON public.rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_due_date ON public.rentals(due_date);
CREATE INDEX IF NOT EXISTS idx_rentals_borrower ON public.rentals(borrower_id);
CREATE INDEX IF NOT EXISTS idx_rentals_lender ON public.rentals(lender_id);
CREATE INDEX IF NOT EXISTS idx_reminders_rental_date ON public.reminders(rental_id, sent_date);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: Is current user an admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- PROFILES POLICIES ---
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- --- BOOKS POLICIES ---
-- Users can read available books OR books they own OR admins can read all
CREATE POLICY "Available books viewable by everyone"
  ON public.books FOR SELECT
  USING (status = 'available' OR owner_id = auth.uid() OR public.is_admin());

-- Users can insert books where they are the owner
CREATE POLICY "Users can create their own books"
  ON public.books FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can update only their own books, or admin can update any book
CREATE POLICY "Users can update own books or admin"
  ON public.books FOR UPDATE
  USING (auth.uid() = owner_id OR public.is_admin());

-- Users can delete their own books or admin
CREATE POLICY "Users can delete own books or admin"
  ON public.books FOR DELETE
  USING (auth.uid() = owner_id OR public.is_admin());

-- --- RENTALS POLICIES ---
-- Users see rentals where they are the borrower or lender; admins see all
CREATE POLICY "Users see their own rentals or admin"
  ON public.rentals FOR SELECT
  USING (borrower_id = auth.uid() OR lender_id = auth.uid() OR public.is_admin());

-- Authenticated borrowers can create rental requests
CREATE POLICY "Borrowers can create rental request"
  ON public.rentals FOR INSERT
  WITH CHECK (auth.uid() = borrower_id);

-- Involved users or admins can update rental
CREATE POLICY "Involved parties or admin can update rental"
  ON public.rentals FOR UPDATE
  USING (borrower_id = auth.uid() OR lender_id = auth.uid() OR public.is_admin());

-- --- PAYOUTS POLICIES ---
-- Lenders can see their own payouts; admins can see and manage all
CREATE POLICY "Lenders can view own payouts"
  ON public.payouts FOR SELECT
  USING (lender_id = auth.uid() OR public.is_admin());

CREATE POLICY "Only admins can manage payouts"
  ON public.payouts FOR ALL
  USING (public.is_admin());

-- --- SETTINGS POLICIES ---
-- Everyone can read settings (e.g. fees, limits); only admins can modify
CREATE POLICY "Settings are viewable by everyone"
  ON public.settings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify settings"
  ON public.settings FOR ALL
  USING (public.is_admin());

-- --- REVIEWS POLICIES ---
CREATE POLICY "Reviews viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- --- NOTIFICATIONS POLICIES ---
CREATE POLICY "Users can see their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- --- PREMIUM INTEREST POLICIES ---
CREATE POLICY "Authenticated users can express interest"
  ON public.premium_interest FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view premium interest count"
  ON public.premium_interest FOR SELECT
  USING (public.is_admin());

-- ==========================================================
-- STORAGE BUCKET CONFIGURATION
-- ==========================================================
-- Insert 'book-covers' bucket into storage.buckets if not present
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: Public can read cover images
CREATE POLICY "Book covers are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-covers');

-- Authenticated users can upload cover images
CREATE POLICY "Authenticated users can upload covers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'book-covers' AND auth.role() = 'authenticated');

