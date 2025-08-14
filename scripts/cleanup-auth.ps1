# cleanup-auth.ps1
# Script to remove original auth files after migration

$ErrorActionPreference = "Stop"

$filesToRemove = @(
    "apps\api\src\core\auth\decorators\roles.decorator.ts",
    "apps\api\src\core\auth\guards\jwt-auth.guard.ts",
    "apps\api\src\core\auth\guards\roles.guard.ts",
    "apps\api\src\core\auth\guards\index.ts"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
        Write-Host "Removed: $file" -ForegroundColor Yellow
    } else {
        Write-Host "Not found (already removed): $file" -ForegroundColor Gray
    }
}

# Remove empty directories
$directories = @(
    "apps\api\src\core\auth\guards",
    "apps\api\src\core\auth\decorators",
    "apps\api\src\core\auth"
)

foreach ($dir in $directories) {
    if ((Test-Path $dir) -and ((Get-ChildItem -Path $dir -Recurse -Force | Measure-Object).Count -eq 0)) {
        Remove-Item -Path $dir -Force -Recurse
        Write-Host "Removed empty directory: $dir" -ForegroundColor DarkYellow
    }
}

Write-Host "\nCleanup completed. Please verify the following:" -ForegroundColor Green
Write-Host "1. All auth functionality still works as expected"
Write-Host "2. No broken imports remain in the codebase"
