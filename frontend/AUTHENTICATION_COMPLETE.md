# Redux + JWT Authentication Setup - Complete Guide

## ✅ What Has Been Set Up

### 1. **Redux Store with Authentication Slice**
- **Location**: `src/features/auth/authSlice.ts`
- **Features:**
  - User state management with Redux Toolkit
  - Async thunks for login, register, logout, and user verification
  - JWT token persistence in localStorage
  - Error handling and loading states

### 2. **Type Definitions**
- **Location**: `src/types/auth.ts`
- **Includes:**
  - `User` interface
  - `AuthState` interface
  - `LoginCredentials` and `RegisterData` interfaces
  - `AuthResponse` interface

### 3. **Redux Store Configuration**
- **Location**: `src/app/store.ts`
- Configured with Redux Toolkit's `configureStore`
- Type-safe RootState and AppDispatch exports

### 4. **Custom useAuth Hook**
- **Location**: `src/hooks/useAuth.ts`
- Simple API for accessing auth state and actions
- All Redux complexity abstracted away

### 5. **Protected Route Component**
- **Location**: `src/components/ProtectedRoute/ProtectedRoute.tsx`
- Wraps routes that require authentication
- Shows loader while checking auth status
- Redirects to login if not authenticated

### 6. **API Service with JWT Interceptors**
- **Location**: `src/services/api.ts` (already configured)
- Automatic JWT token injection in request headers
- Automatic logout on 401 responses
- Error handling

### 7. **Authentication Pages**
- **Login** (`src/pages/Login.tsx`) - Full implementation with Redux integration
- **Register** (`src/pages/Register.tsx`) - Form validation and error handling
- **Forgot Password** (`src/pages/ForgotPassword.tsx`) - Ready for backend integration

### 8. **Smart Routing System**
- **Location**: `src/app/routes.tsx`
- Dynamic routes based on authentication status
- Auth pages only visible when not logged in
- Dashboard only visible when logged in
- Automatic redirects to prevent unauthorized access

### 9. **Layouts**
- **AuthLayout** (`src/layouts/AuthLayout.tsx`) - For login/register pages
- **DashboardLayout** (`src/layouts/DashboardLayout.tsx`) - For protected pages with logout button

### 10. **Main App Integration**
- **Location**: `src/main.tsx` - Redux Provider wrapper
- **Location**: `src/app/App.tsx` - Auth check on app load

## 🔐 Security Features Implemented

✅ **JWT Token Handling**
- Stored in localStorage
- Automatically sent with every API request
- Automatically removed on logout

✅ **Automatic Authentication Check**
- Verifies token validity on app startup
- Fetches user data if token is valid
- Clears auth state if token is invalid

✅ **Protected Routes**
- Public pages (login, register) only accessible when not authenticated
- Dashboard pages only accessible when authenticated
- Automatic redirects prevent unauthorized access

✅ **Request/Response Interceptors**
- Token automatically added to Authorization header
- Unauthorized requests handled gracefully
- Session cleared on 401 responses

✅ **Error Handling**
- User-friendly error messages
- Loading states for async operations
- Form validation on client side

## 🚀 How It Works

### Login Flow
```
1. User enters credentials on Login page
2. Click "Sign in" → login action is dispatched
3. Redux makes API call to /auth/login
4. Server returns { token, user }
5. Token is stored in localStorage
6. Redux state is updated with user data
7. User is automatically redirected to /dashboard
8. getCurrentUser() is called to verify token
```

### Authorization Flow
```
App starts
  ↓
Check if token exists in localStorage
  ↓
If yes → Call getCurrentUser() to verify
  ↓
If valid → Show dashboard
If invalid → Clear state and show login
If no token → Show login
```

### Route Protection
```
User tries to access /dashboard
  ↓
ProtectedRoute component checks auth status
  ↓
If authenticated → Show dashboard
If not authenticated → Redirect to /login
```

## 📝 Required Backend Endpoints

Your backend MUST provide these endpoints:

### POST /auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /auth/register
**Request:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as login

