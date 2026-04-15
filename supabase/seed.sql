-- =========================================================
-- SEED DATA for Multi-Tenant Business Schema (Final Fix)
-- =========================================================

-- ---------------------------------------------------------
-- 1. Create sample auth.users (explicit owner/employee emails)
-- ---------------------------------------------------------
DO $$
DECLARE
  user_emails text[] := ARRAY[
    'owner1@example.com', 'owner2@example.com', 'owner3@example.com', 'owner4@example.com', 'owner5@example.com',
    'employee1@example.com', 'employee2@example.com', 'employee3@example.com', 'employee4@example.com'
  ];
  user_fullnames text[] := ARRAY[
    'Alice Owner', 'Bob Owner', 'Carol Owner', 'Dave Owner', 'Eve Owner',
    'Frank Employee', 'Grace Employee', 'Henry Employee', 'Ivy Employee'
  ];
  v_user_id uuid;
  i int;
BEGIN
  FOR i IN 1..array_length(user_emails, 1) LOOP
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user_emails[i]) THEN
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at, confirmation_token, email_change,
        email_change_token_new, recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        user_emails[i],
        extensions.crypt('password123', extensions.gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        jsonb_build_object('full_name', user_fullnames[i]),
        now(),
        now(),
        '',
        '',
        '',
        ''
      )
      RETURNING id INTO v_user_id;

      INSERT INTO auth.identities (
        id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), v_user_id, v_user_id,
        jsonb_build_object('sub', v_user_id::text, 'email', user_emails[i]),
        'email', now(), now(), now()
      );
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------
-- 2. Business Types
-- ---------------------------------------------------------
INSERT INTO business_types (name, description)
SELECT * FROM (VALUES
  ('Restaurant', 'Food service establishment'),
  ('Retail', 'Physical goods store'),
  ('Cafe', 'Coffee shop and light meals'),
  ('Salon', 'Beauty and hair salon'),
  ('Grocery', 'Food and household items'),
  ('Pharmacy', 'Medical supplies')
) AS t(name, description)
WHERE NOT EXISTS (SELECT 1 FROM business_types LIMIT 1);

-- ---------------------------------------------------------
-- 3. Features & business_type_features
-- ---------------------------------------------------------
INSERT INTO features (name)
SELECT * FROM (VALUES
  ('inventory'), ('pos'), ('appointments'), ('reports'), ('multi_branch')
) AS t(name)
WHERE NOT EXISTS (SELECT 1 FROM features LIMIT 1);

INSERT INTO business_type_features (business_type_id, feature_id)
SELECT bt.id, f.id
FROM business_types bt
CROSS JOIN features f
WHERE NOT EXISTS (
  SELECT 1 FROM business_type_features btf
  WHERE btf.business_type_id = bt.id AND btf.feature_id = f.id
);

-- ---------------------------------------------------------
-- 4. Businesses (owned by explicit owner users)
-- ---------------------------------------------------------
DO $$
DECLARE
  owner_emails text[] := ARRAY['owner1@example.com', 'owner2@example.com', 'owner3@example.com', 'owner4@example.com', 'owner5@example.com'];
  owner_ids uuid[];
  bt_restaurant_id uuid; bt_retail_id uuid; bt_cafe_id uuid; bt_salon_id uuid;
