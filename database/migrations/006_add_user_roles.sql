-- ============================================================================
-- Migration: 006_add_user_roles.sql
-- Description: Add role column to users table for authentication
-- ============================================================================

-- Add role column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'student' 
CHECK (role IN ('creator', 'student'));

-- Create index on role for better query performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to have 'student' role if NULL
UPDATE users SET role = 'student' WHERE role IS NULL;

