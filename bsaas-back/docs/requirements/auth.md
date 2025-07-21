# Auth API Requirements

## Functional Requirements

- Users can authenticate via email/password or social login (OAuth).
- Auth records must include:
  - id
  - email
  - password (hashed, if applicable)
  - social_accounts (array, for OAuth)
  - is_verified
  - last_login_at
- The system must validate:
  - Email is unique and valid
  - Password is securely hashed
  - Social account providers are supported
- Endpoints must support:
  - Registering a user
  - Logging in
  - Social login (OAuth)
  - Password reset
- All auth logic must use PostgreSQL/MongoDB (no in-memory/demo data).

## API Parameters

### Register

| Parameter | Type   | Description               |
| --------- | ------ | ------------------------- |
| email     | string | Email address             |
| password  | string | Password (secure, hashed) |
| name      | string | User's name               |

### Social Login

| Parameter        | Type   | Description                                  |
| ---------------- | ------ | -------------------------------------------- |
| provider         | string | Social provider (e.g., 'google', 'facebook') |
| provider_user_id | string | User id from the provider                    |

## Notes

- All auth logic must use production databases (PostgreSQL/MongoDB).
- Interfaces must be in the `models` folder, one per file.
- Demo data is only allowed in tests/mocks.