BEGIN
  SELECT id INTO bt_restaurant_id FROM business_types WHERE name = 'Restaurant';
  SELECT id INTO bt_retail_id FROM business_types WHERE name = 'Retail';
  SELECT id INTO bt_cafe_id FROM business_types WHERE name = 'Cafe';
  SELECT id INTO bt_salon_id FROM business_types WHERE name = 'Salon';

  SELECT array_agg(id ORDER BY email) INTO owner_ids
  FROM auth.users
  WHERE email = ANY(owner_emails);

  -- Restaurant (owner1)
  IF NOT EXISTS (SELECT 1 FROM businesses WHERE name = 'Tasty Bistro') THEN
    INSERT INTO businesses (owner_id, business_type_id, name, currency, timezone, address)
    VALUES (owner_ids[1], bt_restaurant_id, 'Tasty Bistro', 'USD', 'America/New_York', '123 Food St');
  END IF;

  -- Retail (owner2)
  IF NOT EXISTS (SELECT 1 FROM businesses WHERE name = 'Urban Mart') THEN
    INSERT INTO businesses (owner_id, business_type_id, name, currency, timezone, address)
    VALUES (owner_ids[2], bt_retail_id, 'Urban Mart', 'USD', 'America/Chicago', '456 Retail Ave');
  END IF;

  -- Cafe (owner3)
  IF NOT EXISTS (SELECT 1 FROM businesses WHERE name = 'Bean Haven') THEN
    INSERT INTO businesses (owner_id, business_type_id, name, currency, timezone, address)
    VALUES (owner_ids[3], bt_cafe_id, 'Bean Haven', 'USD', 'America/Denver', '789 Coffee Ln');
  END IF;

  -- Salon (owner4)
  IF NOT EXISTS (SELECT 1 FROM businesses WHERE name = 'Glamour Studio') THEN
    INSERT INTO businesses (owner_id, business_type_id, name, currency, timezone, address)
    VALUES (owner_ids[4], bt_salon_id, 'Glamour Studio', 'USD', 'America/Los_Angeles', '321 Beauty Blvd');
  END IF;

  -- Grocery for owner5
  IF NOT EXISTS (SELECT 1 FROM businesses WHERE name = 'Fresh Market') THEN
    INSERT INTO businesses (owner_id, business_type_id, name, currency, timezone, address)
    VALUES (owner_ids[5], (SELECT id FROM business_types WHERE name = 'Grocery'), 'Fresh Market', 'USD', 'America/Chicago', '555 Grocery Ln');
  END IF;
END $$;

-- ---------------------------------------------------------
-- 5. Roles & Permissions (no ON CONFLICT)
-- ---------------------------------------------------------
DO $$
DECLARE
  b RECORD;
  role_admin_id uuid; role_manager_id uuid; role_cashier_id uuid;
  perm_create uuid; perm_read uuid; perm_update uuid; perm_delete uuid;
BEGIN
  INSERT INTO permissions (name) SELECT 'create' WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'create');
  INSERT INTO permissions (name) SELECT 'read'   WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'read');
  INSERT INTO permissions (name) SELECT 'update' WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'update');
  INSERT INTO permissions (name) SELECT 'delete' WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'delete');

  SELECT id INTO perm_create FROM permissions WHERE name = 'create';
  SELECT id INTO perm_read   FROM permissions WHERE name = 'read';
  SELECT id INTO perm_update FROM permissions WHERE name = 'update';
  SELECT id INTO perm_delete FROM permissions WHERE name = 'delete';

  FOR b IN SELECT id, name FROM businesses LOOP
    -- Admin role
    INSERT INTO roles (business_id, name)
    SELECT b.id, 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM roles WHERE business_id = b.id AND name = 'admin');
    SELECT id INTO role_admin_id FROM roles WHERE business_id = b.id AND name = 'admin';

    -- Manager role
    INSERT INTO roles (business_id, name)
    SELECT b.id, 'manager'
    WHERE NOT EXISTS (SELECT 1 FROM roles WHERE business_id = b.id AND name = 'manager');
    SELECT id INTO role_manager_id FROM roles WHERE business_id = b.id AND name = 'manager';

    -- Cashier role
    INSERT INTO roles (business_id, name)
    SELECT b.id, 'cashier'
    WHERE NOT EXISTS (SELECT 1 FROM roles WHERE business_id = b.id AND name = 'cashier');
    SELECT id INTO role_cashier_id FROM roles WHERE business_id = b.id AND name = 'cashier';

    -- Permissions
    INSERT INTO role_permissions (role_id, permission_id)
    SELECT role_admin_id, perm_id FROM (VALUES (perm_create), (perm_read), (perm_update), (perm_delete)) AS p(perm_id)
    WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = role_admin_id AND permission_id = perm_id);

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT role_manager_id, perm_id FROM (VALUES (perm_create), (perm_read), (perm_update)) AS p(perm_id)
    WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = role_manager_id AND permission_id = perm_id);

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT role_cashier_id, perm_id FROM (VALUES (perm_read)) AS p(perm_id)
    WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = role_cashier_id AND permission_id = perm_id);
  END LOOP;
