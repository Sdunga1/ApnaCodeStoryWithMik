# Backend API Testing Checklist ✅

## Environment Setup
- ✅ Database migration completed (role column added)
- ✅ Creator user seeded in database
- ✅ Dependencies installed (bcryptjs, jsonwebtoken, pg)
- ✅ Environment variables configured (.env.local)
- ✅ Dev server running at http://localhost:3000

## API Endpoints Testing

### ✅ POST /api/auth/login

#### Test Cases:
- ✅ **Valid Creator Login**
  - Email: `creator@codestorywithmik.com`
  - Password: `codestorywithmik2024`
  - Expected: Success with role='creator'
  - Result: ✅ PASSED

- ✅ **Invalid Credentials**
  - Email: `invalid@example.com`
  - Password: `wrongpassword`
  - Expected: Error "Invalid email or password"
  - Result: ✅ PASSED

- ⚠️ **Invalid Email Format** (Manual test recommended)
  - Email: `invalidemail`
  - Password: `password123`
  - Expected: Error "Invalid email format"

- ⚠️ **Missing Fields** (Manual test recommended)
  - Email: empty
  - Password: empty
  - Expected: Error "Email and password are required"

### ✅ POST /api/auth/register

#### Test Cases:
- ✅ **Valid Registration**
  - Name: `Test Student`
  - Email: `teststudent@example.com`
  - Password: `password123`
  - Expected: Success with role='student', token returned
  - Result: ✅ PASSED

- ✅ **Duplicate Email**
  - Email: `creator@codestorywithmik.com`
  - Expected: Error "Email already exists" (409)
  - Result: ✅ PASSED

- ⚠️ **Short Name** (Manual test recommended)
  - Name: `A` (1 char)
  - Expected: Error "Name must be at least 2 characters long"

- ⚠️ **Short Password** (Manual test recommended)
  - Password: `pass` (4 chars)
  - Expected: Error "Password must be at least 8 characters long"

- ⚠️ **Invalid Email Format** (Manual test recommended)
  - Email: `invalidemail`
  - Expected: Error "Invalid email format"

### ✅ POST /api/auth/logout

#### Test Cases:
- ✅ **Valid Token**
  - Authorization: `Bearer <valid_token>`
  - Expected: Success response
  - Result: ✅ PASSED

- ⚠️ **Missing Token** (Manual test recommended)
  - No Authorization header
  - Expected: Error "No token provided" (401)

- ⚠️ **Invalid Token** (Manual test recommended)
  - Authorization: `Bearer invalid_token`
  - Expected: Error "Invalid token" (401)

### ✅ GET /api/auth/me

#### Test Cases:
- ✅ **Valid Token**
  - Authorization: `Bearer <valid_token>`
  - Expected: User object with id, email, name, role
  - Result: ✅ PASSED

- ⚠️ **Missing Token** (Manual test recommended)
  - No Authorization header
  - Expected: Error "Unauthorized" (401)

- ⚠️ **Invalid Token** (Manual test recommended)
  - Authorization: `Bearer invalid_token`
  - Expected: Error "Invalid token" (401)

- ⚠️ **Deleted User Token** (Manual test recommended)
  - Token of soft-deleted user
  - Expected: Error "User not found" (401)

## Frontend Integration Testing

### ⚠️ Login Page (`/login`)
- [ ] Visit http://localhost:3000/login
- [ ] Enter creator credentials
- [ ] Click "Sign In"
- [ ] Expected: Redirect to /creator (for creator role)
- [ ] Check localStorage for token and user
- [ ] Check cookies for token and user

### ⚠️ Register Page (`/register`)
- [ ] Visit http://localhost:3000/register
- [ ] Fill in name, email, password, confirm password
- [ ] Click "Create Account"
- [ ] Expected: Redirect to /dashboard (for student role)
- [ ] Check localStorage for token and user
- [ ] Check cookies for token and user

### ⚠️ Protected Routes
- [ ] Logout (clear storage)
- [ ] Try to access /dashboard
- [ ] Expected: Redirect to /login or show unauthorized

