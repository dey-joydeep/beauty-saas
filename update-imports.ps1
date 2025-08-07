# Update imports from shared directory to use @beauty-saas/shared
$files = Get-ChildItem -Path "apps/bsaas-front/src/app" -Recurse -Include *.ts -File | 
    Select-String -Pattern "from ['\"].*shared/" -List | 
    Select-Object -ExpandProperty Path

foreach ($file in $files) {
    $content = Get-Content -Path $file -Raw
    
    # Update imports from shared directory to use @beauty-saas/shared
    $newContent = $content -replace "from ['\"]\.\./shared/", "from '@beauty-saas/shared/"
    $newContent = $newContent -replace "from ['\"]\.\.\/\.\./shared/", "from '@beauty-saas/shared/"
    $newContent = $newContent -replace "from ['\"]\.\.\/\.\.\/\.\./shared/", "from '@beauty-saas/shared/"
    
    # Only write if content changed
    if ($newContent -ne $content) {
        Write-Host "Updating imports in $file"
        $newContent | Set-Content -Path $file -NoNewline
    }
}

Write-Host "Import updates complete!"
