# Frontend Shared Library

This library contains frontend-specific shared code used across the Beauty SaaS application, including:

- **Components**: Reusable UI components
- **Directives**: Custom Angular directives
- **Pipes**: Custom Angular pipes
- **Services**: Shared services and data access
- **Guards**: Route guards for authentication/authorization
- **Interceptors**: HTTP interceptors for request/response handling
- **Models**: Frontend-specific interfaces and types
- **Utils**: Frontend-specific utility functions

## Installation

This library is automatically included in the Nx workspace and can be imported using the `@beauty-saas/frontend` alias.

## Usage

### Importing from the frontend shared library

```typescript
// Import components
import { ExampleComponent } from '@beauty-saas/frontend';

// Import services
import { ExampleService } from '@beauty-saas/frontend';

// Import models
import { ExampleModel } from '@beauty-saas/frontend';

// Import utils
import { exampleUtil } from '@beauty-saas/frontend';
```

## Development

### Building the Library

```bash
npx nx build frontend
```

### Running Tests

```bash
npx nx test frontend
```

### Linting

```bash
npx nx lint frontend
```

## Adding New Code

1. **Components**: Add to `src/lib/components/`
2. **Directives**: Add to `src/lib/directives/`
3. **Pipes**: Add to `src/lib/pipes/`
4. **Services**: Add to `src/lib/services/`
5. **Guards**: Add to `src/lib/guards/`
6. **Interceptors**: Add to `src/lib/interceptors/`
7. **Models**: Add to `src/lib/models/`
8. **Utils**: Add to `src/lib/utils/`

## Best Practices

- Keep components small and focused on a single responsibility
- Use services for shared business logic and data access
- Follow Angular style guide for component structure
- Write unit tests for all new functionality
- Document public APIs with JSDoc comments
