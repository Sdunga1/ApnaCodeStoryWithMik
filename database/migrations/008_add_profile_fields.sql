-- Add profile-specific fields to users table

ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(40),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location VARCHAR(120),
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_handle VARCHAR(60);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = current_schema()
          AND indexname = 'users_username_unique'
    ) THEN
        EXECUTE 'CREATE UNIQUE INDEX users_username_unique ON users (LOWER(username)) WHERE username IS NOT NULL';
    END IF;
END $$;

