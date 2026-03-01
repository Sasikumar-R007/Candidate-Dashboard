# 🌐 Custom Domain Setup Guide
## Adding Your Namecheap Domain to Vercel

This guide will walk you through adding your custom domain from Namecheap to your Vercel project.

---

## 📋 Prerequisites

- ✅ Domain purchased from Namecheap
- ✅ Vercel project already deployed
- ✅ Access to Namecheap account
- ✅ Access to Vercel dashboard

---

## 🚀 Step-by-Step Instructions

### Step 1: Add Domain in Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your project (Candidate-Dashboard)

2. **Navigate to Domain Settings**
   - Click on your project
   - Go to **Settings** → **Domains**
   - Click **Add Domain** button

3. **Enter Your Domain**
   - Enter your domain (e.g., `yourdomain.com` or `www.yourdomain.com`)
   - Click **Add**

4. **Choose Domain Type**
   - **Apex Domain** (e.g., `yourdomain.com`): Use for root domain
   - **Subdomain** (e.g., `www.yourdomain.com`): Use for www or other subdomains

5. **Vercel Will Show DNS Configuration**
   - Vercel will display the DNS records you need to add
   - **Save these values** - you'll need them for Namecheap

---

### Step 2: Configure DNS in Namecheap

#### Option A: Adding Apex Domain (yourdomain.com)

