# 🚨 Strict NestJS Migration Rules

## 1. Mandatory Pre-Migration Steps
- [ ] Read the ENTIRE NestJS Migration Guide before starting
- [ ] Review the target folder structure in the guide
- [ ] Understand all "What NOT to Do" items completely

## 2. File Operations (Priority #1)
- [ ] Use PowerShell commands for all file moves (`Move-Item`, `Remove-Item`)
- [ ] Move files to their exact specified subfolders (controllers/, services/, etc.)
- [ ] Delete empty folders after moving files (EXCEPT `test/.keep`)
- [ ] NEVER create duplicate files - only move existing ones

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

## 6. Shared Code
- [ ] Import from `@shared` or `@backend-shared` when possible
- [ ] NEVER duplicate shared code in multiple modules
- [ ] Verify imports after moving files

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

## 9. Error Handling
If unsure about ANYTHING:
1. STOP immediately
2. Review the migration guide
3. Ask for clarification
4. Get explicit approval before proceeding
