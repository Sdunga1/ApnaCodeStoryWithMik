-- ============================================================================
-- Migration: 001_create_base_tables.sql
-- Description: Create base tables for the application
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CREATOR PROFILE TABLE
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

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- POSTS TABLE
-- ============================================================================
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

-- ============================================================================
-- PROBLEMS TABLE (Practice Sheet Problems)
-- ============================================================================
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

-- ============================================================================
-- DAILY PROBLEMS TABLE
-- ============================================================================
CREATE TABLE daily_problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_date DATE NOT NULL UNIQUE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    lc_problem_id UUID REFERENCES problems(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER PROGRESS TABLE (For Practice Sheet Problems)
-- ============================================================================
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'not_attempted' CHECK (status IN ('not_attempted', 'attempted', 'solved')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, problem_id)
);

-- ============================================================================
-- USER DAILY COMPLETION TABLE (For Daily Posts Completion)
-- ============================================================================
CREATE TABLE user_daily_completion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- ============================================================================
-- UPDATES TABLE (Announcements & Content Updates)
-- ============================================================================
CREATE TABLE updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    month_year DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TAGS TABLE (Predefined tags managed by creator)
-- ============================================================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