1. **Log in to Namecheap**
   - Go to [namecheap.com](https://www.namecheap.com)
   - Sign in to your account

2. **Access Domain List**
   - Click **Domain List** from the left sidebar
   - Find your domain and click **Manage**

3. **Go to Advanced DNS**
   - Click on **Advanced DNS** tab
   - Scroll down to **Host Records** section

4. **Add A Record for Apex Domain**
   - Click **Add New Record**
   - Select **A Record**
   - **Host**: `@` (or leave blank, depending on Namecheap interface)
   - **Value**: Copy the IP address from Vercel (usually starts with `76.76.21.` or similar)
   - **TTL**: `Automatic` (or `600` seconds)
   - Click **Save** (checkmark icon)

5. **Add CNAME for www (Optional but Recommended)**
   - Click **Add New Record**
   - Select **CNAME Record**
   - **Host**: `www`
   - **Value**: `cname.vercel-dns.com` (or the CNAME value shown in Vercel)
   - **TTL**: `Automatic` (or `600` seconds)
   - Click **Save**

#### Option B: Adding Subdomain (www.yourdomain.com or app.yourdomain.com)

1. **Follow Steps 1-3 from Option A**

2. **Add CNAME Record**
   - Click **Add New Record**
   - Select **CNAME Record**
   - **Host**: `www` (or your subdomain like `app`, `staging`, etc.)
   - **Value**: `cname.vercel-dns.com` (or the exact CNAME value from Vercel)
   - **TTL**: `Automatic` (or `600` seconds)
   - Click **Save**

---

### Step 3: Wait for DNS Propagation

1. **DNS Propagation Time**
   - Usually takes **5 minutes to 48 hours**
   - Typically completes within **15-30 minutes**
   - You can check status in Vercel dashboard

2. **Check Status in Vercel**
   - Go back to Vercel → Settings → Domains
   - You'll see the domain status:
     - 🟡 **Pending**: DNS is propagating
     - 🟢 **Valid**: Domain is active and working
     - 🔴 **Invalid**: DNS configuration issue

3. **Verify DNS Propagation**
   - Use online tools like:
     - [whatsmydns.net](https://www.whatsmydns.net)
     - [dnschecker.org](https://dnschecker.org)
   - Enter your domain and check if A/CNAME records are propagated

---

### Step 4: Update Environment Variables

After your domain is active, you need to update environment variables:

#### Update Vercel Environment Variables

**No changes needed** - Vercel automatically uses your custom domain.

#### Update Render Backend Environment Variables

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Select your backend service

2. **Update FRONTEND_URL**
   - Go to **Environment** tab
   - Find `FRONTEND_URL` variable
   - Update it to your new custom domain:
     ```
     FRONTEND_URL=https://yourdomain.com
     ```
     or
     ```
     FRONTEND_URL=https://www.yourdomain.com
     ```
   - **Important**: Use `https://` and NO trailing slash
   - Click **Save Changes** (this will trigger a redeploy)

3. **Verify CORS Configuration**
   - Your backend CORS is configured to allow requests from `FRONTEND_URL`
   - After updating, CORS will automatically allow your custom domain

---

### Step 5: Update Google OAuth (If Using)

If you're using Google OAuth, update the authorized redirect URI:

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)
   - Navigate to **APIs & Services** → **Credentials**

2. **Edit OAuth 2.0 Client**
   - Find your OAuth client ID
   - Click **Edit**

3. **Update Authorized Redirect URIs**
   - Add your new domain:
     ```
     https://yourdomain.com/api/auth/google/callback
     ```
   - Or if using www:
     ```
     https://www.yourdomain.com/api/auth/google/callback
     ```
   - Click **Save**

4. **Update Environment Variable in Render**
   - Update `GOOGLE_CALLBACK_URL` in Render:
     ```
     GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
     ```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Domain is showing as **Valid** in Vercel dashboard
- [ ] You can access your site at `https://yourdomain.com`
- [ ] HTTPS is working (SSL certificate is active)
- [ ] `FRONTEND_URL` updated in Render backend
- [ ] Backend CORS allows your custom domain
- [ ] Google OAuth updated (if applicable)
- [ ] All features work correctly on custom domain

---

## 🔍 Troubleshooting

### Domain Shows as "Invalid" in Vercel

**Possible Causes:**
1. DNS records not propagated yet (wait 15-30 minutes)
2. Incorrect DNS values entered
3. Wrong record type (A vs CNAME)

**Solutions:**
- Double-check DNS values in Namecheap match Vercel's requirements
- Verify DNS propagation using [whatsmydns.net](https://www.whatsmydns.net)
- Ensure TTL is set correctly
- Wait longer for propagation (can take up to 48 hours)

### Site Not Loading After DNS Setup

**Check:**
1. DNS propagation status
2. Vercel domain status (should be "Valid")
3. Browser cache (try incognito mode)
4. SSL certificate status in Vercel

**Solutions:**
- Clear browser cache
- Try accessing from different network/device
- Check Vercel deployment logs
- Verify domain is assigned to correct project

### CORS Errors After Domain Change

**Cause:** Backend `FRONTEND_URL` not updated

**Solution:**
1. Update `FRONTEND_URL` in Render to your new domain
2. Save changes (triggers redeploy)
3. Wait for redeploy to complete
4. Test again

### SSL Certificate Issues

**Vercel automatically provisions SSL certificates**, but if you see issues:

1. Check domain status in Vercel (should be "Valid")
2. Wait for SSL certificate provisioning (usually automatic)
3. If issues persist, contact Vercel support

---

## 📝 DNS Record Reference

### For Apex Domain (yourdomain.com)

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | `@` | `76.76.21.21` (from Vercel) | Automatic |
| CNAME | `www` | `cname.vercel-dns.com` | Automatic |

### For Subdomain (www.yourdomain.com)

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | `www` | `cname.vercel-dns.com` | Automatic |

**Note:** Actual values will be shown in Vercel dashboard when you add the domain.

---

## 🔐 SSL Certificate

- ✅ Vercel automatically provisions SSL certificates via Let's Encrypt
- ✅ SSL is enabled by default for all custom domains
- ✅ Certificate renewal is automatic
- ✅ No additional configuration needed

---

## 🌍 Multiple Domains

You can add multiple domains to the same Vercel project:

1. **Primary Domain**: `yourdomain.com`
2. **WWW Domain**: `www.yourdomain.com`
3. **Subdomains**: `app.yourdomain.com`, `staging.yourdomain.com`, etc.

**To add multiple:**
- Repeat the process for each domain
- All domains will point to the same deployment
- Each gets its own SSL certificate

---

## 📚 Additional Resources

- [Vercel Custom Domains Documentation](https://vercel.com/docs/concepts/projects/domains)
- [Namecheap DNS Management Guide](https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain/)
- [Vercel DNS Troubleshooting](https://vercel.com/docs/concepts/projects/domains/troubleshooting)

---

## ⚠️ Important Notes

1. **DNS Propagation**: Can take up to 48 hours, but usually completes in 15-30 minutes
2. **HTTPS**: Vercel automatically enables HTTPS - no additional setup needed
3. **Backend URL**: Remember to update `FRONTEND_URL` in Render after adding domain
4. **OAuth**: Update Google OAuth redirect URIs if using social login
5. **Testing**: Test all features after domain change to ensure everything works

---

## 🎯 Quick Summary

1. ✅ Add domain in Vercel → Settings → Domains
2. ✅ Copy DNS values from Vercel
3. ✅ Add DNS records in Namecheap → Advanced DNS
4. ✅ Wait for DNS propagation (15-30 minutes)
5. ✅ Update `FRONTEND_URL` in Render backend
6. ✅ Update Google OAuth (if applicable)
7. ✅ Test your site on custom domain

---

**Last Updated**: 2024  
**Maintained By**: Development Team





