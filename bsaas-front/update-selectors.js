import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, 'src', 'app');

// Function to process files
async function processFiles(dir) {
  const files = readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = join(dir, file.name);

    if (file.isDirectory()) {
      // Skip node_modules and other non-source directories
      if (['node_modules', '.angular', '.git', 'dist', 'build', 'coverage'].includes(file.name)) continue;
      await processFiles(fullPath);
    } else if (file.name.endsWith('.ts') || file.name.endsWith('.html') || file.name.endsWith('.spec.ts')) {
      try {
        let content = readFileSync(fullPath, 'utf8');
        let updated = false;

        // Update component selectors in .ts files
        if (file.name.endsWith('.ts')) {
          const newContent = content.replace(/selector:\s*['"]bsaas-([^\"\']+)['"]/g, "selector: 'app-$1'");
          if (newContent !== content) {
            content = newContent;
            updated = true;
          }
        }

        // Update template references in .html and .spec.ts files
        let newContent = content.replace(/<bsaas-([^>\/]+)([ >])/g, '<app-$1$2');

        // Update closing tags
        newContent = newContent.replace(/<\/bsaas-([^>]+)>/g, '</app-$1>');

        if (newContent !== content) {
          content = newContent;
          updated = true;
        }

        if (updated) {
          writeFileSync(fullPath, content, 'utf8');
          console.log(`Updated: ${fullPath}`);
        }
      } catch (error) {
        console.error(`Error processing ${fullPath}:`, error.message);
      }
    }
  }
}

// Run the script
console.log('Starting to update component selectors...');
processFiles(rootDir)
  .then(() => console.log('Finished updating component selectors'))
  .catch(console.error);
