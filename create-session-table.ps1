# PowerShell script to create session table
# This connects to your local PostgreSQL database and creates the session table

$env:PGPASSWORD = "your_password_here"  # Replace with your PostgreSQL password
$dbName = "staffos_dev"  # Replace with your database name if different

# SQL to create session table
$sql = @"
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
"@

# Write SQL to temp file
$sql | Out-File -FilePath "temp_session.sql" -Encoding utf8

Write-Host "To create the session table, run one of these:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Using psql command line:" -ForegroundColor Cyan
Write-Host "  psql -U postgres -d $dbName -f CREATE_SESSION_TABLE.sql" -ForegroundColor White
Write-Host ""
Write-Host "Option 2: Connect to database and run SQL manually:" -ForegroundColor Cyan
Write-Host "  psql -U postgres -d $dbName" -ForegroundColor White
Write-Host "  Then paste the SQL from CREATE_SESSION_TABLE.sql" -ForegroundColor White
Write-Host ""
Write-Host "Option 3: Use a database GUI tool (pgAdmin, DBeaver, etc.)" -ForegroundColor Cyan
Write-Host "  Open your database and run the SQL from CREATE_SESSION_TABLE.sql" -ForegroundColor White