END $$;

-- ---------------------------------------------------------
-- 6. Business Users (FIXED: only one role per user per business)
-- ---------------------------------------------------------
DO $$
DECLARE
  b RECORD;
  owner_user_id uuid;
  employee_user_ids uuid[];
  role_admin_id uuid; role_cashier_id uuid; role_manager_id uuid;
  v_role_id uuid;
  i int;
BEGIN
  SELECT array_agg(id ORDER BY email) INTO employee_user_ids
  FROM auth.users
  WHERE email LIKE 'employee%@example.com';

  FOR b IN SELECT id FROM businesses LOOP
    -- Owner gets admin
    SELECT owner_id INTO owner_user_id FROM businesses WHERE id = b.id;
    SELECT id INTO role_admin_id FROM roles WHERE business_id = b.id AND name = 'admin';
    INSERT INTO business_users (user_id, business_id, role_id, status)
    SELECT owner_user_id, b.id, role_admin_id, 'active'
    WHERE NOT EXISTS (SELECT 1 FROM business_users WHERE user_id = owner_user_id AND business_id = b.id);

    -- Employees: first two become managers, rest become cashiers
    SELECT id INTO role_cashier_id FROM roles WHERE business_id = b.id AND name = 'cashier';
    SELECT id INTO role_manager_id FROM roles WHERE business_id = b.id AND name = 'manager';
    
    FOR i IN 1..array_length(employee_user_ids, 1) LOOP
      IF i <= 2 THEN
        v_role_id := role_manager_id;
      ELSE
        v_role_id := role_cashier_id;
      END IF;
      
      INSERT INTO business_users (user_id, business_id, role_id, status)
      SELECT employee_user_ids[i], b.id, v_role_id, 'active'
      WHERE NOT EXISTS (SELECT 1 FROM business_users WHERE user_id = employee_user_ids[i] AND business_id = b.id);
    END LOOP;
  END LOOP;
END $$;

-- ---------------------------------------------------------
-- 7. Branches (2 per business)
-- ---------------------------------------------------------
DO $$
DECLARE
  b RECORD;
BEGIN
  FOR b IN SELECT id, name FROM businesses LOOP
    IF NOT EXISTS (SELECT 1 FROM branches WHERE business_id = b.id AND name = 'Main Branch') THEN
      INSERT INTO branches (business_id, name, address, phone)
      VALUES (b.id, 'Main Branch', b.name || ' Main Street', '+1234567890');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM branches WHERE business_id = b.id AND name = 'Downtown Branch') THEN
      INSERT INTO branches (business_id, name, address, phone)
      VALUES (b.id, 'Downtown Branch', b.name || ' Downtown Ave', '+1987654321');
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------
-- 8. Employees & employee_branches
-- ---------------------------------------------------------
DO $$
DECLARE
  emp_user RECORD;
  b RECORD;
  v_emp_id uuid;
  branch_ids uuid[];
  v_branch_id uuid;
BEGIN
  FOR emp_user IN SELECT id, email FROM auth.users WHERE email LIKE 'employee%@example.com' LOOP
    FOR b IN SELECT id FROM businesses LOOP
      IF NOT EXISTS (SELECT 1 FROM employees WHERE user_id = emp_user.id AND business_id = b.id) THEN
        INSERT INTO employees (user_id, business_id, designation, salary, hired_at)
        VALUES (emp_user.id, b.id, 'Sales Associate', 30000 + (random() * 20000)::int, CURRENT_DATE - (random() * 365)::int)
        RETURNING id INTO v_emp_id;
      ELSE
        SELECT id INTO v_emp_id FROM employees WHERE user_id = emp_user.id AND business_id = b.id;
      END IF;

      SELECT array_agg(id) INTO branch_ids FROM branches WHERE business_id = b.id;
      IF v_emp_id IS NOT NULL AND branch_ids IS NOT NULL THEN
        FOREACH v_branch_id IN ARRAY branch_ids LOOP
          IF NOT EXISTS (SELECT 1 FROM employee_branches WHERE employee_id = v_emp_id AND branch_id = v_branch_id) THEN
            INSERT INTO employee_branches (employee_id, branch_id) VALUES (v_emp_id, v_branch_id);
          END IF;
        END LOOP;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- ---------------------------------------------------------
