# 🚨 Strict NestJS Migration Rules

## 1. Mandatory Pre-Migration Steps

- [ ] Read the ENTIRE NestJS Migration Guide before starting

- [ ] Review the target folder structure in the guide

- [ ] Understand all "What NOT to Do" items completely

- [ ] Verify all imports are correctly defined and used

## 2. File Operations (Priority #1)

- [ ] Use PowerShell commands for all file moves (`Move-Item`, `Remove-Item`)

- [ ] Move files to their exact specified subfolders:

  - Controllers → `controllers/`
  - Services → `services/`
  - DTOs → `dto/` (with `requests/` and `responses/` subdirectories)
  - Validators → `src/common/validators/`

- [ ] Delete empty folders after moving files (EXCEPT `test/.keep`)

- [ ] NEVER create duplicate files - only move existing ones

- [ ] Update all import paths after moving files

- [ ] When running commands, use Windows PowerShell syntax (not bash) for file operations

## 3. Code Changes (Priority #2)

- [ ] Replace Express patterns with NestJS decorators:

  - `req`, `res` → `@Req()`, `@Res()`
  - Use `@Controller`, `@Injectable`, `@Module`
  - Replace route handlers with `@Get()`, `@Post()`, etc.

- [ ] Remove all Express routers and middleware unless absolutely necessary

## 4. Test Handling (Priority #3)

- [ ] DO NOT run any tests during migration

- [ ] DO NOT add new tests

- [ ] Only move existing test files to their new locations:

  - Service tests → `services/*.spec.ts`
  - Other tests → `test/` directory

## 5. Swagger Documentation

- [ ] Add `@ApiTags()` to all controllers

- [ ] Add `@ApiOperation()` and `@ApiResponse()` to endpoints

- [ ] Use proper response DTOs with `@ApiProperty()`

## 6. Shared Code & Imports

- [ ] Import from `@shared` or `@backend-shared` when possible

- [ ] NEVER duplicate shared code in multiple modules

- [ ] Verify all imports are correct and complete after moving files

- [ ] Use absolute imports (starting with `@/` or `@module-name/`) instead of relative paths

- [ ] Move shared enums to appropriate shared locations

- [ ] Ensure all used decorators and utilities are properly imported:
  - Check for missing imports of common decorators like `@MaxLength`, `@Min`, `@Max`
  - Verify all class-validator decorators are imported from 'class-validator'
  - Ensure all Swagger decorators are imported from '@nestjs/swagger'

## 7. Strict Prohibitions

- [ ] NO new logic or functionality

- [ ] NO TypeScript error fixes

- [ ] NO test execution

- [ ] NO assumptions - follow the guide exactly

## 8. Final Verification

- [ ] All files in correct folders

- [ ] No Express patterns remain

- [ ] No empty folders (except test/.keep)

- [ ] All shared code properly imported

- [ ] All DTOs have proper validation decorators

- [ ] No duplicate enums or interfaces exist across modules

- [ ] All custom validators are in the common directory

- [ ] All API endpoints have proper Swagger documentation

- [ ] All imports are correctly defined and used

- [ ] No unused imports remain in any file

## 9. DTO and Validation Guidelines

### DTO Creation and Structure

- [ ] Create DTOs in the `dto` folder with proper validation decorators
- [ ] Follow consistent naming conventions:
  - `CreateXDto` for creation DTOs
  - `UpdateXDto` for update DTOs
  - `XResponseDto` for response DTOs
  - `XQueryDto` for query parameters
- [ ] Use `class-validator` and `class-transformer` decorators for all validations
- [ ] Organize DTO properties in this order:
  1. Required properties
  2. Optional properties
  3. Readonly properties (like IDs)
  4. Date fields (createdAt, updatedAt)

### Validation Rules

- [ ] Move all custom validators to `src/common/validators/`
- [ ] Remove any remaining `*.validator.ts` files after migration
- [ ] Use appropriate validation decorators:
  - `@IsString()`, `@IsNumber()`, `@IsBoolean()` for type validation
  - `@IsOptional()` for optional fields
  - `@IsEnum()` for enum validations
  - `@IsDateString()` for date strings
  - `@ValidateNested()` for nested objects
  - `@Type()` for proper type transformation

### Documentation

- [ ] Add proper JSDoc comments to all DTOs
- [ ] Document each property with `@ApiProperty()` including:
  - `description`: Clear description of the field
  - `required`: Whether the field is required
  - `example`: Example value
  - `enum`: For enum types
  - `type`: For proper type documentation
- [ ] Add `@ApiTags()` to all controllers
- [ ] Add `@ApiOperation()` to all endpoint methods
- [ ] Add `@ApiResponse()` for all possible responses

### Type Safety and Imports

- [ ] Use proper TypeScript types and interfaces
- [ ] Avoid using `any` type
- [ ] Use enums for fixed sets of values
- [ ] Verify all decorators have corresponding imports
- [ ] Ensure all used decorators and utilities are properly imported
- [ ] Group imports by source (external, internal)
- [ ] Use absolute imports when possible
- [ ] Remove unused imports

## 10. DTO Schema Guidelines

### Naming Conventions
- [ ] Use `CreateXDto` for creation DTOs (e.g., `CreateSalonStaffRequestDto`)
- [ ] Use `UpdateXDto` for update DTOs
- [ ] Use `XResponseDto` for response DTOs
- [ ] Use `XQueryDto` for query parameters
- [ ] Suffix with `Status` or `Type` for enums (e.g., `RequestStatus`, `RequestType`)

### Structure and Organization
- [ ] Place DTOs in the `dto` directory of each module
- [ ] Group related DTOs in the same file when appropriate
- [ ] Use inheritance for shared fields when applicable
- [ ] Keep DTOs focused on a single responsibility

