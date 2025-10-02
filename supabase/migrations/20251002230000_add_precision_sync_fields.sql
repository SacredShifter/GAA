/*
  # Add Precision Sync Fields for Real-Time Geometric Alignment

  ## Changes Made

  1. Extended `gaa_sync_sessions` table
    - `bpm` (integer): Tempo for bar-based synchronization (default 60)
    - `beats_per_bar` (integer): Number of beats per bar (default 8)
    - `f0` (double precision): Base frequency in Hz (e.g., 432.0)
    - `ratios` (double precision array): Integer-ratio harmonics [1, 2, 1.5, etc.]
    - `bar0_epoch_ms` (bigint): Server epoch milliseconds of bar zero for phase alignment
    - `binaural_hz` (double precision): Binaural beat frequency (nullable, 4-8 Hz range)
    - `sweep` (jsonb): Sweep configuration {type, from, to, durationMs}
    - `waveform` (text): Waveform type (sine, triangle, square, sawtooth)
    - `geometric_pack` (text): Geometric frequency pack identifier

  2. Updated `gaa_resonance_log` table
    - `client_offset_ms` (integer): Measured clock offset from server
    - `rtt_ms` (integer): Round-trip time for diagnostics
    - `bar_drift_ms` (integer): Drift from bar boundary in milliseconds
    - `last_heartbeat_at` (timestamptz): Last heartbeat timestamp
    - `sync_quality` (text): Quality indicator (good, fair, poor)

  3. Added `gaa_presets` fields for geometric packs
    - `audio_mode` (text): Audio mode (single, harmonic, sweep, binaural)
    - `harmonic_count` (integer): Number of harmonics
    - `sweep_start`, `sweep_end`, `sweep_duration` (double precision/integer)
    - `binaural_beat` (double precision): Binaural beat frequency
    - `geometric_pack` (text): Geometric pack identifier
    - `bpm`, `beats_per_bar` (integer): Tempo settings

  ## Important Notes
  - All fields use `IF NOT EXISTS` to prevent errors on re-run
  - Maintains backward compatibility with existing sessions
  - Default values ensure safe operation even with incomplete data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_sync_sessions' AND column_name = 'bpm'
  ) THEN
    ALTER TABLE gaa_sync_sessions ADD COLUMN bpm integer NOT NULL DEFAULT 60;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_sync_sessions' AND column_name = 'beats_per_bar'
  ) THEN
    ALTER TABLE gaa_sync_sessions ADD COLUMN beats_per_bar integer NOT NULL DEFAULT 8;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_sync_sessions' AND column_name = 'f0'
  ) THEN
    ALTER TABLE gaa_sync_sessions ADD COLUMN f0 double precision NOT NULL DEFAULT 432.0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_sync_sessions' AND column_name = 'ratios'
  ) THEN
    ALTER TABLE gaa_sync_sessions ADD COLUMN ratios double precision[] NOT NULL DEFAULT ARRAY[1.0, 2.0, 1.5, 1.333333, 1.25];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_sync_sessions' AND column_name = 'bar0_epoch_ms'
  ) THEN
    ALTER TABLE gaa_sync_sessions ADD COLUMN bar0_epoch_ms bigint NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_sync_sessions' AND column_name = 'binaural_hz'
  ) THEN
    ALTER TABLE gaa_sync_sessions ADD COLUMN binaural_hz double precision;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_sync_sessions' AND column_name = 'sweep'
  ) THEN
    ALTER TABLE gaa_sync_sessions ADD COLUMN sweep jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_sync_sessions' AND column_name = 'waveform'
  ) THEN
    ALTER TABLE gaa_sync_sessions ADD COLUMN waveform text NOT NULL DEFAULT 'sine';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_sync_sessions' AND column_name = 'geometric_pack'
  ) THEN
    ALTER TABLE gaa_sync_sessions ADD COLUMN geometric_pack text DEFAULT 'octave';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_resonance_log' AND column_name = 'client_offset_ms'
  ) THEN
    ALTER TABLE gaa_resonance_log ADD COLUMN client_offset_ms integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_resonance_log' AND column_name = 'rtt_ms'
  ) THEN
    ALTER TABLE gaa_resonance_log ADD COLUMN rtt_ms integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_resonance_log' AND column_name = 'bar_drift_ms'
  ) THEN
    ALTER TABLE gaa_resonance_log ADD COLUMN bar_drift_ms integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_resonance_log' AND column_name = 'last_heartbeat_at'
  ) THEN
    ALTER TABLE gaa_resonance_log ADD COLUMN last_heartbeat_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_resonance_log' AND column_name = 'sync_quality'
  ) THEN
    ALTER TABLE gaa_resonance_log ADD COLUMN sync_quality text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_presets' AND column_name = 'audio_mode'
  ) THEN
    ALTER TABLE gaa_presets ADD COLUMN audio_mode text DEFAULT 'binaural';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_presets' AND column_name = 'harmonic_count'
  ) THEN
    ALTER TABLE gaa_presets ADD COLUMN harmonic_count integer DEFAULT 3;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_presets' AND column_name = 'sweep_start'
  ) THEN
    ALTER TABLE gaa_presets ADD COLUMN sweep_start double precision;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_presets' AND column_name = 'sweep_end'
  ) THEN
    ALTER TABLE gaa_presets ADD COLUMN sweep_end double precision;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_presets' AND column_name = 'sweep_duration'
  ) THEN
    ALTER TABLE gaa_presets ADD COLUMN sweep_duration integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_presets' AND column_name = 'binaural_beat'
  ) THEN
    ALTER TABLE gaa_presets ADD COLUMN binaural_beat double precision;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_presets' AND column_name = 'geometric_pack'
  ) THEN
    ALTER TABLE gaa_presets ADD COLUMN geometric_pack text DEFAULT 'octave';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_presets' AND column_name = 'bpm'
  ) THEN
    ALTER TABLE gaa_presets ADD COLUMN bpm integer DEFAULT 60;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gaa_presets' AND column_name = 'beats_per_bar'
  ) THEN
    ALTER TABLE gaa_presets ADD COLUMN beats_per_bar integer DEFAULT 8;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_gaa_sync_sessions_bar0_epoch
  ON gaa_sync_sessions(bar0_epoch_ms)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_gaa_resonance_log_quality
  ON gaa_resonance_log(sync_quality, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gaa_resonance_log_heartbeat
  ON gaa_resonance_log(user_id, last_heartbeat_at DESC);