-- 9. Shifts
-- ---------------------------------------------------------
DO $$
DECLARE
  emp RECORD;
BEGIN
  FOR emp IN SELECT e.id AS emp_id, eb.branch_id FROM employees e JOIN employee_branches eb ON e.id = eb.employee_id LOOP
    IF NOT EXISTS (
      SELECT 1 FROM shifts 
      WHERE employee_id = emp.emp_id 
        AND start_time::date = now()::date
    ) THEN
      INSERT INTO shifts (employee_id, branch_id, start_time, end_time)
      VALUES (
        emp.emp_id, emp.branch_id,
        now()::date + interval '9 hours',
        now()::date + interval '17 hours'
      );
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------
-- 10. Customers (10 per business)
-- ---------------------------------------------------------
DO $$
DECLARE
  b RECORD;
  i int;
  v_phone text;
BEGIN
  FOR b IN SELECT id FROM businesses LOOP
    FOR i IN 1..10 LOOP
      v_phone := '+1' || (1000000000 + floor(random() * 900000000)::bigint);
      IF NOT EXISTS (SELECT 1 FROM customers WHERE business_id = b.id AND phone = v_phone) THEN
        INSERT INTO customers (business_id, name, phone, email)
        VALUES (
          b.id,
          'Customer ' || i || ' of ' || (SELECT name FROM businesses WHERE id = b.id),
          v_phone,
          'cust' || i || '@example.com'
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- ---------------------------------------------------------
-- 11. Items (15 per business)
-- ---------------------------------------------------------
DO $$
DECLARE
  b RECORD;
  i int;
  item_name text;
  item_type text;
  item_price numeric;
  v_item_id uuid;
BEGIN
  FOR b IN SELECT id, (SELECT name FROM business_types WHERE id = business_type_id) AS bt_name FROM businesses LOOP
    FOR i IN 1..15 LOOP
      CASE b.bt_name
        WHEN 'Restaurant' THEN
          item_name := CASE (i % 5)
            WHEN 0 THEN 'Burger' WHEN 1 THEN 'Pizza' WHEN 2 THEN 'Pasta' WHEN 3 THEN 'Salad' ELSE 'Soup'
          END || ' ' || i;
          item_type := 'food';
          item_price := 5 + (random() * 25)::int;
        WHEN 'Retail' THEN
          item_name := CASE (i % 4)
            WHEN 0 THEN 'T-Shirt' WHEN 1 THEN 'Jeans' WHEN 2 THEN 'Shoes' ELSE 'Hat'
          END || ' ' || i;
          item_type := 'clothing';
          item_price := 10 + (random() * 90)::int;
        WHEN 'Cafe' THEN
          item_name := CASE (i % 4)
            WHEN 0 THEN 'Latte' WHEN 1 THEN 'Cappuccino' WHEN 2 THEN 'Croissant' ELSE 'Muffin'
          END || ' ' || i;
          item_type := 'beverage';
          item_price := 2 + (random() * 10)::int;
        WHEN 'Salon' THEN
          item_name := CASE (i % 4)
            WHEN 0 THEN 'Haircut' WHEN 1 THEN 'Manicure' WHEN 2 THEN 'Facial' ELSE 'Massage'
          END || ' ' || i;
          item_type := 'service';
          item_price := 20 + (random() * 80)::int;
        ELSE
          item_name := 'Item ' || i;
          item_type := 'general';
          item_price := 1 + (random() * 50)::int;
      END CASE;

      IF NOT EXISTS (SELECT 1 FROM items WHERE business_id = b.id AND sku = 'SKU' || b.id::text || i) THEN
        INSERT INTO items (business_id, name, type, sku, barcode, price, cost, is_active)
        VALUES (
          b.id,
          item_name,
          item_type,
          'SKU' || b.id::text || i,
          'BAR' || b.id::text || i,
          item_price,
          item_price * 0.6,
          true
        )
        RETURNING id INTO v_item_id;

        IF i % 3 = 0 THEN
          INSERT INTO item_variants (item_id, name, sku, price)
          VALUES
            (v_item_id, 'Small', 'VAR-SML-' || i, item_price * 0.8),
            (v_item_id, 'Large', 'VAR-LRG-' || i, item_price * 1.2);
        END IF;
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- ---------------------------------------------------------
-- 12. Inventory per branch
-- ---------------------------------------------------------
DO $$
DECLARE
  branch RECORD;
  item RECORD;
BEGIN
  FOR branch IN SELECT id, business_id FROM branches LOOP
    FOR item IN SELECT id FROM items WHERE business_id = branch.business_id LOOP
      IF NOT EXISTS (SELECT 1 FROM inventory WHERE item_id = item.id AND branch_id = branch.id) THEN
        INSERT INTO inventory (item_id, branch_id, quantity, low_stock_threshold)
        VALUES (item.id, branch.id, floor(random() * 100)::int, 10);
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- ---------------------------------------------------------
-- 13. Inventory transactions
-- ---------------------------------------------------------
DO $$
DECLARE
  inv RECORD;
BEGIN
  FOR inv IN SELECT item_id, branch_id FROM inventory LIMIT 50 LOOP
    INSERT INTO inventory_transactions (item_id, branch_id, change, type, reference_id)
    VALUES (inv.item_id, inv.branch_id, 50, 'purchase', gen_random_uuid()),
           (inv.item_id, inv.branch_id, -5, 'sale', gen_random_uuid());
  END LOOP;
END $$;

-- ---------------------------------------------------------
-- 14. Product batches (only for Restaurant)
-- ---------------------------------------------------------
DO $$
DECLARE
  v_item RECORD;
  branch RECORD;
BEGIN
  FOR v_item IN SELECT i.id FROM items i JOIN businesses b ON i.business_id = b.id JOIN business_types bt ON b.business_type_id = bt.id WHERE bt.name = 'Restaurant' LOOP
    FOR branch IN SELECT id FROM branches WHERE business_id = (SELECT business_id FROM items WHERE id = v_item.id) LOOP
      INSERT INTO product_batches (item_id, branch_id, quantity, expiry_date, cost)
      VALUES (
        v_item.id, branch.id, floor(random() * 20)::int,
        CURRENT_DATE + (random() * 90)::int,
        (SELECT cost FROM items WHERE id = v_item.id)
      );
    END LOOP;
  END LOOP;
END $$;

-- ---------------------------------------------------------
-- 15. Orders, Order Items, Payments
-- ---------------------------------------------------------
DO $$
DECLARE
  b RECORD;
  branch RECORD;
  cust RECORD;
  emp_user RECORD;
  v_order_id uuid;
  v_item RECORD;
  qty int;
  order_total numeric;
  payment_methods text[] := ARRAY['cash', 'card', 'mobile'];
BEGIN
  FOR b IN SELECT id FROM businesses LOOP
    FOR branch IN SELECT id FROM branches WHERE business_id = b.id LOOP
      FOR cust IN SELECT id FROM customers WHERE business_id = b.id LIMIT 5 LOOP
        FOR ord_num IN 1..3 LOOP
          SELECT bu.user_id INTO emp_user
          FROM business_users bu
          JOIN roles r ON bu.role_id = r.id
          WHERE bu.business_id = b.id AND r.name IN ('cashier', 'manager')
          LIMIT 1;
          
          INSERT INTO orders (business_id, branch_id, customer_id, created_by, order_type, total_amount, status, created_at)
          VALUES (b.id, branch.id, cust.id, emp_user.user_id, 'sale', 0, 'completed', now() - (random() * interval '30 days'))
          RETURNING id INTO v_order_id;

          order_total := 0;
          FOR i IN 1..(1 + floor(random() * 5)::int) LOOP
            SELECT id, price INTO v_item FROM items WHERE business_id = b.id ORDER BY random() LIMIT 1;
            qty := 1 + floor(random() * 3)::int;
            order_total := order_total + (v_item.price * qty);
            INSERT INTO order_items (order_id, item_id, quantity, price)
            VALUES (v_order_id, v_item.id, qty, v_item.price);
          END LOOP;

          UPDATE orders SET total_amount = order_total WHERE id = v_order_id;

          INSERT INTO payments (order_id, method, amount, paid_at)
          VALUES (v_order_id, payment_methods[1 + floor(random() * 3)::int], order_total, now());
        END LOOP;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- ---------------------------------------------------------
-- 16. Tables (only for Restaurant)
-- ---------------------------------------------------------
DO $$
DECLARE
  rest_business_id uuid;
  branch RECORD;
  t int;
BEGIN
  SELECT id INTO rest_business_id FROM businesses WHERE business_type_id = (SELECT id FROM business_types WHERE name = 'Restaurant');
  IF rest_business_id IS NOT NULL THEN
    FOR branch IN SELECT id FROM branches WHERE business_id = rest_business_id LOOP
      FOR t IN 1..10 LOOP
        IF NOT EXISTS (SELECT 1 FROM tables WHERE branch_id = branch.id AND table_number = 'Table-' || t) THEN
          INSERT INTO tables (branch_id, table_number, capacity, status)
          VALUES (branch.id, 'Table-' || t, 2 + (t % 4), 'available');
        END IF;
      END LOOP;
    END LOOP;
  END IF;
END $$;

-- ---------------------------------------------------------
-- 17. Appointments (for Salon)
-- ---------------------------------------------------------
DO $$
DECLARE
  salon_id uuid;
  branch RECORD;
  service_item RECORD;
  cust RECORD;
  v_emp_id uuid;
BEGIN
  SELECT id INTO salon_id FROM businesses WHERE business_type_id = (SELECT id FROM business_types WHERE name = 'Salon');
  IF salon_id IS NOT NULL THEN
    FOR branch IN SELECT id FROM branches WHERE business_id = salon_id LOOP
      FOR cust IN SELECT id FROM customers WHERE business_id = salon_id LIMIT 10 LOOP
        FOR service_item IN SELECT id FROM items WHERE business_id = salon_id AND type = 'service' LIMIT 5 LOOP
          SELECT e.id INTO v_emp_id FROM employees e JOIN employee_branches eb ON e.id = eb.employee_id WHERE eb.branch_id = branch.id LIMIT 1;
          INSERT INTO appointments (business_id, branch_id, customer_id, service_id, employee_id, start_time, end_time, status)
          VALUES (
            salon_id, branch.id, cust.id, service_item.id, v_emp_id,
            now() + (random() * interval '10 days'),
            now() + (random() * interval '10 days') + interval '1 hour',
            CASE floor(random() * 3) WHEN 0 THEN 'scheduled' WHEN 1 THEN 'completed' ELSE 'cancelled' END
          );
        END LOOP;
      END LOOP;
    END LOOP;
  END IF;
END $$;

-- ---------------------------------------------------------
-- 18. Suppliers & Purchases
-- ---------------------------------------------------------
DO $$
DECLARE
  b RECORD;
  v_supplier_id uuid;
  v_purchase_id uuid;
  v_item RECORD;
BEGIN
  FOR b IN SELECT id FROM businesses LOOP
    INSERT INTO suppliers (business_id, name, contact)
    SELECT b.id, 'Supplier for ' || (SELECT name FROM businesses WHERE id = b.id), 'supplier@example.com'
    WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE business_id = b.id)
    RETURNING id INTO v_supplier_id;

    IF v_supplier_id IS NULL THEN
      SELECT id INTO v_supplier_id FROM suppliers WHERE business_id = b.id;
    END IF;

    INSERT INTO purchases (supplier_id, business_id, total_amount)
    VALUES (v_supplier_id, b.id, 0)
    RETURNING id INTO v_purchase_id;

    FOR v_item IN SELECT id, cost FROM items WHERE business_id = b.id LIMIT 5 LOOP
      INSERT INTO purchase_items (purchase_id, item_id, quantity, cost)
      VALUES (v_purchase_id, v_item.id, floor(random() * 20)::int, v_item.cost);
    END LOOP;

    UPDATE purchases SET total_amount = (SELECT SUM(quantity * cost) FROM purchase_items WHERE purchase_id = v_purchase_id)
    WHERE id = v_purchase_id;
  END LOOP;
