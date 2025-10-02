/*
  # Add Egyptian Code Tables

  ## New Tables

  1. `egyptian_code_sessions`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `started_at` (timestamptz)
    - `completed_at` (timestamptz, nullable)
    - `current_chapter_id` (text)
    - `current_chapter_index` (integer)
    - `total_duration` (integer, seconds)
    - `is_active` (boolean)

  2. `egyptian_code_progress`
    - `id` (uuid, primary key)
    - `session_id` (uuid, references egyptian_code_sessions)
    - `user_id` (uuid, references profiles)
    - `chapter_id` (text)
    - `chapter_index` (integer)
    - `started_at` (timestamptz)
    - `completed_at` (timestamptz, nullable)
    - `duration_seconds` (integer)
    - `intensity` (double precision)

  ## Security
  - RLS enabled on all tables
  - Users can only access their own sessions and progress

  ## Indexes
  - Active sessions by user
  - Progress by session
  - Completion tracking
*/

CREATE TABLE IF NOT EXISTS egyptian_code_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  current_chapter_id text,
  current_chapter_index integer DEFAULT 0,
  total_duration integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE egyptian_code_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own Egyptian sessions"
  ON egyptian_code_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own Egyptian sessions"
  ON egyptian_code_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Egyptian sessions"
  ON egyptian_code_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own Egyptian sessions"
  ON egyptian_code_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS egyptian_code_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES egyptian_code_sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  chapter_id text NOT NULL,
  chapter_index integer NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  duration_seconds integer,
  intensity double precision DEFAULT 0.5,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE egyptian_code_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own Egyptian progress"
  ON egyptian_code_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own Egyptian progress"
  ON egyptian_code_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Egyptian progress"
  ON egyptian_code_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_egyptian_sessions_user
  ON egyptian_code_sessions(user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_egyptian_sessions_active
  ON egyptian_code_sessions(is_active, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_egyptian_progress_session
  ON egyptian_code_progress(session_id, chapter_index);

CREATE INDEX IF NOT EXISTS idx_egyptian_progress_user
  ON egyptian_code_progress(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_egyptian_progress_completion
  ON egyptian_code_progress(user_id, completed_at)
  WHERE completed_at IS NOT NULL;

DROP TRIGGER IF EXISTS update_egyptian_sessions_updated_at ON egyptian_code_sessions;
CREATE TRIGGER update_egyptian_sessions_updated_at
  BEFORE UPDATE ON egyptian_code_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
