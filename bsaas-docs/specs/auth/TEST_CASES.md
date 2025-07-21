# Authentication Module Test Cases

## Test Environment Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 6+

### Test Database Setup

```bash
# Start test containers
docker-compose -f docker-compose.test.yml up -d

# Run migrations
npm run db:migrate:test

# Seed test data
npm run db:seed:test
```

### Environment Variables

Create `.env.test` file:

```env
NODE_ENV=test
DATABASE_URL=postgresql://user:pass@localhost:5432/auth_test
REDIS_URL=redis://localhost:6379/1
JWT_SECRET=test-secret-change-in-production
OTP_SECRET=test-otp-secret
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

## Unit Tests

### Auth Service Tests

```typescript
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: getRepositoryToken(User), useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should validate user credentials', async () => {
    const user = { email: 'test@example.com', password: 'ValidPass123!' };
    const result = await service.validateUser(user.email, user.password);
    expect(result).toBeDefined();
    expect(result.email).toBe(user.email);
  });
});
```

### Test Cases

#### 1. User Registration

| Test Case | Description                  | Expected Result           |
| --------- | ---------------------------- | ------------------------- |
| TC-REG-01 | Register with valid data     | 201 Created, user created |
| TC-REG-02 | Register with existing email | 409 Conflict              |
| TC-REG-03 | Register with invalid email  | 400 Bad Request           |
| TC-REG-04 | Register with weak password  | 400 Bad Request           |

#### 2. User Login

| Test Case   | Description                   | Expected Result   |
| ----------- | ----------------------------- | ----------------- |
| TC-LOGIN-01 | Login with valid credentials  | 200 OK, JWT token |
| TC-LOGIN-02 | Login with invalid password   | 401 Unauthorized  |
| TC-LOGIN-03 | Login with non-existent email | 401 Unauthorized  |
| TC-LOGIN-04 | Login with missing fields     | 400 Bad Request   |

#### 3. OTP Verification

| Test Case | Description             | Expected Result      |
| --------- | ----------------------- | -------------------- |
| TC-OTP-01 | Verify with valid OTP   | 200 OK, access token |
| TC-OTP-02 | Verify with invalid OTP | 403 Forbidden        |
| TC-OTP-03 | Verify with expired OTP | 403 Forbidden        |
| TC-OTP-04 | Resend OTP              | 200 OK, new OTP sent |

## Integration Tests

### Auth Controller Test

```typescript
describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await app.close();
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!',
        name: 'Test User',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.id).toBeDefined();
        expect(body.email).toBe('test@example.com');
        expect(body.password).toBeUndefined();
      });
  });
});
```

## Performance Tests

### Load Testing with k6

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 100 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  const url = 'http://localhost:3000/auth/login';
  const payload = JSON.stringify({
    email: 'test@example.com',
    password: 'Test123!',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has token': (r) => r.json('token') !== undefined,
  });

  sleep(1);
}
```

## Security Tests

### OWASP ZAP Scan

```bash
docker run -v $(pwd):/zap/wrk/:rw \
  -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000 \
  -r testreport.html \
  -x report_xml.xml
```

### Test Cases for Security

#### 1. Authentication

| Test Case      | Description            | Expected Result                 |
| -------------- | ---------------------- | ------------------------------- |
| TC-SEC-AUTH-01 | Brute force protection | Account locked after 5 attempts |
| TC-SEC-AUTH-02 | Session fixation       | Session ID changes after login  |
| TC-SEC-AUTH-03 | JWT tampering          | Invalid signature detected      |
| TC-SEC-AUTH-04 | CSRF protection        | CSRF token required             |

#### 2. Input Validation

| Test Case       | Description            | Expected Result             |
| --------------- | ---------------------- | --------------------------- |
| TC-SEC-INPUT-01 | SQL injection          | Input sanitized             |
| TC-SEC-INPUT-02 | XSS payload            | Input encoded               |
| TC-SEC-INPUT-03 | JSON injection         | Invalid JSON rejected       |
| TC-SEC-INPUT-04 | File upload validation | Only allowed types accepted |

