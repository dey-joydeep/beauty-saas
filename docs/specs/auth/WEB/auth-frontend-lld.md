# Auth Frontend — Low-Level Design (LLD)

Status: Draft v2 (concrete labels, validations, reactions)
Scope: Forms, fields, validation, i18n keys, SSR/guards, UX states.

## 0. Key Namespacing (i18n)
- Namespace roots: `auth.*`, `common.*`.
- Languages: en, bn, hi (ensure all keys exist in each locale file).

## 1. Forms, Fields, and Validations (per route)

### 1.1 LoginForm (route `/login`)
- Fields
  - email
    - type: `email`, autocomplete: `email`, inputmode: `email`, maxLength: 254
    - trim + lowercase on blur
    - validators: required, Angular `Validators.email`
    - labelKey: `auth.login.email.label`
    - placeholderKey: `auth.login.email.placeholder`
    - helpKey: `auth.login.email.help`
    - errorKeys: required→`auth.login.email.required`, invalid→`auth.login.email.invalid`
  - password
    - type: `password`, autocomplete: `current-password`, maxLength: 128, toggle show/hide
    - validators: required, minLength 8
    - labelKey: `auth.login.password.label`
    - placeholderKey: `auth.login.password.placeholder`
    - helpKey: `auth.login.password.help`
    - errorKeys: required→`auth.login.password.required`, minLength→`auth.login.password.tooShort`
  - rememberMe (optional)
    - type: checkbox
    - labelKey: `auth.login.remember`
- Buttons
  - submit labelKey: `auth.login.submit`
  - passkey labelKey: `auth.login.passkey`
  - social buttons use `auth.oauth.google` / `auth.oauth.meta`
- API
  - POST `/auth/login` with body { email, password }
  - 200 { totpRequired:false } → navigate to intended or default; toast `auth.login.success`
  - 200 { totpRequired:true, tempToken } → route `/login/totp` with state; toast `auth.totp.required`
  - 400 { code:"error.validation", details } → map to field errors
  - 401 { code:"error.auth.invalid_credentials" } → banner `auth.errors.invalidCredentials`
  - 429 Retry-After → disable form; show `common.errors.rateLimited` with countdown

### 1.2 TotpChallengeForm (route `/login/totp`)
- Fields
  - code
    - type: `text`, inputmode: `numeric`, pattern: `^\d{6}$`, maxLength: 6
    - validators: required, regex
    - labelKey: `auth.totp.code.label`
    - placeholderKey: `auth.totp.code.placeholder`
    - errorKeys: required→`auth.totp.code.required`, invalid→`auth.totp.code.invalid`
- Hidden
  - tempToken (navigation state)
- Buttons
  - submit labelKey: `auth.totp.verify`
- API
  - POST `/auth/login/totp` { tempToken, totpCode: code }
  - 200 → redirect to intended; toast `auth.totp.success`
  - 401 → `auth.errors.invalidTotp` or `auth.errors.totpExpired`
  - 429 → cooldown banner

### 1.3 RegisterForm (Customer placeholder, route `/register`)
- Fields (current)
  - email (same validators as login)
- Labels
  - titleKey: `auth.register.title`
  - infoKey: `auth.register.placeholder.info`
  - submitKey: `auth.register.submit`
- API
  - POST `/auth/register` { email } → 202 success; show `auth.register.pending`

### 1.4 EmailVerifyRequestForm (route `/verify-email` step 1)
- Fields: email (if not prefilled)
- Labels: titleKey `auth.verify.request.title`, submitKey `auth.verify.request.submit`
- API: POST `/auth/email/verify/request` { email } → 202; show `auth.verify.requested`
- 429 → `common.errors.rateLimited` + cooldown

### 1.5 EmailVerifyConfirmForm (route `/verify-email` step 2)
- Fields
  - email (readonly if passed via query)
    - labelKey: `auth.verify.email.label`
  - otp: 6-digit code
    - labelKey: `auth.verify.otp.label`
    - placeholderKey: `auth.verify.otp.placeholder`
    - errors: required→`auth.verify.otp.required`, invalid→`auth.verify.otp.invalid`
- Buttons: submitKey `auth.verify.confirm`
- API: POST `/auth/email/verify/confirm` { email, otp }
  - 200 → `auth.verify.success`; navigate per policy
  - 410 → `auth.verify.expired`; 401 → `auth.verify.invalid`

### 1.6 ForgotPasswordForm (route `/password/forgot`)
- Fields: email
- Labels: titleKey `auth.reset.request.title`, submitKey `auth.reset.request.submit`
- API: POST `/auth/password/forgot` { email } → 202; show `auth.reset.requested`

### 1.7 ResetPasswordForm (route `/password/reset?token=...`)
- Fields
  - newPassword
    - labelKey: `auth.reset.password.label`
    - placeholderKey: `auth.reset.password.placeholder`
    - errors: required→`auth.reset.password.required`, tooShort→`auth.reset.password.tooShort`
  - confirmPassword
    - labelKey: `auth.reset.confirm.label`
    - errors: mismatch→`auth.reset.confirm.mismatch`
  - recoveryCode (optional)
    - labelKey: `auth.reset.recovery.label`
    - placeholderKey: `auth.reset.recovery.placeholder`
    - pattern: `^[A-Z0-9-]{8,}$`
