# Redux Authentication Setup with JWT

This document outlines the complete authentication setup using Redux Toolkit and JWT tokens.

## Architecture Overview

### Files Structure
```
src/
├── app/
│   ├── store.ts              # Redux store configuration
│   ├── App.tsx               # Main app component with auth check
│   └── routes.tsx            # Route definitions with protection
├── features/
│   └── auth/
│       └── authSlice.ts      # Redux auth slice with async thunks
├── hooks/
│   └── useAuth.ts            # Custom hook for auth state and actions
├── components/
│   └── ProtectedRoute/       # Protected route wrapper component
├── pages/
│   ├── Login.tsx             # Login page
│   ├── Register.tsx          # Registration page
│   ├── ForgotPassword.tsx    # Forgot password page
│   └── NotFound.tsx          # 404 page
├── layouts/
│   ├── AuthLayout.tsx        # Layout for auth pages
│   └── DashboardLayout.tsx   # Layout for protected pages
├── services/
│   ├── api.ts                # Axios instance with JWT interceptors
│   └── auth.service.ts       # Auth API service
└── types/
    └── auth.ts               # TypeScript interfaces
```

## Key Features

### 1. **Redux Store Setup** (`src/app/store.ts`)
- Configured with Redux Toolkit
- Single auth reducer
- Type-safe RootState and AppDispatch

### 2. **Auth Slice** (`src/features/auth/authSlice.ts`)
- **Async Thunks:**
  - `login`: Authenticate user and store JWT
  - `register`: Create new user account
  - `getCurrentUser`: Fetch current user data (validates token)
  - `logout`: Clear authentication state

- **State Management:**
  - `user`: Current logged-in user
  - `token`: JWT token
  - `isLoading`: API loading state
  - `error`: Error messages
  - `isAuthenticated`: Boolean flag for auth status

### 3. **JWT Integration**
- Token stored in `localStorage` as `authToken`
- Automatically added to all API requests via axios interceptor
- Automatic logout on 401 (Unauthorized) responses
- Token persists across page refreshes

### 4. **useAuth Hook** (`src/hooks/useAuth.ts`)
Simple API for components:
```typescript
const {
  user,              // Current user object
  token,             // JWT token
  isLoading,         // Loading state
  error,             // Error message
  isAuthenticated,   // Auth status
  login,             // Login function
  register,          // Register function
  logout,            // Logout function
  getCurrentUser,    // Fetch user data
  clearError,        // Clear error message
} = useAuth();
```

### 5. **Route Protection** (`src/components/ProtectedRoute/ProtectedRoute.tsx`)
- Wraps protected routes
- Redirects unauthenticated users to login
- Shows loader while checking auth

### 6. **Smart Routing** (`src/app/routes.tsx`)
- Two route sets based on authentication status
- Auth pages (login, register, forgot-password) only visible when not authenticated
- Dashboard and protected pages only visible when authenticated
- Automatic redirects to prevent unauthorized access

### 7. **API Interceptors** (`src/services/api.ts`)
- Request interceptor: Adds JWT to Authorization header
- Response interceptor: Handles 401 errors and redirects to login
- Error handling and user feedback

## User Flow

### Login Flow
1. User visits app or tries to access protected route
2. App checks for stored JWT token
3. If no token exists, user is redirected to login page
4. User enters credentials and clicks "Sign in"
5. `login()` thunk is dispatched
6. JWT token is received and stored in localStorage
7. User is redirected to dashboard
8. `getCurrentUser()` is called to fetch user profile

### Logout Flow
1. User clicks logout button
2. `logout()` thunk is dispatched
3. Server session is cleared
4. localStorage token is removed
5. Redux state is cleared
6. User is redirected to login page

### Token Refresh (Optional)
- Implement `refreshToken()` in authSlice if backend supports refresh tokens
- Call in response interceptor when token expires

## Configuration

### 1. Environment Variables
Create `.env` file:
```
VITE_API_URL=http://localhost:3000/api
VITE_JWT_STORAGE_KEY=authToken
```

### 2. Backend API Endpoints Required
- `POST /auth/login` - Returns { user, token }
- `POST /auth/register` - Returns { user, token }
- `GET /auth/me` - Returns { user }
- `POST /auth/logout` - Clears session

### 3. JWT Token Requirements
- Include user ID, email, role in token payload
- Set appropriate expiration time (e.g., 24 hours)
- Use secure signing algorithm (e.g., HS256)

## Usage Examples

### In Components
```typescript
import { useAuth } from '../hooks/useAuth';

export const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      Welcome, {user?.name}!
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};
```

### Protecting Routes
```typescript
import { ProtectedRoute } from '../components/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
  {/* Dashboard routes */}
</Route>
```

## Security Considerations

✅ **Implemented:**
- JWT tokens stored as httpOnly when possible
- Automatic inclusion of token in API headers
- Automatic logout on 401 responses
- Token cleared from localStorage on logout
- Reload user data on app startup

⚠️ **To Implement:**
- Use httpOnly cookies instead of localStorage for production
- Implement token refresh mechanism
- Add CORS configuration
- Use HTTPS in production
- Add rate limiting on auth endpoints
- Implement password reset flow

## Testing

Test scenarios:
1. **Login Success**: Verify token is stored and user is redirected
2. **Login Failure**: Verify error message is displayed
3. **Protected Routes**: Verify access denied without token
4. **Token Expiry**: Verify automatic logout on 401
5. **Local Storage**: Verify token persists across refresh
6. **Logout**: Verify all auth data is cleared

## Troubleshooting

### Issue: "Not authenticated after login"
- Check backend returns proper { user, token } response
- Verify axios interceptor is adding token to headers
- Check localStorage has 'authToken' key

### Issue: "Redirect loop on protected routes"
- Ensure getCurrentUser() is implemented correctly
- Check token validation on backend
- Verify 401 response is returned for invalid tokens

### Issue: "Token not being sent to API"
- Verify API interceptor is configured
- Check token exists in localStorage
- Ensure Authorization header format is correct

## Next Steps

1. Update backend API endpoints to match expected interface
2. Customize dashboard layout with app navigation
3. Implement password reset flow
4. Add MFA/2FA support
5. Add role-based access control (RBAC)
6. Implement token refresh mechanism
