# Fix Render Database Connection Issue

## Problem: ECONNRESET Error

The error `ECONNRESET` means the connection was reset. This happens because:

1. **Internal URL doesn't work from local machine** - Internal URLs only work from within Render's network
2. **Need External URL for local tools** - Your computer needs the External Connection String
3. **SSL/Network issues** - May need SSL parameters

---

## Solution 1: Use External Connection String (Recommended)

### Get External URL from Render:
1. Go to Render Dashboard → Your Database
2. Click **"Info"** or **"Connections"** tab
3. Look for **"External Connection String"** or **"Connection Pooling"**
4. It should look like:
   ```
   postgresql://staffos_user:password@dpg-xxxxx-a.singapore-postgres.render.com/staffos_production
   ```
   (Note the full domain with `-a.singapore-postgres.render.com`)

### Try with External URL:
```powershell
$env:DATABASE_URL="postgresql://staffos_user:vYE0qWs62LXOPOyV6Y31ENbfzsoAh3hO@dpg-d6i7747kijhs73ftoor0-a.singapore-postgres.render.com/staffos_production"
npm run db:push
```

---

## Solution 2: Add SSL Parameters

Render databases require SSL. Try adding SSL parameters:

```powershell
$env:DATABASE_URL="postgresql://staffos_user:vYE0qWs62LXOPOyV6Y31ENbfzsoAh3hO@dpg-d6i7747kijhs73ftoor0-a.singapore-postgres.render.com/staffos_production?sslmode=require"
npm run db:push
```

---

## Solution 3: Use Render's Web Interface

If local connection doesn't work:

1. **Use Render Shell** (if available):
   - Go to Render Dashboard → Your Database
   - Look for "Shell" or "Query" option
   - Run SQL directly

2. **Use Neon Web SQL Editor** (for reference):
   - This shows you can use web-based tools
   - Render might have similar option

---

## Solution 4: Update Drizzle Config for SSL

Modify `drizzle.config.ts` to handle SSL:

```typescript
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Add this for Render
  },
});
```

---

## Solution 5: Use pgAdmin or DBeaver

Instead of db:push, use a database GUI tool:

1. **Install pgAdmin or DBeaver**
2. **Connect using External Connection String**
3. **Run SQL migrations manually**

---

## Quick Test: Verify Connection String Format

Your Internal URL:
```
postgresql://staffos_user:vYE0qWs62LXOPOyV6Y31ENbfzsoAh3hO@dpg-d6i7747kijhs73ftoor0-a/staffos_production
```

**Issue:** Missing full hostname domain!

**Should be:**
```
postgresql://staffos_user:vYE0qWs62LXOPOyV6Y31ENbfzsoAh3hO@dpg-d6i7747kijhs73ftoor0-a.singapore-postgres.render.com/staffos_production
```

---

## Recommended Approach

### For Local db:push:
1. Get **External Connection String** from Render dashboard
2. It should have full domain: `dpg-xxxxx-a.singapore-postgres.render.com`
3. Use that with `npm run db:push`

### For Render Backend:
1. Use **Internal Database URL** (what you have)
2. Update in Render backend Environment tab
3. Backend will connect automatically

---

## Alternative: Run Migrations via Render

If local connection keeps failing:

1. **Update backend DATABASE_URL first** (use Internal URL)
2. **Create a migration script** that runs on backend startup
3. **Or use Render Shell** to run SQL directly

---

## Next Steps

1. ✅ Get External Connection String from Render dashboard
2. ✅ Try db:push with External URL + SSL parameter
3. ✅ If still fails, use pgAdmin/DBeaver
4. ✅ Or run migrations via Render Shell/web interface

