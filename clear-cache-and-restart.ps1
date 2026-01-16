# Clear Vite Cache and Restart Script
Write-Host "Clearing Vite cache and node_modules/.vite..." -ForegroundColor Yellow

# Navigate to project directory
$projectPath = "C:\Users\sasir\OneDrive\Documents\Sasikumar R\StaffOS NEW\Candidate-Dashboard"
Set-Location $projectPath

# Clear Vite cache
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
    Write-Host "✓ Cleared node_modules/.vite" -ForegroundColor Green
} else {
    Write-Host "✓ No Vite cache found" -ForegroundColor Green
}

# Clear dist folder
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✓ Cleared dist folder" -ForegroundColor Green
}

# Clear any .vite folders in client
if (Test-Path "client\node_modules\.vite") {
    Remove-Item -Recurse -Force "client\node_modules\.vite"
    Write-Host "✓ Cleared client node_modules/.vite" -ForegroundColor Green
}

Write-Host "`nCache cleared! Now restart your dev server with: npm run dev" -ForegroundColor Cyan

