# the akik city

A modern, high-performance e-commerce application for authentic Yemeni agate jewelry and gemstones, built with Next.js 14, Ant Design, and Supabase, following Atomic Design principles.

## Features

- ⚡ **Fast Loading**: Optimized with Next.js Image component, code splitting, and efficient data fetching
- 🎨 **Atomic Design**: Clean, maintainable component architecture
- 🔍 **Advanced Search**: Real-time product search with filters
- 📱 **Responsive Design**: Works seamlessly on all devices
- 🖼️ **Image Optimization**: Automatic image optimization with Next.js
- 🛒 **E-Commerce Ready**: Product grid, filters, sorting, and more

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: Ant Design 5
- **Database**: Supabase (PostgreSQL)
- **State Management**: TanStack Query (React Query)
- **Language**: TypeScript
- **Styling**: CSS Modules

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier available)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up Supabase:

   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from Settings > API
   - Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

3. Add your Supabase credentials to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Create the products table in Supabase:

Run this SQL in the Supabase SQL Editor:

```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount INTEGER,
  image_url TEXT NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  free_delivery BOOLEAN DEFAULT false,
  star_seller BOOLEAN DEFAULT false,
  dispatched_from TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional, adjust as needed)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);
```

5. Insert sample data (optional):

```sql
INSERT INTO products (name, description, price, original_price, discount, image_url, rating, review_count, free_delivery, star_seller, dispatched_from, category) VALUES
('Dark Brown Yemeni Aqeeq Ring', 'Handcrafted silver ring with genuine Aqeeq stone', 9580.00, 21290.00, 55, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', 4.8, 470, true, true, 'India', 'jewelry'),
('Natural Yemeni Aqeeq Agate Cabochon', 'Premium quality loose Aqeeq stones', 1454.00, NULL, NULL, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', 5.0, 5, false, false, 'India', 'stones'),
('Oval Red Aqeeq Men Ring', 'Silver handmade jewelry for men', 11063.00, NULL, NULL, 'https://images.unsplash.com/photo-1596944924616-7b38e7cf8f77?w=400', 4.9, 723, true, true, 'India', 'jewelry'),
('Aqeeq Stone Ring For Men', 'Real Aqeeq ring with Islamic design', 7199.00, 15999.00, 55, 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400', 4.8, 470, false, true, 'India', 'jewelry');
```

6. Run the development server:

```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ecommerce-app/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home/search results page
│   └── globals.css         # Global styles
├── components/
│   ├── atoms/              # Basic building blocks
│   │   ├── Button/
│   │   ├── Rating/
│   │   └── Badge/
│   ├── molecules/          # Simple component combinations
│   │   ├── ProductCard/
│   │   ├── SearchBar/
│   │   └── FilterButton/
│   └── organisms/          # Complex components
│       ├── Header/
│       ├── ProductGrid/
│       └── FilterBar/
├── lib/
│   ├── supabase.ts         # Supabase client & types
│   └── queries.ts          # Data fetching functions
└── public/                 # Static assets
```

## Features Explained

### Atomic Design Principles

- **Atoms**: Basic UI elements (Button, Rating, Badge)
- **Molecules**: Simple combinations (ProductCard, SearchBar, FilterButton)
- **Organisms**: Complex UI sections (Header, ProductGrid, FilterBar)
- **Templates**: Page layouts (handled by Next.js App Router)
- **Pages**: Full pages with real content

### Performance Optimizations

- **Next.js Image Component**: Automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **React Query**: Smart caching and background updates
- **SSR/SSG**: Server-side rendering for better performance
- **CSS Modules**: Scoped styling without runtime overhead

### Supabase Benefits

- **Free Tier**: Generous free tier perfect for e-commerce
- **PostgreSQL**: Full-featured relational database
- **Real-time**: Built-in real-time subscriptions
- **Row Level Security**: Secure data access
- **Easy Integration**: Simple JavaScript SDK

## Customization

### Styling

Modify theme colors in `app/layout.tsx`:

```tsx
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff', // Change primary color
      borderRadius: 4,
    },
  }}
>
```

### Adding New Filters

Add filter buttons in `components/organisms/FilterBar/FilterBar.tsx` and update the `ProductFilters` interface in `lib/supabase.ts`.

### Product Schema

Modify the products table schema in Supabase to match your needs, then update the `Product` interface in `lib/supabase.ts`.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Digital Ocean
- Your own server

## License

MIT
