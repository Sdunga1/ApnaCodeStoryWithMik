# 🔌 Authentication API Reference

Base URL: `http://localhost:3000/api`

---

## Endpoints

### 1. POST `/auth/login`

Authenticate a user and receive a JWT token.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "b515c2da-75a2-499e-b28e-6097e18810d1",
    "email": "user@example.com",
    "name": "User Name",
    "role": "student"
  }
}
```

**Error Responses:**

**400 Bad Request** - Missing fields:
```json
{
  "success": false,
  "error": "Email and password are required"
}
```

**400 Bad Request** - Invalid email format:
```json
{
  "success": false,
  "error": "Invalid email format"
}
```

**401 Unauthorized** - Invalid credentials:
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@codestorywithmik.com","password":"codestorywithmik2024"}'
```

---

### 2. POST `/auth/register`

Register a new user account.

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "b5a83246-69ba-4387-8915-4af14d15ac3a",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "student"
  }
}
```

**Error Responses:**

**400 Bad Request** - Missing fields:
```json
{
  "success": false,
  "error": "Name, email, and password are required"
}
```

**400 Bad Request** - Name too short:
```json
{
  "success": false,
  "error": "Name must be at least 2 characters long"
}
```

**400 Bad Request** - Invalid email:
```json
{
  "success": false,
  "error": "Invalid email format"
}
```

**400 Bad Request** - Password too short:
```json
{
  "success": false,
  "error": "Password must be at least 8 characters long"
}
```

**409 Conflict** - Email already exists:
```json
{
  "success": false,
  "error": "Email already exists"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "mypassword123"
  }'
```

---

### 3. POST `/auth/logout`

Logout the current user (client-side token removal).

**Request:**
```http
POST /api/auth/logout
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**

**401 Unauthorized** - No token provided:
```json
{
  "success": false,
  "error": "No token provided"
}
```

**401 Unauthorized** - Invalid token:
```json
{
  "success": false,
  "error": "Invalid token"
}
```

**Example cURL:**
```bash
TOKEN="your_jwt_token_here"
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4. GET `/auth/me`

Get current authenticated user's information.

**Request:**
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "b515c2da-75a2-499e-b28e-6097e18810d1",
    "email": "user@example.com",
    "name": "User Name",
    "role": "creator"
  }
}
```

**Error Responses:**

**401 Unauthorized** - No token:
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**401 Unauthorized** - Invalid token:
```json
{
  "success": false,
  "error": "Invalid token"
}
```

**401 Unauthorized** - User not found:
```json
{
  "success": false,
  "error": "User not found"
}
```

**Example cURL:**
```bash
TOKEN="your_jwt_token_here"
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Data Models

### User Object
```typescript
{
  id: string;          // UUID
  email: string;       // Valid email address
  name: string;        // User's full name
  role: 'creator' | 'student';  // User role
}
```

### JWT Token Payload
```typescript
{
  userId: string;      // UUID
  role: 'creator' | 'student';
  iat: number;         // Issued at timestamp
  exp: number;         // Expiration timestamp (7 days)
}
```

---

## Authentication Flow

### Login Flow:
1. User submits email and password
2. Server validates email format
3. Server queries database for user
4. Server verifies password with bcrypt
5. Server generates JWT token (7-day expiration)
6. Server returns token and user object
7. Client stores token in localStorage and cookies

### Register Flow:
1. User submits name, email, and password
2. Server validates input (name ≥ 2 chars, email format, password ≥ 8 chars)
3. Server checks for duplicate email
4. Server hashes password with bcrypt (10 rounds)
5. Server creates user with role='student'
6. Server generates JWT token
7. Server returns token and user object
8. Client stores token in localStorage and cookies

### Protected Route Access:
1. Client includes token in Authorization header
2. Server extracts and verifies token
3. Server decodes userId from token
4. Server queries database for user
5. Server returns user data or error

---

## HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200  | OK | Successful operation |
| 400  | Bad Request | Validation errors, missing fields |
| 401  | Unauthorized | Invalid credentials, expired/invalid token |
| 409  | Conflict | Duplicate email during registration |
| 500  | Internal Server Error | Unexpected server errors |

---

## Security Features

### Password Security:
- ✅ Hashed using bcrypt with 10 salt rounds
- ✅ Minimum length: 8 characters
- ✅ Never returned in API responses
- ✅ Never logged or stored in plain text

### Token Security:
- ✅ JWT signed with HS256 algorithm
- ✅ 7-day expiration
- ✅ Includes userId and role in payload
- ✅ Verified on every protected request

### Input Validation:
- ✅ Email format validation
- ✅ Name minimum length: 2 characters
- ✅ Password minimum length: 8 characters
- ✅ SQL injection prevention (parameterized queries)

### Database Security:
- ✅ Soft delete support (is_deleted flag)
- ✅ Deleted users cannot login
- ✅ Password hash stored in separate column
- ✅ Role-based access control ready

---

## Rate Limiting

⚠️ **Not implemented yet** - Consider adding rate limiting for:
- Login attempts (prevent brute force)
- Registration attempts (prevent spam)
- Token refresh requests

---

## CORS Configuration

Default configuration allows same-origin requests. For production:
- Configure allowed origins in `next.config.js`
- Set appropriate CORS headers
- Enable credentials if needed

---

## Error Handling

All errors follow this consistent format:
```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

Errors are logged server-side for debugging.

---

## Testing

### Test Credentials:

**Creator Account:**
- Email: `creator@codestorywithmik.com`
- Password: `codestorywithmik2024`
- Role: `creator`

**Create Student Account:**
- Use the `/register` endpoint
- Role automatically set to `student`

### Postman Collection

Import this as a Postman collection for easy testing:

```json
{
  "info": {
    "name": "Auth API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"creator@codestorywithmik.com\",\"password\":\"codestorywithmik2024\"}"
        }
      }
    },
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/auth/register",
        "body": {
          "mode": "raw",
          "raw": "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
        }
      }
    },
    {
      "name": "Get Me",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/auth/me",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    },
    {
      "name": "Logout",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/auth/logout",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ]
      }
    }
  ]
}
```

---

## Support & Documentation

For more information, see:
- **BACKEND_IMPLEMENTATION.md** - Complete implementation details
- **TESTING_CHECKLIST.md** - Test cases and results
- **MESSAGE_FOR_ASHISH.md** - Project summary

---

**Last Updated:** November 17, 2025  
**API Version:** 1.0  
**Status:** ✅ Production-ready for dev/staging

