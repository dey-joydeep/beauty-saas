# migrate-auth.ps1
# Script to migrate auth module to new Nx structure

$ErrorActionPreference = "Stop"

# Create necessary directories
$directories = @(
    "libs\core\auth\src\decorators",
    "libs\core\auth\src\guards"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir"
    } else {
        Write-Host "Directory already exists: $dir"
    }
}

# Move files
$filesToMove = @{
    "apps\api\src\core\auth\decorators\roles.decorator.ts" = "libs\core\auth\src\decorators\roles.decorator.ts"
    "apps\api\src\core\auth\guards\jwt-auth.guard.ts" = "libs\core\auth\src\guards\jwt-auth.guard.ts"
    "apps\api\src\core\auth\guards\roles.guard.ts" = "libs\core\auth\src\guards\roles.guard.ts"
    "apps\api\src\core\auth\guards\index.ts" = "libs\core\auth\src\guards\index.ts"
}

foreach ($src in $filesToMove.Keys) {
    $dst = $filesToMove[$src]
    
    if (Test-Path $src) {
        if (Test-Path $dst) {
            Write-Warning "Skipped (already exists): $src -> $dst"
        } else {
            Move-Item -Path $src -Destination $dst -Force
            Write-Host "Moved: $src -> $dst" -ForegroundColor Green
        }
    } else {
        Write-Warning "Source file not found: $src"
    }
}

# Create/update index.ts in auth module
$authIndex = @"
// Core Auth Module
export * from './decorators';
export * from './guards';
"@

Set-Content -Path "libs\core\auth\src\index.ts" -Value $authIndex
Write-Host "Updated auth module index.ts"

Write-Host "`nMigration completed. Please verify the following:"
Write-Host "1. Check the files in libs/core/auth/src/"
Write-Host "2. Update any import paths in your application"
Write-Host "3. Run tests to ensure everything works as expected"

# Open the destination directory in File Explorer
explorer "libs\core\auth\src"
