import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const FRONTEND_SRC = join(__dirname, '..', 'apps', 'bsaas-front', 'src');
const COMPONENTS_TO_UPDATE = [
  'StaffRequestFormComponent',
  'PortfolioComponent',
  'CustomerStatsWidgetComponent',
  'StatsWidgetComponent',
  'SubscriptionChartWidgetComponent',
  'RenewalsListWidgetComponent',
  'RevenueChartComponent',
  'ProductSalesWidgetComponent',
  'DashboardComponent'
];

function processFile(filePath: string): void {
  try {
    let content = readFileSync(filePath, 'utf-8');
    
    // Check if the file extends BaseComponent
    if (!content.includes('extends BaseComponent')) {
      return; // Skip files that don't extend BaseComponent
    }
    
    // Update the import statement
    if (content.includes("from '@beauty-saas/core/base.component'")) {
      content = content.replace(
        "from '@beauty-saas/core/base.component'",
        "from '@beauty-saas/frontend/app/core/base/abstract-base.component'"
      );
    } else if (content.includes("from './base.component'")) {
      content = content.replace(
        "from './base.component'",
        "from '@beauty-saas/frontend/app/core/base/abstract-base.component'"
      );
    } else if (content.includes("from '../base.component'")) {
      content = content.replace(
        "from '../base.component'",
        "from '@beauty-saas/frontend/app/core/base/abstract-base.component'"
      );
    } else {
      // Add import if not present
      const importStatement = "import { AbstractBaseComponent } from '@beauty-saas/frontend/app/core/base/abstract-base.component';\n";
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const insertIndex = content.indexOf(';', lastImportIndex) + 1;
        content = content.slice(0, insertIndex) + '\n' + importStatement + content.slice(insertIndex);
      } else {
        // If no imports found, add after any file comments
        const firstNonCommentIndex = content.search(/[^\s\/\*\/]/);
        content = content.slice(0, firstNonCommentIndex) + importStatement + content.slice(firstNonCommentIndex);
      }
    }
    
    // Update the class extension
    content = content.replace(
      /export\s+class\s+(\w+)\s+extends\s+BaseComponent/g,
      'export class $1 extends AbstractBaseComponent'
    );
    
    // Write the updated content back to the file
    writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated: ${filePath}`);
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

function processDirectory(directory: string): void {
  const files = readdirSync(directory);
  
  for (const file of files) {
    const filePath = join(directory, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
      processFile(filePath);
    }
  }
}

// Start processing from the frontend source directory
console.log('Starting to update BaseComponent imports...');
processDirectory(FRONTEND_SRC);
console.log('Update complete!');
