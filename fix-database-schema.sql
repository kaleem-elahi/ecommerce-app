-- Fix missing columns in products table
-- Run this SQL in your Supabase SQL Editor
-- This will add all columns if they don't exist

-- Add name column (required, but check anyway)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Add description column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add price column (required, but check anyway)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2);

-- Add original_price column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2);

-- Add discount column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS discount INTEGER;

-- Add image_url column (required, but check anyway)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add rating column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0;

-- Add review_count column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Add free_delivery column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS free_delivery BOOLEAN DEFAULT false;

-- Add star_seller column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS star_seller BOOLEAN DEFAULT false;

-- Add dispatched_from column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS dispatched_from TEXT;

-- Add category column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add created_at column (if not exists)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
