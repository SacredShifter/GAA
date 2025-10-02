/*
  # Collective Consciousness Field Generator Schema

  ## Overview
  This migration creates the foundation for the world's first bio-responsive,
  AI-orchestrated collective consciousness platform that combines real-time
  biometric feedback, quantum-inspired coherence algorithms, and emergent
  intelligence for unprecedented group synchronization.

  ## New Tables

  ### 1. biometric_streams
  Real-time biometric data from participants (HRV, coherence, brainwave estimates)
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `session_id` (uuid, references gaa_sync_sessions)
  - `timestamp` (timestamptz)
  - `heart_rate` (integer, BPM)
  - `hrv_rmssd` (double precision, milliseconds)
  - `coherence_score` (double precision, 0-1)
  - `estimated_brainwave_state` (text: delta/theta/alpha/beta/gamma)
  - `ppg_quality` (double precision, 0-1)
  - `device_type` (text: bluetooth/webcam/manual)

  ### 2. collective_field_states
  Aggregated collective consciousness metrics computed in real-time
  - `id` (uuid, primary key)
  - `session_id` (uuid, references gaa_sync_sessions)
  - `timestamp` (timestamptz)
  - `participant_count` (integer)
  - `avg_coherence` (double precision, 0-1)
  - `field_strength` (double precision, 0-100)
  - `dominant_frequency` (double precision, Hz)
  - `phase_synchrony` (double precision, 0-1)
  - `quantum_entanglement_metric` (double precision, 0-1)
  - `emergence_index` (double precision, measures novel patterns)
  - `coherence_stability` (double precision, variance measure)

  ### 3. quantum_coherence_events
  Records of significant quantum-inspired coherence phenomena
  - `id` (uuid, primary key)
  - `session_id` (uuid)
  - `timestamp` (timestamptz)
  - `event_type` (text: phase_lock/resonance_cascade/field_crystallization)
  - `participants` (uuid[], array of user_ids)
  - `coherence_peak` (double precision)
  - `frequency_signature` (double precision[])
  - `duration_seconds` (integer)
  - `metadata` (jsonb, additional event details)

  ### 4. ai_journey_insights
  AI-generated insights and recommendations from ML model
  - `id` (uuid, primary key)
  - `session_id` (uuid)
  - `timestamp` (timestamptz)
  - `insight_type` (text: prediction/recommendation/pattern_detection)
  - `confidence` (double precision, 0-1)
  - `insight_text` (text, human-readable)
  - `suggested_frequency` (double precision)
  - `suggested_geometry` (text)
  - `model_version` (text)
  - `training_data_size` (integer)

  ### 5. collective_intentions
  Democratic intention setting and voting system
  - `id` (uuid, primary key)
  - `session_id` (uuid)
  - `proposed_by` (uuid, references profiles)
  - `intention_text` (text)
  - `category` (text: healing/growth/manifestation/exploration)
  - `vote_count` (integer, default 0)
  - `is_active` (boolean, default true)
  - `activated_at` (timestamptz, when it became session intention)
  - `created_at` (timestamptz)

  ### 6. intention_votes
  Individual votes on collective intentions
  - `id` (uuid, primary key)
  - `intention_id` (uuid, references collective_intentions)
  - `user_id` (uuid, references profiles)
  - `vote_power` (double precision, based on coherence history)
  - `voted_at` (timestamptz)

  ### 7. consciousness_metrics
  Long-term tracking of individual consciousness evolution
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `date` (date)
  - `avg_session_coherence` (double precision)
  - `total_session_minutes` (integer)
  - `peak_coherence_achieved` (double precision)
  - `contribution_to_field` (double precision)
  - `consciousness_quotient` (double precision, composite metric)
  - `transformation_index` (double precision, rate of improvement)
  - `resonance_bonds_count` (integer, strong connections with others)

  ### 8. resonance_bonds
  Social network of consciousness connections between users
  - `id` (uuid, primary key)
  - `user_a_id` (uuid, references profiles)
  - `user_b_id` (uuid, references profiles)
  - `bond_strength` (double precision, 0-1)
  - `sessions_together` (integer)
  - `avg_mutual_coherence` (double precision)
  - `last_synced_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 9. frequency_discoveries
  Community-discovered frequency combinations and geometries
  - `id` (uuid, primary key)
  - `discovered_by` (uuid[], array of contributors)
  - `discovery_session_id` (uuid)
  - `name` (text)
  - `description` (text)
  - `base_frequency` (double precision)
  - `harmonic_ratios` (double precision[])
  - `geometry_pattern` (jsonb)
  - `effectiveness_rating` (double precision, 0-5)
  - `times_used` (integer, default 0)
  - `is_verified` (boolean, default false)
  - `created_at` (timestamptz)

  ### 10. ritual_templates
  Community-created session templates and journeys
  - `id` (uuid, primary key)
  - `created_by` (uuid, references profiles)
  - `name` (text)
  - `description` (text)
  - `duration_minutes` (integer)
  - `chapters` (jsonb, array of chapter definitions)
  - `intended_outcome` (text)
  - `prerequisite_coherence` (double precision)
  - `success_rate` (double precision, 0-1)
  - `times_completed` (integer, default 0)
  - `avg_coherence_gain` (double precision)
  - `is_public` (boolean, default false)
  - `created_at` (timestamptz)

  ### 11. spacetime_recordings
  4D recordings of collective field states for replay
  - `id` (uuid, primary key)
  - `session_id` (uuid)
  - `timestamp` (timestamptz)
  - `field_snapshot` (jsonb, complete state)
  - `visual_state` (jsonb, Three.js scene state)
  - `audio_state` (jsonb, frequency configuration)
  - `participant_positions` (jsonb, biometric states)
  - `prediction_accuracy` (double precision, if this was predicted)

  ### 12. manifestation_tracker
  Tracking real-world outcomes linked to collective intentions
  - `id` (uuid, primary key)
  - `intention_id` (uuid, references collective_intentions)
  - `reported_by` (uuid, references profiles)
  - `outcome_description` (text)
  - `synchronicity_score` (double precision, 0-10)
  - `days_after_session` (integer)
  - `verification_count` (integer, others who experienced similar)
  - `reported_at` (timestamptz)

  ## Security (Row Level Security)
  All tables have RLS enabled with appropriate policies for user privacy
  while allowing collective visibility where appropriate.

  ## Indexes
  Optimized for real-time queries, time-series analysis, and social network operations.
*/

