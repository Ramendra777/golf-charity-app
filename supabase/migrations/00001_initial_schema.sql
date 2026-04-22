-- ============================================================
-- FAIRWAY IMPACT REWARDS — Initial Database Schema
-- ============================================================
-- Run this in your Supabase SQL Editor after creating a new project.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CHARITIES (defined first, so profiles can reference it)
-- ============================================================
CREATE TABLE public.charities (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  description       TEXT,
  impact_statement  TEXT,
  media_url         TEXT,
  total_contributed NUMERIC DEFAULT 0.00,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id                  UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role                TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  full_name           TEXT,
  email               TEXT UNIQUE NOT NULL,
  subscription_status TEXT DEFAULT 'inactive'
                        CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'inactive', 'trialing')),
  stripe_customer_id  TEXT,
  selected_charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SCORES
-- Constraint: 1 score per date per user (duplicate date rejected)
-- Rolling logic: Postgres trigger deletes oldest when >5 exist
-- ============================================================
CREATE TABLE public.scores (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score      INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  date       DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- ============================================================
-- DRAWS
-- ============================================================
CREATE TABLE public.draws (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month           TIMESTAMPTZ NOT NULL,
  draw_type       TEXT NOT NULL,
  draw_logic      TEXT NOT NULL CHECK (draw_logic IN ('RANDOM', 'ALGORITHMIC')),
  jackpot_amount  NUMERIC NOT NULL DEFAULT 0.00,
  winning_numbers INTEGER[] DEFAULT '{}',
  is_published    BOOLEAN DEFAULT FALSE,
  rolled_over     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WINNERS
-- ============================================================
CREATE TABLE public.winners (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id           UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES public.profiles(id),
  amount_won        NUMERIC NOT NULL,
  match_type        TEXT NOT NULL CHECK (match_type IN ('5-Match', '4-Match', '3-Match')),
  proof_url         TEXT,
  payout_completed  BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNCTION: enforce rolling 5-score limit per user
-- Runs AFTER INSERT; removes scores beyond the 5 most recent.
-- ============================================================
CREATE OR REPLACE FUNCTION enforce_rolling_5_scores()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.scores
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id
      FROM public.scores
      WHERE user_id = NEW.user_id
      ORDER BY date DESC, created_at DESC
      LIMIT 5
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_enforce_rolling_5_scores
  AFTER INSERT ON public.scores
  FOR EACH ROW
  EXECUTE FUNCTION enforce_rolling_5_scores();

-- ============================================================
-- FUNCTION: auto-create profile row on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Service role can manage profiles"
  ON public.profiles FOR ALL USING (auth.role() = 'service_role');

-- Charities (public read, admin write)
CREATE POLICY "Anyone can view charities"
  ON public.charities FOR SELECT USING (true);
CREATE POLICY "Service role can manage charities"
  ON public.charities FOR ALL USING (auth.role() = 'service_role');

-- Scores (own data)
CREATE POLICY "Users can view own scores"
  ON public.scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores"
  ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scores"
  ON public.scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores"
  ON public.scores FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage scores"
  ON public.scores FOR ALL USING (auth.role() = 'service_role');

-- Draws (public read when published)
CREATE POLICY "Anyone can view published draws"
  ON public.draws FOR SELECT USING (is_published = true);
CREATE POLICY "Service role can manage draws"
  ON public.draws FOR ALL USING (auth.role() = 'service_role');

-- Winners
CREATE POLICY "Winners can view own record"
  ON public.winners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage winners"
  ON public.winners FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- SEED: Default charities
-- ============================================================
INSERT INTO public.charities (name, description, impact_statement, total_contributed) VALUES
  ('Clean Water Foundation',  'Delivering safe drinking water to Sub-Saharan Africa.',  'Every £50 provides clean water for a family for a year.', 28500),
  ('Education First Alliance','Building schools and providing learning resources.',       'Funds schoolbooks for 120 children per year.',           14200),
  ('Reforestation Now',       'Planting native trees across deforested landscapes.',     '£10 plants one tree that absorbs carbon for 80 years.',  9800),
  ('Rural Health Initiative', 'Funding mobile health clinics for rural populations.',    'One clinic visit costs £12 on average.',                 31000),
  ('Zero Hunger Project',     'Fighting food insecurity via sustainable food banks.',    'Feeds one family for a month at £25.',                   17600),
  ('Accessibility for All',   'Making sports accessible to people with disabilities.',   'Sponsors adaptive equipment for athletes.',              7300);
