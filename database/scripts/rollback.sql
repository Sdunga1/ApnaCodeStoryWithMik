-- ============================================================================
-- Rollback Script
-- Description: Drop all database objects
-- WARNING: This will delete ALL data!
-- Usage: psql -U your_username -d your_database -f rollback.sql
-- ============================================================================

\echo '=========================================='
\echo 'WARNING: This will DROP all tables!'
\echo '=========================================='

-- Drop tables in reverse order (respecting foreign key dependencies)
DROP TABLE IF EXISTS user_daily_completion CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS daily_problems CASCADE;
DROP TABLE IF EXISTS problems CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS updates CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS creator_profile CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS soft_delete_user(UUID);
DROP FUNCTION IF EXISTS restore_user(UUID);
DROP FUNCTION IF EXISTS hard_delete_expired_users();
DROP FUNCTION IF EXISTS get_user_stats(UUID);
DROP FUNCTION IF EXISTS get_user_daily_completions(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS get_problems_by_difficulty(VARCHAR);

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();

\echo 'Rollback complete!'

