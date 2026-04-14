-- =============================================
-- Multi-Tenant Business + POS Schema (Supabase) - FIXED
-- Single file | Idempotent | RLS-safe
-- =============================================

-- Custom Type (safe creation)
DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'employee');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 1. Business Types
CREATE TABLE IF NOT EXISTS business_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- 2. Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_type_id uuid REFERENCES business_types(id) ON DELETE SET NULL,
  subscription_tier text DEFAULT 'free',
  subscription_status text DEFAULT 'active',
  trial_ends_at timestamp with time zone DEFAULT now() + interval '14 days',
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Profiles Table (FIXED: id = auth.users.id, removed redundant user_id)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  email text,
  current_business_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Business Access (many-to-many with role)
CREATE TABLE IF NOT EXISTS business_access (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  role user_role DEFAULT 'employee',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, business_id)  -- Simplified: one access record per user/business
);

-- 5. Products
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text,
  price decimal(10, 2) NOT NULL,
  stock_quantity integer DEFAULT 0,
  image text,
  created_at timestamp with time zone DEFAULT now()
);

-- 6. Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  subtotal decimal(10, 2) NOT NULL,
  tax decimal(10, 2) NOT NULL,
  total decimal(10, 2) NOT NULL,
  payment_method text DEFAULT 'cash',
  created_at timestamp with time zone DEFAULT now()
);

-- 7. Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  unit_price decimal(10, 2) NOT NULL,
  total_price decimal(10, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- =============================================
-- HELPER FUNCTIONS (SECURITY DEFINER - bypass RLS safely)
-- =============================================

-- Check if user is admin for a specific business (no recursion)
CREATE OR REPLACE FUNCTION public.is_admin_for_business(check_user_id uuid, check_business_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER  -- ⚠️ Runs with elevated privileges, bypasses RLS
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM business_access 
    WHERE user_id = check_user_id 
      AND business_id = check_business_id 
      AND role = 'admin'
  );
END;
$$;

-- Check if user has ANY access to a business (admin or employee)
CREATE OR REPLACE FUNCTION public.has_business_access(check_user_id uuid, check_business_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM business_access 
    WHERE user_id = check_user_id 
      AND business_id = check_business_id
  );
END;
$$;

-- =============================================
-- Enable Row Level Security
-- =============================================
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies (FIXED: No recursion)
-- =============================================

-- Businesses: Owner or anyone with access can view
CREATE POLICY "Users can view accessible businesses" ON businesses
  FOR SELECT USING (
    auth.uid() = owner_id 
    OR public.has_business_access(auth.uid(), id)
  );

-- Business Access: 
-- 1. Users can always see their own access records
-- 2. Admins of a business can see all access records for that business
CREATE POLICY "Users can view own business access" ON business_access
  FOR SELECT USING (
    user_id = auth.uid()  -- Own records always visible
    OR public.is_admin_for_business(auth.uid(), business_id)  -- Admins see all for their business
  );

-- Business Access: Admins can manage (INSERT/UPDATE/DELETE) access for their business
CREATE POLICY "Admins can manage business access" ON business_access
  FOR ALL USING (
    public.is_admin_for_business(auth.uid(), business_id)
  );

-- Profiles: Users can manage their own profile
CREATE POLICY "Users manage own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Profiles: Admins can manage employees in businesses they admin
CREATE POLICY "Admins manage employees in their business" ON profiles
  FOR ALL USING (
    public.is_admin_for_business(auth.uid(), current_business_id)
  );

-- Products: Access only via business_access
CREATE POLICY "Products via business access" ON products
  FOR ALL USING (
    public.has_business_access(auth.uid(), business_id)
  );

-- Orders: Access only via business_access
CREATE POLICY "Orders via business access" ON orders
  FOR ALL USING (
    public.has_business_access(auth.uid(), business_id)
  );

-- Order Items: Access via linked order's business
CREATE POLICY "Order items via business access" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND public.has_business_access(auth.uid(), o.business_id)
    )
  );

-- =============================================
-- Trigger: Auto-create profile on signup (FIXED)
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,              -- Must match auth.users.id
    full_name,
    email
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE 
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        created_at = EXCLUDED.created_at;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_business_access_user_business ON business_access(user_id, business_id);
CREATE INDEX IF NOT EXISTS idx_business_access_role ON business_access(business_id, role);
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_business_id ON orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_employee_id ON orders(employee_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_type_id ON businesses(business_type_id);

-- Comments
COMMENT ON FUNCTION public.is_admin_for_business IS 'Check admin status without RLS recursion';
COMMENT ON FUNCTION public.has_business_access IS 'Check any access without RLS recursion';
COMMENT ON TABLE business_access IS 'User-business membership with roles (RLS-safe)';