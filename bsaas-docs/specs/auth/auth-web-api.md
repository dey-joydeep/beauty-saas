# Auth Module - Web API

## Base URL

`/api/v1/auth`

## Authentication

All endpoints (except login/register) require a valid JWT token in the Authorization header.

## Endpoints

### Register New User

- **URL**: `/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123!",
    "name": "John Doe"
  }
  ```
- **Response**:
  ```json
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "is_verified": false
  }
  ```

### Login

- **URL**: `/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123!"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 86400,
    "token_type": "Bearer"
  }
  ```

### Refresh Token

- **URL**: `/refresh`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Response**: Same as login response

### Forgot Password

- **URL**: `/forgot-password`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Password reset email sent if account exists"
  }
  ```

### Reset Password

- **URL**: `/reset-password`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "token": "reset-token-from-email",
    "password": "newSecurePassword123!"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Password updated successfully"
  }
  ```

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation Error",
  "message": "Invalid email format",
  "statusCode": 400
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid credentials",
  "statusCode": 401
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "Email not verified",
  "statusCode": 403
}
```

### 429 Too Many Requests

```json
{
  "error": "Too Many Requests",
  "message": "Too many login attempts. Please try again later.",
  "statusCode": 429,
  "retry_after": 300
}
```

## Rate Limiting

- 100 requests per 15 minutes per IP for auth endpoints
- 5 failed login attempts per 5 minutes per IP
- 5 password reset requests per hour per email
