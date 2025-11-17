# Environment Variables Setup

Create a `.env.local` file in the frontend directory with the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://ashishthanga:@localhost:5432/apnacodestory

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# API Configuration
NEXT_PUBLIC_API_URL=/api
```

## Setup Instructions

1. Copy the above content to a new file named `.env.local` in the `frontend/` directory
2. Update `JWT_SECRET` with a strong random secret key
3. Update `DATABASE_URL` if your PostgreSQL configuration is different
4. Restart the Next.js development server after creating the file

## Environment Variables Explained

- **DATABASE_URL**: PostgreSQL connection string
- **JWT_SECRET**: Secret key for signing JWT tokens (must be strong and unique in production)
- **JWT_EXPIRES_IN**: Token expiration time (7d = 7 days)
- **NEXT_PUBLIC_API_URL**: API base URL (public variable accessible on client-side)

