# Jest ESM Configuration Notes

## Current Limitations

As of the current versions of Jest (^29.0.0), NX (^16.0.0), and TypeScript (^5.0.0), there are known limitations when using ESM (ECMAScript Modules) with Jest:

1. **Jest's ESM Support**: Jest's ESM support is still experimental and has limitations, especially when used with TypeScript and NX [^jest-esm].

2. **Configuration Loading**: Jest tries to load the configuration file using `require()`, which doesn't work with ESM files (`.ts` files with `"type": "module"` in package.json) [^jest-config].

3. **NX Integration**: NX's Jest executor doesn't fully support ESM configuration files yet, as noted in the NX documentation [^nx-jest].

## Workarounds

### Option 1: Use CommonJS for Jest Config (Recommended)

1. Rename `jest.config.ts` to `jest.config.js`
2. Use CommonJS syntax in the config file
3. Keep the rest of your codebase using ESM

```javascript
// jest.config.js
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  preset: 'ts-jest/presets/default',
  testEnvironment: 'node',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  // Other Jest config...
};
```

### Option 2: Use ts-jest with ESM Support

1. Install required dependencies:

   ```bash
   npm install --save-dev ts-jest @types/jest
   ```

2. Create a custom Jest preset file (e.g., `jest.preset.js`):

   ```javascript
   const { jsWithTs } = require('ts-jest/presets');
   
   module.exports = {
     ...jsWithTs,
     transform: {
       ...jsWithTs.transform,
       '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
     },
     moduleNameMapper: {
       '^(\\.{1,2}/.*)\\.js$': '$1',
     },
     extensionsToTreatAsEsm: ['.ts'],
   };
   ```

3. Reference this preset in your `jest.config.ts`

## Future Considerations

1. Keep an eye on [Jest's ESM support progress][jest-esm]
2. Check [NX updates][nx-releases] for better ESM support
3. Consider using [Vitest][vitest] as an alternative test runner with better ESM support

## Alternative: Vitest

If ESM support is critical, consider using [Vitest][vitest], which has better ESM support out of the box [^vitest]:

1. Install Vitest:

   ```bash
   npm install -D vitest @vitest/ui
   ```

2. Create a `vitest.config.ts`:

   ```typescript
   import { defineConfig } from 'vitest/config';
   import { fileURLToPath } from 'url';
   
   export default defineConfig({
     test: {
       environment: 'node',
       include: ['**/*.test.ts'],
       exclude: ['node_modules', 'dist', '.idea', '.git'],
     },
     resolve: {
       alias: {
         // Add your path aliases here
       },
     },
   });
   ```

3. Update your `package.json` scripts:

   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:watch": "vitest watch",
       "test:coverage": "vitest run --coverage"
     }
   }
   ```

## References

[^jest-esm]: [Jest Documentation - ECMAScript Modules][jest-esm]
[^jest-config]: [Jest Configuration - Configuring Jest][jest-config]
[^nx-jest]: [NX Documentation - Jest Plugin][nx-jest]
[^vitest]: [Vitest - A Vite-native test runner][vitest]

[jest-esm]: https://jestjs.io/docs/ecmascript-modules
[jest-config]: https://jestjs.io/docs/configuration
[nx-jest]: https://nx.dev/packages/jest
[nx-releases]: https://github.com/nrwl/nx/releases
[vitest]: https://vitest.dev/

## Conclusion

For now, the most stable solution is to use CommonJS for the Jest configuration while keeping the rest of your codebase in ESM. As the JavaScript ecosystem continues to evolve, better solutions for ESM testing will become available.
