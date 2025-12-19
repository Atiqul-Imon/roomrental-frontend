# Vercel Environment Variables Guide

## Required Environment Variables for Frontend

### 1. **NEXT_PUBLIC_API_URL** ⭐ REQUIRED

**Value:**
```
https://roomrentalapi.pixelforgebd.com
```

**Description:**
- Your backend API URL
- Used by the frontend to make API requests
- Must be accessible from the browser (HTTPS)

**Apply to:** Production, Preview, Development

---

### 2. **NEXT_PUBLIC_SITE_URL** ⭐ REQUIRED

**Value (Production):**
```
https://your-frontend-domain.vercel.app
```
Or your custom domain:
```
https://yourdomain.com
```

**Description:**
- Your frontend URL
- Used for metadata, sitemap, robots.txt
- Used for redirects and canonical URLs

**Apply to:** Production, Preview, Development

**Note:** After first deployment, Vercel will provide your URL. Update this value after deployment.

---

## Optional Environment Variables

### 3. **NEXT_PUBLIC_GOOGLE_VERIFICATION** (Optional)

**Value:**
```
Your Google Search Console verification code
```

**Description:**
- Google Search Console verification meta tag
- Only needed if you want to verify your site with Google

**Apply to:** Production

---

## How to Add Environment Variables in Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. Go to your project on Vercel: https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://roomrentalapi.pixelforgebd.com`
   - Environment: Select **Production**, **Preview**, and **Development**

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://your-frontend-domain.vercel.app` (update after first deploy)
   - Environment: Select **Production**, **Preview**, and **Development**

6. Click **Save**

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to frontend directory
cd frontend

# Add environment variables
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://roomrentalapi.pixelforgebd.com
# Select: Production, Preview, Development

vercel env add NEXT_PUBLIC_SITE_URL
# Enter: https://your-frontend-domain.vercel.app
# Select: Production, Preview, Development
```

---

## Quick Setup Checklist

- [ ] Deploy frontend to Vercel (first deployment)
- [ ] Get your Vercel deployment URL
- [ ] Add `NEXT_PUBLIC_API_URL` = `https://roomrentalapi.pixelforgebd.com`
- [ ] Add `NEXT_PUBLIC_SITE_URL` = `https://your-vercel-url.vercel.app`
- [ ] Update backend CORS to include your Vercel URL (if needed)
- [ ] Redeploy frontend to apply environment variables

---

## Example Values

### Production Environment
```env
NEXT_PUBLIC_API_URL=https://roomrentalapi.pixelforgebd.com
NEXT_PUBLIC_SITE_URL=https://roomrental-usa.vercel.app
```

### Preview Environment (for branches)
```env
NEXT_PUBLIC_API_URL=https://roomrentalapi.pixelforgebd.com
NEXT_PUBLIC_SITE_URL=https://roomrental-usa-git-main.vercel.app
```

### Development Environment
```env
NEXT_PUBLIC_API_URL=https://roomrentalapi.pixelforgebd.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Important Notes

1. **All `NEXT_PUBLIC_*` variables are exposed to the browser** - Never put secrets here
2. **After adding/updating environment variables, you must redeploy** for changes to take effect
3. **Use HTTPS URLs** for production (your backend already has HTTPS)
4. **Update CORS on backend** if you add a custom domain to frontend

---

## Update Backend CORS (If Needed)

If you deploy frontend to a custom domain, update backend CORS:

```bash
ssh root@45.55.213.28
cd /opt/roomrental-backend
nano .env

# Update CORS_ORIGIN to include your frontend domain:
CORS_ORIGIN=https://your-frontend-domain.com,https://roomrentalapi.pixelforgebd.com,http://localhost:3000

# Restart container
docker restart roomrental-api
```

---

## Verification

After deployment, verify environment variables are working:

1. Check browser console - no CORS errors
2. Test API calls - should connect to your backend
3. Check network tab - requests should go to `https://roomrentalapi.pixelforgebd.com`

---

**Ready to deploy?** Follow the deployment guide in `VERCEL_DEPLOYMENT.md`

