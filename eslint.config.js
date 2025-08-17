import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import nxEslintPlugin from '@nx/eslint-plugin';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

function isPathIgnored(filePath) {
    // Ignore node_modules and dist directories
    if (filePath.includes('node_modules') || filePath.includes('dist')) {
        return true;
    }
    // Ignore docs directory
    if (filePath.includes('docs')) {
        return true;
    }
    return false;
}

export default [
    { plugins: { '@nx': nxEslintPlugin } },
    {
        ignores: ['**/node_modules/**', '**/dist/**', '**/docs/**', '**/coverage/**'],
    },
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        ignores: ['**/node_modules/**', '**/dist/**', '**/docs/**', '**/coverage/**'],
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: [],
                    depConstraints: [
                        {
                            sourceTag: '*',
                            onlyDependOnLibsWithTags: ['*'],
                        },
                    ],
                },
            ],
        },
    },
    ...compat.extends('prettier'),
    // Add TypeScript support
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: (await import('@typescript-eslint/parser')).default,
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: __dirname,
            },
        },
        rules: {},
    },
];
