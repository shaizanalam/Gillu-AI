-- Gillu AI: Wardrobe Scanner - Database Initialization
-- Run this SQL in your Supabase SQL Editor to create the wardrobe table.

CREATE TABLE IF NOT EXISTS wardrobe (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT,
  brand TEXT,
  material TEXT,
  season TEXT CHECK (season IN ('spring', 'summer', 'fall', 'winter', 'all-season')),
  occasion TEXT CHECK (occasion IN ('casual', 'formal', 'business', 'sport', 'party', 'other')),
  ai_description TEXT,
  ai_styling_tips TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE wardrobe ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own wardrobe items
CREATE POLICY "Users can view own wardrobe items"
  ON wardrobe FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own wardrobe items
CREATE POLICY "Users can insert own wardrobe items"
  ON wardrobe FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own wardrobe items
CREATE POLICY "Users can update own wardrobe items"
  ON wardrobe FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own wardrobe items
CREATE POLICY "Users can delete own wardrobe items"
  ON wardrobe FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_wardrobe_user_id ON wardrobe(user_id);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_wardrobe_category ON wardrobe(category);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on row change
CREATE TRIGGER set_wardrobe_updated_at
  BEFORE UPDATE ON wardrobe
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
