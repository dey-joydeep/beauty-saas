# consolidate-auth.ps1
# Script to consolidate duplicate auth directories in core

$ErrorActionPreference = "Stop"

# Source and destination paths
$sourceAuth = "libs\core\auth\src"
$destAuth = "libs\core\src\auth"

# Create destination directory if it doesn't exist
if (-not (Test-Path $destAuth)) {
    New-Item -ItemType Directory -Path $destAuth -Force | Out-Null
    Write-Host "Created directory: $destAuth" -ForegroundColor Green
}

# Function to safely move files and directories
function Move-IfNotExists {
    param (
        [string]$Source,
        [string]$Destination
    )
    
    if (Test-Path $Source) {
        $item = Get-Item $Source
        $destPath = Join-Path $Destination $item.Name
        
        if (Test-Path $destPath) {
            Write-Warning "Skipping (already exists): $destPath"
            return
        }
        
        if ($item.PSIsContainer) {
            # For directories, create in destination and move contents
            $newDir = New-Item -ItemType Directory -Path $destPath -Force
            Get-ChildItem -Path $Source -Force | ForEach-Object {
                $itemDest = Join-Path $newDir.FullName $_.Name
                Move-Item -Path $_.FullName -Destination $itemDest -Force
                Write-Host "Moved: $($_.FullName) -> $itemDest" -ForegroundColor Green
            }
        } else {
            # For files, just move them
            Move-Item -Path $Source -Destination $destPath -Force
            Write-Host "Moved: $Source -> $destPath" -ForegroundColor Green
        }
    } else {
        Write-Warning "Source not found: $Source"
    }
}

# Move contents from source to destination
Write-Host "`nConsolidating auth directories..." -ForegroundColor Cyan
Get-ChildItem -Path $sourceAuth -Force | ForEach-Object {
    Move-IfNotExists -Source $_.FullName -Destination $destAuth
}

# Clean up empty source directory
if ((Test-Path $sourceAuth) -and ((Get-ChildItem -Path $sourceAuth -Recurse -Force | Measure-Object).Count -eq 0)) {
    Remove-Item -Path $sourceAuth -Recurse -Force
    Write-Host "Removed empty directory: $sourceAuth" -ForegroundColor DarkYellow
}

# Remove the now-empty auth directory if it exists
$authDir = Split-Path -Parent $sourceAuth
if ((Test-Path $authDir) -and ((Get-ChildItem -Path $authDir -Recurse -Force | Measure-Object).Count -eq 0)) {
    Remove-Item -Path $authDir -Recurse -Force
    Write-Host "Removed empty directory: $authDir" -ForegroundColor DarkYellow
}

Write-Host "`nAuth directory consolidation complete!" -ForegroundColor Green
Write-Host "Please review the changes and test your application." -ForegroundColor Yellow
