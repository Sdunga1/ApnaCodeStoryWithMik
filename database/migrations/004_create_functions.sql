-- ============================================================================
-- Migration: 004_create_functions.sql
-- Description: Create utility functions for database operations
-- ============================================================================

-- ============================================================================
-- FUNCTION: Soft delete user
-- ============================================================================
CREATE OR REPLACE FUNCTION soft_delete_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET is_deleted = TRUE,
        deleted_at = NOW()
    WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Restore soft deleted user
-- ============================================================================
CREATE OR REPLACE FUNCTION restore_user(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users
    SET is_deleted = FALSE,
        deleted_at = NULL
    WHERE id = user_uuid
    AND deleted_at IS NOT NULL
    AND deleted_at > NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Hard delete users after 30 days
-- ============================================================================
CREATE OR REPLACE FUNCTION hard_delete_expired_users()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH deleted AS (
        DELETE FROM users
        WHERE is_deleted = TRUE
        AND deleted_at IS NOT NULL
        AND deleted_at <= NOW() - INTERVAL '30 days'
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Get user progress statistics
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE(
    total_problems BIGINT,
    solved_problems BIGINT,
    attempted_problems BIGINT,
    not_attempted_problems BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) AS total_problems,
        COUNT(*) FILTER (WHERE status = 'solved') AS solved_problems,
        COUNT(*) FILTER (WHERE status = 'attempted') AS attempted_problems,
        COUNT(*) FILTER (WHERE status = 'not_attempted') AS not_attempted_problems
    FROM user_progress
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Get daily completion status for user
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_daily_completions(
    user_uuid UUID,
    start_date DATE,
    end_date DATE
)
RETURNS TABLE(
    post_date DATE,
    is_completed BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.post_date,
        (udc.id IS NOT NULL) AS is_completed
    FROM posts p
    LEFT JOIN user_daily_completion udc
        ON p.id = udc.post_id AND udc.user_id = user_uuid
    WHERE p.post_date BETWEEN start_date AND end_date
    ORDER BY p.post_date DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: Get problems by difficulty
-- ============================================================================
CREATE OR REPLACE FUNCTION get_problems_by_difficulty(diff VARCHAR)
RETURNS TABLE(
    problem_id UUID,
    title VARCHAR,
    topic VARCHAR,
    lc_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.title,
        p.topic,
        p.lc_url
    FROM problems p
    WHERE p.difficulty = diff
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

