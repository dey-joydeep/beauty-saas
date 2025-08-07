# Backend Shared Library

This library contains backend-specific shared code used across the Beauty SaaS application, including:

- **Decorators**: Custom NestJS decorators
- **Filters**: Exception filters for error handling
- **Guards**: Authentication and authorization guards
- **Interceptors**: Request/response interceptors
- **Middleware**: Custom middleware functions
- **Pipes**: Data transformation and validation pipes
- **Services**: Shared business logic and utilities
- **Utils**: Helper functions and utilities

## Installation

This library is automatically included in the Nx workspace and can be imported using the `@beauty-saas/backend` alias.

## Usage

### Importing from the backend shared library

```typescript
// Import decorators
import { ExampleDecorator } from '@beauty-saas/backend';

// Import services
import { ExampleService } from '@beauty-saas/backend';

// Import utils
import { exampleUtil } from '@beauty-saas/backend';
```

## Development

### Building the Library

```bash
npx nx build backend
```

### Running Tests

```bash
npx nx test backend
```

### Linting

```bash
npx nx lint backend
```

## Adding New Code

1. **Decorators**: Add to `src/lib/decorators/`
2. **Filters**: Add to `src/lib/filters/`
3. **Guards**: Add to `src/lib/guards/`
4. **Interceptors**: Add to `src/lib/interceptors/`
5. **Middleware**: Add to `src/lib/middleware/`
6. **Pipes**: Add to `src/lib/pipes/`
7. **Services**: Add to `src/lib/services/`
8. **Utils**: Add to `src/lib/utils/`

## Best Practices

- Keep services small and focused on a single responsibility
- Use decorators to add metadata to classes and methods
- Implement proper error handling with custom exceptions and filters
- Write unit tests for all new functionality
- Document public APIs with JSDoc comments
