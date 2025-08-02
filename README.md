# Beauty SaaS Platform (Nx Monorepo)

[![Nx](https://img.shields.io/badge/powered%20by-nx-143055?style=flat-square&logo=nx&logoColor=white)](https://nx.dev)

A modern, scalable beauty salon management platform built with Nx, Angular, and NestJS.

> **Last Updated**: August 2, 2025

## 🏗️ Project Structure

```text
beauty-saas/
├── apps/
│   ├── bsaas-front/      # Frontend application (Angular)
│   ├── bsaas-back/       # Backend API (NestJS)
│   └── bsaas-docs/       # Documentation site
├── libs/                 # Shared libraries
│   └── shared/           # Shared code between frontend and backend
├── scripts/              # Utility scripts
├── .github/              # GitHub workflows
├── .husky/               # Git hooks
└── .vscode/              # VS Code settings
```

## 🚀 Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Docker 20.10+ (optional, for local database)
- Git 2.35+
- Nx CLI (optional): `npm install -g nx`

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/beauty-saas.git
   cd beauty-saas
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Update the .env file with your configuration
   ```

4. **Start development servers**

   Start the frontend:
   ```bash
   npm run dev:frontend
   ```

   In a separate terminal, start the backend:
   ```bash
   npm run dev:api
   ```

   For documentation:
   ```bash
   npm run dev:docs
   ```

5. **Run database migrations**
   ```bash
   npx nx run bsaas-back:db:migrate
   ```

## 🛠 Development Commands

### Run applications

- **Start frontend in development mode**
  ```bash
  npx nx serve bsaas-front
  ```

- **Start backend in development mode**
  ```bash
  npx nx serve bsaas-back
  ```

### Build applications

- **Build all applications**
  ```bash
  npx nx run-many --target=build --all
  ```

- **Build specific application**
  ```bash
  npx nx build bsaas-front
  npx nx build bsaas-back
  ```

### Testing

- **Run all tests**
  ```bash
  npx nx run-many --target=test --all
  ```

- **Run tests for specific project**
  ```bash
  npx nx test bsaas-front
  npx nx test bsaas-back
  ```

- **Run tests in watch mode**
  ```bash
  npx nx test bsaas-front --watch
  ```

### Linting

- **Lint all projects**
  ```bash
  npx nx run-many --target=lint --all
  ```

- **Fix linting issues**
  ```bash
  npx nx run-many --target=lint --all --fix
  ```

## 🏗️ Project Structure Details

### Apps

- **bsaas-front**: Angular-based frontend application
- **bsaas-back**: NestJS-based backend API

### Libraries

- **shared**: Code shared between frontend and backend (DTOs, interfaces, utilities)

## 🔧 Tools

- **Nx**: Monorepo build system with powerful project graph
- **Angular**: Frontend framework
- **NestJS**: Backend framework
- **Prisma**: Database ORM
- **Jest**: Testing framework
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting

## 🤝 Contributing

1. Create a new feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npx nx affected:test`
4. Lint your code: `npx nx affected:lint`
5. Commit your changes: `git commit -m 'feat: your feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

6. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Development Workflow

### Branch Naming

Use the following format for branch names:

```
<type>/<ticket-number>-<short-description>
```

Types:

- `feat/`: New features
- `fix/`: Bug fixes
- `chore/`: Maintenance tasks
- `docs/`: Documentation updates
- `test/`: Adding missing tests
- `refactor/`: Code refactoring
- `style/`: Code style changes

Example:

```
feat/123-add-user-profile
```

### Commit Messages

Follow Conventional Commits specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Example:

```
feat(auth): add password reset functionality

- Add password reset endpoint
- Implement email service
- Add validation

Closes #123
```

### Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linters
4. Push your branch and create a PR
5. Request review from at least one team member
6. Address review comments
7. Squash and merge when approved

## Code Style

### TypeScript/JavaScript

- Use 2 spaces for indentation
- Use single quotes
- Always use semicolons
- Maximum line length: 100 characters
- Sort imports alphabetically

### Styling

- Use CSS Modules for component styles
- Follow BEM naming convention
- Use CSS custom properties for theming
- Mobile-first approach

## Testing

### Running Tests

- Unit tests: `npm test`
- Integration tests: `npm run test:integration`
- E2E tests: `npm run test:e2e`
- All tests: `npm run test:all`

### Writing Tests

- Use Jest for unit and integration tests
- Use React Testing Library for component tests
- Use Cypress for E2E tests
- Follow AAA pattern (Arrange, Act, Assert)
- Test both success and error cases

## API Development

### Guidelines

- Follow RESTful principles
- Use proper HTTP methods
- Use proper HTTP status codes
- Version your API
- Document with OpenAPI/Swagger

### Request/Response Format

```typescript
// Request
{
  "data": {
    // request data
  },
  "meta": {
    // pagination, filters, etc.
  }
}

// Response
{
  "data": {
    // response data
  },
  "meta": {
    // metadata
  },
  "errors": [
    // error details
  ]
}
```

## Database

### Migrations

- Create migrations for schema changes
- Keep migrations small and focused
- Test migrations before deployment
- Document breaking changes

### Querying

- Use the repository pattern
- Use transactions for multiple operations
- Optimize queries with proper indexes
- Avoid N+1 queries

## CI/CD

### Pipeline

- Lint and type check on every push
- Run tests on pull requests
- Build and deploy on merge to main
- Run security scans

### Environments

- `development`: Local development
- `staging`: Pre-production testing
- `production`: Live environment

## Monitoring and Logging

### Logging

- Use structured logging
- Include correlation IDs
- Log at appropriate levels (DEBUG, INFO, WARN, ERROR)
- Do not log sensitive information

### Monitoring

- Set up health checks
- Monitor error rates
- Track performance metrics
- Set up alerts for critical issues

## Documentation

### Code Documentation

- Document public APIs
- Include examples in JSDoc
- Keep documentation up to date
- Document design decisions

### Project Documentation

- Keep README.md updated
- Document architecture decisions
- Maintain API documentation
- Keep setup instructions current

## Troubleshooting

### Common Issues

1. **Dependency issues**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm cache clean --force`
   - Reinstall dependencies with `npm install`

2. **Database connection issues**
   - Verify Docker is running
   - Check database credentials in `.env`
   - Try restarting containers with `docker-compose restart`

3. **Tests failing**
   - Run tests with `--watch` flag
   - Check for flaky tests
   - Update snapshots if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit a pull request

## License

[Your License Here]
