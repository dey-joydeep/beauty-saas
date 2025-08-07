import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const TARGET_DIRS = [
  'apps/bsaas-front/src',
  'libs/frontend/src/app'
];

// Patterns to find and replace
const IMPORT_PATTERNS = [
  {
    // Match: @beauty-saas/frontend/lib/services/... -> @beauty-saas/frontend/app/core/services/...
    pattern: /from ['"]@beauty-saas\/frontend\/lib\/(services\/[^'"}]+)['"]/g,
    replacement: 'from \'@beauty-saas/frontend/app/core/$1\''
  },
  {
    // Match: @beauty-saas/frontend/lib/... -> @beauty-saas/frontend/app/...
    pattern: /from ['"]@beauty-saas\/frontend\/lib\/([^'"}]+)['"]/g,
    replacement: 'from \'@beauty-saas/frontend/app/$1\''
  }
];

// Process a single file
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updatedContent = content;
  let changesMade = false;

  IMPORT_PATTERNS.forEach(({ pattern, replacement }) => {
    const newContent = updatedContent.replace(pattern, replacement);
    if (newContent !== updatedContent) {
      changesMade = true;
      updatedContent = newContent;
    }
  });

  if (changesMade) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Updated: ${path.relative(ROOT_DIR, filePath)}`);
    return true;
  }
  return false;
}

// Recursively process directory
function processDirectory(directory) {
  let count = 0;
  
  const files = fs.readdirSync(directory, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      count += processDirectory(fullPath);
    } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx'))) {
      if (processFile(fullPath)) {
        count++;
      }
    }
  }
  
  return count;
}

// Run the script
console.log('Starting import path updates...');
let totalUpdates = 0;

TARGET_DIRS.forEach(dir => {
  const fullPath = path.join(ROOT_DIR, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`\nProcessing directory: ${dir}`);
    const updates = processDirectory(fullPath);
    totalUpdates += updates;
    console.log(`  → Updated ${updates} files`);
  } else {
    console.warn(`Warning: Directory not found: ${dir}`);
  }
});

console.log(`\n✅ Update complete! ${totalUpdates} files were updated.`);
