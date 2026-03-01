# PowerShell Script to Run Client Logo Migration
# Usage: .\run-migration.ps1

Write-Host "=== Client Logo Migration Script ===" -ForegroundColor Cyan
Write-Host ""

# Method 1: Try using DATABASE_URL from environment
if ($env:DATABASE_URL) {
    Write-Host "Found DATABASE_URL environment variable" -ForegroundColor Green
    Write-Host "Running migration using DATABASE_URL..." -ForegroundColor Yellow
    
    $sqlContent = Get-Content -Path "server\migrations\add_client_logo.sql" -Raw
    
    # Extract connection details from DATABASE_URL if needed
    # For now, we'll provide instructions
    
    Write-Host ""
    Write-Host "Please run this command manually:" -ForegroundColor Yellow
    Write-Host "psql `"$env:DATABASE_URL`" -f server\migrations\add_client_logo.sql" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "DATABASE_URL not found in environment" -ForegroundColor Yellow
    Write-Host ""
}

# Method 2: Prompt for connection details
Write-Host "=== Manual Connection Method ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please provide your database connection details:" -ForegroundColor Yellow
Write-Host ""

$dbHost = Read-Host "Database Host (e.g., localhost or your-server.com)"
$dbPort = Read-Host "Database Port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }
$dbName = Read-Host "Database Name"
$dbUser = Read-Host "Database Username"

# Secure password input
$securePassword = Read-Host "Database Password" -AsSecureString
$dbPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
)

Write-Host ""
Write-Host "Attempting to run migration..." -ForegroundColor Yellow
Write-Host ""

# Try to find psql
$psqlPath = $null
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\14\bin\psql.exe",
    "psql.exe"  # If in PATH
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path -ErrorAction SilentlyContinue) {
        $psqlPath = $path
        break
    }
    # Try if it's in PATH
    $psqlInPath = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlInPath) {
        $psqlPath = "psql"
        break
    }
}

if ($psqlPath) {
    Write-Host "Found psql at: $psqlPath" -ForegroundColor Green
    Write-Host ""
    
    # Set password as environment variable
    $env:PGPASSWORD = $dbPassword
    
    # Build command
    $migrationFile = Join-Path $PSScriptRoot "add_client_logo.sql"
    $command = "& `"$psqlPath`" -h $dbHost -p $dbPort -U $dbUser -d $dbName -f `"$migrationFile`""
    
    Write-Host "Running command:" -ForegroundColor Yellow
    Write-Host $command -ForegroundColor Gray
    Write-Host ""
    
    try {
        Invoke-Expression $command
        Write-Host ""
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
    } catch {
        Write-Host ""
        Write-Host "❌ Migration failed: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Alternative: Copy the SQL from add_client_logo.sql and run it in your database GUI tool" -ForegroundColor Yellow
    } finally {
        # Clear password from environment
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "❌ psql not found. Please use one of these options:" -ForegroundColor Red
    Write-Host ""
    Write-Host "Option 1: Install PostgreSQL client tools" -ForegroundColor Yellow
    Write-Host "Option 2: Use a database GUI tool (pgAdmin, DBeaver, Azure Data Studio)" -ForegroundColor Yellow
    Write-Host "Option 3: Copy the SQL below and run it manually:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "--- SQL to Run ---" -ForegroundColor Cyan
    Get-Content "server\migrations\add_client_logo.sql" | Write-Host
    Write-Host "--- End SQL ---" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

