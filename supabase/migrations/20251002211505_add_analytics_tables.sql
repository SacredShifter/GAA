/*
  # Add Analytics Tables and Views for GAA
  
  ## New Tables
  
  1. `gaa_session_analytics`
    - Aggregated session statistics per user
    - Tracks total sessions, average duration, frequency ranges
    
  2. `gaa_frequency_distribution`
    - Tracks frequency usage patterns by time buckets
    - Used for heatmap visualization
  
  ## New Views
  
  1. `gaa_global_metrics`
    - Aggregated view of all users' collective resonance data
    - Public read access for collective insights
    
  2. `gaa_user_analytics_summary`
    - Per-user analytics summary with computed metrics
    - Avg frequency, session count, total time
  
  ## Security
  
  - RLS enabled on all new tables
  - Users can only access their own analytics data
  - Global metrics view is read-only for authenticated users
*/

-- Session Analytics Table
CREATE TABLE IF NOT EXISTS gaa_session_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  total_sessions integer DEFAULT 0,
  total_duration_seconds integer DEFAULT 0,
  avg_frequency float,
  min_frequency float,
  max_frequency float,
  avg_intensity float,
  dominant_wave_type text,
  dominant_geometry_mode text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE gaa_session_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own session analytics"
  ON gaa_session_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session analytics"
  ON gaa_session_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session analytics"
  ON gaa_session_analytics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Frequency Distribution Heatmap Table
CREATE TABLE IF NOT EXISTS gaa_frequency_distribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  frequency_range text NOT NULL,
  hour_of_day integer NOT NULL CHECK (hour_of_day >= 0 AND hour_of_day < 24),
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week < 7),
  usage_count integer DEFAULT 0,
  avg_duration_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, frequency_range, hour_of_day, day_of_week)
);

ALTER TABLE gaa_frequency_distribution ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own frequency distribution"
  ON gaa_frequency_distribution FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own frequency distribution"
  ON gaa_frequency_distribution FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own frequency distribution"
  ON gaa_frequency_distribution FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Global Metrics View (Read-only aggregated data)
CREATE OR REPLACE VIEW gaa_global_metrics AS
SELECT
  COUNT(DISTINCT user_id) as total_active_users,
  AVG(frequency) as avg_global_frequency,
  AVG(intensity) as avg_global_intensity,
  COUNT(*) as total_active_sessions,
  wave_type as dominant_wave_type,
  geometry_mode as dominant_geometry_mode,
  DATE(created_at) as metric_date
FROM gaa_sync_sessions
WHERE is_active = true
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY wave_type, geometry_mode, DATE(created_at);

-- User Analytics Summary View
CREATE OR REPLACE VIEW gaa_user_analytics_summary AS
SELECT
  rl.user_id,
  COUNT(DISTINCT rl.id) as total_sessions,
  SUM(rl.duration_seconds) as total_duration_seconds,
  AVG(rl.frequency) as avg_frequency,
  MIN(rl.frequency) as min_frequency,
  MAX(rl.frequency) as max_frequency,
  AVG(rl.intensity) as avg_intensity,
  AVG(rl.avg_spectrum_energy) as avg_spectrum_energy,
  MAX(rl.created_at) as last_session_at,
  DATE_TRUNC('day', rl.created_at) as session_date
FROM gaa_resonance_log rl
WHERE rl.created_at >= NOW() - INTERVAL '30 days'
GROUP BY rl.user_id, DATE_TRUNC('day', rl.created_at);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gaa_session_analytics_user_date ON gaa_session_analytics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_gaa_frequency_distribution_user ON gaa_frequency_distribution(user_id, hour_of_day, day_of_week);
CREATE INDEX IF NOT EXISTS idx_gaa_resonance_log_created_at ON gaa_resonance_log(created_at DESC);

-- Trigger for session analytics updated_at
DROP TRIGGER IF EXISTS update_gaa_session_analytics_updated_at ON gaa_session_analytics;
CREATE TRIGGER update_gaa_session_analytics_updated_at
  BEFORE UPDATE ON gaa_session_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for frequency distribution updated_at
DROP TRIGGER IF EXISTS update_gaa_frequency_distribution_updated_at ON gaa_frequency_distribution;
CREATE TRIGGER update_gaa_frequency_distribution_updated_at
  BEFORE UPDATE ON gaa_frequency_distribution
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to aggregate session data into analytics
CREATE OR REPLACE FUNCTION aggregate_session_analytics(p_user_id uuid, p_date date)
RETURNS void AS $$
BEGIN
  INSERT INTO gaa_session_analytics (
    user_id,
    date,
    total_sessions,
    total_duration_seconds,
    avg_frequency,
    min_frequency,
    max_frequency,
    avg_intensity
  )
  SELECT
    p_user_id,
    p_date,
    COUNT(*) as total_sessions,
    SUM(duration_seconds) as total_duration_seconds,
    AVG(frequency) as avg_frequency,
    MIN(frequency) as min_frequency,
    MAX(frequency) as max_frequency,
    AVG(intensity) as avg_intensity
  FROM gaa_resonance_log
  WHERE user_id = p_user_id
    AND DATE(created_at) = p_date
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    total_duration_seconds = EXCLUDED.total_duration_seconds,
    avg_frequency = EXCLUDED.avg_frequency,
    min_frequency = EXCLUDED.min_frequency,
    max_frequency = EXCLUDED.max_frequency,
    avg_intensity = EXCLUDED.avg_intensity,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;