### GET /auth/me
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "user": {
    "id": "123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### POST /auth/logout
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

## 🛠️ Usage in Components

### Access Auth State
```typescript
import { useAuth } from '../hooks/useAuth';

export const MyComponent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return <div>Welcome {user?.name}!</div>;
};
```

### Use Auth Actions
```typescript
const { login, logout, error } = useAuth();

// Login
const handleLogin = async () => {
  await login({ email: 'user@example.com', password: 'pass' });
};

// Logout
const handleLogout = () => {
  logout();
};
```

### Protect Routes
```typescript
<Route
  element={
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

## 📋 Files Created/Modified

### Created:
- ✅ `src/types/auth.ts` - Type definitions
- ✅ `src/app/store.ts` - Redux store
- ✅ `src/features/auth/authSlice.ts` - Auth reducer and thunks
- ✅ `src/hooks/useAuth.ts` - Custom hook
- ✅ `src/components/ProtectedRoute/ProtectedRoute.tsx` - Protected route wrapper
- ✅ `src/components/ProtectedRoute/index.ts` - Export
- ✅ `src/app/routes.tsx` - Route definitions
- ✅ `.env.example` - Environment variable template

### Modified:
- ✅ `src/main.tsx` - Added Redux Provider
- ✅ `src/app/App.tsx` - Added auth check and routing
- ✅ `src/pages/Login.tsx` - Integrated with Redux
- ✅ `src/pages/Register.tsx` - Integrated with Redux
- ✅ `src/pages/ForgotPassword.tsx` - Added form handling
- ✅ `src/layouts/AuthLayout.tsx` - Updated for routing
- ✅ `src/layouts/DashboardLayout.tsx` - Added logout, user info

## 🧪 Testing the Setup

### 1. Start the dev server
```bash
cd frontend
npm run dev
```

### 2. Test login page
- Navigate to http://localhost:5173
- Should see login page
- Form validation working

### 3. Test registration page
- Click "Register here"
- Enter test data
- Should validate passwords match

### 4. Test logout
- Login with valid credentials
- Click logout button
- Should redirect to login page

## ⚙️ Environment Setup

1. Create `.env` file in `frontend/` directory:
```
VITE_API_URL=http://localhost:3000/api
```

2. Adjust based on your backend URL

## 🔧 Customization

### Change storage from localStorage to cookies:
- Edit `src/services/api.ts` interceptors
- Use document.cookie instead of localStorage

### Add refresh token support:
- Create `refreshToken` thunk in `src/features/auth/authSlice.ts`
- Call in response interceptor before 401 redirect

### Add role-based access control:
- Update User interface to include role
- Create role checking utility
- Wrap ProtectedRoute with role validation

### Customize pages:
- Edit `src/pages/Login.tsx`, `Register.tsx`, etc.
- Update styles as needed
- Add your branding

## 📚 Additional Improvements to Consider

1. **Token Refresh**: Implement refresh token mechanism
2. **Remember Me**: Add "Remember me" checkbox
3. **Social Login**: Add OAuth/Google login
4. **2FA**: Implement two-factor authentication
5. **Session Timeout**: Add automatic logout on inactivity
6. **Password Reset**: Implement forgot password flow
7. **Profile Update**: Allow users to update their profile
8. **Role-Based Routes**: Different layouts for different roles

## 🆘 Troubleshooting

### Login always fails
- Check backend is running
- Verify API_URL in .env matches backend
- Check console for error messages
- Ensure backend returns correct response format

### Redirect loop on login
- Verify getCurrentUser() endpoint is correct
- Check token validation on backend
- Check backend returns 401 for invalid tokens

### User not persisting after refresh
- Verify localStorage has authToken
- Check getCurrentUser() is being called
- Verify backend validates token correctly

## 📞 Support

For issues:
1. Check browser console for errors
2. Check network tab for API requests
3. Verify backend endpoints return correct format
4. Check localStorage for authToken
5. Review the AUTH_SETUP.md file for detailed architecture

---
**Setup Complete! Your authentication system is ready to use.** 🎉
