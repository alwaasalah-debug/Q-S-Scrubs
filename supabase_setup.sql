-- Q&S Scrubs - Supabase Setup Script
-- ====================================
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Create Products Table
CREATE TABLE public.products (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  category text NOT NULL, -- Free text: group products by using the exact same category name (e.g. 'رجالي', 'حريمي', 'أطفال')
  price numeric NOT NULL,
  old_price numeric,
  img text NOT NULL,
  sizes jsonb DEFAULT '["S", "M", "L", "XL", "XXL"]'::jsonb NOT NULL,
  details text
);

-- 2. Create Orders Table
CREATE TABLE public.orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  governorate text NOT NULL,
  address text NOT NULL,
  notes text,
  subtotal numeric NOT NULL,
  shipping_price numeric NOT NULL,
  total_price numeric NOT NULL,
  status text DEFAULT 'pending'::text NOT NULL,
  items jsonb NOT NULL,
  customer_info jsonb
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Allow anyone to read products (public store)
CREATE POLICY "Allow public read access on products"
  ON public.products FOR SELECT USING (true);

-- Allow anyone to insert orders (public checkout)
CREATE POLICY "Allow public insert access on orders"
  ON public.orders FOR INSERT WITH CHECK (true);

-- Allow anyone to read orders (for admin panel - adjust later with auth)
CREATE POLICY "Allow public read access on orders"
  ON public.orders FOR SELECT USING (true);

-- Allow anyone to update orders (for admin panel - adjust later with auth)
CREATE POLICY "Allow public update access on orders"
  ON public.orders FOR UPDATE USING (true);

-- Allow full access on products for management (adjust later with auth)
CREATE POLICY "Allow public insert access on products"
  ON public.products FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on products"
  ON public.products FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on products"
  ON public.products FOR DELETE USING (true);
