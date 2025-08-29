# Changelog

All notable changes to the Authentication module will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Device fingerprinting for enhanced security
- Account activity monitoring

### Changed

- Improved token revocation mechanism
- Updated security headers

## [1.3.0] - 2025-07-16

### Added

- Device fingerprinting
- Enhanced security headers
- Improved token revocation

### Fixed

- Race condition in token refresh
- Session cleanup on logout

## [1.2.1] - 2025-06-25

### Fixed

- Race conditions in token refresh
- Rate limiting improvements

## [1.2.0] - 2025-06-15

### Added

- Audit logging
- Enhanced security monitoring
- Concurrent session management

## [1.1.0] - 2025-05-30

### Added

- Rate limiting
- Improved error handling
- Input validation

## [1.0.0] - 2025-05-15

### Added

- Initial production release
- Email/Password authentication
- Social login (Google, Facebook, Apple)
- Two-factor authentication
- Password reset flow

## Migration Guides

### Upgrading from 1.2.x to 1.3.0

1. Update dependencies:
   ```bash
   npm update @beautysaas/auth-core
   ```
2. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. Clear Redis cache:
   ```bash
   redis-cli FLUSHALL
   ```

### Deprecation Notices

- Support for Node.js 16 will be dropped in v2.0.0
- Legacy token format will be removed in v2.0.0

## Security Notices

- Critical security updates will be marked with [SECURITY] in the changelog
- Always update to the latest patch version for security fixes

## Contributing

Please see [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.
