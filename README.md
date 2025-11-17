# ApnaCodeStoryWithMik

A community platform for the CodeStoryWithMIK Family! This hub centralizes daily LeetCode practice, video explanations, code solutions, and motivational content. It ensures the community has the best tools to master DSA. Built as a tribute, we foster consistent, guided practice.

## 🎉 Latest Update: Authentication System Complete!

✅ **Backend authentication API is now fully implemented and tested!**

👉 **Quick Start**: See [QUICK_START.md](QUICK_START.md) for 30-second setup  
👉 **Complete Guide**: See [MESSAGE_FOR_ASHISH.md](MESSAGE_FOR_ASHISH.md) for full details  
👉 **API Reference**: See [API_REFERENCE.md](API_REFERENCE.md) for endpoint documentation

### Test the System Now:
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Creator Email**: creator@codestorywithmik.com
- **Creator Password**: codestorywithmik2024

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/auth/          # ✅ NEW: Authentication API endpoints
│   │   │   ├── login/             # Login page
│   │   │   ├── register/          # Register page
│   │   │   └── page.tsx           # Home page
│   │   ├── components/            # React components
│   │   ├── contexts/              # Auth & Theme contexts
│   │   └── lib/
│   │       ├── api.ts             # API client
│   │       ├── db.ts              # ✅ NEW: Database connection
│   │       └── jwt.ts             # ✅ NEW: JWT utilities
│   └── .env.local                 # ✅ NEW: Environment variables
│
├── database/
│   ├── migrations/
│   │   ├── 006_add_user_roles.sql      # ✅ NEW: Added roles
│   │   └── 007_seed_creator_user.sql   # ✅ NEW: Creator user
│   └── schema.sql                 # ✅ UPDATED: Includes roles
│
└── [Documentation Files]          # ✅ NEW: Complete docs
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Database Setup

```bash
# Start PostgreSQL
brew services start postgresql@14

# Create database
psql -U ashishthanga -d postgres -c "CREATE DATABASE apnacodestory;"

# Run migrations
cd database
psql -U ashishthanga -d apnacodestory -f schema.sql
psql -U ashishthanga -d apnacodestory -f migrations/006_add_user_roles.sql
psql -U ashishthanga -d apnacodestory -f migrations/007_seed_creator_user.sql
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

### 3. Test Authentication

**Option 1: UI Testing**
- Visit http://localhost:3000/login
- Use creator credentials (see above)

**Option 2: API Testing**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@codestorywithmik.com","password":"codestorywithmik2024"}'
```

## Features

### ✅ Implemented:
- User authentication (login/register/logout)
- Role-based access control (creator/student)
- JWT token-based sessions
- Password hashing with bcrypt
- Protected API endpoints
- Responsive UI with dark/light themes
- Login and Register pages

### 🚧 Coming Soon:
- Creator dashboard
- Student dashboard
- Daily LeetCode problem tracking
- Progress statistics
- Problem categorization
- Video explanations integration
- Motivational content

## Tech Stack

### Frontend:
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Components**: Radix UI, Shadcn UI, Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API

### Backend:
- **API**: Next.js API Routes
- **Database**: PostgreSQL 14
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Database Client**: node-postgres (pg)

### Security:
- JWT tokens (7-day expiration)
- bcrypt password hashing (10 rounds)
- SQL injection prevention (parameterized queries)
- Input validation
- Role-based access control

## Documentation

### 📚 Start Here:
1. **[QUICK_START.md](QUICK_START.md)** - Get up and running in 30 seconds
2. **[MESSAGE_FOR_ASHISH.md](MESSAGE_FOR_ASHISH.md)** - Complete project summary
3. **[API_REFERENCE.md](API_REFERENCE.md)** - API endpoint documentation

### 📖 Additional Docs:
- **[BACKEND_IMPLEMENTATION.md](BACKEND_IMPLEMENTATION.md)** - Technical implementation details
- **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** - Test cases and results
- **[ENV_SETUP.md](frontend/ENV_SETUP.md)** - Environment configuration
- **[IMPLEMENTATION_SUMMARY.txt](IMPLEMENTATION_SUMMARY.txt)** - Visual summary

## API Endpoints

All endpoints are available at `http://localhost:3000/api/auth/`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login | ❌ |
| POST | `/auth/register` | User registration | ❌ |
| POST | `/auth/logout` | User logout | ✅ |
| GET | `/auth/me` | Get current user | ✅ |

See [API_REFERENCE.md](API_REFERENCE.md) for complete documentation.

## Database Schema

### Users Table:
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `role` (VARCHAR: 'creator' | 'student') ✅ NEW
- `avatar_url` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `deleted_at` (TIMESTAMP)
- `is_deleted` (BOOLEAN)

### Other Tables:
- `posts` - Daily problem posts
- `problems` - Practice sheet problems
- `user_progress` - User problem tracking
- `tags` - Problem categorization
- See `database/schema.sql` for complete schema

## Testing

### Test Accounts:

**Creator:**
- Email: `creator@codestorywithmik.com`
- Password: `codestorywithmik2024`
- Role: `creator`

**Student:**
- Create your own at: http://localhost:3000/register
- Auto-assigned role: `student`

### Automated Tests:
```bash
# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@codestorywithmik.com","password":"codestorywithmik2024"}'

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

See [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) for complete test suite.

## Development

### Running the Application:
```bash
# Terminal 1: Start development server
cd frontend
npm run dev

# Terminal 2: Monitor database (optional)
psql -U ashishthanga -d apnacodestory
```

### Common Commands:
```bash
# View users in database
psql -U ashishthanga -d apnacodestory -c "SELECT id, name, email, role FROM users;"

# Reset password for a user
# (generate hash then update)

# View server logs
# Check terminal running `npm run dev`
```

## Troubleshooting

### Port Already in Use:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Database Connection Error:
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Restart if needed
brew services restart postgresql@14
```

### Auth Not Working:
```bash
# Check .env.local exists
cat frontend/.env.local

# Restart dev server
cd frontend
npm run dev
```

See [BACKEND_IMPLEMENTATION.md](BACKEND_IMPLEMENTATION.md) for more troubleshooting tips.

## Contributing

This is a personal project for the CodeStoryWithMIK community. For questions or issues, please contact the project maintainer.

## Deployment

### Production Checklist:
- [ ] Change JWT_SECRET to strong random value
- [ ] Update DATABASE_URL for production
- [ ] Enable CORS for production domain
- [ ] Set up HTTPS/SSL
- [ ] Add rate limiting
- [ ] Enable logging and monitoring
- [ ] Set up backup strategy
- [ ] Configure environment variables in hosting platform

Recommended platforms:
- **Frontend**: Vercel, Netlify
- **Database**: Supabase, AWS RDS, Railway
- **Full Stack**: Vercel with Vercel Postgres

## License

MIT

---

## 🎯 Status

**Current Phase**: ✅ Authentication Complete  
**Next Phase**: Dashboard Implementation  
**Overall Progress**: 🟢 On Track

**Last Updated**: November 17, 2025  
**Version**: 1.0.0
