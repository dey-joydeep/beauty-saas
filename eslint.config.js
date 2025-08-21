import nx from '@nx/eslint-plugin';

export default [
  {
    files: ['**/*.{js,ts,tsx,jsx,html}'],
    plugins: { '@nx': nx },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: [],
          depConstraints: [
            // Apps may only depend on libs
            { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['type:lib'] },

            // Platform walls
            { sourceTag: 'platform:web', onlyDependOnLibsWithTags: ['platform:web', 'scope:shared'] },
            { sourceTag: 'platform:server', onlyDependOnLibsWithTags: ['platform:server', 'scope:shared'] },

            // Shared must stay framework-agnostic
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },

            // UI should not pull app/server code
            { sourceTag: 'scope:ui', onlyDependOnLibsWithTags: ['scope:ui', 'scope:shared'] },

            // Web core & features
            { sourceTag: 'scope:web-core', onlyDependOnLibsWithTags: ['scope:web-core', 'scope:ui', 'scope:shared'] },
            { sourceTag: 'scope:web-feature-auth', onlyDependOnLibsWithTags: ['scope:web-core', 'scope:ui', 'scope:shared'] },
            { sourceTag: 'scope:web-config', onlyDependOnLibsWithTags: ['scope:web-core', 'scope:ui', 'scope:shared'] },
            { sourceTag: 'scope:web-testing', onlyDependOnLibsWithTags: ['scope:web-core', 'scope:ui', 'scope:shared'] },

            // Server layering
            { sourceTag: 'scope:server-feature', onlyDependOnLibsWithTags: ['scope:server-core', 'scope:server-data', 'scope:shared'] },
            { sourceTag: 'scope:server-core', onlyDependOnLibsWithTags: ['scope:server-data', 'scope:shared'] },
            { sourceTag: 'scope:server-data', onlyDependOnLibsWithTags: ['scope:shared'] },
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
