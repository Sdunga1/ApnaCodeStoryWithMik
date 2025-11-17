-- ============================================================================
-- Migration: 003_create_triggers.sql
-- Description: Create triggers for automatic timestamp updates
-- ============================================================================

-- ============================================================================
-- TRIGGER FUNCTION: Update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- APPLY TRIGGERS TO TABLES
-- ============================================================================

-- Creator Profile
CREATE TRIGGER update_creator_profile_updated_at
    BEFORE UPDATE ON creator_profile
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Posts
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Problems
CREATE TRIGGER update_problems_updated_at
    BEFORE UPDATE ON problems
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- User Progress
CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Updates
CREATE TRIGGER update_updates_updated_at
    BEFORE UPDATE ON updates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

