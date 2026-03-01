# Test Render Database Connection

## Your Internal URL (for Render Backend):
```
postgresql://staffos_user:vYE0qWs62LXOPOyV6Y31ENbfzsoAh3hO@dpg-d6i7747kijhs73ftoor0-a/staffos_production
```

**Note:** This is missing the full domain. Should be:
```
postgresql://staffos_user:vYE0qWs62LXOPOyV6Y31ENbfzsoAh3hO@dpg-d6i7747kijhs73ftoor0-a.singapore-postgres.render.com/staffos_production
```

## Try These Commands:

### Option 1: With Full Domain + SSL
```powershell
cd Candidate-Dashboard
$env:DATABASE_URL="postgresql://staffos_user:vYE0qWs62LXOPOyV6Y31ENbfzsoAh3hO@dpg-d6i7747kijhs73ftoor0-a.singapore-postgres.render.com/staffos_production?sslmode=require"
npm run db:push
```

### Option 2: Get External URL from Render
1. Go to Render Dashboard → Your Database
2. Copy **"External Connection String"**
3. Use that instead (it should work from your computer)

### Option 3: Use Internal URL in Render Backend Only
- Internal URL is ONLY for Render services
- Don't use it for local db:push
- Update it in Render backend Environment tab
- Use External URL for local tools

