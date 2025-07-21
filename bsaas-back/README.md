# Beauty SaaS Backend

A production-ready, multi-tenant beauty salon SaaS backend built with Node.js, TypeScript, Express, Prisma, PostgreSQL, and Angular frontend integration.

## Features

- Multi-tenant architecture
- Portfolio management
- Social login (Google, Facebook)
- Color theme customization per tenant
- User activity tracking
- RESTful API with robust error handling
- Internationalization (i18n)
- Mobile-friendly API design
- JWT authentication & security best practices
- Swagger/OpenAPI documentation
- Role-Based Access Control (RBAC)

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for local dev)

### Setup

1. Clone the repo
2. Copy `.env.example` to `.env` and set your secrets
3. Run with Docker Compose:
   ```sh
   docker-compose up --build
   ```
   Or run locally:
   ```sh
   npm install
   npx prisma migrate dev
   npm run dev
   ```

### API Documentation

- Visit [http://localhost:3000/api/docs](http://localhost:3000/api/docs) for Swagger UI

### Environment Variables

See `.env.example` for all required variables.

### Testing

```sh
npm run test
```

### Folder Structure

- `src/controllers` - Route controllers
- `src/routes` - Express routes
- `src/middleware` - Auth, validation, error handling
- `src/validators` - Zod schemas
- `src/locales` - i18n translation files
- `src/docs` - OpenAPI/Swagger docs

### DevOps

- Dockerfile and docker-compose included
- Ready for CI/CD integration

### Staff Management Endpoints (2025-04)

- `POST /salons/:salonId/staff` — Add staff (inactive by default)
- `POST /salons/:salonId/staff/:staffId/activate` — Activate staff
- `POST /salons/:salonId/staff/:staffId/deactivate` — Deactivate staff
- `DELETE /salons/:salonId/staff/:staffId` — Remove staff (soft delete)
- Only owner/admin can access these endpoints.

---

## License

MIT
