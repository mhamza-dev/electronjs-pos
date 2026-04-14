-- =============================================
-- SEED DATA for Multi-Tenant Business + POS Schema
-- =============================================

-- =============================================
-- 1. Create Business Types
-- =============================================
INSERT INTO business_types (name, description) 
SELECT 'Restaurant', 'Food service establishment'
WHERE NOT EXISTS (SELECT 1 FROM business_types WHERE name = 'Restaurant')
UNION ALL SELECT 'Retail Store', 'Physical goods retail shop'
WHERE NOT EXISTS (SELECT 1 FROM business_types WHERE name = 'Retail Store')
UNION ALL SELECT 'Cafe', 'Coffee shop and light meals'
WHERE NOT EXISTS (SELECT 1 FROM business_types WHERE name = 'Cafe')
UNION ALL SELECT 'Salon', 'Beauty and hair salon'
WHERE NOT EXISTS (SELECT 1 FROM business_types WHERE name = 'Salon')
UNION ALL SELECT 'Grocery', 'Food and household items store'
WHERE NOT EXISTS (SELECT 1 FROM business_types WHERE name = 'Grocery')
UNION ALL SELECT 'Pharmacy', 'Medical supplies and prescriptions'
WHERE NOT EXISTS (SELECT 1 FROM business_types WHERE name = 'Pharmacy');

-- =============================================
-- 2. Create Auth Users (12 users)
-- =============================================
DO $$
DECLARE
  v_user_id uuid;
  i integer;
  user_name text;
BEGIN
  -- Create 12 users
  FOR i IN 1..12 LOOP
    user_name := 'seed_user' || i;
    
    -- Check if user already exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user_name || '@seed.local') THEN
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        user_name || '@seed.local',
        extensions.crypt('password123', extensions.gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', initcap(replace(user_name, '_', ' '))),
        now(),
        now(),
        '',
        '',
        '',
        ''
      )
      RETURNING id INTO v_user_id;
      
      -- Create identity for each user
      IF v_user_id IS NOT NULL THEN
        INSERT INTO auth.identities (
          id,
          provider_id,
          user_id,
          identity_data,
          provider,
          last_sign_in_at,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          v_user_id,
          v_user_id,
          jsonb_build_object('sub', v_user_id::text, 'email', user_name || '@seed.local'),
          'email',
          now(),
          now(),
          now()
        );
      END IF;
    END IF;
  END LOOP;
END $$;

-- =============================================
-- 3. Create Businesses (each user gets 1-3 businesses)
-- =============================================
DO $$
DECLARE
  user_record RECORD;
  business_count integer;
  i integer;
  business_name text;
  business_type_id uuid;
  user_counter integer := 0;
BEGIN
  FOR user_record IN 
    SELECT id, email
    FROM auth.users 
    WHERE email LIKE '%seed%'
    ORDER BY email
  LOOP
    user_counter := user_counter + 1;
    business_count := 1 + (user_counter % 3);
    
    FOR i IN 1..business_count LOOP
      -- Pick a random business type
      SELECT id INTO business_type_id 
      FROM business_types 
      ORDER BY random() 
      LIMIT 1;
      
      -- Generate business name based on user number and business number
      CASE (user_counter % 6)
        WHEN 0 THEN 
          business_name := CASE i 
            WHEN 1 THEN 'Sunrise Restaurant' 
            WHEN 2 THEN 'Sunrise Cafe' 
            ELSE 'Sunrise Bakery' 
          END;
        WHEN 1 THEN 
          business_name := CASE i 
            WHEN 1 THEN 'Tech Gadgets' 
            WHEN 2 THEN 'Tech Repairs' 
            ELSE 'Tech Accessories' 
          END;
        WHEN 2 THEN 
          business_name := CASE i 
            WHEN 1 THEN 'Green Grocers' 
            WHEN 2 THEN 'Green Market' 
            ELSE 'Green Organics' 
          END;
        WHEN 3 THEN 
          business_name := CASE i 
            WHEN 1 THEN 'Style Studio' 
            WHEN 2 THEN 'Style Salon' 
            ELSE 'Style Spa' 
          END;
        WHEN 4 THEN 
          business_name := CASE i 
            WHEN 1 THEN 'City Pharmacy' 
            WHEN 2 THEN 'City Wellness' 
            ELSE 'City Health' 
          END;
        ELSE 
          business_name := CASE i 
            WHEN 1 THEN 'Fresh Foods' 
            WHEN 2 THEN 'Fresh Mart' 
            ELSE 'Fresh Deli' 
          END;
      END CASE;
      
      business_name := business_name || ' #' || user_counter;
      
      INSERT INTO businesses (
        owner_id,
        name,
        business_type_id,
        subscription_tier,
        subscription_status,
        trial_ends_at
      ) VALUES (
        user_record.id,
        business_name,
        business_type_id,
        CASE (user_counter % 3)
          WHEN 0 THEN 'enterprise'
          WHEN 1 THEN 'pro'
          ELSE 'free'
        END,
        CASE (user_counter % 5)
          WHEN 0 THEN 'past_due'
          ELSE 'active'
        END,
        now() + (interval '1 day' * (user_counter * 7))
      );
    END LOOP;
  END LOOP;
