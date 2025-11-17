# Database Setup

## Quick Setup

1. Install PostgreSQL:
```bash
brew install postgresql@14
brew services start postgresql@14
```

2. Create database:
```bash
psql -U postgres -d postgres -c "CREATE DATABASE apnacodestory;"
```

3. Run migrations:
```bash
cd database
psql -U postgres -d apnacodestory -f schema.sql
```

## Structure

- `schema.sql` - Complete database schema
- `migrations/` - Individual migration files
- `scripts/` - Utility scripts