-- Biometric Streams
CREATE TABLE IF NOT EXISTS biometric_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid REFERENCES gaa_sync_sessions(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  heart_rate integer,
  hrv_rmssd double precision,
  coherence_score double precision CHECK (coherence_score >= 0 AND coherence_score <= 1),
  estimated_brainwave_state text CHECK (estimated_brainwave_state IN ('delta', 'theta', 'alpha', 'beta', 'gamma', 'unknown')),
  ppg_quality double precision CHECK (ppg_quality >= 0 AND ppg_quality <= 1),
  device_type text CHECK (device_type IN ('bluetooth', 'webcam', 'manual', 'smartwatch'))
);

ALTER TABLE biometric_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own biometric data"
  ON biometric_streams FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own biometric data"
  ON biometric_streams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Collective Field States
CREATE TABLE IF NOT EXISTS collective_field_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES gaa_sync_sessions(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  participant_count integer NOT NULL DEFAULT 0,
  avg_coherence double precision CHECK (avg_coherence >= 0 AND avg_coherence <= 1),
  field_strength double precision CHECK (field_strength >= 0 AND field_strength <= 100),
  dominant_frequency double precision,
  phase_synchrony double precision CHECK (phase_synchrony >= 0 AND phase_synchrony <= 1),
  quantum_entanglement_metric double precision CHECK (quantum_entanglement_metric >= 0 AND quantum_entanglement_metric <= 1),
  emergence_index double precision,
  coherence_stability double precision
);

ALTER TABLE collective_field_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view collective field states for active sessions"
  ON collective_field_states FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gaa_sync_sessions
      WHERE gaa_sync_sessions.id = session_id
      AND gaa_sync_sessions.is_active = true
    )
  );

-- Quantum Coherence Events
CREATE TABLE IF NOT EXISTS quantum_coherence_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES gaa_sync_sessions(id) ON DELETE SET NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  event_type text CHECK (event_type IN ('phase_lock', 'resonance_cascade', 'field_crystallization', 'quantum_tunneling', 'entanglement_spike')),
  participants uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  coherence_peak double precision,
  frequency_signature double precision[] NOT NULL DEFAULT ARRAY[]::double precision[],
  duration_seconds integer,
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE quantum_coherence_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quantum events"
  ON quantum_coherence_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create quantum events"
  ON quantum_coherence_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- AI Journey Insights
