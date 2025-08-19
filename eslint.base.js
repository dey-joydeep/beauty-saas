import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import nxEslintPlugin from '@nx/eslint-plugin';
import path from 'path';
import { fileURLToPath } from 'url';
import tsParser from '@typescript-eslint/parser';
import ts from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

export default [
    {
        plugins: { '@nx': nxEslintPlugin },
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
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/docs/**',
            '**/coverage/**',
            '**/.angular/**',
            '**/.nx/**',
            '**/tmp/**',
            // Do not lint ESLint config files themselves
            '**/eslint.config.js',
            '**/eslint.config.cjs',
            '**/eslint.config.mjs',
        ],
    },
    // Typescript-ESLint recommended rules (define plugin once globally)
    ...ts.configs.recommended,
    ...compat.extends('prettier'),
    // TypeScript support
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.base.json',
                tsconfigRootDir: __dirname,
            },
        },
        rules: {},
    },
    // Avoid requiring a TS project for declaration files
    {
        files: ['**/*.d.ts'],
        languageOptions: {
            parser: tsParser,
            parserOptions: { project: null },
        },
        rules: {},
    },
];
