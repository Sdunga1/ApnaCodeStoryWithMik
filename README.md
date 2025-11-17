# ApnaCodeStoryWithMIK

A community platform for the CodeStoryWithMIK Family! This hub centralizes daily LeetCode practice, video explanations, code solutions, and motivational content. It ensures the community has the best tools to master DSA. Built as a tribute, we foster consistent, guided practice.

## Architecture

```
├── frontend/          Next.js 14 (App Router) UI + API routes
│   └── src/app/api/   Auth routes (login, register, logout, me)
└── database/          SQL schema and migrations for PostgreSQL
```

- The frontend ships the entire experience (pages, components, context state, styling) and exposes server-side API routes under `/api/auth/*`.
- Backend logic lives in `frontend/src/lib/{api,db,jwt}.ts`, using a pooled connection to PostgreSQL and JWT-based sessions.
- SQL migrations and seed data are stored in `database/schema.sql` and `database/migrations/*.sql`.

## Requirements

- Node.js 18+
- npm 10+
- PostgreSQL 14+ (local or hosted)

## Environment

Create `frontend/.env.local` before running the app:

```
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/apnacodestory
JWT_SECRET=replace-with-long-random-string
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

`DATABASE_URL` is required by the pooled client in `lib/db.ts`. `JWT_SECRET` secures the access token issued in `lib/jwt.ts`. The API URL defaults to `/api` if the public value is omitted.

## Setup

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Prepare database (from repo root)
createdb apnacodestory           # or use psql command
psql -d apnacodestory -f database/schema.sql
psql -d apnacodestory -f database/migrations/006_add_user_roles.sql
psql -d apnacodestory -f database/migrations/007_seed_creator_user.sql

# 3. Start the dev server
npm run dev
```

The site and API are served from `http://localhost:3000`.

### Default Accounts

- Creator: `creator@codestorywithmik.com` / `codestorywithmik2024`
- Students can self-register at `/register` and receive the `student` role automatically.

## Features

- Next.js UI with theme toggling, responsive sidebar, and curated practice feed.
- Auth flow (register, login, logout) built on Next.js API routes.
- JWT sessions with role awareness (`creator`, `student`).
- PostgreSQL persistence via node-postgres and prepared statements.
- Basic progress tracking UI for students (creators skip progress meters as requested).

## API Summary

| Method | Endpoint             | Purpose               | Auth |
| ------ | -------------------- | --------------------- | ---- |
| POST   | `/api/auth/register` | Create a user account | No   |
| POST   | `/api/auth/login`    | Issue JWT + session   | No   |
| POST   | `/api/auth/logout`   | Clear auth cookie     | Yes  |
| GET    | `/api/auth/me`       | Current user profile  | Yes  |

All routes rely on the shared JWT helpers in `src/lib/jwt.ts`. Requests require the `Authorization: Bearer <token>` header once logged in.

## Database Notes

- `schema.sql` contains the canonical tables (users, posts, problems, progress, tags, etc.).
- Incremental files in `database/migrations/` capture changes over time; apply them in numeric order after the base schema.
- Use the scripts in `database/scripts/` for bulk operations if needed.

## Development Commands

```bash
npm run dev     # Start Next.js with hot reload
npm run build   # Production build
npm run start   # Start built app
npm run lint    # ESLint via next lint
```

## License

MIT
