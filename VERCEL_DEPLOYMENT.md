# Vercel Deployment Guide

Complete guide for deploying RoomRentalUSA Frontend to Vercel.

## 📋 Prerequisites

- **Backend API deployed** (see `../backend/DEPLOYMENT.md`)
- GitHub repository: `Atiqul-Imon/roomrental-frontend`
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Backend API URL (from your backend deployment)

## 🚀 Quick Deployment (5 minutes)

### Step 1: Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select `Atiqul-Imon/roomrental-frontend`
4. Click "Import"

### Step 2: Configure Project

Vercel will auto-detect:
- **Framework Preset**: Next.js ✅
- **Root Directory**: `./` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅
- **Install Command**: `npm install` ✅

**No changes needed** - the configuration is already optimal!

### Step 3: Set Environment Variables

**⚠️ IMPORTANT: Deploy your backend first!** See `../backend/DEPLOYMENT.md` for backend deployment instructions.

Before deploying the frontend, add these environment variables:

1. Go to **Project Settings** → **Environment Variables**

2. Add the following:

   | Variable | Value | Environment |
   |----------|-------|-------------|
   | `NEXT_PUBLIC_API_URL` | `https://your-backend-api.com` | Production, Preview, Development |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` | Production |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-preview-branch.vercel.app` | Preview |
   | `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Development |

   **Important**: 
   - **You must deploy the backend first** to get the API URL
   - Replace `your-backend-api.com` with your actual backend API URL (e.g., `https://roomrental-api.railway.app`)
   - Vercel will auto-generate the site URL after first deployment
   - You can update `NEXT_PUBLIC_SITE_URL` after the first deployment
   - Make sure your backend's `CORS_ORIGIN` includes your Vercel domain

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Your site will be live! 🎉

## 🔧 Advanced Configuration

### Custom Domain

1. Go to **Project Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain

### Environment-Specific Variables

Set different values for:
- **Production**: Live site
- **Preview**: Pull request previews
- **Development**: Local development

### Build Settings

The project uses optimized build settings:
- **Node.js Version**: 18.x (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Performance Optimizations

Vercel automatically:
- ✅ Optimizes images
- ✅ Enables edge caching
- ✅ Provides CDN distribution
- ✅ Enables compression
- ✅ Provides analytics

## 📊 Monitoring

### Vercel Analytics

1. Go to **Project Settings** → **Analytics**
2. Enable Vercel Analytics (free tier available)
3. Monitor:
   - Page views
   - Performance metrics
   - Real user monitoring

### Logs

View deployment logs:
1. Go to **Deployments** tab
2. Click on any deployment
3. View build logs and runtime logs

## 🔄 Continuous Deployment

Vercel automatically deploys:
- ✅ Every push to `main` branch → Production
- ✅ Every pull request → Preview deployment
- ✅ Every commit → Preview URL

### Branch Protection

For production deployments:
1. Go to **Project Settings** → **Git**
2. Enable "Production Branch Protection"
3. Require approval for production deployments

## 🐛 Troubleshooting

### Build Fails

**Error**: `Module not found`
- **Solution**: Ensure all dependencies are in `package.json`

**Error**: `TypeScript errors`
- **Solution**: Fix TypeScript errors locally first
- Run `npm run build` locally to verify

**Error**: `Environment variable missing`
- **Solution**: Add all required environment variables in Vercel dashboard

### Runtime Errors

**Error**: `API calls failing`
- **Solution**: Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify CORS settings on backend

**Error**: `Images not loading`
- **Solution**: Verify image domains in `next.config.ts`
- Check Cloudinary/Unsplash configuration

### Performance Issues

1. Check **Analytics** → **Performance**
2. Identify slow pages
3. Optimize using:
   - Image optimization
   - Code splitting
   - Lazy loading

## 🔐 Security Checklist

- [x] Security headers configured in `vercel.json`
- [x] Environment variables set (not in code)
- [x] API keys not exposed
- [x] HTTPS enabled (automatic on Vercel)
- [x] CORS configured on backend

## 📝 Post-Deployment

After successful deployment:

1. **Update Backend CORS**:
   - Add Vercel domain to allowed origins
   - Example: `https://your-project.vercel.app`

2. **Test Production Build**:
   - Visit your Vercel URL
   - Test all major features
   - Verify API connections

3. **Set Up Custom Domain** (optional):
   - Add domain in Vercel dashboard
   - Configure DNS records
   - Update `NEXT_PUBLIC_SITE_URL`

4. **Enable Analytics**:
   - Set up Vercel Analytics
   - Configure error tracking

## 🎯 Best Practices

1. **Always test locally first**:
   ```bash
   npm run build
   npm start
   ```

2. **Use preview deployments** for testing:
   - Create a feature branch
   - Open a pull request
   - Test on preview URL

3. **Monitor deployments**:
   - Check build logs
   - Monitor error rates
   - Review performance metrics

4. **Keep dependencies updated**:
   ```bash
   npm outdated
   npm update
   ```

## 📞 Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Project Issues**: GitHub Issues

## ✅ Deployment Checklist

Before deploying:
- [ ] Code pushed to GitHub
- [ ] `npm run build` succeeds locally
- [ ] Environment variables documented
- [ ] Backend API URL available
- [ ] CORS configured on backend
- [ ] Custom domain DNS ready (if applicable)

After deploying:
- [ ] Site loads successfully
- [ ] API connections working
- [ ] Authentication working
- [ ] Images loading correctly
- [ ] Analytics enabled
- [ ] Custom domain configured (if applicable)

---

**Ready to deploy?** Follow the Quick Deployment steps above! 🚀