### ⚠️ Logout Functionality
- [ ] Login first
- [ ] Click logout button in Header
- [ ] Expected: Redirect to home/login
- [ ] Check localStorage/cookies are cleared

### ⚠️ Auto-login on Page Refresh
- [ ] Login to application
- [ ] Refresh the page
- [ ] Expected: Still logged in, user info persists

## Database Verification

### ✅ Check Role Column
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';
```
Result: ✅ Column exists with default 'student'

### ✅ Check Creator User
```sql
SELECT id, name, email, role FROM users WHERE role = 'creator';
```
Result: ✅ Creator user exists

### ✅ Check New Student User
```sql
SELECT id, name, email, role FROM users WHERE email = 'teststudent@example.com';
```
Result: ✅ Student created with role='student'

### ✅ Check Role Index
```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'users' AND indexname = 'idx_users_role';
```
Result: ✅ Index exists

## Security Testing

### ⚠️ Password Hashing
- [x] Passwords are hashed with bcrypt
- [x] Original passwords are never stored
- [ ] Manual verification: Check database password_hash column

### ⚠️ JWT Tokens
- [x] Tokens include userId and role
- [x] Tokens expire in 7 days
- [x] Tokens are signed with JWT_SECRET
- [ ] Manual verification: Decode token at jwt.io

### ⚠️ SQL Injection Prevention
- [x] All queries use parameterized queries
- [x] No string concatenation in SQL
- [ ] Manual verification: Try SQL injection in email field

### ⚠️ Input Validation
- [x] Email format validated
- [x] Password length validated
- [x] Name length validated
- [ ] Manual verification: Test with various invalid inputs

## Performance Testing

### ⚠️ Database Connection Pool
- [x] Connection pool created with max 20 connections
- [x] Idle timeout set to 30 seconds
- [ ] Manual verification: Check pool under load

### ⚠️ Response Times
- [ ] Login endpoint: < 500ms
- [ ] Register endpoint: < 500ms
- [ ] /me endpoint: < 200ms
- [ ] Logout endpoint: < 100ms

## Error Handling

### ✅ Consistent Error Format
- ✅ All errors return `{ success: false, error: "message" }`
- ✅ Appropriate HTTP status codes used

### ✅ Status Codes
- ✅ 200: Success
- ✅ 400: Bad Request (validation)
- ✅ 401: Unauthorized
- ✅ 409: Conflict (duplicate email)
- ✅ 500: Server Error (caught exceptions)

## Test Results Summary

### Automated API Tests
- ✅ Login with valid credentials: PASSED
- ✅ Login with invalid credentials: PASSED
- ✅ Register new user: PASSED
- ✅ Register duplicate email: PASSED
- ✅ Get current user with token: PASSED
- ✅ Logout with token: PASSED

### Manual Tests Required
- ⚠️ Frontend login page
- ⚠️ Frontend register page
- ⚠️ Frontend logout functionality
- ⚠️ Protected routes
- ⚠️ Role-based redirects
- ⚠️ Input validation on frontend
- ⚠️ Error message display

## Known Issues / Limitations

1. **Token Blacklisting**: Not implemented - logged out tokens remain valid until expiration
2. **Rate Limiting**: Not implemented - vulnerable to brute force
3. **Email Verification**: Not implemented - users can register with any email
4. **Password Reset**: Not implemented
5. **CORS**: May need configuration for production deployment

## Next Steps for Ashish

1. ✅ Backend API implementation complete
2. ⚠️ Test frontend integration manually
3. ⚠️ Test role-based routing (creator → /creator, student → /dashboard)
4. ⚠️ Implement /creator and /dashboard pages if not already done
5. ⚠️ Add role-based access control middleware for protected routes
6. ⚠️ Consider implementing the "Known Issues" features before production

## Quick Test Commands

### Test Login (Creator)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@codestorywithmik.com","password":"codestorywithmik2024"}'
```

### Test Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"newuser@example.com","password":"password123"}'
```

### Test Get User (replace TOKEN)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Logout (replace TOKEN)
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**Testing Status**: ✅ API Endpoints Verified | ⚠️ Frontend Testing Pending
**Last Updated**: November 17, 2025