END $$;

-- =============================================
-- 4. Create Business Access records
-- =============================================
DO $$
DECLARE
  business_record RECORD;
  i integer;
BEGIN
  FOR business_record IN 
    SELECT 
      b.id as business_id,
      b.owner_id
    FROM businesses b
    JOIN auth.users u ON b.owner_id = u.id
    WHERE u.email LIKE '%seed%'
  LOOP
    -- Owner gets admin access (check if not exists first)
    IF NOT EXISTS (
      SELECT 1 FROM business_access 
      WHERE business_id = business_record.business_id 
        AND user_id = business_record.owner_id
    ) THEN
      INSERT INTO business_access (
        profile_id,
        user_id,
        business_id,
        role
      ) VALUES (
        business_record.owner_id,
        business_record.owner_id,
        business_record.business_id,
        'admin'
      );
    END IF;
    
    -- Add 1-3 employees per business (random other users)
    FOR i IN 1..(1 + floor(random() * 3)::int) LOOP
      INSERT INTO business_access (
        profile_id,
        user_id,
        business_id,
        role
      )
      SELECT 
        u.id as profile_id,
        u.id as user_id,
        business_record.business_id,
        'employee'
      FROM auth.users u
      WHERE u.email LIKE '%seed%'
        AND u.id != business_record.owner_id
        AND NOT EXISTS (
          SELECT 1 FROM business_access ba 
          WHERE ba.business_id = business_record.business_id 
          AND ba.user_id = u.id
        )
      ORDER BY random()
      LIMIT 1;
    END LOOP;
  END LOOP;
END $$;

-- =============================================
-- 5. Create Products for each business
-- =============================================
DO $$
DECLARE
  business_record RECORD;
  i integer;
  product_name text;
  product_category text;
  categories text[] := ARRAY['Food', 'Beverage', 'Apparel', 'Beauty', 'Health', 'Household', 'Electronics'];
BEGIN
  FOR business_record IN 
    SELECT 
      b.id as business_id,
      b.name as business_name,
      bt.name as business_type
    FROM businesses b
    JOIN business_types bt ON b.business_type_id = bt.id
  LOOP
    -- Generate 8-20 products per business based on business type
    FOR i IN 1..(8 + floor(random() * 13)::int) LOOP
      
      -- Generate product name based on business type
      IF business_record.business_type = 'Restaurant' THEN
        product_name := CASE (i % 8)
          WHEN 0 THEN 'Burger' WHEN 1 THEN 'Pizza'
          WHEN 2 THEN 'Pasta' WHEN 3 THEN 'Salad'
          WHEN 4 THEN 'Soup' WHEN 5 THEN 'Steak'
          WHEN 6 THEN 'Sandwich' ELSE 'Wrap'
        END || ' ' || i;
      ELSIF business_record.business_type = 'Cafe' THEN
        product_name := CASE (i % 8)
          WHEN 0 THEN 'Espresso' WHEN 1 THEN 'Latte'
          WHEN 2 THEN 'Cappuccino' WHEN 3 THEN 'Mocha'
          WHEN 4 THEN 'Americano' WHEN 5 THEN 'Tea'
          WHEN 6 THEN 'Croissant' ELSE 'Muffin'
        END || ' ' || i;
      ELSIF business_record.business_type = 'Retail Store' THEN
        product_name := CASE (i % 8)
          WHEN 0 THEN 'Shirt' WHEN 1 THEN 'Pants'
          WHEN 2 THEN 'Jacket' WHEN 3 THEN 'Shoes'
          WHEN 4 THEN 'Hat' WHEN 5 THEN 'Bag'
          WHEN 6 THEN 'Watch' ELSE 'Sunglasses'
        END || ' ' || i;
      ELSIF business_record.business_type = 'Salon' THEN
        product_name := CASE (i % 8)
          WHEN 0 THEN 'Haircut' WHEN 1 THEN 'Color'
          WHEN 2 THEN 'Style' WHEN 3 THEN 'Manicure'
          WHEN 4 THEN 'Pedicure' WHEN 5 THEN 'Facial'
          WHEN 6 THEN 'Massage' ELSE 'Wax'
        END || ' ' || i;
      ELSIF business_record.business_type = 'Grocery' THEN
        product_name := CASE (i % 8)
          WHEN 0 THEN 'Bread' WHEN 1 THEN 'Milk'
          WHEN 2 THEN 'Eggs' WHEN 3 THEN 'Cheese'
          WHEN 4 THEN 'Fruit' WHEN 5 THEN 'Vegetables'
          WHEN 6 THEN 'Rice' ELSE 'Pasta'
        END || ' ' || i;
      ELSIF business_record.business_type = 'Pharmacy' THEN
        product_name := CASE (i % 8)
          WHEN 0 THEN 'Pain Relief' WHEN 1 THEN 'Cold Medicine'
          WHEN 2 THEN 'Vitamins' WHEN 3 THEN 'First Aid'
          WHEN 4 THEN 'Allergy' WHEN 5 THEN 'Digestive'
          WHEN 6 THEN 'Sleep Aid' ELSE 'Bandages'
        END || ' ' || i;
      ELSE
        product_name := 'Product ' || i;
      END IF;
      
      product_category := categories[1 + (i % array_length(categories, 1))];
      
      INSERT INTO products (
        business_id,
        name,
        category,
        price,
        stock_quantity,
        image
      ) VALUES (
        business_record.business_id,
        product_name,
        product_category,
        (5 + random() * 95)::decimal(10,2),
        (10 + random() * 90)::int,
        'https://picsum.photos/seed/' || 
        replace(replace(business_record.business_id::text, '-', ''), '-', '') || 
        i || '/200/200'
      );
    END LOOP;
  END LOOP;
