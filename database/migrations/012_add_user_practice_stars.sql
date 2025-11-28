-- 012_add_user_practice_stars.sql
-- Description: Track user starred/favorite practice problems

CREATE TABLE IF NOT EXISTS user_practice_stars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES practice_problems(id) ON DELETE CASCADE,
    starred_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_user_practice_stars_user_id
    ON user_practice_stars(user_id);

CREATE INDEX IF NOT EXISTS idx_user_practice_stars_problem_id
    ON user_practice_stars(problem_id);

CREATE INDEX IF NOT EXISTS idx_user_practice_stars_starred_at
    ON user_practice_stars(starred_at DESC);

