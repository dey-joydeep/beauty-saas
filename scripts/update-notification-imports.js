import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToUpdate = [
  'apps/bsaas-front/src/app/core/auth/services/auth.service.ts',
  'apps/bsaas-front/src/app/core/auth/components/login/login.component.spec.ts',
  'apps/bsaas-back/src/modules/appointment/appointment.service.ts'
];

filesToUpdate.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Handle different import patterns
      const newContent = content
        .replace(
          /from ['"](?:\.\.\/)+services\/notification\.service['"]/g,
          "from '@beauty-saas/frontend/lib/services/notification.service'"
        )
        .replace(
          /from ['"](?:\.\.\/)+notification\/notification\.service['"]/g,
          "from '@beauty-saas/frontend/lib/services/notification.service'"
        )
        .replace(
          /from ['"](?:\.\.\/)+notification\.service['"]/g,
          "from '@beauty-saas/frontend/lib/services/notification.service'"
        );
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated imports in ${filePath}`);
      } else {
        console.log(`No changes needed for ${filePath}`);
      }
    } else {
      console.log(`File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log('NotificationService import updates complete.');