## Test Coverage Report

### Current Coverage

```
-----------------|---------|----------|---------|---------|-------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------|---------|----------|---------|---------|-------------------
All files       |    94.5 |    88.88 |   92.85 |    94.5 |
 auth           |   100   |      100 |     100 |     100 |
  auth.module.ts |     100 |      100 |     100 |     100 |
 auth/guards    |     100 |      100 |     100 |     100 |
  jwt.guard.ts  |     100 |      100 |     100 |     100 |
  roles.guard.ts|     100 |      100 |     100 |     100 |
 auth/services  |   92.3  |    83.33 |   88.88 |    92.3 |
  auth.service.ts |   92.3  |    83.33 |   88.88 |    92.3 | 56,78-81,94-97
-----------------|---------|----------|---------|---------|-------------------
```

## Test Data Management

### Test Users

```typescript
export const testUsers = [
  {
    email: 'admin@beautysaas.com',
    password: 'AdminPass123!',
    role: 'admin',
    isVerified: true,
  },
  {
    email: 'staff@beautysaas.com',
    password: 'StaffPass123!',
    role: 'staff',
    isVerified: true,
  },
  // ... more test users
];
```

## Running Tests

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

### Coverage Report

```bash
npm run test:cov
```

### Watch Mode

```bash
npm run test:watch
```

## Test Maintenance

### Adding New Tests

1. Create test file with `.spec.ts` suffix
2. Follow existing patterns
3. Test both success and error cases
4. Include edge cases
5. Update documentation

### Updating Tests

1. Run tests before making changes
2. Update tests to match new requirements
3. Ensure all tests pass
4. Update documentation if needed

## Troubleshooting

### Common Issues

1. **Database connection issues**
   - Verify Docker containers are running
   - Check database credentials in `.env.test`
   - Run migrations

2. **Test timeouts**
   - Increase timeout in `jest.config.js`
   - Check for long-running operations

3. **Random test failures**
   - Ensure tests are isolated
   - Clean up test data after each test
   - Use unique test data

## Test Automation

### CI/CD Pipeline

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npm run db:migrate:test

      - name: Run tests
        run: npm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
```

## Test Data Privacy

- All test data is anonymized
- No production data is used in tests
- Sensitive information is masked in logs
- Test databases are isolated

## Performance Benchmarks

### Authentication Endpoints

| Endpoint      | RPS  | p95 Latency | Error Rate |
| ------------- | ---- | ----------- | ---------- |
| /auth/login   | 1200 | 180ms       | 0.1%       |
| /auth/refresh | 2000 | 120ms       | 0.05%      |
| /auth/me      | 3000 | 80ms        | 0.01%      |

### Database Queries

| Query            | Avg Time | 95th % |
| ---------------- | -------- | ------ |
| User Lookup      | 5ms      | 12ms   |
| Session Create   | 8ms      | 15ms   |
| Token Validation | 2ms      | 5ms    |

## Test Reporting

### HTML Report

```bash
npm run test:report
```

### JUnit Report

```bash
npm run test:junit
```

### Coverage Report

```bash
open coverage/lcov-report/index.html
```

## Test Maintenance

### Version Compatibility

| Module  | Version | Tested |
| ------- | ------- | ------ |
| Node.js | 18.x    | ✅     |
| NestJS  | 9.x     | ✅     |
| Jest    | 29.x    | ✅     |
| Prisma  | 4.x     | ✅     |
| Redis   | 6.x     | ✅     |

### Test Dependencies

```json
{
  "devDependencies": {
    "@nestjs/testing": "^9.0.0",
    "@types/jest": "^29.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.0.0",
    "testcontainers": "^9.0.0"
  }
}
```

## Contributing

### Writing Tests

1. Follow existing patterns
2. Keep tests focused
3. Use descriptive names
4. Test edge cases
5. Keep tests fast and isolated

### Code Review

- All tests must pass
- Minimum 90% coverage
- Follow style guide
- Document complex logic
- Include relevant test cases
