# Authentication API Reference

## Base URL

`https://api.beautysaas.com/v1`

## Authentication

All endpoints (except login/register) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Headers

### Required Headers

```
Content-Type: application/json
X-Request-ID: <uuid>
X-Device-ID: <device_fingerprint>
```

### Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

## Rate Limiting

### Limits

| Endpoint             | Limit | Window | Notes     |
| -------------------- | ----- | ------ | --------- |
| /auth/login          | 10    | 5 min  | Per IP    |
| /auth/otp/request    | 5     | 1 hour | Per email |
| /auth/otp/verify     | 3     | 10 min | Per OTP   |
| /auth/password-reset | 5     | 1 hour | Per email |
| All other endpoints  | 100   | 1 min  | Per IP    |

### Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1617235200
Retry-After: 60
```

## Endpoints

### 1. Login

**POST** `/auth/login`

#### Request

```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "deviceInfo": {
    "fingerprint": "abc123xyz",
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1"
  }
}
```

#### Owner/Staff Response (Requires OTP)

```json
{
  "status": "otp_required",
  "message": "OTP sent to your registered email/phone",
  "otpId": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Responses

**200 OK**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "role": "customer",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**400 Bad Request**

```json
{
  "error": "Invalid credentials",
  "code": "AUTH_001",
  "remainingAttempts": 4
}
```

### 2. Verify OTP

**POST** `/auth/otp/verify`

#### Request

```json
{
  "otpId": "123e4567-e89b-12d3-a456-426614174000",
  "code": "123456",
  "deviceInfo": {
    "fingerprint": "abc123xyz"
  }
}
```

#### Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "def456...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "owner@example.com",
    "role": "owner",
    "firstName": "John",
    "lastName": "Doe",
    "permissions": ["salon:read", "salon:write"]
  }
}
```

### 3. Request New OTP

**POST** `/auth/otp/request`

#### Request

```json
{
  "email": "user@example.com",
  "purpose": "login"
}
```

### 4. Social Login

**POST** `/auth/social`

### 5. Refresh Token

**POST** `/auth/refresh`

#### Request Headers

```
Authorization: Bearer <refresh_token>
X-Device-ID: <device_fingerprint>
```

#### Response

```json
{
  "token": "new.jwt.token.here",
  "refreshToken": "new.refresh.token.here"
}
```

### 6. Logout

**POST** `/auth/logout`

#### Request Headers

```
Authorization: Bearer <jwt_token>
X-Device-ID: <device_fingerprint>
```

#### Query Parameters

- `allDevices` (boolean): If true, logs out all user sessions

### 7. Active Sessions

**GET** `/auth/sessions`

#### Response

```json
{
  "sessions": [
    {
      "id": "sess_123",
      "device": "Chrome on Windows",
      "ip": "192.168.1.1",
      "location": "New York, US",
      "lastActive": "2025-07-16T12:34:56Z",
      "current": true
    }
  ]
}
```

### 8. Revoke Session

**DELETE** `/auth/sessions/:sessionId`

### 9. Get Current User

**GET** `/auth/me`

#### Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "role": "customer",
  "firstName": "John",
  "lastName": "Doe",
  "emailVerified": true,
  "phoneNumber": "+1234567890",
  "phoneVerified": true,
  "createdAt": "2025-01-01T00:00:00Z",
  "lastLogin": "2025-07-16T12:34:56Z"
}
```

## Error Codes

### Authentication Errors

| Code     | HTTP | Description           | Resolution                    |
| -------- | ---- | --------------------- | ----------------------------- |
| AUTH_001 | 401  | Invalid credentials   | Check email/password          |
| AUTH_002 | 403  | Account locked        | Wait 15 min or reset password |
| AUTH_003 | 401  | Invalid token         | Re-authenticate               |
| AUTH_004 | 401  | Expired token         | Refresh token                 |
| AUTH_005 | 429  | Rate limit exceeded   | Wait before retrying          |
| AUTH_006 | 403  | Invalid OTP           | Check code or request new OTP |
| AUTH_007 | 400  | OTP expired           | Request new OTP               |
| AUTH_008 | 403  | Session expired       | Re-authenticate               |
| AUTH_009 | 403  | Device not recognized | Verify device via email       |
| AUTH_010 | 400  | Password too weak     | Use stronger password         |

