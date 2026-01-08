# Script to update API URLs in all files
# Usage: .\update-api-url.ps1 "https://your-api-url.com/api"

param(
    [Parameter(Mandatory=$true)]
    [string]$NewApiUrl
)

$files = @(
    "src\store\authStore.ts",
    "src\store\protocolStore.ts",
    "src\store\profileStore.ts",
    "src\store\historyStore.ts",
    "src\screens\WorkoutDetailScreen.tsx"
)

$oldPattern = "const API_URL = '[^']*';"
$newValue = "const API_URL = '$NewApiUrl';"

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $newContent = $content -replace $oldPattern, $newValue
        Set-Content $fullPath -Value $newContent -NoNewline
        Write-Host "✓ Updated $file" -ForegroundColor Green
    } else {
        Write-Host "✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nAll API URLs updated to: $NewApiUrl" -ForegroundColor Cyan
Write-Host "Now rebuild your APK with: cd android; .\gradlew assembleRelease" -ForegroundColor Yellow
