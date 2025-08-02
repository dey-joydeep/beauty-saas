# Function to get directory info
function Get-DirectoryInfo {
    param (
        [string]$path
    )
    
    if (-not (Test-Path $path)) {
        Write-Host "Directory does not exist: $path" -ForegroundColor Red
        return $null
    }
    
    $items = Get-ChildItem -Path $path -Recurse -File -Force
    $totalSize = ($items | Measure-Object -Property Length -Sum).Sum
    $fileCount = $items.Count
    $dirCount = (Get-ChildItem -Path $path -Recurse -Directory -Force).Count
    
    return @{
        Path = $path
        TotalSize = $totalSize
        FileCount = $fileCount
        DirectoryCount = $dirCount
        Files = $items | ForEach-Object {
            $relativePath = $_.FullName.Substring((Resolve-Path $path).Path.Length + 1)
            [PSCustomObject]@{
                RelativePath = $relativePath
                Size = $_.Length
                LastWriteTime = $_.LastWriteTime
                Checksum = (Get-FileHash -Path $_.FullName -Algorithm MD5).Hash
            }
        }
    }
}

# Paths to compare
$rootFront = "e:\workspace\beauty-saas\bsaas-front"
$appsFront = "e:\workspace\beauty-saas\apps\bsaas-front"

Write-Host "\nComparing directories:" -ForegroundColor Cyan
Write-Host "1. $rootFront"
Write-Host "2. $appsFront\n"

# Get info for both directories
Write-Host "Analyzing $rootFront..." -NoNewline
$rootInfo = Get-DirectoryInfo -path $rootFront
Write-Host " Done" -ForegroundColor Green

Write-Host "Analyzing $appsFront..." -NoNewline
$appsInfo = Get-DirectoryInfo -path $appsFront
Write-Host " Done\n" -ForegroundColor Green

# Display summary
Write-Host "=== Directory Comparison Summary ===" -ForegroundColor Cyan
Write-Host "Directory: $($rootInfo.Path)"
Write-Host "  Files: $($rootInfo.FileCount)"
Write-Host "  Directories: $($rootInfo.DirectoryCount)"
Write-Host "  Total Size: $([math]::Round($rootInfo.TotalSize/1MB, 2)) MB\n"

Write-Host "Directory: $($appsInfo.Path)"
Write-Host "  Files: $($appsInfo.FileCount)"
Write-Host "  Directories: $($appsInfo.DirectoryCount)"
Write-Host "  Total Size: $([math]::Round($appsInfo.TotalSize/1MB, 2)) MB\n"

# Compare files
$rootFiles = $rootInfo.Files | Group-Object -Property RelativePath -AsHashTable -AsString
$appsFiles = $appsInfo.Files | Group-Object -Property RelativePath -AsHashTable -AsString

# Find files only in root
$onlyInRoot = $rootInfo.Files | Where-Object { -not $appsFiles.ContainsKey($_.RelativePath) }

# Find files only in apps
$onlyInApps = $appsInfo.Files | Where-Object { -not $rootFiles.ContainsKey($_.RelativePath) }

# Find common files with differences
$commonFiles = @()
foreach ($file in $rootInfo.Files) {
    if ($appsFiles.ContainsKey($file.RelativePath)) {
        $appsFile = $appsFiles[$file.RelativePath]
        if ($file.Checksum -ne $appsFile.Checksum) {
            $commonFiles += [PSCustomObject]@{
                File = $file.RelativePath
                RootSize = $file.Size
                AppsSize = $appsFile.Size
                RootModified = $file.LastWriteTime
                AppsModified = $appsFile.LastWriteTime
                Different = $true
            }
        }
    }
}

# Display differences
if ($onlyInRoot.Count -gt 0) {
    Write-Host "\n=== Files only in $($rootInfo.Path) ===" -ForegroundColor Yellow
    $onlyInRoot | Select-Object -First 10 -Property RelativePath, @{Name='Size (KB)';Expression={[math]::Round($_.Size/1KB, 2)}}, LastWriteTime | Format-Table -AutoSize
    if ($onlyInRoot.Count -gt 10) {
        Write-Host "... and $($onlyInRoot.Count - 10) more files" -ForegroundColor Yellow
    }
}

if ($onlyInApps.Count -gt 0) {
    Write-Host "\n=== Files only in $($appsInfo.Path) ===" -ForegroundColor Yellow
    $onlyInApps | Select-Object -First 10 -Property RelativePath, @{Name='Size (KB)';Expression={[math]::Round($_.Size/1KB, 2)}}, LastWriteTime | Format-Table -AutoSize
    if ($onlyInApps.Count -gt 10) {
        Write-Host "... and $($onlyInApps.Count - 10) more files" -ForegroundColor Yellow
    }
}

if ($commonFiles.Count -gt 0) {
    Write-Host "\n=== Files with differences ===" -ForegroundColor Yellow
    $commonFiles | Select-Object -First 10 -Property File, 
        @{Name='RootSize (KB)';Expression={[math]::Round($_.RootSize/1KB, 2)}}, 
        @{Name='AppsSize (KB)';Expression={[math]::Round($_.AppsSize/1KB, 2)}},
        @{Name='SizeDiff (KB)';Expression={[math]::Round(($_.RootSize - $_.AppsSize)/1KB, 2)}},
        RootModified, AppsModified | Format-Table -AutoSize
    if ($commonFiles.Count -gt 10) {
        Write-Host "... and $($commonFiles.Count - 10) more files with differences" -ForegroundColor Yellow
    }
}

if ($onlyInRoot.Count -eq 0 -and $onlyInApps.Count -eq 0 -and $commonFiles.Count -eq 0) {
    Write-Host "\nThe directories appear to be identical." -ForegroundColor Green
}

Write-Host "\nComparison complete." -ForegroundColor Cyan
