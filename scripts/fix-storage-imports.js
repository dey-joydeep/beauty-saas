import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// List of files that need updating with their current import paths
const filesToUpdate = [
  'apps/bsaas-front/src/app/core/layout/header/header.component.ts',
  'apps/bsaas-front/src/app/core/auth/services/auth.service.ts',
  'apps/bsaas-front/src/app/core/auth/services/current-user.service.ts',
  'apps/bsaas-front/src/app/app.config.server.ts',
  'apps/bsaas-front/src/app/core/auth/components/login/login.component.ts',
  'apps/bsaas-front/src/app/modules/dashboard/dashboard.component.ts'
];

// The correct import path
const correctImport = "import { StorageService } from '@beauty-saas/frontend/app/core/services/storage/storage.service';";

// Function to update a single file
async function updateFile(filePath) {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const fullPath = path.join(process.cwd(), filePath);
    
    let content = await fs.promises.readFile(fullPath, 'utf8');
    
    // Replace any existing StorageService import with the correct one
    const updatedContent = content.replace(
      /import\s*\{\s*StorageService\s*\}\s*from\s*['"](?:.*\/)?storage\.service['"]\s*;/g,
      correctImport
    );
    
    if (updatedContent !== content) {
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
  console.log('🔄 Updating StorageService imports...\n');
  
  for (const file of filesToUpdate) {
    await updateFile(file);
  }
  
  console.log('\n✅ Update complete!');
}

main().catch(console.error);
