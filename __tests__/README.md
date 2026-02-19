
# Dual-Auth System Test Suite

Comprehensive programmatic tests for the dual-authentication system:
- Admin authentication (password-based with Auth.js)
- Client tracking sessions (passwordless JWT-based)
- Route protection via edge middleware
- Database integrity and security
- Password hashing and encryption

## Test Categories

### 1. Admin Authentication Tests (`admin-auth.test.ts`)
- Invalid credentials rejection
- Valid credentials acceptance
- Protected route redirection
- Session token structure validation

### 2. Tracking Session Tests (`tracking.test.ts`)
- Tracking login page accessibility
- Invalid token rejection
- Protected /track route without session
- Cookie attributes validation (HttpOnly, SameSite, etc.)
- Form input validation

### 3. Middleware Protection Tests (`middleware.test.ts`)
- Protected routes redirect without auth (admin/*, track/*)
- Public routes accessible without auth
- Middleware matcher configuration verification
- Login pages always accessible

### 4. Database Integrity Tests (`database.test.ts`)
- Admin user existence in database
- Password hashing verification (bcryptjs)
- Order tracking token uniqueness
- Order-OrderLog relationship integrity

### 5. Security Attributes Tests (`database.test.ts`)
- Sensitive data field protection
- Email uniqueness constraints
- Role field default values
- Password verification with bcryptjs

## Running Tests

### Prerequisites
- Ensure the dev server is running:
  ```bash
  pnpm dev
  ```

### Run All Tests
```bash
tsx __tests__/run-tests.ts
```

### Run Individual Test Suites
```bash
# Admin auth tests only
tsx __tests__/admin-auth.test.ts

# Tracking tests only
tsx __tests__/tracking.test.ts

# Middleware tests only
tsx __tests__/middleware.test.ts

# Database tests only
tsx __tests__/database.test.ts
```

## Test Results Interpretation

**✓ (Checkmark)** - Test passed  
**✗ (X)** - Test failed  
**ℹ (Info)** - Inconclusive result (may be expected)  
**⚠ (Warning)** - Potential issue (review recommended)  

## What Gets Tested

### Authentication Flow
- Admin login with credentials
- Session creation and validation
- Protected route access
- Session persistence across pages
- Logout functionality

### Tracking Flow
- Tracking token validation
- Session cookie creation
- JWT token structure and signing
- Client session persistence
- URL-based entry points

### Security
- Password hashing (bcryptjs with 10 rounds)
- Cookie security flags (HttpOnly, SameSite, Secure)
- JWT signature verification
- Database constraints (unique emails, tokens)
- Middleware route protection

### Data Integrity
- Database relationships (Order → OrderLog)
- Constraint enforcement (unique tokens/emails)
- Field presence and types
- Default values and role assignment

## Expected Results

All tests should pass with ✓ indicators. Any ✗ or ⚠ results indicate:
- Configuration issues
- Missing environment variables
- Database connectivity problems
- Security concerns that need addressing

## Continuous Integration

Add to your CI/CD pipeline:
```yaml
- name: Run Auth Tests
  run: pnpm test:auth

- name: Run Tracking Tests
  run: pnpm test:tracking

- name: Run All Tests
  run: pnpm test
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "tsx __tests__/run-tests.ts",
    "test:auth": "tsx __tests__/admin-auth.test.ts",
    "test:tracking": "tsx __tests__/tracking.test.ts",
    "test:middleware": "tsx __tests__/middleware.test.ts",
    "test:db": "tsx __tests__/database.test.ts"
  }
}
```

## Test Server
Tests communicate with the running Next.js dev server at `http://localhost:3000`. Make sure the server is running before executing tests.

## Dependencies
- `tsx` - TypeScript execution (already installed)
- `bcryptjs` - Password hashing validation (already installed)
- Prisma Client - Database queries (already configured)

No additional test framework dependencies required for basic functionality tests!
