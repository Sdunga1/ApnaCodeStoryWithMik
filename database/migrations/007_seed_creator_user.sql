-- ============================================================================
-- Migration: 007_seed_creator_user.sql
-- Description: Create a creator user for testing
-- Password for creator: codestorywithmik2024
-- ============================================================================

-- Insert creator user with bcrypt hashed password
-- The password hash below is for: codestorywithmik2024
-- Generated using: bcrypt.hash('codestorywithmik2024', 10)
INSERT INTO users (name, email, password_hash, role)
VALUES 
  ('CodeStoryWithMIK', 'creator@codestorywithmik.com', '$2b$10$GWUpuU.4zEy7TM2JF77RqO0tZCP8CoGKgnFzqLRvs47D1hWXujap6', 'creator')
ON CONFLICT (email) DO NOTHING;

-- Note: To generate a new bcrypt hash for a different password, use:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('your-password', 10);
-- console.log(hash);

