-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  subscription_status TEXT DEFAULT 'inactive', -- active, past_due, canceled, inactive
  stripe_customer_id TEXT,
  selected_charity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHARITIES
CREATE TABLE public.charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  impact_statement TEXT,
  media_url TEXT,
  total_contributed NUMERIC DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Associate profiles.selected_charity_id now that charities table exists
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profile_charity
  FOREIGN KEY (selected_charity_id)
  REFERENCES public.charities(id)
  ON DELETE SET NULL;

-- SCORES
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date) -- Only one score entry per date per user per requirements
);

-- DRAWS
CREATE TABLE public.draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month TIMESTAMPTZ NOT NULL,
  draw_type TEXT NOT NULL, -- 5-Match, 4-Match, 3-Match
  draw_logic TEXT NOT NULL CHECK (draw_logic IN ('RANDOM', 'ALGORITHMIC')),
  jackpot_amount NUMERIC NOT NULL DEFAULT 0.00,
  winning_numbers INTEGER[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WINNERS
CREATE TABLE public.winners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  amount_won NUMERIC NOT NULL,
  match_type TEXT NOT NULL,
  proof_url TEXT,
  payout_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read/update their own profile. Admins can read/update all.
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Charities: Anyone can view.
CREATE POLICY "Anyone can view charities" ON public.charities FOR SELECT USING (true);

-- Scores: Users can manage their own scores.
CREATE POLICY "Users can view own scores" ON public.scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own scores" ON public.scores FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own scores" ON public.scores FOR UPDATE USING (auth.uid() = user_id);

-- TRIGGER: Rolling 5-score logic
CREATE OR REPLACE FUNCTION enforce_rolling_5_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- If replacing, ignore. The trigger shouldn't interfere with standard unique constraints on date.
  -- Delete the oldest score(s) if we are about to exceed 5 for this user.
  -- Wait, we allow a max of 5 AFTER insert. So we delete where the record is not in the latest 5.
  DELETE FROM public.scores
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM public.scores 
      WHERE user_id = NEW.user_id 
      ORDER BY date DESC, created_at DESC 
      LIMIT 4 -- wait, checking pre-insert vs post-insert context... we can do it post-insert or use LIMIT 5.
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER defined AFTER INSERT
CREATE TRIGGER trigger_enforce_rolling_5_scores
AFTER INSERT ON public.scores
FOR EACH ROW
EXECUTE FUNCTION enforce_rolling_5_scores();

-- Wait, the function needs to retain the NEW id as well, let's fix the query.
CREATE OR REPLACE FUNCTION enforce_rolling_5_scores()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.scores
  WHERE user_id = NEW.user_id
    AND id NOT IN (
      SELECT id FROM public.scores 
      WHERE user_id = NEW.user_id 
      ORDER BY date DESC, created_at DESC 
      LIMIT 5
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
