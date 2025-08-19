import nx from '@nx/eslint-plugin';

export default [
    {
        files: ['**/*.{js,ts,tsx,jsx,html}'],
        plugins: { '@nx': nx },
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: [],
                    depConstraints: [
                        // Frontend code can depend only on other web libs and shared
                        {
                            sourceTag: 'platform:web',
                            onlyDependOnLibsWithTags: ['platform:web', 'scope:shared'],
                        },
                        // Server-side code can depend only on other server libs and shared
                        {
                            sourceTag: 'platform:server',
                            onlyDependOnLibsWithTags: ['platform:server', 'scope:shared'],
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
];
