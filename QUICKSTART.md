# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up Supabase (Choose One)

#### Option A: Use Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings > API and copy:
   - Project URL
   - anon/public key
4. Copy `.env.local.example` to `.env.local`
5. Add your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
   ```
6. Go to SQL Editor in Supabase dashboard
7. Copy and paste the contents of `supabase-setup.sql`
8. Run the SQL script

#### Option B: Development Mode (No Database)

The app will use mock data if Supabase is not configured, so you can test the UI immediately!

### Step 3: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 What's Included

✅ **Next.js 14** - Latest framework with App Router
✅ **Ant Design 5** - Professional UI components
✅ **Supabase** - Free tier PostgreSQL database
✅ **TypeScript** - Type-safe development
✅ **React Query** - Smart data fetching & caching
✅ **Image Optimization** - Automatic with Next.js
✅ **Atomic Design** - Clean, maintainable components

## 🎨 Features

- **Search Products** - Real-time search with instant results
- **Filter Products** - By delivery, seller, location, etc.
- **Sort Products** - By price, rating, reviews, relevance
- **Responsive Design** - Works on mobile, tablet, desktop
- **Fast Loading** - Optimized images and code splitting
- **Mock Data Mode** - Works without database for testing

## 🔧 Development Tips

### Adding New Products

Add products directly in Supabase dashboard or use the SQL editor:

```sql
INSERT INTO products (name, description, price, image_url, rating, review_count, category)
VALUES ('Product Name', 'Description', 1000.00, 'https://image-url.com/image.jpg', 4.5, 100, 'jewelry');
```

### Customizing Styles

- Component styles: Check `components/*/ComponentName.module.css`
- Global styles: Edit `app/globals.css`
- Theme colors: Modify `app/layout.tsx` ConfigProvider theme

### Adding New Filters

1. Update `ProductFilters` interface in `lib/supabase.ts`
2. Add filter button in `components/organisms/FilterBar/FilterBar.tsx`
3. Update query logic in `lib/queries.ts`

## 🚢 Deployment

### Vercel (Easiest)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

Works with any platform supporting Next.js:

- Netlify
- AWS Amplify
- Digital Ocean App Platform
- Your own server

## 💰 Supabase Pricing

**Free Tier Includes:**

- 500 MB database
- 1 GB file storage
- 2 GB bandwidth
- Perfect for small to medium e-commerce stores

**Paid Plans Start at:**

- $25/month for Pro plan
- Scales automatically with your business

## 🐛 Troubleshooting

### Images Not Loading

- Check `next.config.js` for allowed image domains
- Ensure image URLs are valid and accessible

### Database Connection Issues

- Verify `.env.local` has correct credentials
- Check Supabase project is active
- Ensure RLS policies allow read access

### Type Errors

- Run `npm install` to ensure all dependencies are installed
- Check TypeScript version matches package.json

## 📚 Next Steps

1. **Add Product Detail Page** - Create `/products/[id]` route
2. **Shopping Cart** - Implement cart functionality
3. **User Authentication** - Add Supabase Auth
4. **Payment Integration** - Add Stripe or similar
5. **Admin Dashboard** - Build product management UI

Enjoy building! 🎉
