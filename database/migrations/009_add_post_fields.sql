-- ============================================================================
-- Migration: 009_add_post_fields.sql
-- Description: Add difficulty and thumbnail_url fields to posts table
-- ============================================================================

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Create index on difficulty for faster filtering
CREATE INDEX IF NOT EXISTS idx_posts_difficulty ON posts(difficulty);

