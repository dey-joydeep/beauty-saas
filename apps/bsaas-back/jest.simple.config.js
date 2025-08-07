module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/user.service.spec.ts'],
    moduleNameMapper: {
        '^@shared/(.*)$': '<rootDir>/../../libs/shared/src/$1',
        '^@backend/(.*)$': '<rootDir>/../../libs/backend/src/$1',
    },
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
