# Shared Libraries

This directory contains shared libraries used across the Beauty SaaS application. These libraries are designed to be reusable across different parts of the application.

## Available Libraries

- `@shared` - Core shared utilities, types, and enums used across the entire application
- `@backend` - Backend-specific utilities, decorators, guards, and services
- `@frontend` - Frontend components, services, and utilities for the web application

## Adding a New File to a Shared Library

### 1. Create Your New File

Add your new file in the appropriate directory, for example:

```
libs/shared/src/types/new-type.ts
```

### 2. Update the Barrel Export (Index File)

Add an export to the relevant index file. For example, if you added a new type:

```typescript
// libs/shared/src/types/index.ts
export * from './user.types.js';
export * from './new-type.js'; // Add your new file
```

### 3. Build the Shared Library

```bash
cd libs/shared
npx tsc -p tsconfig.lib.json
```

### 4. Use Your New Export

Import your new file in your application:

```typescript
// Import from the barrel export (recommended)
import { NewType } from '@shared/types';

// Or import directly from the main index
import { NewType } from '@shared';
```

## Example: Adding a New Enum

1. Create the enum file:

```typescript
// libs/shared/src/enums/payment-status.enum.ts
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}
```

2. Update the enums index:

```typescript
// libs/shared/src/enums/index.ts
export * from './appointment-status.enum.js';
export * from './payment-status.enum.js'; // Add this line
```

3. Build the shared library (see step 3 above)

4. Import in your application:

```typescript
import { PaymentStatus } from '@shared/enums';
```

## Best Practices

- Keep shared code generic and reusable
- Add appropriate TypeScript types and interfaces
- Document your code with JSDoc comments
- Write unit tests for shared utilities
- Keep the public API surface minimal and focused

## Development

To rebuild the shared library automatically during development:

```bash
# Run in watch mode
cd libs/shared
npx tsc -p tsconfig.lib.json --watch
```

## Versioning

Shared libraries follow [Semantic Versioning](https://semver.org/). Update the version in the respective `package.json` file when making changes.

## License

This project is licensed under the terms of the MIT license.