END $$;

-- =============================================
-- 6. Create Orders and Order Items
-- =============================================
DO $$
DECLARE
  business_record RECORD;
  order_num integer;
  order_id uuid;
  order_subtotal decimal(10,2);
  order_tax decimal(10,2);
  order_total decimal(10,2);
  employee_id uuid;
  item_num integer;
  product_record RECORD;
  item_quantity integer;
  item_price decimal(10,2);
  item_total decimal(10,2);
  payment_methods text[] := ARRAY['cash', 'card', 'mobile'];
BEGIN
  FOR business_record IN 
    SELECT 
      b.id as business_id,
      b.owner_id
    FROM businesses b
  LOOP
    -- Create 5-15 orders per business
    FOR order_num IN 1..(5 + floor(random() * 11)::int) LOOP
      -- Get a random employee (or owner) for this order
      SELECT user_id INTO employee_id
      FROM business_access
      WHERE business_id = business_record.business_id
      ORDER BY random()
      LIMIT 1;
      
      -- Create order
      INSERT INTO orders (
        business_id,
        employee_id,
        subtotal,
        tax,
        total,
        payment_method,
        created_at
      ) VALUES (
        business_record.business_id,
        COALESCE(employee_id, business_record.owner_id),
        0, -- Will update after adding items
        0,
        0,
        payment_methods[1 + floor(random() * 3)::int],
        now() - (interval '1 day' * floor(random() * 30)::int)
      )
      RETURNING id INTO order_id;
      
      -- Add 1-5 items to order
      order_subtotal := 0;
      
      FOR item_num IN 1..(1 + floor(random() * 5)::int) LOOP
        -- Get random product from this business
        SELECT id, price INTO product_record
        FROM products
        WHERE business_id = business_record.business_id
        ORDER BY random()
        LIMIT 1;
        
        IF product_record.id IS NOT NULL THEN
          item_quantity := 1 + floor(random() * 5)::int;
          item_price := product_record.price;
          item_total := item_quantity * item_price;
          order_subtotal := order_subtotal + item_total;
          
          INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            unit_price,
            total_price
          ) VALUES (
            order_id,
            product_record.id,
            item_quantity,
            item_price,
            item_total
          );
        END IF;
      END LOOP;
      
      -- Update order with totals (only if items were added)
      IF order_subtotal > 0 THEN
        order_tax := order_subtotal * 0.08; -- 8% tax
        order_total := order_subtotal + order_tax;
        
        UPDATE orders
        SET 
          subtotal = order_subtotal,
          tax = order_tax,
          total = order_total
        WHERE id = order_id;
      END IF;
      
    END LOOP;
  END LOOP;
END $$;

-- =============================================
-- 7. Display summary of seeded data
-- =============================================
SELECT 
  'Seed Data Summary' as info,
  (SELECT COUNT(*) FROM auth.users WHERE email LIKE '%seed%') as users,
  (SELECT COUNT(*) FROM businesses) as businesses,
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM orders) as orders,
  (SELECT COUNT(*) FROM order_items) as order_items;

-- Show sample users with their business counts
SELECT 
  u.email,
  COUNT(DISTINCT b.id) as businesses_owned,
  COUNT(DISTINCT CASE WHEN ba.role = 'admin' THEN ba.business_id END) as admin_access,
  COUNT(DISTINCT CASE WHEN ba.role = 'employee' THEN ba.business_id END) as employee_access
FROM auth.users u
LEFT JOIN businesses b ON b.owner_id = u.id
LEFT JOIN business_access ba ON ba.user_id = u.id
WHERE u.email LIKE '%seed%'
GROUP BY u.id, u.email
ORDER BY u.email;