CREATE TABLE IF NOT EXISTS ai_journey_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES gaa_sync_sessions(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  insight_type text CHECK (insight_type IN ('prediction', 'recommendation', 'pattern_detection', 'warning', 'opportunity')),
  confidence double precision CHECK (confidence >= 0 AND confidence <= 1),
  insight_text text NOT NULL,
  suggested_frequency double precision,
  suggested_geometry text,
  suggested_intensity double precision,
  model_version text DEFAULT 'v1.0',
  training_data_size integer DEFAULT 0
);

ALTER TABLE ai_journey_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view AI insights for their sessions"
  ON ai_journey_insights FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gaa_sync_sessions
      WHERE gaa_sync_sessions.id = session_id
      AND (gaa_sync_sessions.user_id = auth.uid() OR gaa_sync_sessions.is_active = true)
    )
  );

-- Collective Intentions
CREATE TABLE IF NOT EXISTS collective_intentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES gaa_sync_sessions(id) ON DELETE SET NULL,
  proposed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  intention_text text NOT NULL,
  category text CHECK (category IN ('healing', 'growth', 'manifestation', 'exploration', 'connection', 'wisdom')),
  vote_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  activated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE collective_intentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active collective intentions"
  ON collective_intentions FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can create collective intentions"
  ON collective_intentions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = proposed_by);

CREATE POLICY "Users can update own intentions"
  ON collective_intentions FOR UPDATE
  TO authenticated
  USING (auth.uid() = proposed_by)
  WITH CHECK (auth.uid() = proposed_by);

-- Intention Votes
CREATE TABLE IF NOT EXISTS intention_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intention_id uuid REFERENCES collective_intentions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  vote_power double precision DEFAULT 1.0 CHECK (vote_power >= 0),
  voted_at timestamptz DEFAULT now(),
  UNIQUE(intention_id, user_id)
);

ALTER TABLE intention_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view votes for active intentions"
  ON intention_votes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collective_intentions
      WHERE collective_intentions.id = intention_id
      AND collective_intentions.is_active = true
    )
  );

CREATE POLICY "Users can cast own votes"
  ON intention_votes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Consciousness Metrics
CREATE TABLE IF NOT EXISTS consciousness_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  avg_session_coherence double precision,
  total_session_minutes integer DEFAULT 0,
  peak_coherence_achieved double precision,
  contribution_to_field double precision,
  consciousness_quotient double precision,
  transformation_index double precision,
  resonance_bonds_count integer DEFAULT 0,
  UNIQUE(user_id, date)
);

ALTER TABLE consciousness_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consciousness metrics"
  ON consciousness_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own metrics"
  ON consciousness_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own metrics"
  ON consciousness_metrics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Resonance Bonds
CREATE TABLE IF NOT EXISTS resonance_bonds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  user_b_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  bond_strength double precision CHECK (bond_strength >= 0 AND bond_strength <= 1),
  sessions_together integer DEFAULT 0,
  avg_mutual_coherence double precision,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CHECK (user_a_id < user_b_id),
  UNIQUE(user_a_id, user_b_id)
);

ALTER TABLE resonance_bonds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bonds involving them"
  ON resonance_bonds FOR SELECT
  TO authenticated
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);

-- Frequency Discoveries
CREATE TABLE IF NOT EXISTS frequency_discoveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discovered_by uuid[] NOT NULL DEFAULT ARRAY[]::uuid[],
  discovery_session_id uuid REFERENCES gaa_sync_sessions(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  base_frequency double precision NOT NULL,
  harmonic_ratios double precision[] NOT NULL,
  geometry_pattern jsonb DEFAULT '{}'::jsonb,
  effectiveness_rating double precision DEFAULT 0 CHECK (effectiveness_rating >= 0 AND effectiveness_rating <= 5),
  times_used integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE frequency_discoveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified discoveries"
  ON frequency_discoveries FOR SELECT
  TO authenticated
  USING (is_verified = true OR auth.uid() = ANY(discovered_by));

CREATE POLICY "Users can create discoveries"
  ON frequency_discoveries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = ANY(discovered_by));

