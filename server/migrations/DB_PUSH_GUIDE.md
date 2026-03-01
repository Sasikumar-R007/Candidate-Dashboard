# Using db:push to Push Schema Changes

## Quick Method: Push to Both Databases

Since you already have `db:push` configured, you can push the schema changes directly from the terminal!

### Step 1: Push to Dev (Neon) Database

Your `.env` file already has the Neon database URL. Just run:

```powershell
# Make sure you're in the Candidate-Dashboard directory
cd Candidate-Dashboard

# Push schema changes to Dev (Neon)
npm run db:push
```

This will push the `logo` column to your Neon database automatically! ✅

### Step 2: Push to Staging (Render) Database

For Render, you need to temporarily change the DATABASE_URL:

```powershell
# Option 1: Set environment variable for this command only
$env:DATABASE_URL="postgresql://staffos_user:VElEYZPGVlE92wE6ekYnZqK4SmPLLUCR@dpg-d6hbk0rh46gs73e43ov0-a.singapore-postgres.render.com/staffos_staging"
npm run db:push

# Option 2: Temporarily edit .env file
# Change DATABASE_URL to Render connection string
# Run: npm run db:push
# Change it back to Neon
```

### Step 3: Verify Both Databases

After pushing, verify the column exists:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clients' AND column_name = 'logo';
```

---

## Complete Commands

### For Dev (Neon):
```powershell
cd Candidate-Dashboard

# Your .env already has Neon URL, so just run:
npm run db:push
```

### For Staging (Render):
```powershell
cd Candidate-Dashboard

# Set Render database URL temporarily
$env:DATABASE_URL="postgresql://staffos_user:VElEYZPGVlE92wE6ekYnZqK4SmPLLUCR@dpg-d6hbk0rh46gs73e43ov0-a.singapore-postgres.render.com/staffos_staging"

# Push to Render
npm run db:push

# (Optional) Reset back to Neon URL
$env:DATABASE_URL="postgresql://neondb_owner:npg_U7ZcveYr8mNq@ep-muddy-meadow-a1qwjjyt-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

---

## What db:push Does

`db:push` will:
1. ✅ Read your schema from `shared/schema.ts`
2. ✅ Compare it with the actual database
3. ✅ Add the `logo` column to the `clients` table
4. ✅ Show you what changes it's making
5. ✅ Apply the changes automatically

---

## Advantages

✅ No manual SQL needed  
✅ No pgAdmin connection issues  
✅ Works directly from terminal  
✅ Automatically syncs schema  
✅ Safe (won't drop existing data)  

---

## Troubleshooting

### Error: "DATABASE_URL not set"
- Make sure your `.env` file has DATABASE_URL
- Or set it as environment variable before running

### Error: "Connection refused"
- Check if your database is accessible
- Verify the connection string is correct
- For Render, make sure you're using the correct connection string

### Error: "SSL required"
- Drizzle should handle SSL automatically
- If not, check your connection string includes `?sslmode=require`

---

## Recommended Workflow

1. **Push to Dev first:**
   ```powershell
   npm run db:push  # Uses Neon from .env
   ```

2. **Push to Staging:**
   ```powershell
   $env:DATABASE_URL="postgresql://staffos_user:VElEYZPGVlE92wE6ekYnZqK4SmPLLUCR@dpg-d6hbk0rh46gs73e43ov0-a.singapore-postgres.render.com/staffos_staging"
   npm run db:push
   ```

3. **Verify both:**
   - Check that `logo` column exists in both databases
   - You're ready to deploy code changes!

---

## Note

Since you already updated `shared/schema.ts` with the `logo` field, `db:push` will automatically detect it and add it to both databases. This is the easiest method! 🎉

