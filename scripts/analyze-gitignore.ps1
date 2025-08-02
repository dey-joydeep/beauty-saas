# Script to analyze .gitignore patterns with detailed logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage
    $script:logContent += $logMessage
}

# Initialize variables
$script:logContent = @()
$outputFile = Join-Path (Split-Path -Parent $PSScriptRoot) "tmp\gitignore-analysis-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
$gitignorePath = Join-Path (Split-Path -Parent $PSScriptRoot) '.gitignore'

# Track directories that have already been matched to avoid redundant checks
$script:matchedDirectories = @()

# Check if .gitignore exists
if (-not (Test-Path $gitignorePath)) {
    Write-Log "Error: Could not find .gitignore at: $gitignorePath" -Level "ERROR"
    exit 1
}

# Create tmp directory if it doesn't exist
$tmpDir = Join-Path (Split-Path -Parent $PSScriptRoot) "tmp"
if (-not (Test-Path $tmpDir)) {
    New-Item -ItemType Directory -Path $tmpDir | Out-Null
    Write-Log "Created directory: $tmpDir"
}

Write-Log "Starting .gitignore pattern analysis..."
Write-Log "Using .gitignore: $gitignorePath"

# Read and parse .gitignore, then sort with directory patterns first
$patterns = Get-Content $gitignorePath | 
    Where-Object { $_ -and -not $_.StartsWith('#') -and $_.Trim() -ne '' } | 
    ForEach-Object { $_.Trim() } | 
    Sort-Object { -$_.EndsWith('/') }  # Sort directories first

$results = @()
$totalPatterns = $patterns.Count
$currentPattern = 0

Write-Log "Found $totalPatterns patterns to analyze"

foreach ($pattern in $patterns) {
    $currentPattern++
    $escapedPattern = [regex]::Escape($pattern).Replace('\*', '[^/\\]*').Replace('\?', '[^/\\]')
    $escapedPattern = '^' + $escapedPattern.Replace('**', '.*').Replace('*', '[^/\\]*') + '$'
    $escapedPattern = $escapedPattern -replace '\\/', '[\\/]'
    
    Write-Log ("Analyzing pattern {0} of {1}: '{2}'" -f $currentPattern, $totalPatterns, $pattern) -Level "DEBUG"
    
    # Skip if this path is inside an already matched directory
    $isInMatchedDir = $false
    $normalizedPattern = $pattern -replace '\\', '/'
    
    foreach ($dir in $script:matchedDirectories) {
        $normalizedDir = $dir -replace '\\', '/'
        if ($normalizedPattern.StartsWith($normalizedDir) -or 
            $normalizedPattern -like "*$normalizedDir*" -or
            $normalizedPattern -like "*$normalizedDir/*") {
            $isInMatchedDir = $true
            Write-Log "  Debug: Skipping '$pattern' as it's inside already matched directory: $dir" -Level "DEBUG"
            break
        }
    }
    
    if ($isInMatchedDir) {
        $status = "SKIPPED (inside matched dir)"
        $results += "$pattern # $status"
        Write-Log "  - $result"
        continue
    }
    
    # Convert gitignore pattern to file system pattern
    $fsPattern = $pattern
    $matchingItems = $null
    
    # Handle directory patterns (ending with /)
    if ($fsPattern.EndsWith('/')) {
        $dirName = $fsPattern.TrimEnd('/')
        $exists = Test-Path -Path $dirName -PathType Container
        if ($exists) {
            $matchingItems = Get-Item -Path $dirName -Force -ErrorAction SilentlyContinue
            $script:matchedDirectories += $matchingItems.FullName
            Write-Log "  Debug: Directory pattern '$pattern' matches: $($matchingItems.FullName)" -Level "DEBUG"
        }
    }
    # Handle file patterns
    else {
        # Handle patterns starting with / (root-relative)
        if ($fsPattern.StartsWith('/')) {
            $fsPattern = $fsPattern.Substring(1)
        }
        
        # Skip if this file is inside an already matched directory
        $isFileInMatchedDir = $false
        $fullPath = Join-Path $PWD $fsPattern
        foreach ($dir in $script:matchedDirectories) {
            if ($fullPath -like "$dir*" -or $fsPattern -like "$dir*") {
                $isFileInMatchedDir = $true
                Write-Log "  Debug: Skipping file '$fsPattern' as it's inside already matched directory: $dir" -Level "DEBUG"
                break
            }
        }
        
        if (-not $isFileInMatchedDir) {
            # Handle patterns with wildcards
            if ($fsPattern -match '[?*]') {
                $matchingItems = Get-ChildItem -Path . -Recurse -Force -ErrorAction SilentlyContinue | 
                               Where-Object { 
                                   $normalizedPath = $_.FullName -replace '\\', '/'
                                   $normalizedPath -like "*$fsPattern" -and 
                                   -not ($script:matchedDirectories | Where-Object { $normalizedPath -like "$_*" })
                               } | 
                               Select-Object -First 1
            }
            # Handle exact file matches
            elseif (Test-Path -Path $fsPattern) {
                $matchingItems = Get-Item -Path $fsPattern -Force -ErrorAction SilentlyContinue
            }
        }
    }
    
    $status = if ($matchingItems) { "HIT" } else { "NO HIT" }
    $result = "$pattern # $status"
    if ($matchingItems) { $result += " (Example: $($matchingItems.FullName))" }
    
    $results += $result
    Write-Log "  - $result"
}

