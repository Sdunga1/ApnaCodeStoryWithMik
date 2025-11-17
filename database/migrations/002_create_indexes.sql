-- ============================================================================
-- Migration: 002_create_indexes.sql
-- Description: Create indexes for optimized query performance
-- ============================================================================

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_deleted ON users(is_deleted);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================================================
-- POSTS TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_posts_post_date ON posts(post_date DESC);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);

-- ============================================================================
-- PROBLEMS TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_topic ON problems(topic);
CREATE INDEX idx_problems_created_at ON problems(created_at);
CREATE INDEX idx_problems_metadata ON problems USING GIN(metadata);

-- ============================================================================
-- DAILY PROBLEMS TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_daily_problems_date ON daily_problems(problem_date DESC);
CREATE INDEX idx_daily_problems_post_id ON daily_problems(post_id);
CREATE INDEX idx_daily_problems_lc_problem_id ON daily_problems(lc_problem_id);

-- ============================================================================
-- USER PROGRESS TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_problem_id ON user_progress(problem_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
CREATE INDEX idx_user_progress_updated_at ON user_progress(updated_at DESC);
CREATE INDEX idx_user_progress_user_status ON user_progress(user_id, status);

-- ============================================================================
-- USER DAILY COMPLETION TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_user_daily_completion_user_id ON user_daily_completion(user_id);
CREATE INDEX idx_user_daily_completion_post_id ON user_daily_completion(post_id);
CREATE INDEX idx_user_daily_completion_completed_at ON user_daily_completion(completed_at DESC);

-- ============================================================================
-- UPDATES TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_updates_month_year ON updates(month_year DESC);
CREATE INDEX idx_updates_created_at ON updates(created_at DESC);

-- ============================================================================
-- TAGS TABLE INDEXES
-- ============================================================================
CREATE INDEX idx_tags_name ON tags(name);

