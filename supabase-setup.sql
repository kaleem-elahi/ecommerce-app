-- E-Commerce App - Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create products table
CREATE TABLE IF NOT EXISTS products (
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

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

-- Insert sample data
INSERT INTO products (name, description, price, original_price, discount, image_url, rating, review_count, free_delivery, star_seller, dispatched_from, category) VALUES
('Dark Brown Yemeni Aqeeq Ring Akik Rings Aqee', 'Handcrafted silver ring with genuine Aqeeq stone. Perfect for daily wear and special occasions.', 9580.00, 21290.00, 55, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', 4.8, 470, true, true, 'India', 'jewelry'),
('Natural Yemeni Aqeeq Agate Cabochon: Soleim', 'Premium quality loose Aqeeq stones. Perfect for jewelry making and collection.', 1454.00, NULL, NULL, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', 5.0, 5, false, false, 'India', 'stones'),
('Oval Red Aqeeq Men Ring, Silver Handmade Jew', 'Silver handmade jewelry for men. Elegant design with traditional craftsmanship.', 11063.00, NULL, NULL, 'https://images.unsplash.com/photo-1596944924616-7b38e7cf8f77?w=400', 4.9, 723, true, true, 'India', 'jewelry'),
('Aqeeq Stone Ring For Men Real Aqeeq Ring Isla', 'Real Aqeeq ring with Islamic design. Authentic gemstone with silver setting.', 7199.00, 15999.00, 55, 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400', 4.8, 470, false, true, 'India', 'jewelry'),
('Yemeni Aqeeq Bracelet Silver Handmade', 'Beautiful silver bracelet with natural Aqeeq stones. Adjustable size for perfect fit.', 8500.00, 15000.00, 43, 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400', 4.7, 320, true, true, 'India', 'jewelry'),
('Natural Aqeeq Pendant Necklace', 'Elegant necklace with genuine Aqeeq pendant. Comes with matching chain.', 6500.00, NULL, NULL, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', 4.6, 189, false, false, 'India', 'jewelry'),
('Premium Aqeeq Gemstone Collection', 'Set of 5 premium Aqeeq stones in different sizes. Perfect for custom jewelry.', 3500.00, 5000.00, 30, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', 4.9, 156, true, false, 'India', 'stones'),
('Silver Aqeeq Ring Set for Couples', 'Matching rings for couples with authentic Aqeeq stones. Available in multiple sizes.', 15000.00, 25000.00, 40, 'https://images.unsplash.com/photo-1596944924616-7b38e7cf8f77?w=400', 4.8, 245, true, true, 'India', 'jewelry')
ON CONFLICT DO NOTHING;

-- Create a view for better querying (optional)
CREATE OR REPLACE VIEW products_view AS
SELECT 
  id,
  name,
  description,
  price,
  original_price,
  discount,
  image_url,
  rating,
  review_count,
  free_delivery,
  star_seller,
  dispatched_from,
  category,
  created_at,
  CASE 
    WHEN original_price IS NOT NULL 
    THEN ROUND(((original_price - price) / original_price) * 100)
    ELSE NULL
  END AS calculated_discount
FROM products;

