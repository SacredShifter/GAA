/*
  # GAA (Global Alignment Amplifier) Schema

  ## Tables Created
  
  1. `profiles`
    - Stores user profile data
    - Links to Supabase auth.users
    
  2. `gaa_sync_sessions`
    - Tracks active sync sessions
    - Stores frequency, intensity, wave type
    - Real-time subscriptions for collective sync
    
  3. `gaa_presets`
    - User-created frequency presets
    - Shareable configurations
    
  4. `gaa_resonance_log`
    - Historical log of user resonance states
    - Analytics and pattern tracking

  ## Security
  
  - RLS enabled on all tables
  - Users can only read/write their own data
  - Public read access for active sync sessions (for collective view)
*/

-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  username text UNIQUE,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- GAA Sync Sessions (for collective sync)
CREATE TABLE IF NOT EXISTS gaa_sync_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  circle_id uuid,
  frequency float NOT NULL,
  intensity float NOT NULL,
  wave_type text NOT NULL,
  pulse_speed float DEFAULT 1,
  geometry_mode text DEFAULT 'waves',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gaa_sync_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active sync sessions"
  ON gaa_sync_sessions FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can create own sync sessions"
  ON gaa_sync_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync sessions"
  ON gaa_sync_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sync sessions"
  ON gaa_sync_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- GAA Presets
CREATE TABLE IF NOT EXISTS gaa_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  frequency float NOT NULL,
  intensity float NOT NULL,
  wave_type text NOT NULL,
  pulse_speed float DEFAULT 1,
  geometry_mode text DEFAULT 'waves',
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gaa_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own presets"
  ON gaa_presets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own presets"
  ON gaa_presets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presets"
  ON gaa_presets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own presets"
  ON gaa_presets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- GAA Resonance Log
CREATE TABLE IF NOT EXISTS gaa_resonance_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES gaa_sync_sessions(id) ON DELETE SET NULL,
  frequency float NOT NULL,
  intensity float NOT NULL,
  duration_seconds integer,
  avg_spectrum_energy float,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gaa_resonance_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resonance log"
  ON gaa_resonance_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own resonance entries"
  ON gaa_resonance_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gaa_sync_sessions_active ON gaa_sync_sessions(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gaa_sync_sessions_circle ON gaa_sync_sessions(circle_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_gaa_presets_public ON gaa_presets(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_gaa_resonance_log_user ON gaa_resonance_log(user_id, created_at DESC);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gaa_sync_sessions_updated_at ON gaa_sync_sessions;
CREATE TRIGGER update_gaa_sync_sessions_updated_at
  BEFORE UPDATE ON gaa_sync_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gaa_presets_updated_at ON gaa_presets;
CREATE TRIGGER update_gaa_presets_updated_at
  BEFORE UPDATE ON gaa_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();