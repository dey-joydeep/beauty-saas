import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Common replacements that apply to multiple files
const commonReplacements = [
  // Core services
  { from: '@beauty-saas/frontend/app/core/error/error.service', to: 'frontend-common/core/error/error.service' },
  { from: '@beauty-saas/frontend/app/core/services/error/error.service', to: 'frontend-common/core/services/error/error.service' },
  { from: '@beauty-saas/frontend/app/core/services/error/error-handler.service', to: 'frontend-common/core/services/error/error-handler.service' },
  { from: '@beauty-saas/frontend/app/core/services/storage/storage.service', to: 'frontend-common/core/services/storage/storage.service' },
  { from: '@beauty-saas/frontend/app/core/services/loading.service', to: 'frontend-common/core/services/loading.service' },
  { from: '@beauty-saas/frontend/app/core/services/notification.service', to: 'frontend-common/core/services/notification.service' },
  
  // Core components and base classes
  { from: '@beauty-saas/frontend/app/core/base/abstract-base.component', to: 'frontend-common/core/base/abstract-base.component' },
  { from: '@beauty-saas/frontend/app/core/base/base.component', to: 'frontend-common/core/base/base.component' },
  
  // Auth
  { from: '@beauty-saas/frontend/app/core/auth/services/auth.service', to: 'frontend-common/core/auth/services/auth.service' },
  
  // Tokens and interfaces
  { from: '@beauty-saas/frontend/app/core/tokens/platform-utils.token', to: 'frontend-common/core/tokens/platform-utils.token' },
  { from: '@beauty-saas/frontend/app/core/interfaces/platform-utils.interface', to: 'frontend-common/core/interfaces/platform-utils.interface' },
  
  // Interceptors
  { from: '@beauty-saas/frontend/core/interceptors/error.interceptor', to: 'frontend-common/core/interceptors/error.interceptor' },
  
  // Utils
  { from: '@beauty-saas/frontend/core/utils/platform-utils', to: 'frontend-common/core/utils/platform-utils' }
];

// Files to update with their import replacements
const filesToUpdate = [
  'apps/bsaas-front/src/app/modules/user/user.component.ts',
  'apps/bsaas-front/src/app/modules/salon/components/staff-request/staff-request-form.component.ts',
  'apps/bsaas-front/src/app/modules/salon/components/salon-profile/salon-profile.component.ts',
  'apps/bsaas-front/src/app/modules/portfolio/portfolio.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/dashboard.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/subscription-chart/subscription-chart-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/stats/stats-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/renewals-list/renewals-list-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/revenue-chart/revenue-chart.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/revenue-chart/revenue-chart-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/product-sales/product-sales-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/customer-stats/customer-stats-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/dashboard.service.ts',
  'apps/bsaas-front/src/app/app.config.ts',
  'apps/bsaas-front/src/app/core/auth/services/auth.service.ts',
  'apps/bsaas-front/src/app/core/auth/components/login/login.component.ts',
  'apps/bsaas-front/src/app/core/auth/components/login/login.component.spec.ts',
  'apps/bsaas-front/src/app/core/auth/services/current-user.service.ts',
  'apps/bsaas-front/src/app/core/layout/header/header.component.ts',
  'apps/bsaas-front/src/app/core/interceptors/loading.interceptor.ts',
  'apps/bsaas-front/src/app/modules/appointment/booking-reschedule/appointment-reschedule.component.ts',
  'apps/bsaas-front/src/app/app.config.server.ts'
].map(filePath => ({
  path: filePath,
  replacements: commonReplacements
}));

// Function to update a single file
async function updateFile(filePath, replacements) {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const fullPath = path.join(process.cwd(), filePath);
    
    let content = await fs.promises.readFile(fullPath, 'utf8');
    let updatedContent = content;
    let changesMade = false;

    // Apply all replacements
    for (const { from, to } of replacements) {
      const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (regex.test(updatedContent)) {
        updatedContent = updatedContent.replace(regex, to);
        changesMade = true;
      }
    }

    // Only write if changes were made
    if (changesMade && updatedContent !== content) {
      await fs.promises.writeFile(fullPath, updatedContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Process all files
async function main() {
  console.log('🔄 Updating import paths...\n');
  
  for (const file of filesToUpdate) {
    await updateFile(file.path, file.replacements);
  }
  
  console.log('\n✅ Update complete!');
}

main().catch(console.error);
