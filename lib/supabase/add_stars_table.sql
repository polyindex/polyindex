-- Add stars table for index starring feature
-- Run this migration in your Supabase SQL editor

-- Stars table (many-to-many relationship between users and indexes)
CREATE TABLE IF NOT EXISTS stars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  index_id UUID NOT NULL REFERENCES indexes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(index_id, user_id) -- Ensure a user can only star an index once
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stars_index_id ON stars(index_id);
CREATE INDEX IF NOT EXISTS idx_stars_user_id ON stars(user_id);
CREATE INDEX IF NOT EXISTS idx_stars_created_at ON stars(created_at);

-- Enable RLS
ALTER TABLE stars ENABLE ROW LEVEL SECURITY;

-- Anyone can view stars (to see star counts)
CREATE POLICY "Anyone can view stars"
  ON stars FOR SELECT
  USING (TRUE);

-- Authenticated users can add stars
CREATE POLICY "Authenticated users can add stars"
  ON stars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own stars
CREATE POLICY "Users can remove own stars"
  ON stars FOR DELETE
  USING (auth.uid() = user_id);

-- Function to get star count for an index
CREATE OR REPLACE FUNCTION get_index_star_count(index_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM stars WHERE index_id = index_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to check if user has starred an index
CREATE OR REPLACE FUNCTION has_user_starred_index(index_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM stars WHERE index_id = index_uuid AND user_id = user_uuid);
$$ LANGUAGE SQL STABLE;
