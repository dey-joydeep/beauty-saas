import baseConfig from '../../../eslint.config.js';

export default [
    ...baseConfig,
    {
        files: ['**/*.ts'],
        rules: {},
    },
    {
        files: ['**/*.spec.ts', '**/*.test.ts'],
        env: {
            jest: true,
        },
        rules: {},
    },
];
