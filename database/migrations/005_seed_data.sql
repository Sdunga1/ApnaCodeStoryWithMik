-- ============================================================================
-- Migration: 005_seed_data.sql
-- Description: Optional seed data for initial setup
-- ============================================================================

-- ============================================================================
-- SEED: Creator Profile (Single creator)
-- ============================================================================
-- INSERT INTO creator_profile (name, email, github, youtube, bio)
-- VALUES (
--     'Your Name',
--     'creator@example.com',
--     'https://github.com/yourusername',
--     'https://youtube.com/@yourchannel',
--     'Your bio here'
-- );

-- ============================================================================
-- SEED: Common Tags
-- ============================================================================
INSERT INTO tags (name) VALUES
    ('Array'),
    ('String'),
    ('Hash Table'),
    ('Dynamic Programming'),
    ('Math'),
    ('Sorting'),
    ('Greedy'),
    ('Depth-First Search'),
    ('Breadth-First Search'),
    ('Binary Search'),
    ('Tree'),
    ('Binary Tree'),
    ('Binary Search Tree'),
    ('Stack'),
    ('Queue'),
    ('Heap (Priority Queue)'),
    ('Graph'),
    ('Backtracking'),
    ('Sliding Window'),
    ('Two Pointers'),
    ('Linked List'),
    ('Recursion'),
    ('Bit Manipulation'),
    ('Divide and Conquer'),
    ('Trie'),
    ('Union Find'),
    ('Monotonic Stack'),
    ('Segment Tree'),
    ('Binary Indexed Tree')
ON CONFLICT (name) DO NOTHING;

