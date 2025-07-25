const fs = require('fs').promises;
const path = require('path');

// Source and target directories
const sourceDir = path.join(__dirname, '..', 'bsaas-back', 'docs', 'requirements');
const targetDir = path.join(__dirname, '..', 'bsaas-docs', 'specs');

// Mapping of source files to target directories
const fileMapping = {
  'appointment.md': 'appointment',
  'auth.md': 'auth',
  'portfolio.md': 'portfolio',
  'review.md': 'review',
  'salon-search.md': 'salon',
  'salon-staff.md': 'salon/staff',
  'social.md': 'social',
  'theme.md': 'theme',
  'user.md': 'user'
};

async function mergeFiles(sourceFile, targetDir) {
  try {
    // Read source and target files
    const sourceContent = await fs.readFile(path.join(sourceDir, sourceFile), 'utf8');
    const targetFile = path.join(targetDir, path.basename(sourceFile));
    
    let targetContent = '';
    try {
      targetContent = await fs.readFile(targetFile, 'utf8');
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      console.log(`Creating new file: ${targetFile}`);
    }

    // Simple merge strategy: append source content to target if not already present
    if (!targetContent.includes(sourceContent)) {
      const mergedContent = `${targetContent}\n\n<!-- Merged from ${sourceFile} -->\n${sourceContent}`;
      await fs.writeFile(targetFile, mergedContent, 'utf8');
      console.log(`Merged content into: ${targetFile}`);
    } else {
      console.log(`Content already exists in: ${targetFile}`);
    }
  } catch (error) {
    console.error(`Error processing ${sourceFile}:`, error);
  }
}

async function main() {
  try {
    // Process each file in the mapping
    for (const [sourceFile, targetSubdir] of Object.entries(fileMapping)) {
      const targetPath = path.join(targetDir, targetSubdir);
      
      // Create target directory if it doesn't exist
      await fs.mkdir(targetPath, { recursive: true });
      
      // Merge the file
      await mergeFiles(sourceFile, targetPath);
    }

    console.log('Documentation merge completed successfully!');
    
    // After successful merge, remove the source directory
    console.log('Removing source directory...');
    await fs.rm(sourceDir, { recursive: true, force: true });
    console.log('Source directory removed.');
    
  } catch (error) {
    console.error('Error during documentation merge:', error);
    process.exit(1);
  }
}

main();
