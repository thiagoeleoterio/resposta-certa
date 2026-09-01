-- Migration: 003_create_responses
-- Description: Creates responses table with the IA output

-- Enable RLS
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL UNIQUE REFERENCES requests(id) ON DELETE CASCADE,
  recommended TEXT NOT NULL,
  short TEXT NOT NULL,
  friendly TEXT NOT NULL,
  firm TEXT NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- RLS Policies for responses
-- Users can view responses from their own requests
CREATE POLICY "Users can view own responses" ON responses
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM requests WHERE id = request_id AND user_id = auth.uid()
  ));

-- Insert is controlled via the reservation function
CREATE POLICY "Insert controlled" ON responses
  FOR INSERT WITH CHECK (true);