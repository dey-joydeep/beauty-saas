import baseConfig from '../../../eslint.base.js';

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
