-- ============================================================================
-- Complete Database Schema (All-in-One)
-- Description: Full database schema in a single file
-- Usage: psql -U your_username -d your_database -f schema.sql
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- BASE TABLES
-- ============================================================================

CREATE TABLE creator_profile (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    github VARCHAR(255),
    youtube VARCHAR(255),
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('creator', 'student')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_name VARCHAR(500) NOT NULL,
    youtube_link TEXT,
    lc_daily_link TEXT,
    github_link TEXT,
    motivational_quote TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    extra_links JSONB DEFAULT '{}'::jsonb,
    post_date DATE NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    topic VARCHAR(255),
    lc_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_date DATE NOT NULL UNIQUE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    lc_problem_id UUID REFERENCES problems(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'not_attempted' CHECK (status IN ('not_attempted', 'attempted', 'solved')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, problem_id)
);

CREATE TABLE user_daily_completion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

CREATE TABLE updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    month_year DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_deleted ON users(is_deleted);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);

-- Posts
CREATE INDEX idx_posts_post_date ON posts(post_date DESC);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);

-- Problems
CREATE INDEX idx_problems_difficulty ON problems(difficulty);
CREATE INDEX idx_problems_topic ON problems(topic);
CREATE INDEX idx_problems_created_at ON problems(created_at);
CREATE INDEX idx_problems_metadata ON problems USING GIN(metadata);

-- Daily Problems
CREATE INDEX idx_daily_problems_date ON daily_problems(problem_date DESC);
CREATE INDEX idx_daily_problems_post_id ON daily_problems(post_id);
CREATE INDEX idx_daily_problems_lc_problem_id ON daily_problems(lc_problem_id);

-- User Progress
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_problem_id ON user_progress(problem_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
CREATE INDEX idx_user_progress_updated_at ON user_progress(updated_at DESC);
CREATE INDEX idx_user_progress_user_status ON user_progress(user_id, status);

-- User Daily Completion
CREATE INDEX idx_user_daily_completion_user_id ON user_daily_completion(user_id);
CREATE INDEX idx_user_daily_completion_post_id ON user_daily_completion(post_id);
CREATE INDEX idx_user_daily_completion_completed_at ON user_daily_completion(completed_at DESC);

-- Updates
CREATE INDEX idx_updates_month_year ON updates(month_year DESC);
CREATE INDEX idx_updates_created_at ON updates(created_at DESC);

-- Tags
CREATE INDEX idx_tags_name ON tags(name);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_creator_profile_updated_at BEFORE UPDATE ON creator_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_updates_updated_at BEFORE UPDATE ON updates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION soft_delete_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users SET is_deleted = TRUE, deleted_at = NOW() WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users SET is_deleted = FALSE, deleted_at = NULL
    WHERE id = user_uuid AND deleted_at IS NOT NULL AND deleted_at > NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION hard_delete_expired_users()
RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM users WHERE is_deleted = TRUE AND deleted_at IS NOT NULL AND deleted_at <= NOW() - INTERVAL '30 days' RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE(total_problems BIGINT, solved_problems BIGINT, attempted_problems BIGINT, not_attempted_problems BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) AS total_problems,
        COUNT(*) FILTER (WHERE status = 'solved') AS solved_problems,
        COUNT(*) FILTER (WHERE status = 'attempted') AS attempted_problems,
        COUNT(*) FILTER (WHERE status = 'not_attempted') AS not_attempted_problems
    FROM user_progress WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_daily_completions(user_uuid UUID, start_date DATE, end_date DATE)
RETURNS TABLE(post_date DATE, is_completed BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT p.post_date, (udc.id IS NOT NULL) AS is_completed
    FROM posts p
    LEFT JOIN user_daily_completion udc ON p.id = udc.post_id AND udc.user_id = user_uuid
    WHERE p.post_date BETWEEN start_date AND end_date
    ORDER BY p.post_date DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_problems_by_difficulty(diff VARCHAR)
RETURNS TABLE(problem_id UUID, title VARCHAR, topic VARCHAR, lc_url TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.title, p.topic, p.lc_url FROM problems p WHERE p.difficulty = diff ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA
-- ============================================================================

INSERT INTO tags (name) VALUES
    ('Array'), ('String'), ('Hash Table'), ('Dynamic Programming'), ('Math'),
    ('Sorting'), ('Greedy'), ('Depth-First Search'), ('Breadth-First Search'),
    ('Binary Search'), ('Tree'), ('Binary Tree'), ('Binary Search Tree'),
    ('Stack'), ('Queue'), ('Heap (Priority Queue)'), ('Graph'), ('Backtracking'),
    ('Sliding Window'), ('Two Pointers'), ('Linked List'), ('Recursion'),
    ('Bit Manipulation'), ('Divide and Conquer'), ('Trie'), ('Union Find'),
    ('Monotonic Stack'), ('Segment Tree'), ('Binary Indexed Tree')
ON CONFLICT (name) DO NOTHING;