-- Ritual Templates
CREATE TABLE IF NOT EXISTS ritual_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  duration_minutes integer NOT NULL,
  chapters jsonb NOT NULL DEFAULT '[]'::jsonb,
  intended_outcome text,
  prerequisite_coherence double precision DEFAULT 0,
  success_rate double precision DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 1),
  times_completed integer DEFAULT 0,
  avg_coherence_gain double precision DEFAULT 0,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ritual_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public ritual templates"
  ON ritual_templates FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create ritual templates"
  ON ritual_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates"
  ON ritual_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Spacetime Recordings
CREATE TABLE IF NOT EXISTS spacetime_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES gaa_sync_sessions(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  field_snapshot jsonb NOT NULL,
  visual_state jsonb DEFAULT '{}'::jsonb,
  audio_state jsonb DEFAULT '{}'::jsonb,
  participant_positions jsonb DEFAULT '[]'::jsonb,
  prediction_accuracy double precision
);

ALTER TABLE spacetime_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view session recordings"
  ON spacetime_recordings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gaa_sync_sessions
      WHERE gaa_sync_sessions.id = session_id
      AND gaa_sync_sessions.is_active = true
    )
  );

-- Manifestation Tracker
CREATE TABLE IF NOT EXISTS manifestation_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intention_id uuid REFERENCES collective_intentions(id) ON DELETE SET NULL,
  reported_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  outcome_description text NOT NULL,
  synchronicity_score double precision CHECK (synchronicity_score >= 0 AND synchronicity_score <= 10),
  days_after_session integer,
  verification_count integer DEFAULT 0,
  reported_at timestamptz DEFAULT now()
);

ALTER TABLE manifestation_tracker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view manifestations"
  ON manifestation_tracker FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can report manifestations"
  ON manifestation_tracker FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reported_by);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_biometric_streams_user_time ON biometric_streams(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_biometric_streams_session ON biometric_streams(session_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_collective_field_session_time ON collective_field_states(session_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_quantum_events_session ON quantum_coherence_events(session_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_quantum_events_type ON quantum_coherence_events(event_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_ai_insights_session ON ai_journey_insights(session_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_intentions_active ON collective_intentions(is_active, vote_count DESC);
CREATE INDEX IF NOT EXISTS idx_intentions_session ON collective_intentions(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_consciousness_metrics_user_date ON consciousness_metrics(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_resonance_bonds_users ON resonance_bonds(user_a_id, user_b_id);
CREATE INDEX IF NOT EXISTS idx_resonance_bonds_strength ON resonance_bonds(bond_strength DESC);

CREATE INDEX IF NOT EXISTS idx_discoveries_verified ON frequency_discoveries(is_verified, effectiveness_rating DESC);

CREATE INDEX IF NOT EXISTS idx_ritual_templates_public ON ritual_templates(is_public, success_rate DESC);

CREATE INDEX IF NOT EXISTS idx_spacetime_session_time ON spacetime_recordings(session_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_manifestations_intention ON manifestation_tracker(intention_id, reported_at DESC);

-- Trigger to update vote count on intentions
CREATE OR REPLACE FUNCTION update_intention_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE collective_intentions
  SET vote_count = (
    SELECT COALESCE(SUM(vote_power), 0)
    FROM intention_votes
    WHERE intention_id = NEW.intention_id
  )
  WHERE id = NEW.intention_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_vote_count ON intention_votes;
CREATE TRIGGER trigger_update_vote_count
  AFTER INSERT ON intention_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_intention_vote_count();

-- Function to calculate consciousness quotient
CREATE OR REPLACE FUNCTION calculate_consciousness_quotient(
  p_user_id uuid,
  p_date date
) RETURNS double precision AS $$
DECLARE
  v_cq double precision;
BEGIN
  SELECT
    (
      COALESCE(avg_session_coherence, 0) * 0.3 +
      COALESCE(contribution_to_field, 0) * 0.2 +
      COALESCE(transformation_index, 0) * 0.2 +
      COALESCE(resonance_bonds_count, 0) * 0.1 +
      COALESCE(peak_coherence_achieved, 0) * 0.2
    ) * 10
  INTO v_cq
  FROM consciousness_metrics
  WHERE user_id = p_user_id AND date = p_date;

  RETURN COALESCE(v_cq, 0);
END;
$$ LANGUAGE plpgsql;
