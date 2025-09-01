# Implementation Folder Structure (Aligned to Current Monorepo)

```
libs/
  server/
    core/
      src/
        auth/                 # cross-cutting guards/decorators if shared
        common/errors/
        filters/
        i18n/{en,bn,jp}/
        interceptors/{correlation-id,audit,rate-limit}.ts
        services/error/
    data-access/
      prisma/
        schema.prisma         # include auth entities (User, Passkey, TOTP, RT, etc.)
      src/
        adapters/
          prisma-user.repo.ts
          redis-token.store.ts
          email.nodemailer.adapter.ts
          webauthn.simplewebauthn.adapter.ts
          totp.otplib.adapter.ts
          audit.pino.adapter.ts
          ratelimit.redis.adapter.ts
    features/
      auth/
        src/lib/
          http/               # Nest controllers (thin)
            auth.controller.ts
            sessions.controller.ts
            totp.controller.ts
            webauthn.controller.ts
          application/        # use-cases (business logic)
            sign-in.usecase.ts
            refresh-session.usecase.ts
            enroll-passkey.usecase.ts
            login-passkey.usecase.ts
            enroll-totp.usecase.ts
            verify-totp.usecase.ts
            request-reset.usecase.ts
            confirm-reset.usecase.ts
            verify-email.usecase.ts
          domain/
            entities/
            policies/
          ports/
            token.port.ts
            user-repo.port.ts
            webauthn.port.ts
            totp.port.ts
            email-sender.port.ts
            audit.port.ts
            ratelimit.port.ts
          dto/
            requests/
            responses/
          services/
            mapping/
          validators/
          test/
            unit/
            integration/
  shared/
    src/{enums,types}/

web/
  admin/auth/src/lib/...
  partner/auth/src/lib/...
  customer/auth/src/lib/...
  core/auth/src/lib/guards|services   # shared client guards/services (HTTP interceptors, route guards)
  config/src/environments/{admin,partner,customer}/
  ui/src/lib/dialogs, layout, etc.
```
