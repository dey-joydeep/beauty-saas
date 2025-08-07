import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const filesToUpdate = [
  'apps/bsaas-front/src/app/modules/user/user.component.ts',
  'apps/bsaas-front/src/app/modules/salon/components/staff-request/staff-request-form.component.ts',
  'apps/bsaas-front/src/app/modules/salon/components/salon-profile/salon-profile.component.ts',
  'apps/bsaas-front/src/app/modules/portfolio/portfolio.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/dashboard.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/stats/stats-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/subscription-chart/subscription-chart-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/renewals-list/renewals-list-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/revenue-chart/revenue-chart-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/product-sales/product-sales-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/dashboard.service.ts',
  'apps/bsaas-front/src/app/core/auth/components/login/login.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/revenue-chart/revenue-chart.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/customer-stats/customer-stats-widget.component.ts',
];

function updateFile(filePath: string) {
  try {
    const fullPath = join(process.cwd(), filePath);
    let content = readFileSync(fullPath, 'utf-8');
    
    // Update import paths to use the lib's ErrorService
    content = content.replace(
      /from ['"]@beauty-saas\/frontend\/app\/core(\/services)?\/error(\.service)?['"]/g,
      "from '@beauty-saas/frontend/app/core/services/error/error.service'"
    );
    
    writeFileSync(fullPath, content, 'utf-8');
    console.log(`Updated: ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

// Run updates
console.log('Updating ErrorService imports...');
filesToUpdate.forEach(updateFile);
console.log('Update complete!');
