-- Migration: 002_create_requests
-- Description: Creates requests table to track IA generation attempts

-- Enable RLS
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT,  -- nullable, preenchido futuramente
  objective TEXT NOT NULL,
  tone TEXT NOT NULL,
  input_text TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'openai',
  model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  prompt_version TEXT NOT NULL DEFAULT 'v1.0',
  status TEXT NOT NULL DEFAULT 'processing',  -- processing, success, failed
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- RLS Policies for requests
CREATE POLICY "Users can view own requests" ON requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert requests" ON requests
  FOR INSERT WITH CHECK (true);  -- Inserido via função atômica/trigger

CREATE POLICY "Users can update own request status" ON requests
  FOR UPDATE USING (auth.uid() = user_id);