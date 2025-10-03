/*
  # Collective Sync Events Calendar Schema

  1. New Tables
    - `collective_sync_events`
      - `id` (uuid, primary key)
      - `title` (text) - Event name
      - `description` (text) - Event details
      - `start_time` (timestamptz) - Event start in UTC
      - `duration_minutes` (integer) - Event duration
      - `created_by` (text) - User who created the event
      - `max_participants` (integer, optional) - Max participant limit
      - `intention_focus` (text, optional) - Pre-set intention for the event
      - `is_active` (boolean) - Whether event is still active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `event_participants`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key)
      - `user_id` (text)
      - `joined_at` (timestamptz)
      - `reminder_sent` (boolean)

  2. Security
    - Enable RLS on both tables
    - Public can read active events
    - Authenticated users can create events
    - Users can join events
    - Users can manage their own event registrations

  3. Indexes
    - Index on start_time for efficient queries
    - Index on event_id for participant lookups
*/

-- Create collective_sync_events table
CREATE TABLE IF NOT EXISTS collective_sync_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  start_time timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  created_by text NOT NULL,
  max_participants integer,
  intention_focus text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_participants table
CREATE TABLE IF NOT EXISTS event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES collective_sync_events(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  joined_at timestamptz DEFAULT now(),
  reminder_sent boolean DEFAULT false,
  UNIQUE(event_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_start_time ON collective_sync_events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_active ON collective_sync_events(is_active, start_time);
CREATE INDEX IF NOT EXISTS idx_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON event_participants(user_id);

-- Enable Row Level Security
ALTER TABLE collective_sync_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collective_sync_events

-- Anyone can view active events
CREATE POLICY "Anyone can view active events"
  ON collective_sync_events FOR SELECT
  USING (is_active = true);

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
  ON collective_sync_events FOR INSERT
  WITH CHECK (created_by IS NOT NULL AND created_by != '');

-- Users can update their own events
CREATE POLICY "Users can update own events"
  ON collective_sync_events FOR UPDATE
  USING (created_by = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (created_by = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can delete their own events
CREATE POLICY "Users can delete own events"
  ON collective_sync_events FOR DELETE
  USING (created_by = current_setting('request.jwt.claims', true)::json->>'sub');

-- RLS Policies for event_participants

-- Anyone can view event participants
CREATE POLICY "Anyone can view participants"
  ON event_participants FOR SELECT
  USING (true);

-- Authenticated users can join events
CREATE POLICY "Users can join events"
  ON event_participants FOR INSERT
  WITH CHECK (user_id IS NOT NULL AND user_id != '');

-- Users can remove themselves from events
CREATE POLICY "Users can leave events"
  ON event_participants FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_collective_sync_events_updated_at ON collective_sync_events;
CREATE TRIGGER update_collective_sync_events_updated_at
  BEFORE UPDATE ON collective_sync_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
