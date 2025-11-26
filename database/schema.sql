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
    username VARCHAR(40),
    bio TEXT,
    location VARCHAR(120),
    website_url TEXT,
    twitter_handle VARCHAR(60),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_name VARCHAR(500) NOT NULL,
    difficulty VARCHAR(20) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    youtube_link TEXT,
    lc_daily_link TEXT,
    github_link TEXT,
    motivational_quote TEXT,
    thumbnail_url TEXT,
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

CREATE TABLE practice_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE practice_problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES practice_topics(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    leetcode_url TEXT NOT NULL,
    solution_video_url TEXT,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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
CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users (LOWER(username)) WHERE username IS NOT NULL;

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

-- Practice Topics
CREATE INDEX idx_practice_topics_position ON practice_topics(position ASC, created_at ASC);

-- Practice Problems
CREATE INDEX idx_practice_problems_topic_position ON practice_problems(topic_id ASC, position ASC, created_at ASC);

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
CREATE TRIGGER update_practice_topics_updated_at BEFORE UPDATE ON practice_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_practice_problems_updated_at BEFORE UPDATE ON practice_problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

INSERT INTO practice_topics (id, title, position) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Arrays & Hashing', 1),
    ('22222222-2222-2222-2222-222222222222', 'Two Pointers', 2),
    ('33333333-3333-3333-3333-333333333333', 'Sliding Window', 3),
    ('44444444-4444-4444-4444-444444444444', 'Stack', 4),
    ('55555555-5555-5555-5555-555555555555', 'Binary Search', 5),
    ('66666666-6666-6666-6666-666666666666', 'Linked List', 6),
    ('77777777-7777-7777-7777-777777777777', 'Trees', 7),
    ('88888888-8888-8888-8888-888888888888', 'Graphs', 8),
    ('99999999-9999-9999-9999-999999999999', 'Dynamic Programming', 9)
ON CONFLICT (id) DO NOTHING;

INSERT INTO practice_problems (topic_id, title, difficulty, position, leetcode_url) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Two Sum', 'Easy', 1, 'https://leetcode.com/problems/two-sum'),
    ('11111111-1111-1111-1111-111111111111', 'Valid Anagram', 'Easy', 2, 'https://leetcode.com/problems/valid-anagram'),
    ('11111111-1111-1111-1111-111111111111', 'Contains Duplicate', 'Easy', 3, 'https://leetcode.com/problems/contains-duplicate'),
    ('11111111-1111-1111-1111-111111111111', 'Group Anagrams', 'Medium', 4, 'https://leetcode.com/problems/group-anagrams'),
    ('11111111-1111-1111-1111-111111111111', 'Top K Frequent Elements', 'Medium', 5, 'https://leetcode.com/problems/top-k-frequent-elements'),
    ('11111111-1111-1111-1111-111111111111', 'Product of Array Except Self', 'Medium', 6, 'https://leetcode.com/problems/product-of-array-except-self'),
    ('11111111-1111-1111-1111-111111111111', 'Valid Sudoku', 'Medium', 7, 'https://leetcode.com/problems/valid-sudoku'),
    ('22222222-2222-2222-2222-222222222222', 'Valid Palindrome', 'Easy', 1, 'https://leetcode.com/problems/valid-palindrome'),
    ('22222222-2222-2222-2222-222222222222', 'Two Sum II - Input Array Is Sorted', 'Medium', 2, 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted'),
    ('22222222-2222-2222-2222-222222222222', '3Sum', 'Medium', 3, 'https://leetcode.com/problems/3sum'),
    ('22222222-2222-2222-2222-222222222222', 'Container With Most Water', 'Medium', 4, 'https://leetcode.com/problems/container-with-most-water'),
    ('33333333-3333-3333-3333-333333333333', 'Best Time to Buy and Sell Stock', 'Easy', 1, 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock'),
    ('33333333-3333-3333-3333-333333333333', 'Longest Substring Without Repeating Characters', 'Medium', 2, 'https://leetcode.com/problems/longest-substring-without-repeating-characters'),
    ('33333333-3333-3333-3333-333333333333', 'Longest Repeating Character Replacement', 'Medium', 3, 'https://leetcode.com/problems/longest-repeating-character-replacement'),
    ('33333333-3333-3333-3333-333333333333', 'Minimum Window Substring', 'Hard', 4, 'https://leetcode.com/problems/minimum-window-substring'),
    ('44444444-4444-4444-4444-444444444444', 'Valid Parentheses', 'Easy', 1, 'https://leetcode.com/problems/valid-parentheses'),
    ('44444444-4444-4444-4444-444444444444', 'Min Stack', 'Medium', 2, 'https://leetcode.com/problems/min-stack'),
    ('44444444-4444-4444-4444-444444444444', 'Daily Temperatures', 'Medium', 3, 'https://leetcode.com/problems/daily-temperatures'),
    ('44444444-4444-4444-4444-444444444444', 'Largest Rectangle in Histogram', 'Hard', 4, 'https://leetcode.com/problems/largest-rectangle-in-histogram'),
    ('55555555-5555-5555-5555-555555555555', 'Binary Search', 'Easy', 1, 'https://leetcode.com/problems/binary-search'),
    ('55555555-5555-5555-5555-555555555555', 'Search in Rotated Sorted Array', 'Medium', 2, 'https://leetcode.com/problems/search-in-rotated-sorted-array'),
    ('55555555-5555-5555-5555-555555555555', 'Find Minimum in Rotated Sorted Array', 'Medium', 3, 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array'),
    ('66666666-6666-6666-6666-666666666666', 'Reverse Linked List', 'Easy', 1, 'https://leetcode.com/problems/reverse-linked-list'),
    ('66666666-6666-6666-6666-666666666666', 'Merge Two Sorted Lists', 'Easy', 2, 'https://leetcode.com/problems/merge-two-sorted-lists'),
    ('66666666-6666-6666-6666-666666666666', 'Reorder List', 'Medium', 3, 'https://leetcode.com/problems/reorder-list'),
    ('66666666-6666-6666-6666-666666666666', 'Remove Nth Node From End of List', 'Medium', 4, 'https://leetcode.com/problems/remove-nth-node-from-end-of-list'),
    ('77777777-7777-7777-7777-777777777777', 'Invert Binary Tree', 'Easy', 1, 'https://leetcode.com/problems/invert-binary-tree'),
    ('77777777-7777-7777-7777-777777777777', 'Maximum Depth of Binary Tree', 'Easy', 2, 'https://leetcode.com/problems/maximum-depth-of-binary-tree'),
    ('77777777-7777-7777-7777-777777777777', 'Binary Tree Level Order Traversal', 'Medium', 3, 'https://leetcode.com/problems/binary-tree-level-order-traversal'),
    ('77777777-7777-7777-7777-777777777777', 'Validate Binary Search Tree', 'Medium', 4, 'https://leetcode.com/problems/validate-binary-search-tree'),
    ('88888888-8888-8888-8888-888888888888', 'Number of Islands', 'Medium', 1, 'https://leetcode.com/problems/number-of-islands'),
    ('88888888-8888-8888-8888-888888888888', 'Clone Graph', 'Medium', 2, 'https://leetcode.com/problems/clone-graph'),
    ('88888888-8888-8888-8888-888888888888', 'Course Schedule', 'Medium', 3, 'https://leetcode.com/problems/course-schedule'),
    ('88888888-8888-8888-8888-888888888888', 'Word Ladder', 'Hard', 4, 'https://leetcode.com/problems/word-ladder'),
    ('99999999-9999-9999-9999-999999999999', 'Climbing Stairs', 'Easy', 1, 'https://leetcode.com/problems/climbing-stairs'),
    ('99999999-9999-9999-9999-999999999999', 'House Robber', 'Medium', 2, 'https://leetcode.com/problems/house-robber'),
    ('99999999-9999-9999-9999-999999999999', 'Longest Increasing Subsequence', 'Medium', 3, 'https://leetcode.com/problems/longest-increasing-subsequence'),
    ('99999999-9999-9999-9999-999999999999', 'Coin Change', 'Medium', 4, 'https://leetcode.com/problems/coin-change')
ON CONFLICT DO NOTHING;

