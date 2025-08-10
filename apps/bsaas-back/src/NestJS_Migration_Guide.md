
# 🔄 Migrating Modules to NestJS Standards

> 🎯 **Objective**: Migrate and align all existing modules to follow proper **NestJS** standards and folder structure.  
If any part of the code uses **ExpressJS**, refactor it into **NestJS-compatible** format.

---

## 📁 Target Folder Structure (Example: `user` module)

```
user/
├── constants/
│   └── user.constants.ts
├── controllers/
│   └── user.controller.ts
├── dto/
│   ├── create-user.dto.ts
│   ├── login-user.dto.ts
│   └── update-user.dto.ts
├── interfaces/
│   └── user-request.interface.ts
├── models/
│   ├── user-params.model.ts
│   └── user.model.ts
├── services/
│   ├── user.service.ts
│   └── user.service.spec.ts
├── test/
│   └── .keep
├── validators/
│   ├── user.validation.ts
│   └── user.validator.ts
└── user.module.ts
```

---

## ✅ Task Checklist (Ordered by Priority)

### 1. 🗂️ Folder Restructuring
- Follow the above layout to reorganize module files.
- Use **PowerShell native commands** to move files (e.g., `Move-Item`, `Remove-Item`).
- If a folder becomes empty after moving, **delete it** (except `test/.keep`).

### 2. 📦 File Relocation
- Move existing files into appropriate subfolders:
  - DTOs → `dto/`
  - Interfaces → `interfaces/`
  - Models → `models/`
  - Validators → `validators/`
  - Controllers → `controllers/`
  - Services → `services/`
  - Constants → `constants/`

### 3. 🚫 Express → ✅ NestJS
- Replace ExpressJS constructs with NestJS:
  - Replace `req`, `res` handlers with `@Req()`, `@Res()`, etc.
  - Use `@Controller`, `@Injectable`, `@Module`, `@Body`, `@Param`, etc.
  - Remove custom Express routers/middleware if redundant.

### 4. 🧪 Test Consolidation
- Search inside `__tests__/` and **move relevant test files** to `user/services/user.service.spec.ts` or `user/test/` as needed.
- Group all module-level test files under `user/test/`.

### 5. 📚 Swagger Documentation
- Add Swagger decorators where needed:
  ```ts
  @ApiTags('User')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  ```
- Use `@nestjs/swagger` to auto-generate API docs.

### 6. 🔎 Check Shared Libraries
- Look into:
  - `libs/shared` → `@shared`
  - `libs/backend` → `@backend-shared`
- If shared interfaces/validators/models are found, **import** instead of duplicating.

### 7. 🧹 Code Cleanup
- Identify and **delete empty files/folders** (except `.keep`).
- For empty but purposeful files (e.g., empty `*.validator.ts`), add minimal scaffolding:
  ```ts
  import { Injectable } from '@nestjs/common';

  @Injectable()
  export class UserValidator {
    // TODO: Implement validation logic
  }
  ```

---

## ❌ What NOT to Do

- ❌ Do **not** add new logic, types, validations, or services.
- ❌ Do **not** run or add new tests.
- ❌ Do **not** fix TypeScript errors **at this stage** – address them later in the cleanup phase.

---

## 💡 Sample PowerShell Commands

```powershell
# Move a file to its new location
Move-Item -Path .\src\create-user.dto.ts -Destination .\user\dto\

# Delete an empty folder
Remove-Item -Path .\src\old-folder -Recurse -Force

# Check for empty files
Get-ChildItem -Recurse -Filter *.ts | Where-Object { (Get-Content $_.FullName).Trim() -eq '' }

# Search and move test files
Get-ChildItem -Recurse -Include *.spec.ts | Where-Object { $_.FullName -like '*__tests__*' } |
ForEach-Object {
    Move-Item $_.FullName -Destination .\user\test\
}
```

---

## 📌 Final Review Points

- [ ] All folders and files follow the standard NestJS layout.
- [ ] Swagger decorators are applied where needed.
- [ ] Tests are grouped under `test/`.
- [ ] All ExpressJS syntax is removed.
- [ ] Empty files are populated with valid placeholders.
- [ ] No new logic or types were introduced.
- [ ] Shared files are reused from `@shared` or `@backend-shared`.

---

> 🛑 **Pause if you encounter TypeScript errors.**  
Focus on structure and alignment first — **Type fixes come later**.
