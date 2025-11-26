-- 010_add_practice_tables.sql
-- Description: introduce practice roadmap topics and problems with ordering metadata

CREATE TABLE IF NOT EXISTS practice_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS practice_problems (
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

CREATE INDEX IF NOT EXISTS idx_practice_topics_position
    ON practice_topics(position ASC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_practice_problems_topic_position
    ON practice_problems(topic_id ASC, position ASC, created_at ASC);

CREATE TRIGGER update_practice_topics_updated_at
BEFORE UPDATE ON practice_topics
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_practice_problems_updated_at
BEFORE UPDATE ON practice_problems
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default roadmap topics based on legacy mock data (can be safely re-run)
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

-- Helper function to insert seeded practice problems
CREATE OR REPLACE FUNCTION seed_practice_problem(
    v_topic UUID,
    v_title VARCHAR,
    v_difficulty VARCHAR,
    v_order INTEGER,
    v_leetcode TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO practice_problems (topic_id, title, difficulty, position, leetcode_url)
    VALUES (v_topic, v_title, v_difficulty, v_order, COALESCE(v_leetcode, ''));
END;
$$ LANGUAGE plpgsql;

-- Seed sample problems mirroring original mock data (order preserved)
DO $$
DECLARE
BEGIN
    PERFORM seed_practice_problem('11111111-1111-1111-1111-111111111111', 'Two Sum', 'Easy', 1, 'https://leetcode.com/problems/two-sum');
    PERFORM seed_practice_problem('11111111-1111-1111-1111-111111111111', 'Valid Anagram', 'Easy', 2, 'https://leetcode.com/problems/valid-anagram');
    PERFORM seed_practice_problem('11111111-1111-1111-1111-111111111111', 'Contains Duplicate', 'Easy', 3, 'https://leetcode.com/problems/contains-duplicate');
    PERFORM seed_practice_problem('11111111-1111-1111-1111-111111111111', 'Group Anagrams', 'Medium', 4, 'https://leetcode.com/problems/group-anagrams');
    PERFORM seed_practice_problem('11111111-1111-1111-1111-111111111111', 'Top K Frequent Elements', 'Medium', 5, 'https://leetcode.com/problems/top-k-frequent-elements');
    PERFORM seed_practice_problem('11111111-1111-1111-1111-111111111111', 'Product of Array Except Self', 'Medium', 6, 'https://leetcode.com/problems/product-of-array-except-self');
    PERFORM seed_practice_problem('11111111-1111-1111-1111-111111111111', 'Valid Sudoku', 'Medium', 7, 'https://leetcode.com/problems/valid-sudoku');

    PERFORM seed_practice_problem('22222222-2222-2222-2222-222222222222', 'Valid Palindrome', 'Easy', 1, 'https://leetcode.com/problems/valid-palindrome');
    PERFORM seed_practice_problem('22222222-2222-2222-2222-222222222222', 'Two Sum II - Input Array Is Sorted', 'Medium', 2, 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted');
    PERFORM seed_practice_problem('22222222-2222-2222-2222-222222222222', '3Sum', 'Medium', 3, 'https://leetcode.com/problems/3sum');
    PERFORM seed_practice_problem('22222222-2222-2222-2222-222222222222', 'Container With Most Water', 'Medium', 4, 'https://leetcode.com/problems/container-with-most-water');

    PERFORM seed_practice_problem('33333333-3333-3333-3333-333333333333', 'Best Time to Buy and Sell Stock', 'Easy', 1, 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock');
    PERFORM seed_practice_problem('33333333-3333-3333-3333-333333333333', 'Longest Substring Without Repeating Characters', 'Medium', 2, 'https://leetcode.com/problems/longest-substring-without-repeating-characters');
    PERFORM seed_practice_problem('33333333-3333-3333-3333-333333333333', 'Longest Repeating Character Replacement', 'Medium', 3, 'https://leetcode.com/problems/longest-repeating-character-replacement');
    PERFORM seed_practice_problem('33333333-3333-3333-3333-333333333333', 'Minimum Window Substring', 'Hard', 4, 'https://leetcode.com/problems/minimum-window-substring');

    PERFORM seed_practice_problem('44444444-4444-4444-4444-444444444444', 'Valid Parentheses', 'Easy', 1, 'https://leetcode.com/problems/valid-parentheses');
    PERFORM seed_practice_problem('44444444-4444-4444-4444-444444444444', 'Min Stack', 'Medium', 2, 'https://leetcode.com/problems/min-stack');
    PERFORM seed_practice_problem('44444444-4444-4444-4444-444444444444', 'Daily Temperatures', 'Medium', 3, 'https://leetcode.com/problems/daily-temperatures');
    PERFORM seed_practice_problem('44444444-4444-4444-4444-444444444444', 'Largest Rectangle in Histogram', 'Hard', 4, 'https://leetcode.com/problems/largest-rectangle-in-histogram');

    PERFORM seed_practice_problem('55555555-5555-5555-5555-555555555555', 'Binary Search', 'Easy', 1, 'https://leetcode.com/problems/binary-search');
    PERFORM seed_practice_problem('55555555-5555-5555-5555-555555555555', 'Search in Rotated Sorted Array', 'Medium', 2, 'https://leetcode.com/problems/search-in-rotated-sorted-array');
    PERFORM seed_practice_problem('55555555-5555-5555-5555-555555555555', 'Find Minimum in Rotated Sorted Array', 'Medium', 3, 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array');

    PERFORM seed_practice_problem('66666666-6666-6666-6666-666666666666', 'Reverse Linked List', 'Easy', 1, 'https://leetcode.com/problems/reverse-linked-list');
    PERFORM seed_practice_problem('66666666-6666-6666-6666-666666666666', 'Merge Two Sorted Lists', 'Easy', 2, 'https://leetcode.com/problems/merge-two-sorted-lists');
    PERFORM seed_practice_problem('66666666-6666-6666-6666-666666666666', 'Reorder List', 'Medium', 3, 'https://leetcode.com/problems/reorder-list');
    PERFORM seed_practice_problem('66666666-6666-6666-6666-666666666666', 'Remove Nth Node From End of List', 'Medium', 4, 'https://leetcode.com/problems/remove-nth-node-from-end-of-list');

    PERFORM seed_practice_problem('77777777-7777-7777-7777-777777777777', 'Invert Binary Tree', 'Easy', 1, 'https://leetcode.com/problems/invert-binary-tree');
    PERFORM seed_practice_problem('77777777-7777-7777-7777-777777777777', 'Maximum Depth of Binary Tree', 'Easy', 2, 'https://leetcode.com/problems/maximum-depth-of-binary-tree');
    PERFORM seed_practice_problem('77777777-7777-7777-7777-777777777777', 'Binary Tree Level Order Traversal', 'Medium', 3, 'https://leetcode.com/problems/binary-tree-level-order-traversal');
    PERFORM seed_practice_problem('77777777-7777-7777-7777-777777777777', 'Validate Binary Search Tree', 'Medium', 4, 'https://leetcode.com/problems/validate-binary-search-tree');

    PERFORM seed_practice_problem('88888888-8888-8888-8888-888888888888', 'Number of Islands', 'Medium', 1, 'https://leetcode.com/problems/number-of-islands');
    PERFORM seed_practice_problem('88888888-8888-8888-8888-888888888888', 'Clone Graph', 'Medium', 2, 'https://leetcode.com/problems/clone-graph');
    PERFORM seed_practice_problem('88888888-8888-8888-8888-888888888888', 'Course Schedule', 'Medium', 3, 'https://leetcode.com/problems/course-schedule');
    PERFORM seed_practice_problem('88888888-8888-8888-8888-888888888888', 'Word Ladder', 'Hard', 4, 'https://leetcode.com/problems/word-ladder');

    PERFORM seed_practice_problem('99999999-9999-9999-9999-999999999999', 'Climbing Stairs', 'Easy', 1, 'https://leetcode.com/problems/climbing-stairs');
    PERFORM seed_practice_problem('99999999-9999-9999-9999-999999999999', 'House Robber', 'Medium', 2, 'https://leetcode.com/problems/house-robber');
    PERFORM seed_practice_problem('99999999-9999-9999-9999-999999999999', 'Longest Increasing Subsequence', 'Medium', 3, 'https://leetcode.com/problems/longest-increasing-subsequence');
    PERFORM seed_practice_problem('99999999-9999-9999-9999-999999999999', 'Coin Change', 'Medium', 4, 'https://leetcode.com/problems/coin-change');
END;
$$;

DROP FUNCTION IF EXISTS seed_practice_problem(UUID, VARCHAR, VARCHAR, INTEGER, TEXT);