### Validation Rules
- [ ] Use `class-validator` decorators for all validations
- [ ] Apply appropriate validators:
  - `@IsString()`, `@IsNumber()`, `@IsBoolean()` for type validation
  - `@IsOptional()` for optional fields
  - `@IsEnum()` for enum validations
  - `@IsDateString()` for date strings
  - `@ValidateNested()` for nested objects
  - `@Type()` for proper type transformation
- [ ] Add custom validation decorators when needed

### Documentation
- [ ] Add `@ApiProperty()` decorator for all properties
- [ ] Include `description` for all properties
- [ ] Add `example` values for better API documentation
- [ ] Mark required/optional fields with `required: true/false`
- [ ] Document enums with `enum` and `enumName`

### Example DTO Structure
```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { SomeEnum } from '@prisma/client';

export class CreateExampleDto {
  @ApiProperty({
    description: 'Description of the field',
    example: 'Example value',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Enum field example',
    enum: SomeEnum,
    example: SomeEnum.VALUE,
  })
  @IsEnum(SomeEnum)
  @IsNotEmpty()
  type: SomeEnum;

  @ApiProperty({
    description: 'Optional date field',
    required: false,
    type: Date,
  })
  @IsDateString()
  @IsOptional()
  someDate?: Date;
}
```

## 11. Module and Code Organization

### Module Structure

- [ ] Each module should have its own folder with a clear structure:

  ```text
  module-name/
  ├── controllers/
  ├── services/
  ├── dto/
  │   ├── requests/
  │   └── responses/
  ├── interfaces/
  └── module.ts
  ```

- [ ] Keep controllers thin (delegate business logic to services)
- [ ] Services should contain the business logic
- [ ] DTOs should handle input validation and data transfer
- [ ] Use proper NestJS module organization with `@Module()` decorator

### Code Quality Standards

- [ ] Follow consistent formatting (use Prettier)
- [ ] Use meaningful and consistent naming conventions
- [ ] Keep functions and methods focused and small
- [ ] Avoid deep nesting of control structures
- [ ] Use early returns when possible
- [ ] Follow the Single Responsibility Principle

### Documentation

- [ ] Add JSDoc comments to all public methods and classes
- [ ] Document complex logic with inline comments
- [ ] Include examples in Swagger documentation
- [ ] Document error cases and possible exceptions

### Error Handling

- [ ] Use NestJS built-in exception filters
- [ ] Create custom exceptions when needed
- [ ] Provide meaningful error messages
- [ ] Use appropriate HTTP status codes
- [ ] Log errors appropriately
- [ ] Handle both expected and unexpected errors

## 11. Testing and Verification

### Test Organization

- [ ] Move existing test files to the appropriate test directory
- [ ] Update test imports after moving files
- [ ] Ensure tests follow the same structure as the codebase
- [ ] Group related tests with `describe` blocks
- [ ] Use clear and descriptive test names
- [ ] Follow the Arrange-Act-Assert pattern

### Test Data

- [ ] Use test factories or builders for creating test data
- [ ] Keep test data close to the tests that use it
- [ ] Use meaningful test data values
- [ ] Consider using faker libraries for generating test data

### Test Coverage

- [ ] Ensure all public methods are tested
- [ ] Test both happy paths and error cases
- [ ] Test edge cases and boundary conditions
- [ ] Test validation rules
- [ ] Test error handling

### Final Verification

- [ ] Verify all files are in the correct folders
- [ ] Ensure no Express patterns remain
- [ ] Check for any empty folders (except test/.keep)
- [ ] Verify all shared code is properly imported
- [ ] Ensure all DTOs have proper validation decorators
- [ ] Check for any duplicate enums or interfaces
- [ ] Verify all custom validators are in the common directory
- [ ] Ensure all API endpoints have proper Swagger documentation
- [ ] Check that all imports are correctly defined and used
- [ ] Remove any unused imports

## 12. Migration-Specific Guidelines

### Controller Migration
- [ ] Convert Express route handlers to NestJS controller methods
- [ ] Use appropriate decorators (`@Get()`, `@Post()`, etc.)
- [ ] Replace `req` and `res` with decorators (`@Req()`, `@Res()`, `@Body()`, `@Param()`, etc.)
- [ ] Implement proper error handling with NestJS exceptions
- [ ] Add Swagger decorators for API documentation

### Service Migration
- [ ] Move business logic from route handlers to service methods
- [ ] Use dependency injection for services and repositories
- [ ] Implement proper error handling and logging
- [ ] Ensure all database operations use the Prisma client

### DTO Migration
- [ ] Create DTOs for all request/response objects
- [ ] Use `class-validator` for input validation
- [ ] Add proper TypeScript types and interfaces
- [ ] Document DTOs with JSDoc comments

### Module Organization
- [ ] Organize code into proper NestJS modules
- [ ] Set up proper imports and exports
- [ ] Configure global pipes and filters
- [ ] Set up proper dependency injection

## 13. Post-Migration Verification

### Code Review
- [ ] Verify all Express patterns have been removed
- [ ] Check for proper use of NestJS decorators
- [ ] Ensure all routes are properly documented
- [ ] Verify error handling is consistent

### Testing
- [ ] Update existing tests to work with the new NestJS structure
- [ ] Add tests for new functionality
- [ ] Test error cases and edge conditions
- [ ] Verify all tests pass

## 14. When in Doubt

If unsure about ANYTHING:

1. STOP immediately
2. Review the migration guide
3. Check existing patterns in the codebase
4. Ask for clarification
5. Get explicit approval before proceeding
