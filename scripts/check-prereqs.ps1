# Enhanced Prerequisites Check Script for Nx Monorepo
# Checks system requirements and project setup

# Function to run a command and get its output
function Get-CommandOutput {
    param(
        [string]$Command,
        [string[]]$Arguments
    )
    try {
        $process = Start-Process -FilePath $Command -ArgumentList $Arguments -NoNewWindow -PassThru -RedirectStandardOutput "$env:TEMP\cmd-output.log" -RedirectStandardError "$env:TEMP\cmd-error.log"
        
        $timeout = 30 # 30 seconds timeout
        $startTime = Get-Date
        
        while (-not $process.HasExited) {
            if (((Get-Date) - $startTime).TotalSeconds -gt $timeout) {
                $process.Kill()
                return "Command timed out after $timeout seconds"
            }
            Start-Sleep -Milliseconds 100
        }
        
        $output = Get-Content "$env:TEMP\cmd-output.log" -Raw -ErrorAction SilentlyContinue
        $errorContent = Get-Content "$env:TEMP\cmd-error.log" -Raw -ErrorAction SilentlyContinue
        
        if ($process.ExitCode -ne 0 -and -not [string]::IsNullOrEmpty($errorContent)) {
            return "Error (Exit $($process.ExitCode)): $($errorContent.Trim())"
        }
        
        return $output.Trim()
    } catch {
        return "Error: $_"
    } finally {
        Remove-Item "$env:TEMP\cmd-output.log" -ErrorAction SilentlyContinue
        Remove-Item "$env:TEMP\cmd-error.log" -ErrorAction SilentlyContinue
    }
}

# Check Node.js version
# Check Node.js version
Write-Host "`n=== System Prerequisites ===" -ForegroundColor Cyan
Write-Host "`n[1/6] Checking Node.js version..." -NoNewline
$nodeVersion = Get-CommandOutput -Command "node" -Arguments @("-v")
if ($nodeVersion -match '^v(\d+)\.\d+\.\d+$') {
    $majorVersion = [int]$matches[1]
    if ($majorVersion -ge 18) {
        Write-Host " ✅ $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host " ❌ $nodeVersion (Node.js 18+ required)" -ForegroundColor Red
    }
} else {
    Write-Host " ❌ $nodeVersion (Invalid version)" -ForegroundColor Red
}

# Check npm version
Write-Host "`n[2/6] Checking npm version..." -NoNewline
$npmVersion = Get-CommandOutput -Command "npm" -Arguments @("-v")
if ($npmVersion -match "^(\d+)\.\d+\.\d+$") {
    $majorVersion = [int]$matches[1]
    if ($majorVersion -ge 9) {
        Write-Host " ✅ $npmVersion" -ForegroundColor Green
    } else {
        Write-Host " ❌ $npmVersion (npm 9+ recommended)" -ForegroundColor Yellow
    }
} else {
    Write-Host " ❌ $npmVersion (Invalid version)" -ForegroundColor Red
}

# Check Nx CLI version
Write-Host "`n[3/6] Checking Nx CLI version..." -NoNewline
$nxVersion = Get-CommandOutput -Command "npx" -Arguments @("nx", "--version")

# If that fails, try getting it from package.json
if (-not ($nxVersion -match "^\d+\.\d+\.\d+$")) {
    try {
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json -ErrorAction Stop
        $nxVersion = $packageJson.devDependencies."@nrwl/cli" -replace '[^0-9.]', ''
        if (-not $nxVersion) {
            $nxVersion = $packageJson.devDependencies."nx" -replace '[^0-9.]', ''
        }
        if ($nxVersion) {
            Write-Host " ✅ $nxVersion (from package.json)" -ForegroundColor Green
        } else {
            Write-Host " ❌ Not found in package.json" -ForegroundColor Red
        }
    } catch {
        Write-Host " ❌ Error checking package.json: $_" -ForegroundColor Red
    }
} else {
    Write-Host " ✅ $nxVersion" -ForegroundColor Green
}

# Check project structure
Write-Host "`n=== Project Structure ===" -ForegroundColor Cyan

# Check if in Nx workspace
Write-Host "`n[4/6] Checking Nx workspace..." -NoNewline
if (Test-Path "nx.json") {
    Write-Host " ✅ Nx workspace detected" -ForegroundColor Green
    
    # Check for apps directory
    $hasAppsDir = Test-Path "apps"
    Write-Host "`n[5/6] Checking apps directory..." -NoNewline
    if ($hasAppsDir) {
        $appCount = (Get-ChildItem -Path "apps" -Directory).Count
        Write-Host " ✅ Found $appCount app(s)" -ForegroundColor Green
    } else {
        Write-Host " ❌ Missing apps/ directory" -ForegroundColor Red
    }
    
    # Check for libs directory
    Write-Host "`n[6/6] Checking libs directory..." -NoNewline
    if (Test-Path "libs") {
        $libCount = (Get-ChildItem -Path "libs" -Directory -Recurse -Filter "*" -ErrorAction SilentlyContinue | Where-Object { $_.PSIsContainer }).Count
        Write-Host " ✅ Found $libCount library/ies" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  No libs/ directory found (this might be expected)" -ForegroundColor Yellow
    }
} else {
    Write-Host " ❌ Not an Nx workspace (nx.json not found)" -ForegroundColor Red
}

# Summary and recommendations
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
$issues = 0
if (-not ($nodeVersion -match '^v(1[89]|2\d)\.\d+\.\d+$')) { $issues++ }
if (-not ($npmVersion -match '^[89]|\d{2,}\.\d+\.\d+$')) { $issues++ }
if (-not (Test-Path "nx.json")) { $issues++ }
if (-not (Test-Path "apps")) { $issues++ }

if ($issues -eq 0) {
    Write-Host "`n✅ All checks passed! Your environment is ready for development." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Found $issues potential issue(s) that might need attention." -ForegroundColor Yellow
}

Write-Host "`nNext steps:"
Write-Host "1. Run 'npm install' if you haven't already"
Write-Host "2. Run 'npx nx graph' to visualize the project dependencies"
Write-Host "3. Run 'npx nx run-many --target=test --all' to run all tests" -NoNewline