END $$;

-- ---------------------------------------------------------
-- 19. Finance: Accounts & Transactions
-- ---------------------------------------------------------
DO $$
DECLARE
  b RECORD;
  v_cash_acc_id uuid; v_bank_acc_id uuid;
  order_rec RECORD;
BEGIN
  FOR b IN SELECT id FROM businesses LOOP
    INSERT INTO accounts (business_id, name, type) 
    SELECT b.id, 'Cash', 'asset'
    WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE business_id = b.id AND name = 'Cash')
    RETURNING id INTO v_cash_acc_id;
    
    IF v_cash_acc_id IS NULL THEN
      SELECT id INTO v_cash_acc_id FROM accounts WHERE business_id = b.id AND name = 'Cash';
    END IF;

    INSERT INTO accounts (business_id, name, type) 
    SELECT b.id, 'Bank', 'asset'
    WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE business_id = b.id AND name = 'Bank')
    RETURNING id INTO v_bank_acc_id;

    IF v_bank_acc_id IS NULL THEN
      SELECT id INTO v_bank_acc_id FROM accounts WHERE business_id = b.id AND name = 'Bank';
    END IF;

    FOR order_rec IN SELECT id, total_amount FROM orders WHERE business_id = b.id LOOP
      INSERT INTO transactions (account_id, amount, type, reference_id, created_at)
      VALUES (v_cash_acc_id, order_rec.total_amount, 'income', order_rec.id, now() - (random() * interval '30 days'));
    END LOOP;
  END LOOP;
