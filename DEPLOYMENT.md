# Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

### Option 1: Using Vercel Dashboard (Easiest)

1. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Visit [vercel.com](https://vercel.com)**
   - Sign up/login with GitHub
   - Click "Add New Project"
   - Import your repository
   - Click "Deploy"

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add these variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ADMIN_USERNAME=your_admin_username
     ADMIN_PASSWORD=your_admin_password
     ```

4. **Redeploy**
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment

### Option 2: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add ADMIN_USERNAME
   vercel env add ADMIN_PASSWORD
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## 🌊 Deploy to Netlify

1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Login**
   ```bash
   netlify login
   ```

3. **Initialize**
   ```bash
   netlify init
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

5. **Set Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add your Supabase credentials

---

## 🚂 Deploy to Railway

1. **Visit [railway.app](https://railway.app)**
   - Sign up/login with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Add Environment Variables**
   - Click on your project
   - Go to Variables tab
   - Add all required env vars

3. **Deploy**
   - Railway auto-deploys on push to main branch

---

## 🐳 Deploy with Docker (Self-Hosted)

1. **Create Dockerfile** (already in project root if exists)
   ```dockerfile
   FROM node:18-alpine AS base

   # Install dependencies only when needed
   FROM base AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci

   # Build the app
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   RUN npm run build

   # Production image
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production

   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static

   EXPOSE 3000
   ENV PORT 3000

   CMD ["node", "server.js"]
   ```

2. **Build & Run**
   ```bash
   docker build -t ecommerce-app .
   docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=xxx ecommerce-app
   ```

---

## 📝 Pre-Deployment Checklist

- [ ] Set up Supabase database with proper schema
- [ ] Configure environment variables
- [ ] Test admin login functionality
- [ ] Verify product images load correctly
- [ ] Test product CRUD operations
- [ ] Set up custom domain (optional)
- [ ] Configure SSL certificate (auto on Vercel/Netlify)
- [ ] Set up monitoring/analytics
- [ ] Configure error tracking (Sentry)
- [ ] Add robots.txt and sitemap

---

## 🔒 Security Considerations

1. **Never commit `.env.local` to Git**
   - Already in `.gitignore`

2. **Use strong admin credentials**
   - Change default username/password

3. **Enable Supabase Row Level Security (RLS)**
   - Review `fix-rls-policies.sql`

4. **Set up rate limiting**
   - Consider adding rate limiting middleware

5. **Use HTTPS only**
   - Enforced by default on Vercel/Netlify

---

## 📊 Post-Deployment Monitoring

### Analytics
- **Vercel Analytics** (built-in)
- **Google Analytics**
- **Plausible** (privacy-friendly)

### Error Tracking
- **Sentry**: `npm install @sentry/nextjs`
- **LogRocket**
- **Rollbar**

### Performance
- **Vercel Speed Insights**
- **Lighthouse CI**
- **WebPageTest**

---

## 🔄 CI/CD Pipeline

Vercel/Netlify automatically set up CI/CD when connected to Git:

1. **Push to branch** → Creates preview deployment
2. **Merge to main** → Deploys to production
3. **Rollback** → One-click in dashboard

---

## 💰 Cost Estimation

### Small E-commerce Site (< 10k visits/month)
- **Vercel Free**: $0
- **Supabase Free**: $0
- **Domain**: $10-15/year
- **Total**: ~$1/month

### Medium Site (50k visits/month)
- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month
- **Domain**: $10-15/year
- **Total**: ~$46/month

### Large Site (500k+ visits/month)
- **Vercel Enterprise**: $Custom
- **Supabase Pro+**: $100+/month
- **CDN**: Consider Cloudflare Pro
- **Total**: $500+/month

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
vercel --force
```

### Environment Variables Not Loading
- Check variable names match exactly
- Redeploy after adding new variables
- Use `NEXT_PUBLIC_` prefix for client-side vars

### Images Not Loading
- Verify image URLs are accessible
- Check Next.js image domains in `next.config.js`

### 404 Errors
- Ensure all files are committed to Git
- Check file paths are correct
- Verify dynamic routes work

---

## 📞 Support

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

