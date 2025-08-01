<#
.SYNOPSIS
    Generates a clean directory structure of the project.
.DESCRIPTION
    This script creates a text file containing the directory structure of the project,
    excluding node_modules directories and their contents. The output is saved to a file
    in the project root directory with a timestamp.
.NOTES
    File Name      : get-directory-structure.ps1
    Prerequisites  : PowerShell 5.1 or later
#>

param (
    # The root directory to scan (defaults to script's parent directory)
    [string]$RootPath = (Split-Path -Parent $PSScriptRoot),
    
    # Maximum depth to scan (default: 2 levels)
    [int]$MaxDepth = 2,
    
    # Output file path (default: directory-structure-{timestamp}.txt in root directory)
    [string]$OutputFile = ""
)

# Set up error handling
$ErrorActionPreference = "Stop"

# Generate output filename with timestamp if not provided
if ([string]::IsNullOrEmpty($OutputFile)) {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $OutputFile = Join-Path $RootPath "directory-structure-${timestamp}.txt"
}

# Function to get directory tree as text
function Get-DirectoryTree {
    param (
        [string]$Path,
        [string]$Indent = "",
        [int]$CurrentDepth = 0,
        [int]$MaxDepth = 2,
        [string]$Exclude = "node_modules"
    )
    
    # Skip if we've reached max depth
    if ($CurrentDepth -gt $MaxDepth) { return }
    
    try {
        # Get all items in the current directory
        $items = Get-ChildItem -Path $Path -Force -ErrorAction Stop | 
                 Where-Object { $_.Name -ne $Exclude -and $_.Name -notlike "*$Exclude*" }
        
        $output = @()
        
        foreach ($item in $items) {
            # Skip hidden files and directories
            if ($item.Name.StartsWith(".")) { continue }
            
            # Add current item to output
            $output += "$Indent$($item.Name)"
            
            # If it's a directory, recurse
            if ($item.PSIsContainer -and $CurrentDepth -lt $MaxDepth) {
                $subDir = Join-Path $Path $item.Name
                $subOutput = Get-DirectoryTree -Path $subDir -Indent "$Indent    " `
                                            -CurrentDepth ($CurrentDepth + 1) -MaxDepth $MaxDepth
                if ($subOutput) {
                    $output += $subOutput
                }
            }
        }
        
        return $output -join "`n"
    }
    catch {
        Write-Error "Error processing path '$Path': $_"
        return $null
    }
}

# Main script execution
try {
    Write-Host "Generating directory structure for: $RootPath" -ForegroundColor Cyan
    
    # Get the directory structure
    $structure = Get-DirectoryTree -Path $RootPath -MaxDepth $MaxDepth
    
    if ($structure) {
        # Add header with timestamp
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $header = @(
            "# Directory Structure",
            "# Generated: $timestamp",
            "# Path: $RootPath",
            "# Max Depth: $MaxDepth",
            "",
            $structure
        ) -join "`n"
        
        # Save to file
        $header | Out-File -FilePath $OutputFile -Encoding utf8 -Force
        
        Write-Host "Directory structure saved to: $OutputFile" -ForegroundColor Green
        Get-Item $OutputFile | Select-Object FullName, Length, LastWriteTime | Format-List
    }
    else {
        Write-Error "Failed to generate directory structure."
        exit 1
    }
}
catch {
    Write-Error "An error occurred: $_"
    exit 1
}
