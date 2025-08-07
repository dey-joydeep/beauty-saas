const fs = require('fs');
const path = require('path');

// List of files that need updating with their correct import paths
const filesToUpdate = [
  'apps/bsaas-front/src/app/modules/user/user.component.ts',
  'apps/bsaas-front/src/app/modules/salon/components/staff-request/staff-request-form.component.ts',
  'apps/bsaas-front/src/app/modules/salon/components/salon-profile/salon-profile.component.ts',
  'apps/bsaas-front/src/app/modules/portfolio/portfolio.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/stats/stats-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/subscription-chart/subscription-chart-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/revenue-chart/revenue-chart.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/revenue-chart/revenue-chart-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/renewals-list/renewals-list-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/product-sales/product-sales-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/widgets/customer-stats/customer-stats-widget.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/dashboard.service.ts',
];

// The correct import path
const correctImport = "import { ErrorService } from '@beauty-saas/frontend/app/core/services/error/error.service';";

// Function to update a single file
function updateFile(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace any existing ErrorService import with the correct one
    const updatedContent = content.replace(
      /import\s*\{\s*ErrorService\s*\}\s*from\s*['"].*error\.service['"]\s*;/g,
      correctImport
    );
    
    if (updatedContent !== content) {
      fs.writeFileSync(fullPath, updatedContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Process all files
console.log('🔄 Updating ErrorService imports...\n');
filesToUpdate.forEach(updateFile);
console.log('\n✅ Update complete!');
