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

// Scope type-aware TS-ESLint rules to source files by mapping configs
const typeCheckedScoped = ts.configs.recommendedTypeChecked.map((cfg) => ({
    ...cfg,
    files: ['**/src/**/*.{ts,tsx}'],
    // Do not apply type-aware rules to test/spec/e2e files; they are handled below
    ignores: [
        '**/*.{spec,test}.ts',
        '**/*.e2e-spec.ts',
        '**/jest*.ts',
    ],
    languageOptions: {
        ...(cfg.languageOptions ?? {}),
        parser: tsParser,
        parserOptions: {
            ...((cfg.languageOptions && cfg.languageOptions.parserOptions) || {}),
            // Use a single root project for reliable association across the monorepo
            project: [path.join(__dirname, 'tsconfig.eslint.json')],
        },
    },
}));

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
    // Typescript-ESLint base (not type-aware) globally
    ...ts.configs.recommended,
    ...compat.extends('prettier'),
    // Type-aware rules only for source files; auto-discover tsconfig via project service
    ...typeCheckedScoped,
    // Non-source TS (configs, tests, scripts) use non-type-aware parsing to avoid tsconfig requirement
    {
        files: [
            '**/*.{config,configs}.ts',
            '**/*.{spec,test}.ts',
            '**/jest*.ts',
            '**/*.scripts.ts',
            '**/*.e2e-spec.ts',
            '**/*.migration.ts',
            '**/tools/**/*.ts',
            '**/scripts/**/*.ts',
        ],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: false,
            },
            globals: {
                afterAll: true,
                afterEach: true,
                beforeAll: true,
                beforeEach: true,
                describe: true,
                expect: true,
                it: true,
                jest: true,
                test: true,
            },
        },
        rules: {},
    },
];
