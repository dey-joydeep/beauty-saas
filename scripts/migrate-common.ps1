# migrate-common.ps1
# Script to safely migrate common, locales, and shared directories

$ErrorActionPreference = "Stop"

# Create target directories if they don't exist
$directories = @(
    "libs\core\src\decorators",
    "libs\core\src\filters",
    "libs\core\src\validators",
    "libs\core\src\i18n"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Green
    }
}

# Function to safely move files
function Move-IfNotExists {
    param (
        [string]$Source,
        [string]$Destination
    )
    
    if (Test-Path $Source) {
        if (Test-Path $Destination) {
            Write-Warning "Skipping (already exists): $Destination"
            return
        }
        
        $destDir = Split-Path -Parent $Destination
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        Move-Item -Path $Source -Destination $Destination -Force
        Write-Host "Moved: $Source -> $Destination" -ForegroundColor Green
    } else {
        Write-Warning "Source not found: $Source"
    }
}

# Move common files
Write-Host "`nMigrating common files..." -ForegroundColor Cyan
Move-IfNotExists "apps\api\src\common\decorators\user.decorator.ts" "libs\core\src\decorators\user.decorator.ts"
Move-IfNotExists "apps\api\src\common\filters\http-exception.filter.ts" "libs\core\src\filters\http-exception.filter.ts"
Move-IfNotExists "apps\api\src\common\validators\appointment.validators.ts" "libs\core\src\validators\appointment.validators.ts"

# Move locales
Write-Host "`nMigrating locale files..." -ForegroundColor Cyan
$locales = @("bn", "en", "jp")
foreach ($locale in $locales) {
    $source = "apps\api\src\locales\$locale\translation.json"
    $dest = "libs\core\src\i18n\$locale\translation.json"
    
    if (Test-Path $source) {
        if (Test-Path $dest) {
            Write-Warning "Skipping (already exists): $dest"
            continue
        }
        
        $destDir = "libs\core\src\i18n\$locale"
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        Move-Item -Path $source -Destination $dest -Force
        Write-Host "Moved: $source -> $dest" -ForegroundColor Green
    }
}

# Clean up empty directories
Write-Host "`nCleaning up empty directories..." -ForegroundColor Cyan
$directoriesToClean = @(
    "apps\api\src\common\decorators",
    "apps\api\src\common\filters",
    "apps\api\src\common\validators",
    "apps\api\src\common",
    "apps\api\src\locales\bn",
    "apps\api\src\locales\en",
    "apps\api\src\locales\jp",
    "apps\api\src\locales"
)

foreach ($dir in $directoriesToClean) {
    if ((Test-Path $dir) -and ((Get-ChildItem -Path $dir -Recurse -Force | Measure-Object).Count -eq 0)) {
        Remove-Item -Path $dir -Force -Recurse
        Write-Host "Removed empty directory: $dir" -ForegroundColor DarkYellow
    }
}

Write-Host "`nMigration complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update import paths in your code to use '@core/...' for core files"
Write-Host "2. Update i18n configuration to point to the new locale file locations"
Write-Host "3. Test the application to ensure everything works as expected" -ForegroundColor Green
