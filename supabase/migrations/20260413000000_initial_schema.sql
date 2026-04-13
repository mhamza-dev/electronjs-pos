-- Enable RLS
-- Businesses table
CREATE TABLE businesses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Profiles table (linked to auth.users)
CREATE TYPE user_role AS ENUM ('admin', 'employee');

CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  business_id uuid REFERENCES businesses ON DELETE CASCADE,
  full_name text,
  role user_role DEFAULT 'employee',
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Products table
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  price decimal(10, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Orders table
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid REFERENCES businesses ON DELETE CASCADE,
  employee_id uuid REFERENCES profiles ON DELETE SET NULL,
  subtotal decimal(10, 2) NOT NULL,
  tax decimal(10, 2) NOT NULL,
  total decimal(10, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Order Items table
CREATE TABLE order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders ON DELETE CASCADE,
  product_id uuid REFERENCES products ON DELETE SET NULL,
  quantity integer NOT NULL,
  unit_price decimal(10, 2) NOT NULL,
  total_price decimal(10, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read their own profile and others in the same business
CREATE POLICY "Profiles are viewable by users in the same business" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM profiles AS my_profile 
      WHERE my_profile.id = auth.uid() AND my_profile.business_id = profiles.business_id
    )
  );

-- Profiles: Admins can manage employees in their business
CREATE POLICY "Admins can manage profiles in their business" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles AS my_profile 
      WHERE my_profile.id = auth.uid() AND my_profile.role = 'admin' AND my_profile.business_id = profiles.business_id
    )
  );

-- Products: Users can view products in their business
CREATE POLICY "Products viewable by same business" ON products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.business_id = products.business_id
    )
  );

-- Products: Admins can manage products
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin' AND profiles.business_id = products.business_id
    )
  );

-- Orders: Users can view/create orders in their business
CREATE POLICY "Orders accessible by same business" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.business_id = orders.business_id
    )
  );

-- Order Items: Users can view/create items in their business
CREATE POLICY "Order items accessible by same business" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM orders
      JOIN profiles ON profiles.business_id = orders.business_id
      WHERE order_items.order_id = orders.id AND profiles.id = auth.uid()
    )
  );

-- Trigger to create profile after auth.user is created
-- Note: business_id and role must be set manually or during signup flow
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
