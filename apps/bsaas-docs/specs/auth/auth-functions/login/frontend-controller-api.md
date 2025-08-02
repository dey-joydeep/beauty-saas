# Authentication - Login

## Overview

The login component provides a secure authentication interface for users to access the beauty SaaS platform. It handles both email/password and social authentication flows.

## Components

### LoginForm Component

#### Props

```typescript
interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
  showSignupLink?: boolean;
  showForgotPassword?: boolean;
  rememberMe?: boolean;
  theme?: 'light' | 'dark';
}
```

#### Methods

- `handleSubmit(e: React.FormEvent)`: Handles the form submission
- `handleSocialLogin(provider: 'google' | 'facebook' | 'apple')`: Initiates OAuth flow for social login
- `handle2FAVerification()`: Handles 2FA code submission
- `handleSocialLogin(provider: string)`: Initiates social login flow
- `validateForm(values: { email: string, password: string })`: Validates form inputs

#### Example Usage

```tsx
<LoginForm
  onSubmit={handleLogin}
  isLoading={isLoading}
  error={error}
  socialProviders={[
    { id: 'google', name: 'Google', icon: <GoogleIcon /> },
    { id: 'facebook', name: 'Facebook', icon: <FacebookIcon /> },
  ]}
/>
```

### useAuth Hook

#### Methods

- `login(email: string, password: string)`: Authenticates user with email/password
- `loginWithProvider(provider: string)`: Authenticates user with social provider
- `logout()`: Logs out the current user
- `getCurrentUser()`: Gets the currently authenticated user

#### Example Usage

```tsx
const { login, loginWithProvider, logout, user } = useAuth();

// Email/password login
await login('user@example.com', 'password');

// Social login
await loginWithProvider('google');

// Logout
await logout();
```

## State Management

### Auth State

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'staff';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Error Handling

- Form validation errors
- Authentication errors
- Network errors
- Session expiration

## Integration Points

- Authentication API
- Social login providers (Google, Facebook, etc.)
- Toast/notification system
- Analytics
- Feature flags
