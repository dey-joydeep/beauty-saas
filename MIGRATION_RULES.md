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

- [ ] Move all custom validators to `src/common/validators/`

- [ ] Use `class-validator` decorators for all DTO validations

- [ ] Remove any remaining `*.validator.ts` files after migration

- [ ] Ensure enums are defined in shared locations when used across modules

- [ ] Add proper JSDoc comments to all DTOs

- [ ] Verify all decorators have corresponding imports

- [ ] Check for missing imports of common utilities and decorators

## 10. Code Quality Standards

- [ ] Follow consistent formatting (use Prettier)

- [ ] Maintain consistent property ordering in DTOs:
  1. Required properties
  2. Optional properties
  3. Date fields (createdAt, updatedAt)

- [ ] Use proper TypeScript types and interfaces

- [ ] Add appropriate JSDoc comments for all public methods and classes

- [ ] Ensure all imports are organized and grouped by source

## 11. Error Handling

If unsure about ANYTHING:
1. STOP immediately
2. Review the migration guide
3. Ask for clarification
4. Get explicit approval before proceeding
