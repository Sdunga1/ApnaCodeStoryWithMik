-- ============================================================================
-- Run All Migrations Script
-- Description: Execute all migrations in order
-- Usage: psql -U your_username -d your_database -f run_all_migrations.sql
-- ============================================================================

\echo '=========================================='
\echo 'Starting Database Migration'
\echo '=========================================='

\echo '\n[1/5] Creating base tables...'
\i ../migrations/001_create_base_tables.sql

\echo '\n[2/5] Creating indexes...'
\i ../migrations/002_create_indexes.sql

\echo '\n[3/5] Creating triggers...'
\i ../migrations/003_create_triggers.sql

\echo '\n[4/5] Creating functions...'
\i ../migrations/004_create_functions.sql

\echo '\n[5/5] Seeding initial data...'
\i ../migrations/005_seed_data.sql

\echo '\n=========================================='
\echo 'Migration Complete!'
\echo '=========================================='

-- Display created tables
\echo '\nCreated Tables:'
\dt

-- Display created functions
\echo '\nCreated Functions:'
\df

