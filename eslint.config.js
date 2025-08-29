import nx from '@nx/eslint-plugin';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@nx': nx },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            { sourceTag: 'scope:web',      onlyDependOnLibsWithTags: ['scope:web', 'scope:web-core', 'type:util', 'type:ui', 'type:config', 'type:data'] },
            { sourceTag: 'scope:web-core', onlyDependOnLibsWithTags: ['scope:web-core', 'type:util', 'type:data', 'type:config'] },
            { sourceTag: 'scope:web-app',  onlyDependOnLibsWithTags: ['scope:web', 'scope:web-core', 'type:ui', 'type:data', 'type:util', 'type:config'] },
            // Server-side constraints
            { sourceTag: 'scope:server',      onlyDependOnLibsWithTags: ['scope:server', 'scope:shared', 'type:util', 'type:core', 'type:data'] },
            { sourceTag: 'type:feature',      onlyDependOnLibsWithTags: ['scope:server', 'scope:shared', 'type:feature', 'type:core', 'type:data', 'type:util'] },
            { sourceTag: 'type:data',         onlyDependOnLibsWithTags: ['scope:server', 'scope:shared', 'type:core', 'type:util'] },
            { sourceTag: 'type:core',         onlyDependOnLibsWithTags: ['scope:server', 'scope:shared', 'type:core', 'type:util'] },
            { sourceTag: 'scope:shared',      onlyDependOnLibsWithTags: ['scope:shared', 'type:util'] },
            { sourceTag: 'scope:server-app',  onlyDependOnLibsWithTags: ['scope:server', 'scope:shared', 'type:feature', 'type:data', 'type:core', 'type:util'] },
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
