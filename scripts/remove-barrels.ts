import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const EXCLUDE_DIRS = [
    'node_modules',
    'dist',
    '.git',
    '.nx',
    'coverage',
    'tmp'
];

// Find all TypeScript/JavaScript files in the project
function findSourceFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dir, file.name);

        if (file.isDirectory()) {
            if (!EXCLUDE_DIRS.includes(file.name)) {
                findSourceFiles(fullPath, fileList);
            }
        } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js') || file.name.endsWith('.jsx')) {
            fileList.push(fullPath);
        }
    }

    return fileList;
}

// Find all index.ts files that are barrel files
function findBarrelFiles(): string[] {
    const barrelFiles: string[] = [];

    function walk(dir: string) {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory()) {
                if (!EXCLUDE_DIRS.some(exclude => fullPath.includes(exclude))) {
                    walk(fullPath);
                }
            } else if (file.name === 'index.ts') {
                const content = fs.readFileSync(fullPath, 'utf-8');
                // Simple check if this is a barrel file (exports other modules)
                if (content.includes('export * from') || content.includes('export {')) {
                    barrelFiles.push(fullPath);
                }
            }
        }
    }

    walk(ROOT_DIR);
    return barrelFiles;
}

// Update imports in source files to point to direct file paths
function updateImports(barrelFiles: string[]): void {
    const sourceFiles = findSourceFiles(ROOT_DIR);
    const barrelMap = new Map<string, string>();

    // Create a map of barrel file paths to their directory paths
    for (const barrelFile of barrelFiles) {
        const dirPath = path.dirname(barrelFile);
        barrelMap.set(dirPath, barrelFile);
    }

    for (const sourceFile of sourceFiles) {
        const content = fs.readFileSync(sourceFile, 'utf-8');
        const sourceFileDir = path.dirname(sourceFile);
        let updatedContent = content;

        // Skip processing barrel files themselves
        if (barrelFiles.includes(sourceFile)) continue;

        // Find all import/export statements
        const importExportRegex = /(import|export)\s+(?:{[^}]+}\s+from\s+)?['"]([^'"]+)['"]/g;
        let match;
        const updates: { oldPath: string, newPath: string }[] = [];

        while ((match = importExportRegex.exec(content)) !== null) {
            const importExport = match[0];
            const importPath = match[2];

            // Skip node modules and absolute imports
            if (importPath.startsWith('.') || importPath.startsWith('@/')) {
                const resolvedPath = path.resolve(sourceFileDir, importPath);
                const dirPath = resolvedPath.endsWith('.ts') ? path.dirname(resolvedPath) : resolvedPath;

                if (barrelMap.has(dirPath)) {
                    // This import points to a barrel file
                    const barrelFile = barrelMap.get(dirPath)!;
                    const barrelDir = path.dirname(barrelFile);
                    const barrelContent = fs.readFileSync(barrelFile, 'utf-8');

                    // Find all exports in the barrel file
                    const exportRegex = /export\s+(?:\*|{[^}]+})\s+from\s+['"]([^'"]+)['"]/g;
                    let exportMatch;

                    while ((exportMatch = exportRegex.exec(barrelContent)) !== null) {
                        const exportPath = exportMatch[1];
                        const fullExportPath = path.resolve(barrelDir, exportPath);
                        const relativePath = path.relative(sourceFileDir, fullExportPath).replace(/\\/g, '/');

                        // Add ./ prefix for relative paths if needed
                        const newImportPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;

                        updates.push({
                            oldPath: importPath,
                            newPath: newImportPath
                        });
                    }
                }
            }
        }

        // Apply updates to the file
        if (updates.length > 0) {
            for (const update of updates) {
                updatedContent = updatedContent.replace(
                    new RegExp(`(['"])${update.oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"])`, 'g'),
                    `$1${update.newPath}$2`
                );
            }

            fs.writeFileSync(sourceFile, updatedContent, 'utf-8');
            console.log(`Updated imports in ${path.relative(ROOT_DIR, sourceFile)}`);
        }
    }
}

// Main function
function main() {
    console.log('Finding barrel files...');
    const barrelFiles = findBarrelFiles();

    console.log(`Found ${barrelFiles.length} barrel files:`);
    barrelFiles.forEach(file => console.log(`- ${path.relative(ROOT_DIR, file)}`));

    if (barrelFiles.length === 0) {
        console.log('No barrel files found.');
        return;
    }

    console.log('\nUpdating imports...');
    updateImports(barrelFiles);

    console.log('\nRemoving barrel files...');
    for (const file of barrelFiles) {
        fs.unlinkSync(file);
        console.log(`- Removed ${path.relative(ROOT_DIR, file)}`);

        // Remove directory if empty
        const dir = path.dirname(file);
        try {
            fs.rmdirSync(dir);
            console.log(`- Removed empty directory ${path.relative(ROOT_DIR, dir)}`);
        } catch (e) {
            // Directory not empty, which is fine
        }
    }

    console.log('\nBarrel file removal complete!');
}

// Run the script
main();
