/* Revert server-core imports to the barrel '@beauty-saas/shared' (idempotent) */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const repo       = path.resolve(__dirname, '..');
const CORE       = path.join(repo, 'libs/server/core/src');

function patch(file, replace) {
  const p = path.join(CORE, file);
  if (!fs.existsSync(p)) return console.log('skip (missing):', file);
  const src = fs.readFileSync(p, 'utf8');
  const out = replace(src);
  if (out !== src) {
    fs.writeFileSync(p, out, 'utf8');
    console.log('✔ patched', file);
  } else {
    console.log('• no change', file);
  }
}

// roles.decorator.ts: UserRole from barrel
patch('auth/decorators/roles.decorator.ts', s =>
  s
    .replace(
      /from\s+['"]@beauty-saas\/shared\/enums\/user-role\.enum['"]/g,
      `from '@beauty-saas/shared'`
    )
    .replace(
      /from\s+['"]@beauty-saas\/shared['"]/g,
      `from '@beauty-saas/shared'`
    )
);

// roles.guard.ts: AppUserRole + AuthenticatedUser + UserRoleInfo from barrel
patch('auth/guards/roles.guard.ts', s =>
  s
    .replace(
      /import\s*\{\s*AppUserRole\s*\}\s*from\s*['"]@beauty-saas\/shared\/enums\/user-role\.enum['"]\s*;?/g,
      `import { AppUserRole } from '@beauty-saas/shared';`
    )
    .replace(
      /import\s*\{\s*AuthenticatedUser\s*,\s*UserRoleInfo\s*\}\s*from\s*['"]@beauty-saas\/shared\/types\/user\.types['"]\s*;?/g,
      `import { AuthenticatedUser, UserRoleInfo } from '@beauty-saas/shared';`
    )
);

// decorators: AuthenticatedUser from barrel (type or value)
patch('decorators/current-user.decorator.ts', s =>
  s
    .replace(
      /from\s+['"]@beauty-saas\/shared\/types\/user\.types['"]/g,
      `from '@beauty-saas/shared'`
    )
);
patch('decorators/user.decorator.ts', s =>
  s
    .replace(
      /from\s+['"]@beauty-saas\/shared\/types\/user\.types['"]/g,
      `from '@beauty-saas/shared'`
    )
);

// validators: AppUserRole from barrel
patch('validation/validators/has-permission.validator.ts', s =>
  s
    .replace(
      /from\s+['"]@beauty-saas\/shared\/enums\/user-role\.enum['"]/g,
      `from '@beauty-saas/shared'`
    )
);
patch('validation/validators/last-admin.validator.ts', s =>
  s
    .replace(
      /from\s+['"]@beauty-saas\/shared\/enums\/user-role\.enum['"]/g,
      `from '@beauty-saas/shared'`
    )
);

// appointment.validators: AppointmentStatus from barrel
patch('validators/appointment.validators.ts', s =>
  s
    .replace(
      /from\s+['"]@beauty-saas\/shared\/enums\/appointment-status\.enum['"]/g,
      `from '@beauty-saas/shared'`
    )
);

// keep data-access import as package root (barrel)
patch('database/database.module.ts', s =>
  s
    .replace(
      /from\s+['"]@beauty-saas\/server-data-access(?:\/index)?['"]/g,
      `from '@beauty-saas/server-data-access'`
    )
);