- Buttons: submitKey `auth.reset.submit`
- API: POST `/auth/password/reset` { token, newPassword, recoveryCode? }
  - 200 → `auth.reset.success`, redirect to `/login`
  - 410 → `auth.reset.expired`; 401 → `auth.reset.invalid`

### 1.8 TotpEnroll (route `/security/mfa`)
- Start
  - buttonKey: `auth.totp.enroll.start`
  - POST `/auth/totp/enroll/start` → { qrCodeDataUrl }
- Finish form
  - code (same validator)
  - buttonKey: `auth.totp.enroll.finish`
  - POST `/auth/totp/enroll/finish` { code } → { success, recoveryCodes }
  - Show codes with: `auth.recovery.title`, `auth.recovery.savePrompt`, `auth.recovery.download`, `auth.recovery.acknowledge`

### 1.9 RecoveryCodes (route `/security/mfa`)
- Generate
  - buttonKey: `auth.recovery.generate`
  - POST `/auth/recovery/codes` → string[]; render with copy/download buttons
- Verify
  - field labelKey: `auth.recovery.code.label`, placeholderKey: `auth.recovery.code.placeholder`
  - POST `/auth/recovery/verify` { code } → { success }
  - Errors: `auth.recovery.invalid`

### 1.10 Passkeys (components)
- Enroll button: `auth.passkey.enroll`
- Login button: `auth.passkey.login`
- Browser errors: `auth.passkey.cancelled`, `auth.passkey.unsupported`, `auth.passkey.error`

### 1.11 Social (Customer)
- Buttons: `auth.oauth.google`, `auth.oauth.meta`
- Callback page messages: `auth.oauth.success`, `auth.oauth.denied`, `auth.oauth.error`

## 2. Concrete i18n Key List (to create in en/bn/hi)
- auth.login.title, auth.login.email.label, auth.login.email.placeholder, auth.login.email.help, auth.login.email.required, auth.login.email.invalid, auth.login.password.label, auth.login.password.placeholder, auth.login.password.help, auth.login.password.required, auth.login.password.tooShort, auth.login.remember, auth.login.submit, auth.login.passkey, auth.login.success
- auth.errors.invalidCredentials, auth.errors.invalidTotp, auth.errors.totpExpired, auth.errors.csrf, auth.errors.userNotFound
- common.errors.rateLimited, common.errors.validation, common.errors.generic
- auth.totp.required, auth.totp.code.label, auth.totp.code.placeholder, auth.totp.code.required, auth.totp.code.invalid, auth.totp.verify, auth.totp.success
- auth.register.title, auth.register.placeholder.info, auth.register.submit, auth.register.pending
- auth.verify.request.title, auth.verify.request.submit, auth.verify.requested, auth.verify.email.label, auth.verify.otp.label, auth.verify.otp.placeholder, auth.verify.otp.required, auth.verify.otp.invalid, auth.verify.confirm, auth.verify.success, auth.verify.expired, auth.verify.invalid
- auth.reset.request.title, auth.reset.request.submit, auth.reset.requested, auth.reset.password.label, auth.reset.password.placeholder, auth.reset.password.required, auth.reset.password.tooShort, auth.reset.confirm.label, auth.reset.confirm.mismatch, auth.reset.recovery.label, auth.reset.recovery.placeholder, auth.reset.submit, auth.reset.success, auth.reset.expired, auth.reset.invalid
- auth.recovery.title, auth.recovery.savePrompt, auth.recovery.download, auth.recovery.acknowledge, auth.recovery.generate, auth.recovery.code.label, auth.recovery.code.placeholder, auth.recovery.invalid
- auth.passkey.enroll, auth.passkey.login, auth.passkey.cancelled, auth.passkey.unsupported, auth.passkey.error
- auth.oauth.google, auth.oauth.meta, auth.oauth.success, auth.oauth.denied, auth.oauth.error

## 3. Error Mapping (server code → UI key)
- error.auth.invalid_credentials → auth.errors.invalidCredentials
- error.auth.invalid_totp_code → auth.errors.invalidTotp
- error.auth.invalid_or_expired_totp → auth.errors.totpExpired
- error.auth.missing_refresh_token → auth.errors.missingRefresh
- error.auth.invalid_refresh_token → auth.errors.invalidRefresh
- error.auth.user_not_found → auth.errors.userNotFound
- error.security.csrf_failed → auth.errors.csrf
- error.rate_limited → common.errors.rateLimited
- error.validation → common.errors.validation
- error.generic → common.errors.generic

## 4. Accessibility & Testability
- ARIA: set `aria-invalid` on invalid inputs; link errors via `aria-describedby`.
- Focus: move focus to first invalid field on submit failure; to banner on API error.
- Test IDs: use `data-testid="auth-<form>-<field>"` (e.g., `auth-login-email`, `auth-totp-code`).

## 5. SSR & Guards (concrete)
- AuthGuard: if not authenticated (via a lightweight `/auth/sessions` or `/user/me`), navigate to `/login?redirect=<url>`.
- GuestGuard: if authenticated, navigate to intended or default route.
- TransferState: key `AUTH_BOOTSTRAP` holds `{ user, sessions? }` snapshot; read on client boot.
- Browser gating: only call WebAuthn/OAuth in `ngAfterViewInit` with `isPlatformBrowser=true`.

## 6. UX Rules
- Disable submit buttons during pending requests; show inline spinners with `aria-live="polite"`.
- Parse `Retry-After` header (seconds or HTTP-date); display countdown.
- Use generic success messages for register/forgot to avoid account enumeration.
