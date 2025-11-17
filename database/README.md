# Database Setup Guide

## Overview
This directory contains modularized PostgreSQL database migrations for the ApnaCodeStoryWithMik application.

## Structure
```
database/
├── migrations/
│   ├── 001_create_base_tables.sql    # Core tables
│   ├── 002_create_indexes.sql        # Performance indexes
│   ├── 003_create_triggers.sql       # Auto-update triggers
│   ├── 004_create_functions.sql      # Utility functions
│   └── 005_seed_data.sql             # Initial data
├── scripts/
│   ├── run_all_migrations.sql        # Run all migrations
│   └── rollback.sql                  # Drop everything
└── README.md                         # This file
```

## Prerequisites
- PostgreSQL 12+ installed
- Database created
- User with appropriate permissions

## Quick Start

### Option 1: Run All Migrations at Once
```bash
psql -U your_username -d your_database -f database/scripts/run_all_migrations.sql
```

### Option 2: Run Migrations Individually
```bash
psql -U your_username -d your_database -f database/migrations/001_create_base_tables.sql
psql -U your_username -d your_database -f database/migrations/002_create_indexes.sql
psql -U your_username -d your_database -f database/migrations/003_create_triggers.sql
psql -U your_username -d your_database -f database/migrations/004_create_functions.sql
psql -U your_username -d your_database -f database/migrations/005_seed_data.sql
```

### Option 3: Using Supabase
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste each migration file in order
4. Execute each one

## Database Schema

### Tables

#### 1. `creator_profile`
Single creator managing the platform
- `id` (SERIAL PK)
- `name`, `email`, `github`, `youtube`, `bio`, `avatar_url`
- Timestamps: `created_at`, `updated_at`

#### 2. `users`
Students tracking their progress
- `id` (UUID PK)
- `name`, `email`, `password_hash`, `avatar_url`
- Soft delete: `deleted_at`, `is_deleted` (30-day restore period)
- Timestamps: `created_at`, `updated_at`

#### 3. `posts`
Daily problem posts created by creator
- `id` (UUID PK)
- `problem_name`, `youtube_link`, `lc_daily_link`, `github_link`
- `motivational_quote`, `tags` (JSONB), `extra_links` (JSONB)
- `post_date` (UNIQUE - one post per day)
- Timestamps: `created_at`, `updated_at`

#### 4. `daily_problems`
Links posts to specific dates
- `id` (UUID PK)
- `problem_date` (UNIQUE - one problem per day)
- `post_id` (FK → posts)
- `lc_problem_id` (FK → problems, optional)

#### 5. `problems`
Practice sheet problems (1000-1200 static problems)
- `id` (UUID PK)
- `title`, `difficulty` (Easy/Medium/Hard), `topic`, `lc_url`
- `metadata` (JSONB)
- Timestamps: `created_at`, `updated_at`

#### 6. `user_progress`
Tracks user progress on practice problems
- `id` (UUID PK)
- `user_id` (FK → users), `problem_id` (FK → problems)
- `status` (not_attempted/attempted/solved)
- UNIQUE constraint on (user_id, problem_id)
- Timestamp: `updated_at`

#### 7. `user_daily_completion`
Tracks which daily posts users completed (green/gray dots)
- `id` (UUID PK)
- `user_id` (FK → users), `post_id` (FK → posts)
- UNIQUE constraint on (user_id, post_id)
- Timestamp: `completed_at`

#### 8. `updates`
Announcements and content updates (~100 per month)
- `id` (UUID PK)
- `title`, `content`, `link`, `month_year`
- Timestamps: `created_at`, `updated_at`

#### 9. `tags`
Predefined tags managed by creator
- `id` (UUID PK)
- `name` (UNIQUE)
- Timestamp: `created_at`

## Key Features

### 1. Automatic Timestamps
All tables with `updated_at` automatically update on record modification.

### 2. Soft Delete for Users
- 30-day restore period before permanent deletion
- Functions: `soft_delete_user()`, `restore_user()`, `hard_delete_expired_users()`

### 3. Cascade Deletes
- Deleting a user cascades to their progress and daily completions
- Deleting a post cascades to associated daily_problems

### 4. Performance Indexes
- Optimized for common queries (date ranges, user lookups, filtering)
- GIN indexes for JSONB fields (tags, metadata)

### 5. Utility Functions
- `get_user_stats()` - Get progress statistics
- `get_user_daily_completions()` - Get completion status for date range
- `get_problems_by_difficulty()` - Filter problems by difficulty

## Constraints

### Unique Constraints
- `users.email` - No duplicate emails
- `posts.post_date` - One post per day
- `daily_problems.problem_date` - One daily problem per date
- `user_progress(user_id, problem_id)` - One progress entry per user-problem
- `user_daily_completion(user_id, post_id)` - One completion per user-post

### Check Constraints
- `problems.difficulty` - Must be 'Easy', 'Medium', or 'Hard'
- `user_progress.status` - Must be 'not_attempted', 'attempted', or 'solved'

## Data Capacity
- **Daily Problems**: 5 years × 365 days = ~1,825 posts
- **Practice Problems**: 1,000-1,200 problems
- **Updates**: ~100 per month = 1,200/year
- **Users**: Unlimited
- **User Progress**: Up to 1,200 entries per user

## Rollback
To completely remove the database:
```bash
psql -U your_username -d your_database -f database/scripts/rollback.sql
```

⚠️ **WARNING**: This will delete ALL data!

## Maintenance

### Clean up deleted users (run periodically)
```sql
SELECT hard_delete_expired_users();
```

### Get user statistics
```sql
SELECT * FROM get_user_stats('user-uuid-here');
```

### Check daily completions
```sql
SELECT * FROM get_user_daily_completions(
    'user-uuid-here',
    '2025-01-01',
    '2025-12-31'
);
```

## Notes
- All UUIDs use `uuid_generate_v4()`
- JSONB fields default to empty objects/arrays
- Avatar URLs nullable (will use defaults in application)
- Motivational quotes nullable (will use fallback quotes in application)

