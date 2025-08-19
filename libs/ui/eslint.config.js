import webBase from '../../../eslint.base.web.js';

export default [
    ...webBase,
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        rules: {},
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {},
    },
    {
        files: ['**/*.js', '**/*.jsx'],
        rules: {},
    },
    {
        files: ['**/*.html'],
        rules: {},
    },
];
