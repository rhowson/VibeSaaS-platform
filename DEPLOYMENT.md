# 🚀 Vercel Deployment Guide

This guide will help you fix Vercel deployment issues and successfully deploy your SaaS platform.

## 🔧 Pre-Deployment Checklist

### 1. Environment Variables Setup

Before deploying, ensure you have all required environment variables:

```bash
# Required for production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### 2. Dependencies Check

Ensure all required dependencies are installed:

```bash
npm install @supabase/supabase-js @next-auth/supabase-adapter react-dropzone
```

## 🚀 Vercel Deployment Steps

### Step 1: Connect to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the repository: `rhowson/VibeSaaS-platform`

### Step 2: Configure Environment Variables

1. **In Vercel Dashboard**:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add each variable from `env-production.txt`

2. **Required Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   NEXTAUTH_SECRET
   NEXTAUTH_URL
   JWT_SECRET
   OPENAI_API_KEY
   ANTHROPIC_API_KEY
   ```

### Step 3: Build Configuration

The `vercel.json` file is already configured with:
- ✅ Correct build command: `npm run build`
- ✅ Node.js 18.x runtime
- ✅ Next.js framework detection
- ✅ Optimized function configuration

### Step 4: Deploy

1. **Trigger deployment**:
   - Push changes to GitHub
   - Vercel will automatically deploy
   - Or manually trigger from Vercel dashboard

2. **Monitor build logs**:
   - Check for any build errors
   - Verify environment variables are loaded

## 🔍 Common Deployment Issues & Fixes

### Issue 1: Build Failures

**Error**: `Module not found` or `Cannot resolve module`

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Issue 2: Environment Variables Not Loading

**Error**: `process.env.VARIABLE is undefined`

**Solution**:
1. Check Vercel environment variables are set
2. Ensure variable names match exactly
3. Redeploy after adding variables

### Issue 3: API Routes Not Working

**Error**: `500 Internal Server Error`

**Solution**:
1. Check Supabase connection
2. Verify API keys are correct
3. Check server logs in Vercel dashboard

### Issue 4: TypeScript Errors

**Error**: `TypeScript compilation failed`

**Solution**:
```bash
# Fix TypeScript issues locally first
npm run lint
npm run build
```

### Issue 5: Memory/Timeout Issues

**Error**: `Function execution timeout`

**Solution**:
- The `vercel.json` is configured for optimal performance
- Consider upgrading to Vercel Pro for longer timeouts

## 📊 Post-Deployment Verification

### 1. Check Application Health

Visit your deployed URL and verify:
- ✅ Homepage loads correctly
- ✅ Navigation works
- ✅ No console errors
- ✅ Responsive design

### 2. Test Core Features

- ✅ Project creation
- ✅ File upload (if Supabase storage configured)
- ✅ Authentication (if implemented)
- ✅ AI features (if API keys configured)

### 3. Monitor Performance

- Check Vercel Analytics
- Monitor Core Web Vitals
- Review function execution times

## 🔧 Advanced Configuration

### Custom Domain Setup

1. **Add domain in Vercel**:
   - Go to project settings
   - Add custom domain
   - Update DNS records

2. **Update environment variables**:
   ```
   NEXTAUTH_URL=https://your-custom-domain.com
   ```

### Environment-Specific Deployments

Create different environments:
- **Production**: Main deployment
- **Preview**: For pull requests
- **Development**: For testing

### Performance Optimization

The configuration includes:
- ✅ Bundle optimization
- ✅ Image optimization
- ✅ Static generation where possible
- ✅ Edge functions for API routes

## 🆘 Troubleshooting Commands

### Local Testing

```bash
# Test build locally
npm run build

# Test production build
npm run start

# Check for TypeScript errors
npx tsc --noEmit

# Lint code
npm run lint
```

### Vercel CLI Commands

```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

## 📈 Monitoring & Analytics

### Vercel Analytics

- Enable Vercel Analytics in project settings
- Monitor Core Web Vitals
- Track user interactions

### Error Monitoring

- Set up error tracking (Sentry, LogRocket)
- Monitor API route errors
- Track performance metrics

## 🔄 Continuous Deployment

### GitHub Integration

1. **Automatic deployments**:
   - Push to `main` branch → Production
   - Pull requests → Preview deployments

2. **Branch protection**:
   - Require status checks
   - Block force pushes
   - Require pull request reviews

### Deployment Pipeline

```yaml
# Example GitHub Actions (optional)
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🎉 Success Checklist

After deployment, verify:

- ✅ Application loads without errors
- ✅ All pages are accessible
- ✅ Environment variables are working
- ✅ Database connections are successful
- ✅ File uploads work (if configured)
- ✅ Authentication flows work (if implemented)
- ✅ AI features function (if API keys set)
- ✅ Performance is acceptable
- ✅ Mobile responsiveness works

---

**🚀 Your SaaS platform is now successfully deployed on Vercel!**