# Process results for markdown report
$hitPatterns = @()
$noHitPatterns = @()
$skippedPatterns = @()

foreach ($result in $results) {
    if ($result -match '# HIT') {
        $pattern = ($result -split '# HIT')[0].Trim()
        $example = ''
        if ($result -match '\(Example: ([^)]+)\)') {
            $example = $matches[1].Trim()
        }
        $hitPatterns += [PSCustomObject]@{
            Pattern = $pattern
            Example = $example
        }
    }
    elseif ($result -match '# NO HIT') {
        $noHitPatterns += ($result -split '# NO HIT')[0].Trim()
    }
    elseif ($result -match '# SKIPPED') {
        $pattern = ($result -split '# SKIPPED')[0].Trim()
        $reason = ($result -split '\(')[1] -replace '\)$'
        $skippedPatterns += [PSCustomObject]@{
            Pattern = $pattern
            Reason = $reason
        }
    }
}

# Generate markdown report with ASCII-style formatting
$report = @"
# .gitignore Analysis Report

**Generated on:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Total patterns analyzed:** $totalPatterns  
**Patterns with matches (HIT):** $($hitPatterns.Count)  
**Patterns with no matches (NO HIT):** $($noHitPatterns.Count)  
**Patterns skipped (inside matched directories):** $($skippedPatterns.Count)  

## Summary

| Status | Count |
|--------|-------|
| [HIT]  | $($hitPatterns.Count.ToString().PadLeft(6)) |
| [NO]   | $($noHitPatterns.Count.ToString().PadLeft(6)) |
| [SKIP] | $($skippedPatterns.Count.ToString().PadLeft(6)) |

## Detailed Results

### [HIT] Patterns with Matches

| Pattern | Example Path |
|---------|-------------|
$($hitPatterns | ForEach-Object { "| $($_.Pattern.PadRight(30).Substring(0, [Math]::Min(30, $_.Pattern.Length)).PadRight(30)) | $($_.Example.PadRight(40).Substring(0, [Math]::Min(40, $_.Example.Length)).PadRight(40)) |" } -join "`n")

### [NO] Patterns with No Matches

$($noHitPatterns | ForEach-Object { "- [ ] $_" } | Sort-Object | Select-Object -First 20 -join "`n")
$(if ($noHitPatterns.Count -gt 20) { "`n... and $($noHitPatterns.Count - 20) more NO HIT patterns" } else { "" })

### [SKIP] Skipped Patterns (inside matched directories)

$($skippedPatterns | ForEach-Object { "- $($_.Pattern) (inside $($_.Reason))" } -join "`n")

## Recommendations

1. **Remove Unused Patterns**: Consider removing the NO HIT patterns from your .gitignore as they don't match any files in your project.
2. **Review Skipped Patterns**: Review the SKIPPED patterns to ensure they should be ignored by parent directory patterns.
3. **Consolidate Patterns**: Look for similar patterns that could be combined.
4. **Check for Typos**: Verify that all patterns are correctly spelled and formatted.

---
*This report was generated by the .gitignore analysis script on $(hostname).*
"@

# Save results with UTF-8 encoding (no BOM)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# Save raw results
[System.IO.File]::WriteAllLines($outputFile, $results, $utf8NoBom)

# Save markdown report
[System.IO.File]::WriteAllLines("$outputFile.md", $report, $utf8NoBom)

# Save log
[System.IO.File]::WriteAllLines("$outputFile.log", $logContent, $utf8NoBom)

Write-Log "Analysis complete. Results saved to: $outputFile"
Write-Log "Detailed log saved to: $outputFile.log"

# Display summary
$hitCount = ($results | Where-Object { $_ -match '# HIT' }).Count
$noHitCount = $totalPatterns - $hitCount

Write-Log "`n=== Analysis Summary ==="
Write-Log "Total patterns: $totalPatterns"
Write-Log "Patterns with matches: $hitCount"
Write-Log "Patterns with no matches: $noHitCount"

# Display top 5 NO HIT patterns for review
if ($noHitCount -gt 0) {
    Write-Log "`nTop 5 NO HIT patterns to review:"
    $results | Where-Object { $_ -match '# NO HIT' } | Select-Object -First 5 | ForEach-Object {
        Write-Log "  - $_"
    }
}

# Display top 5 HIT patterns
if ($hitCount -gt 0) {
    Write-Log "`nTop 5 HIT patterns:"
    $results | Where-Object { $_ -match '# HIT' } | Select-Object -First 5 | ForEach-Object {
        Write-Log "  - $_"
    }
}
