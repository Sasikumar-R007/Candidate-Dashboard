# Troubleshooting pgAdmin Connection Issues

## Issue 1: "getaddrinfo failed" Error

This error means pgAdmin cannot resolve the hostname. Here are solutions:

### Solution 1: Try Without "-pooler" in Hostname

Neon provides two connection types:
- **Pooler connection** (has "-pooler" in hostname) - for connection pooling
- **Direct connection** (no "-pooler") - direct database connection

**Try this hostname instead:**
```
ep-muddy-meadow-a1qwjjyt.ap-southeast-1.aws.neon.tech
```

(Remove "-pooler" from the hostname)

### Solution 2: Get Direct Connection String from Neon

1. Go to Neon Console: https://console.neon.tech
2. Select your project and database
3. Click on "Connection Details"
4. Look for **"Direct connection"** (not pooler)
5. Copy that hostname

### Solution 3: Check Network/Firewall

- Make sure your internet connection is working
- Check if your firewall/antivirus is blocking pgAdmin
- Try from a different network (mobile hotspot)

### Solution 4: Use IP Address (if available)

Some cloud providers show IP addresses. Check Neon console for IP.

---

## Issue 2: SSL Tab Not Visible

The SSL tab might be in a different location or hidden. Here's where to find it:

### Option 1: Check "Advanced" Tab

1. Click on the **"Advanced"** tab in the connection dialog
2. Look for SSL-related settings there
3. You might see SSL mode dropdown

### Option 2: Enable SSL in Connection String

Instead of using the SSL tab, you can add SSL parameters directly:

1. In the **"Connection"** tab, after filling in details
2. Go to **"Advanced"** tab
3. Look for any SSL-related fields

### Option 3: Use Connection String Method

If SSL tab is missing, you can connect using the full connection string:

1. In pgAdmin, try using **"Tools → Query Tool"**
2. Or use Neon's built-in SQL Editor (easier!)

---

## Alternative: Use Neon's Web SQL Editor (EASIEST!)

Since pgAdmin is having connection issues, use Neon's built-in SQL editor:

### Steps:

1. **Go to Neon Console:** https://console.neon.tech
2. **Select your project**
3. **Click on your database** (`neondb`)
4. **Click on "SQL Editor" tab** (or "Query" tab)
5. **Paste this SQL:**
   ```sql
   ALTER TABLE clients 
   ADD COLUMN IF NOT EXISTS logo TEXT;

   COMMENT ON COLUMN clients.logo IS 'Company logo URL for client branding';
   ```
6. **Click "Run" or press Ctrl+Enter**
7. **Done!** ✅

This bypasses pgAdmin entirely and works directly in your browser!

---

## For Render Database (Staging)

### Option 1: Use Render's Connection Info

1. Go to Render Dashboard: https://dashboard.render.com
2. Click on your PostgreSQL database
3. Check if there's a "Connect" or "Query" option
4. Use that to run SQL directly

### Option 2: Try Different Hostname Format

Sometimes Render databases need a different connection format. Try:

**Original:**
```
dpg-d6hbk0rh46gs73e43ov0-a.singapore-postgres.render.com
```

**Alternative (if above doesn't work):**
- Check Render dashboard for "Internal Database URL" vs "External Connection String"
- Use the one that matches your connection method

### Option 3: Use pgAdmin with Advanced Settings

1. In pgAdmin connection dialog
2. Go to **"Advanced"** tab
3. Look for SSL settings or connection parameters
4. You might need to add SSL parameters manually

---

## Quick Fix: Try These Hostnames

### For Neon Dev:
**Option 1 (Pooler - current):**
```
ep-muddy-meadow-a1qwjjyt-pooler.ap-southeast-1.aws.neon.tech
```

**Option 2 (Direct - try this):**
```
ep-muddy-meadow-a1qwjjyt.ap-southeast-1.aws.neon.tech
```

### For Render Staging:
```
dpg-d6hbk0rh46gs73e43ov0-a.singapore-postgres.render.com
```

---

## Recommended Approach

**Since pgAdmin is having issues, use the web-based SQL editors:**

1. **Neon:** Use Neon Console → SQL Editor (easiest!)
2. **Render:** Check if Render has a query interface, or use pgAdmin with Advanced tab settings

This is faster and doesn't require troubleshooting connection issues!

