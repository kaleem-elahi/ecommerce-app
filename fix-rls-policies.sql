-- Fix Row Level Security (RLS) policies for products table
-- Run this SQL in your Supabase SQL Editor

-- First, check if RLS is enabled
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing INSERT policy if it exists (to recreate it)
DROP POLICY IF EXISTS "Allow public insert" ON products;
DROP POLICY IF EXISTS "Allow admin insert" ON products;
DROP POLICY IF EXISTS "Allow authenticated insert" ON products;

-- Option 1: Allow public insert (for development/testing)
-- Use this if you want anyone to be able to insert products
CREATE POLICY "Allow public insert" ON products
  FOR INSERT
  WITH CHECK (true);

-- Option 2: Allow authenticated users to insert (if using Supabase Auth)
-- Uncomment this if you're using Supabase authentication
-- CREATE POLICY "Allow authenticated insert" ON products
--   FOR INSERT
--   WITH CHECK (auth.role() = 'authenticated');

-- Option 3: Allow insert only for service role (if using service role key)
-- This would require using the service role key in your API, not anon key

-- Keep the existing SELECT policy (if it exists)
-- If it doesn't exist, create it:
DROP POLICY IF EXISTS "Allow public read access" ON products;
CREATE POLICY "Allow public read access" ON products
  FOR SELECT
  USING (true);

-- Optional: Add UPDATE policy if you want to allow updates
DROP POLICY IF EXISTS "Allow public update" ON products;
CREATE POLICY "Allow public update" ON products
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Optional: Add DELETE policy if you want to allow deletes
DROP POLICY IF EXISTS "Allow public delete" ON products;
CREATE POLICY "Allow public delete" ON products
  FOR DELETE
  USING (true);

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'products';


