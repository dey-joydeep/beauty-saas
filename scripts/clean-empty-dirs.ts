import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

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
    'tmp',
    '.angular',
    '.vscode',
    '.idea'
];

// Track removed directories
const removedDirs: string[] = [];

/**
 * Check if a directory is empty
 */
function isDirectoryEmpty(dirPath: string): boolean {
    try {
        const files = fs.readdirSync(dirPath);
        return files.length === 0;
    } catch (error) {
        return false;
    }
}

/**
 * Remove empty directories recursively
 */
function removeEmptyDirectories(dirPath: string): boolean {
    // Skip excluded directories
    if (EXCLUDE_DIRS.some(exclude => dirPath.includes(exclude))) {
        return false;
    }

    // Check if directory exists
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
        return false;
    }

    let isDirEmpty = true;
    const files = fs.readdirSync(dirPath);

    // Process all files and subdirectories
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const isDir = fs.statSync(fullPath).isDirectory();

        if (isDir) {
            // Recursively check subdirectories
            const isEmpty = removeEmptyDirectories(fullPath);
            if (!isEmpty) {
                isDirEmpty = false;
            }
        } else {
            // If there's any file, the directory is not empty
            isDirEmpty = false;
        }
    }

    // Remove the directory if it's empty
    if (isDirEmpty) {
        try {
            const relativePath = path.relative(ROOT_DIR, dirPath);
            fs.rmdirSync(dirPath);
            removedDirs.push(relativePath);
            return true;
        } catch (error) {
            console.error(`Error removing directory ${dirPath}:`, error);
            return false;
        }
    }

    return false;
}

// Main function
function main() {
    console.log('Scanning for empty directories...');

    // Start from the root directory
    removeEmptyDirectories(ROOT_DIR);

    // Report results
    if (removedDirs.length > 0) {
        console.log('\nRemoved empty directories:');
        removedDirs.sort().forEach(dir => console.log(`- ${dir}`));
        console.log(`\nTotal removed: ${removedDirs.length}`);
    } else {
        console.log('\nNo empty directories found to remove.');
    }

    console.log('\nEmpty directory cleanup complete!');
}

// Run the script
main();
