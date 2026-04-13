-- Businesses table with owner_id and subscription info
CREATE TABLE IF NOT EXISTS businesses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  owner_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  subscription_tier text DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  subscription_status text DEFAULT 'active', -- 'active', 'past_due', 'canceled'
  trial_ends_at timestamp with time zone DEFAULT now() + interval '14 days',
  created_at timestamp with time zone DEFAULT now()
);

-- Profiles table (linked to auth.users)
-- Now allows many-to-many relationship via business_employees if needed, 
-- but for simplicity we'll keep a 'current_business_id' in profiles 
-- and a separate table for access.
CREATE TYPE user_role AS ENUM ('admin', 'employee');

CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  current_business_id uuid REFERENCES businesses ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Many-to-many table for users and businesses
CREATE TABLE IF NOT EXISTS business_access (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  business_id uuid REFERENCES businesses ON DELETE CASCADE NOT NULL,
  role user_role DEFAULT 'employee',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text,
  price decimal(10, 2) NOT NULL,
  stock_quantity integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Orders table
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

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products ON DELETE SET NULL,
  quantity integer NOT NULL,
  unit_price decimal(10, 2) NOT NULL,
  total_price decimal(10, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS Policies

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Business Access: Users can see businesses they have access to
CREATE POLICY "Users can view their accessible businesses" ON businesses
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM business_access WHERE user_id = auth.uid() AND business_id = businesses.id)
  );

-- Business Access table policies
CREATE POLICY "Users can view their own access" ON business_access
  FOR SELECT USING (auth.uid() = user_id);

-- Profiles: Users can read their own profile
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Products: Must have access to business
CREATE POLICY "Products access via business_access" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM business_access WHERE user_id = auth.uid() AND business_id = products.business_id)
  );

-- Orders & Items: Must have access to business
CREATE POLICY "Orders access via business_access" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM business_access WHERE user_id = auth.uid() AND business_id = orders.business_id)
  );

CREATE POLICY "Order items access via business_access" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders 
      JOIN business_access ON business_access.business_id = orders.business_id
      WHERE order_items.order_id = orders.id AND business_access.user_id = auth.uid()
    )
  );
