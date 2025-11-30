-- Migration: Add roadmap tables for DSA roadmap visualization
-- Created: 2024

-- Table for roadmap topics (nodes)
CREATE TABLE IF NOT EXISTS roadmap_topics (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Foundation', 'Core', 'Intermediate', 'Advanced', 'Final')),
  shape VARCHAR(50) NOT NULL CHECK (shape IN ('rect', 'circle', 'rhomboid')),
  position_x DECIMAL(10, 2) NOT NULL,
  position_y DECIMAL(10, 2) NOT NULL,
  position_z DECIMAL(10, 2) NOT NULL DEFAULT 0,
  scale DECIMAL(5, 2) DEFAULT 1.0,
  font_size DECIMAL(5, 2) DEFAULT 0.45,
  text_color VARCHAR(7) DEFAULT '#ffffff',
  youtube_playlist_link TEXT,
  optional_link TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table for roadmap edges (connections between topics)
CREATE TABLE IF NOT EXISTS roadmap_edges (
  id SERIAL PRIMARY KEY,
  source_topic_id VARCHAR(255) NOT NULL REFERENCES roadmap_topics(id) ON DELETE CASCADE,
  target_topic_id VARCHAR(255) NOT NULL REFERENCES roadmap_topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_topic_id, target_topic_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_roadmap_topics_category ON roadmap_topics(category);
CREATE INDEX IF NOT EXISTS idx_roadmap_edges_source ON roadmap_edges(source_topic_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_edges_target ON roadmap_edges(target_topic_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_roadmap_topics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_roadmap_topics_updated_at
  BEFORE UPDATE ON roadmap_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_roadmap_topics_updated_at();

