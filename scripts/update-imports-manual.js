import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Files and their import updates
const filesToUpdate = [
  {
    path: 'apps/bsaas-front/src/app/modules/user/user.component.spec.ts',
    from: '../../shared/test-setup',
    to: '@beauty-saas/shared/test-setup'
  },
  {
    path: 'apps/bsaas-front/src/app/modules/user/models/user.model.ts',
    from: '../../../shared/enums/user-role.enum',
    to: '@beauty-saas/shared/enums/user-role.enum'
  },
  {
    path: 'apps/bsaas-front/src/app/modules/theme/theme.component.spec.ts',
    from: '../../shared/test-setup',
    to: '@beauty-saas/shared/test-setup'
  },
  {
    path: 'apps/bsaas-front/src/app/modules/settings/settings.component.spec.ts',
    from: '../../shared/test-setup',
    to: '@beauty-saas/shared/test-setup'
  },
  {
    path: 'apps/bsaas-front/src/app/modules/salon/components/salon-profile/salon-profile.component.ts',
    from: '../../../../shared/enums/enums',
    to: '@beauty-saas/shared/enums/enums'
  },
  {
    path: 'apps/bsaas-front/src/app/modules/owner/salon-management.component.ts',
    from: '../../shared/enums/user-role.enum',
    to: '@beauty-saas/shared/enums/user-role.enum'
  },
  {
    path: 'apps/bsaas-front/src/app/modules/dashboard/dashboard.component.spec.ts',
    from: '../../shared/test-setup',
    to: '@beauty-saas/shared/test-setup'
  },
  {
    path: 'apps/bsaas-front/src/app/modules/dashboard/widgets/renewals-list/renewals-list-widget.component.ts',
    from: '../../../../shared/dashboard-api.service',
    to: '@beauty-saas/shared/api/dashboard-api.service'
  },
  {
    path: 'apps/bsaas-front/src/app/modules/dashboard/widgets/product-sales-widget/product-sales-widget.component.ts',
    from: '../../../../shared/models/date-range.model',
    to: '@beauty-saas/shared/models/date-range.model'
  },
  {
    path: 'apps/bsaas-front/src/app/modules/dashboard/owner-dashboard-widgets/product-sales-chart.component.ts',
    from: '../../../shared/dashboard-api.service',
    to: '@beauty-saas/shared/api/dashboard-api.service'
  },
  {
    path: 'apps/bsaas-front/src/app/modules/dashboard/owner-dashboard-widgets/renewals-list.component.ts',
    from: '../../../shared/dashboard-api.service',
    to: '@beauty-saas/shared/api/dashboard-api.service'
  },
  {
    path: 'apps/bsaas-front/src/app/modules/dashboard/owner-dashboard-widgets/revenue-chart.component.ts',
    from: '../../../shared/dashboard-api.service',
    to: '@beauty-saas/shared/api/dashboard-api.service'
  },
  {
    path: 'apps/bsaas-front/src/app/modules/dashboard/owner-dashboard-widgets/subscription-chart.component.ts',
    from: '../../../shared/dashboard-api.service',
    to: '@beauty-saas/shared/api/dashboard-api.service'
  },
  {
    path: 'apps/bsaas-front/src/app/modules/dashboard/owner-dashboard-widgets/customer-stats.component.ts',
    from: '../../../shared/dashboard-api.service',
    to: '@beauty-saas/shared/api/dashboard-api.service'
  },
  {
    path: 'apps/bsaas-front/src/app/modules/appointment/appointment-list/appointment-list.component.ts',
    from: '../../../shared/components/confirm-dialog/confirm-dialog.component',
    to: '@beauty-saas/shared/shared/components/confirm-dialog/confirm-dialog.component'
  },
  {
    path: 'apps/bsaas-front/src/app/models/salon-params.model.ts',
    from: '../shared/models/day-of-week.enum',
    to: '@beauty-saas/shared/shared/models/day-of-week.enum'
  },
  {
    path: 'apps/bsaas-front/src/app/models/salon.model.ts',
    from: '../shared/models/day-of-week.enum',
    to: '@beauty-saas/shared/shared/models/day-of-week.enum'
  },
  {
    path: 'apps/bsaas-front/src/app/models/user-params.model.ts',
    from: '../shared/enums/user-role.enum',
    to: '@beauty-saas/shared/enums/user-role.enum'
  },
  {
    path: 'apps/bsaas-front/src/app/models/user.model.ts',
    from: '../shared/enums/user-role.enum',
    to: '@beauty-saas/shared/enums/user-role.enum'
  }
];

// Process each file
filesToUpdate.forEach(({ path: filePath, from, to }) => {
  try {
    const fullPath = resolve(process.cwd(), filePath);
    if (existsSync(fullPath)) {
      let content = readFileSync(fullPath, 'utf8');
      const newContent = content.replace(new RegExp(`from ['\"]${from.replace(/\//g, '\\/')}['\"]`, 'g'), `from '${to}'`);
      
      if (newContent !== content) {
        writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated imports in ${filePath}`);
      } else {
        console.log(`No changes needed for ${filePath}`);
      }
    } else {
      console.warn(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log('Import updates complete!');
