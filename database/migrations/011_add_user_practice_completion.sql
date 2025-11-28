-- 011_add_user_practice_completion.sql
-- Description: Track user completion status for practice problems

CREATE TABLE IF NOT EXISTS user_practice_completion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES practice_problems(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, problem_id)
);

CREATE INDEX IF NOT EXISTS idx_user_practice_completion_user_id
    ON user_practice_completion(user_id);

CREATE INDEX IF NOT EXISTS idx_user_practice_completion_problem_id
    ON user_practice_completion(problem_id);

CREATE INDEX IF NOT EXISTS idx_user_practice_completion_completed_at
    ON user_practice_completion(completed_at DESC);

