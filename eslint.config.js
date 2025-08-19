import nx from '@nx/eslint-plugin';

export default [
    {
        plugins: { '@nx': nx },
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
];