### Validation Errors

| Code    | HTTP | Field    | Description               |
| ------- | ---- | -------- | ------------------------- |
| VAL_001 | 400  | email    | Invalid email format      |
| VAL_002 | 400  | password | Minimum 12 characters     |
| VAL_003 | 400  | password | Missing uppercase letter  |
| VAL_004 | 400  | password | Missing special character |
| VAL_005 | 400  | password | Found in data breach      |

### Business Logic Errors

| Code        | HTTP | Description              |
| ----------- | ---- | ------------------------ |
| USER_001    | 404  | User not found           |
| USER_002    | 409  | Email already in use     |
| SESSION_001 | 401  | Too many active sessions |
| SESSION_002 | 404  | Session not found        |

## Webhook Events

### Authentication Events

| Event                   | Description          | Payload                                  |
| ----------------------- | -------------------- | ---------------------------------------- |
| `user.login`            | User logged in       | `{userId, ip, device, timestamp}`        |
| `user.login.failed`     | Failed login attempt | `{email, ip, reason, timestamp}`         |
| `user.logout`           | User logged out      | `{userId, sessionId, timestamp}`         |
| `user.locked`           | Account locked       | `{userId, reason, timestamp}`            |
| `user.otp.sent`         | OTP code sent        | `{userId, method, maskedDestination}`    |
| `user.otp.verified`     | OTP verified         | `{userId, method, timestamp}`            |
| `user.password.changed` | Password updated     | `{userId, timestamp}`                    |
| `user.session.revoked`  | Session terminated   | `{userId, sessionId, reason, timestamp}` |

### Security Events

| Event                          | Description                       |
| ------------------------------ | --------------------------------- |
| `security.breach_attempt`      | Multiple failed login attempts    |
| `security.suspicious_activity` | Unusual login pattern             |
| `security.device_verified`     | New device verified               |
| `security.2fa_enabled`         | Two-factor authentication enabled |

## SDKs

### JavaScript/TypeScript

```bash
npm install @beautysaas/auth-sdk
```

```typescript
import { AuthClient } from '@beautysaas/auth-sdk';

const auth = new AuthClient({
  baseUrl: 'https://api.beautysaas.com/v1',
  storage: window.localStorage,
  onSessionExpired: () => {
    // Handle session expiration
  },
});

// Login with OTP flow
const login = async (email: string, password: string) => {
  try {
    const result = await auth.login({ email, password });

    if (result.status === 'otp_required') {
      // Show OTP input
      const verified = await auth.verifyOtp({
        otpId: result.otpId,
        code: userEnteredCode,
      });
      return verified;
    }

    return result;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

### Mobile SDKs

#### iOS (Swift)

```swift
import BeautySaaSAuth

let auth = BeautyAuth(apiKey: "your_api_key")
auth.login(email: "user@example.com", password: "password") { result in
    switch result {
    case .success(let session):
        print("Logged in as \(session.user.email)")
    case .failure(let error):
        print("Login failed: \(error.localizedDescription)")
    }
}
```

#### Android (Kotlin)

```kotlin
val auth = BeautyAuth.Builder()
    .apiKey("your_api_key")
    .build()

auth.login("user@example.com", "password") { result ->
    when (result) {
        is Result.Success -> {
            val session = result.data
            // Handle successful login
        }
        is Result.Error -> {
            // Handle error
        }
    }
}
```

## Rate Limiting Headers

### Request Headers

- `X-Client-Version`: Client application version
- `X-Device-ID`: Unique device identifier
- `X-Request-ID`: Unique request ID for tracing

### Response Headers

- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in window
- `X-RateLimit-Reset`: Unix timestamp when limit resets
- `Retry-After`: Seconds to wait before next request
