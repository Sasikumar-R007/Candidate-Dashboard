# Database Migration - To Run Later

## Note
The database migration will be run later when databases are accessible. The code changes are ready and can be deployed.

## SQL to Run Later

When you can access the databases (via Neon web editor, Render dashboard, or when connection issues are resolved), run this SQL on both databases:

### For Dev (Neon):
```sql
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS logo TEXT;

COMMENT ON COLUMN clients.logo IS 'Company logo URL for client branding';
```

### For Staging (Render):
```sql
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS logo TEXT;

COMMENT ON COLUMN clients.logo IS 'Company logo URL for client branding';
```

## When to Run Migration

- Before deploying to production
- When databases are accessible
- Via Neon web SQL editor (recommended)
- Via Render dashboard or pgAdmin when connection works

## Verification Query

After running migration:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' AND column_name = 'logo';
```

