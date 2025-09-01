# Implementation Folder Structure — Nx Standard (Merged)

> This merges your original layout with Nx conventions: **code under `src/lib`**, each lib has a **barrel `src/index.ts`**, and infra adapters are split into focused libs (email/cache/audit/webauthn/totp).

```
libs/
  server/
    core/
      project.json
      src/
        index.ts
        lib/
          auth/                                # cross-cutting guards/decorators if shared
          common/errors/
          filters/
          i18n/{en,bn,jp}/
          interceptors/
            correlation-id.interceptor.ts
            audit.interceptor.ts
            rate-limit.interceptor.ts
          services/error/
    data-access/                               # DB-only concerns (Prisma + repositories)
      project.json
      prisma/
        schema.prisma                          # include auth entities (User, Passkey, TOTP, RT, etc.)
      src/
        index.ts                               # export PrismaService + repositories
        lib/
          prisma.service.ts
          repositories/
            user.repository.ts
            session.repository.ts
            refresh-token.repository.ts
            email-verification.repository.ts
            password-reset.repository.ts
    infrastructure/                            # infra adapters split by concern (clean boundaries)
      email/
        project.json
        src/
          index.ts
          lib/
            email.nodemailer.adapter.ts
            email.module.ts
      cache/
        project.json
        src/
          index.ts
          lib/
            redis.client.ts
            ratelimit.redis.adapter.ts
      audit/
        project.json
        src/
          index.ts
          lib/
            audit.pino.adapter.ts
      webauthn/
        project.json
        src/
          index.ts
          lib/
            webauthn.simplewebauthn.adapter.ts
      totp/
        project.json
        src/
          index.ts
          lib/
            totp.otplib.adapter.ts
    features/
      auth/
        project.json
        src/
          index.ts
          lib/
            http/                              # thin Nest controllers
              auth.controller.ts
              sessions.controller.ts
              totp.controller.ts
              webauthn.controller.ts
            application/                       # use-cases (business logic)
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
            ports/                              # hex ports (implemented by infra & data-access)
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
    project.json
    src/
      index.ts
      lib/
        enums/
        types/
```

## Nx project tagging & boundaries (recommended)
Add `tags` to each lib’s `project.json` and enforce with `@nx/eslint-plugin` `depConstraints`:

```json
// tools/eslint-rules/.eslintrc.json (example)
{
  "extends": ["plugin:@nx/typescript"],
  "overrides": [
    {
      "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
      "rules": {
        "@nx/enforce-module-boundaries": [
          "error",
          {
            "enforceBuildableLibDependency": true,
            "depConstraints": [
              { "sourceTag": "type:feature", "onlyDependOnLibsWithTags": ["type:infra", "type:data-access", "type:core", "type:shared"] },
              { "sourceTag": "type:data-access", "onlyDependOnLibsWithTags": ["type:core", "type:shared"] },
              { "sourceTag": "type:infra", "onlyDependOnLibsWithTags": ["type:core", "type:shared"] },
              { "sourceTag": "type:core", "onlyDependOnLibsWithTags": ["type:core", "type:shared"] },
              { "sourceTag": "type:shared", "onlyDependOnLibsWithTags": ["type:shared"] }
            ]
          }
        ]
      }
    }
  ]
}
```

Tag examples in `project.json`:
```json
{
  "name": "@cthub/server-data-access",
  "tags": ["scope:server", "type:data-access"]
}
```
```json
{
  "name": "@cthub/server-infra-email",
  "tags": ["scope:server", "type:infra"]
}
```

## Notes
- Keep **Prisma** schema exclusively under `data-access/prisma`. If you add more schemas later, create more `data-access-*` libs.
- Each lib should export only the **public API** from `src/index.ts` (barrel). Avoid deep imports.
- This structure lets `features/auth` depend on **ports**; `data-access` and `infrastructure/*` implement those ports. That keeps testing easy and boundaries clean.
