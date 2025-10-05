/*
  # Add Sonic Coherence History Table

  1. New Tables
    - `sonic_coherence_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `session_id` (text)
      - `frequency_hz` (numeric)
      - `coherence_index` (numeric, 0-1)
      - `amplitude` (numeric, 0-1)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `sonic_coherence_history` table
    - Add policies for authenticated users to:
      - Read their own coherence data
      - Insert their own coherence data
    - Add policy for service role to read all data (for analytics)

  3. Indexes
    - Index on `user_id` for fast user queries
    - Index on `session_id` for session-based queries
    - Index on `timestamp` for time-based queries
*/

-- Create sonic_coherence_history table
CREATE TABLE IF NOT EXISTS sonic_coherence_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  session_id text NOT NULL,
  frequency_hz numeric NOT NULL,
  coherence_index numeric NOT NULL CHECK (coherence_index >= 0 AND coherence_index <= 1),
  amplitude numeric NOT NULL CHECK (amplitude >= 0 AND amplitude <= 1),
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sonic_coherence_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own coherence data
CREATE POLICY "Users can read own coherence data"
  ON sonic_coherence_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Policy: Users can insert their own coherence data
CREATE POLICY "Users can insert own coherence data"
  ON sonic_coherence_history
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

-- Policy: Service role can read all data for analytics
CREATE POLICY "Service role can read all coherence data"
  ON sonic_coherence_history
  FOR SELECT
  TO service_role
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sonic_coherence_user_id 
  ON sonic_coherence_history(user_id);

CREATE INDEX IF NOT EXISTS idx_sonic_coherence_session_id 
  ON sonic_coherence_history(session_id);

CREATE INDEX IF NOT EXISTS idx_sonic_coherence_timestamp 
  ON sonic_coherence_history(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_sonic_coherence_user_timestamp 
  ON sonic_coherence_history(user_id, timestamp DESC);