END $$;

-- ---------------------------------------------------------
-- 20. Invoices
-- ---------------------------------------------------------
DO $$
DECLARE
  order_rec RECORD;
  cust RECORD;
BEGIN
  FOR order_rec IN SELECT id, business_id, customer_id, total_amount, created_at FROM orders ORDER BY random() LIMIT 20 LOOP
    SELECT id INTO cust FROM customers WHERE id = order_rec.customer_id;
    INSERT INTO invoices (business_id, customer_id, total, status, due_date, created_at)
    VALUES (
      order_rec.business_id, cust.id, order_rec.total_amount,
      CASE floor(random() * 3) WHEN 0 THEN 'paid' WHEN 1 THEN 'pending' ELSE 'overdue' END,
      CURRENT_DATE + (random() * 30)::int,
      order_rec.created_at
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------
-- 21. Audit Logs
-- ---------------------------------------------------------
DO $$
DECLARE
  user_rec RECORD;
  actions text[] := ARRAY['login', 'create_order', 'update_inventory', 'delete_item'];
  entities text[] := ARRAY['order', 'item', 'customer', 'inventory'];
BEGIN
  FOR user_rec IN SELECT id FROM auth.users LIMIT 5 LOOP
    FOR i IN 1..10 LOOP
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
      VALUES (
        user_rec.id,
        actions[1 + floor(random() * array_length(actions, 1))],
        entities[1 + floor(random() * array_length(entities, 1))],
        gen_random_uuid(),
        jsonb_build_object('ip', '192.168.1.' || floor(random() * 255)::int, 'user_agent', 'Mozilla/5.0')
      );
    END LOOP;
  END LOOP;
END $$;

-- Final Summary
SELECT 'Seeding completed with fixed roles and no duplicate keys!' AS status,
  (SELECT COUNT(*) FROM businesses) AS businesses,
  (SELECT COUNT(*) FROM branches) AS branches,
  (SELECT COUNT(*) FROM employees) AS employees,
  (SELECT COUNT(*) FROM customers) AS customers,
  (SELECT COUNT(*) FROM items) AS items,
  (SELECT COUNT(*) FROM orders) AS orders,
  (SELECT COUNT(*) FROM inventory) AS inventory_records;