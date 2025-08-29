$ErrorActionPreference = 'Stop'
$root = 'apps/web'
$files = Get-ChildItem -Path $root -Recurse -File -Include *.ts,*.tsx

foreach ($f in $files) {
    $c = Get-Content -LiteralPath $f.FullName -Raw
    $n = $c
    # Fix import type { IPlatformUtils } from '@beauty-saas/web-config'
    $n = [regex]::Replace($n, "import\s+type\s+\{\s*IPlatformUtils\s*\}\s+from\s+'@beauty-saas/web-config'", "import type { PlatformUtils } from '@beauty-saas/web-config'")
    # Also handle double quotes just in case
    $n = [regex]::Replace($n, 'import\s+type\s+\{\s*IPlatformUtils\s*\}\s+from\s+"@beauty-saas/web-config"', 'import type { PlatformUtils } from "@beauty-saas/web-config"')
    # Replace remaining type names
    $n = [regex]::Replace($n, '\\bIPlatformUtils\\b', 'PlatformUtils')
    # Update API usages
    $n = [regex]::Replace($n, '((?:\\bthis\\.)?platformUtils)\\.window\\b', '$1.windowRef')
    $n = [regex]::Replace($n, '((?:\\bthis\\.)?platformUtils)\\.document\\b', '$1.documentRef')
    if ($n -ne $c) {
        Set-Content -LiteralPath $f.FullName -Value $n
    }
}
