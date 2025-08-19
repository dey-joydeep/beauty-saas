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
        files: ['**/*.{ts,tsx,js,jsx,mts,cts}'],
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    // Stricter boundary rules per workspace proposal
                    enforceBuildableLibDependency: false,
                    allow: [],
                    depConstraints: [
                        // Apps may only depend on libs
                        { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['type:lib'] },

                        // Web code must not depend on server code
                        {
                            sourceTag: 'platform:web',
                            onlyDependOnLibsWithTags: [
                                'platform:web',
                                'scope:ui',
                                'scope:shared',
                                'scope:web-config',
                            ],
                        },

                        // Server code must not depend on web code
                        {
                            sourceTag: 'platform:server',
                            onlyDependOnLibsWithTags: [
                                'platform:server',
                                'scope:shared',
                                'scope:server-core',
                                'scope:server-data',
                                'scope:server-feature',
                            ],
                        },

                        // UI should stay presentational / neutral
                        { sourceTag: 'scope:ui', onlyDependOnLibsWithTags: ['scope:shared'] },

                        // Web core & feature libs may use other web core, UI, shared, and web-config
                        {
                            sourceTag: 'scope:web-core',
                            onlyDependOnLibsWithTags: [
                                'scope:web-core',
                                'scope:ui',
                                'scope:shared',
                                'scope:web-config',
                            ],
                        },
                        {
                            sourceTag: 'scope:web-feature-auth',
                            onlyDependOnLibsWithTags: [
                                'scope:web-core',
                                'scope:ui',
                                'scope:shared',
                                'scope:web-config',
                            ],
                        },

                        // Shared should only depend on itself (keeps it framework-agnostic)
                        { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },

                        // Server layering constraints
                        {
                            sourceTag: 'scope:server-feature',
                            onlyDependOnLibsWithTags: [
                                'scope:server-core',
                                'scope:server-data',
                                'scope:shared',
                            ],
                        },
                        {
                            sourceTag: 'scope:server-core',
                            onlyDependOnLibsWithTags: [
                                'scope:server-data',
                                'scope:shared',
                            ],
                        },
                        {
                            sourceTag: 'scope:server-data',
                            onlyDependOnLibsWithTags: ['scope:shared'],
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
    // Non-source TS (tests, scripts) use non-type-aware parsing to avoid tsconfig requirement
    {
        files: [
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
