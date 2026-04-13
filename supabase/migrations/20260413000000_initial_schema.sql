-- =============================================
-- Multi-Tenant Business + POS Schema (Supabase)
-- Single file - no conflicts - run once
-- =============================================

-- 1. Custom Type (safe creation)
DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'employee');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Businesses Table (with subscription info)
CREATE TABLE IF NOT EXISTS businesses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  subscription_tier text DEFAULT 'free',        -- 'free', 'pro', 'enterprise'
  subscription_status text DEFAULT 'active',    -- 'active', 'past_due', 'canceled'
  trial_ends_at timestamp with time zone DEFAULT now() + interval '14 days',
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Profiles Table (user personal data only)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  current_business_id uuid REFERENCES businesses ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Business Access (many-to-many with role)
CREATE TABLE IF NOT EXISTS business_access (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  business_id uuid REFERENCES businesses ON DELETE CASCADE NOT NULL,
  role user_role DEFAULT 'employee',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- 5. Products
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text,
  price decimal(10, 2) NOT NULL,
  stock_quantity integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES profiles ON DELETE SET NULL,
  subtotal decimal(10, 2) NOT NULL,
  tax decimal(10, 2) NOT NULL,
  total decimal(10, 2) NOT NULL,
  payment_method text DEFAULT 'cash',
  created_at timestamp with time zone DEFAULT now()
);

-- 7. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products ON DELETE SET NULL,
  quantity integer NOT NULL,
  unit_price decimal(10, 2) NOT NULL,
  total_price decimal(10, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- Enable Row Level Security on all tables
-- =============================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================

-- Businesses: Owner or anyone with access can view
CREATE POLICY "Users can view accessible businesses" ON businesses
  FOR SELECT USING (
    auth.uid() = owner_id 
    OR EXISTS (
      SELECT 1 FROM business_access 
      WHERE user_id = auth.uid() AND business_id = businesses.id
    )
  );

-- Business Access: Users can only see their own access records
CREATE POLICY "Users can view their own business access" ON business_access
  FOR SELECT USING (auth.uid() = user_id);

-- (Optional) Allow users to manage their own access if needed, or handle via app logic + admin policies

-- Profiles: Users can read their own profile
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Profiles: Admins can view/update employees in their current business
CREATE POLICY "Admins can manage employees in their business" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_access 
      WHERE business_access.user_id = auth.uid() 
      AND business_access.role = 'admin' 
      AND business_access.business_id = profiles.current_business_id
    )
  );

-- Business Access: Admins can manage access for their business
CREATE POLICY "Admins can manage business access" ON business_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_access AS ba
      WHERE ba.user_id = auth.uid() 
      AND ba.role = 'admin' 
      AND ba.business_id = business_access.business_id
    )
  );

-- Products: Access only via business_access
CREATE POLICY "Products accessible via business_access" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_access 
      WHERE user_id = auth.uid() AND business_id = products.business_id
    )
  );

-- Orders: Access only via business_access
CREATE POLICY "Orders accessible via business_access" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM business_access 
      WHERE user_id = auth.uid() AND business_id = orders.business_id
    )
  );

-- Order Items: Access only via linked order's business
CREATE POLICY "Order items accessible via business_access" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 
      FROM orders 
      JOIN business_access ON business_access.business_id = orders.business_id
      WHERE order_items.order_id = orders.id 
        AND business_access.user_id = auth.uid()
    )
  );

-- =============================================
-- Trigger: Auto-create profile on new user signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid conflict on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================
-- Recommended Indexes for RLS performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_business_access_user_id ON business_access(user_id);
CREATE INDEX IF NOT EXISTS idx_business_access_business_id ON business_access(business_id);
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Optional: Index on owner_id for businesses
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);

COMMENT ON TABLE businesses IS 'Core tenant table with subscription details';
COMMENT ON TABLE business_access IS 'Many-to-many relationship between users and businesses with roles';