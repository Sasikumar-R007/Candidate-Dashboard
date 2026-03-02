# Fix for Database Hostname Resolution Error

## Problem

The production website was experiencing database connection errors:
```
Error: getaddrinfo ENOTFOUND dpg-d6i7747kijhs73ftoor0-a
```

This error occurs when the database hostname is incomplete. The hostname `dpg-d6i7747kijhs73ftoor0-a` is missing the full domain name.

## Root Cause

Render provides database connection strings that sometimes have incomplete hostnames. The correct format should be:
```
dpg-d6i7747kijhs73ftoor0-a.singapore-postgres.render.com
```

But the environment variable was set to just:
```
dpg-d6i7747kijhs73ftoor0-a
```

## Solution Implemented

A fix has been added to automatically detect and correct incomplete Render database hostnames in two files:

1. **`server/db.ts`** - Main database connection pool
2. **`server/index.ts`** - Session pool configuration

The fix:
- Detects Render database hostnames (pattern: `dpg-xxxxx-xxxxx`)
- Automatically appends the full domain (`.singapore-postgres.render.com` by default)
- Supports different regions via `RENDER_DB_REGION` environment variable

## How It Works

The `fixRenderDatabaseUrl()` function:
1. Checks if the hostname matches the Render pattern
2. Verifies it doesn't already have a full domain
3. Appends the appropriate region domain (defaults to `singapore`)
4. Logs a warning when fixing the hostname

## Environment Variable (Optional)

If your database is in a different region, you can set:
```bash
RENDER_DB_REGION=oregon  # or 'frankfurt' or 'singapore'
```

## Next Steps

1. **Deploy the fix** - The code changes will automatically fix incomplete hostnames
2. **Verify the connection** - After deployment, the database connection should work
3. **Optional: Update Render environment variable** - You can also update the `DATABASE_URL` in Render dashboard to use the full hostname directly:
   ```
   postgresql://staffos_user:vYE0qWs62LXOPOyV6Y31ENbfzsoAh3hO@dpg-d6i7747kijhs73ftoor0-a.singapore-postgres.render.com/staffos_production
   ```

## Testing

After deployment, the admin setup page should work correctly without the `ENOTFOUND` error. The fix will automatically correct the hostname when the application starts.

