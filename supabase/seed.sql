-- =========================================================
-- SEED DATA for Multi-Tenant Schema (Supabase + Updated ERD)
-- =========================================================
BEGIN;

-- ---------------------------------------------------------
-- 1. Create auth.users (owners and employees)
-- ---------------------------------------------------------
DO $$
DECLARE
    owner_emails text[] := ARRAY[
        'owner1@example.com', 'owner2@example.com', 'owner3@example.com',
        'owner4@example.com', 'owner5@example.com', 'owner6@example.com'
    ];
    -- Create 45 employees (9 businesses × 5 employees each)
    employee_emails text[];
    all_emails text[];
    full_names text[];
    v_user_id uuid;
    i int;
BEGIN
    -- Generate employee emails emp1..emp45@example.com
    FOR i IN 1..45 LOOP
        employee_emails := array_append(employee_emails, 'emp' || i || '@example.com');
        full_names := array_append(full_names, 'Employee ' || i);
    END LOOP;

    -- Prepend owner full names
    full_names := ARRAY[
        'Alice Owner', 'Bob Owner', 'Carol Owner', 'Dave Owner', 'Eve Owner', 'Frank Owner'
    ] || full_names;

    all_emails := owner_emails || employee_emails;

    FOR i IN 1..array_length(all_emails, 1) LOOP
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = all_emails[i]) THEN
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
                all_emails[i],
                extensions.crypt('password123', extensions.gen_salt('bf')),
                now(),
                now(),
                now(),
                '{"provider":"email","providers":["email"]}',
                jsonb_build_object('full_name', full_names[i]),
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
                jsonb_build_object('sub', v_user_id::text, 'email', all_emails[i]),
                'email', now(), now(), now()
            );
        END IF;
    END LOOP;
END $$;

-- ---------------------------------------------------------
-- 2. Global Permissions Catalog
-- ---------------------------------------------------------
INSERT INTO auth_permissions (permission_key, module_name, description)
VALUES
    ('create:all', 'global', 'Create any record'),
    ('read:all',   'global', 'Read any record'),
    ('update:all', 'global', 'Update any record'),
    ('delete:all', 'global', 'Delete any record'),
    ('manage:users', 'rbac', 'Manage users and roles'),
    ('view:reports', 'reports', 'Access financial reports')
ON CONFLICT (permission_key) DO NOTHING;

-- ---------------------------------------------------------
-- 3. Businesses
-- ---------------------------------------------------------
DO $$
DECLARE
    owner_ids uuid[];
    business_names text[] := ARRAY[
        'Tasty Bistro', 'Urban Mart', 'Bean Haven', 'Glamour Studio',
        'Fresh Market', 'Tech Haven', 'Book Nook', 'Fitness Hub', 'Pet Paradise'
    ];
    categories text[] := ARRAY[
        'Restaurant', 'Retail', 'Cafe', 'Salon',
        'Grocery', 'Electronics', 'Bookstore', 'Gym', 'Pet Store'
    ];
    i int;
    v_business_id uuid;
    owner_user_id uuid;
BEGIN
    SELECT array_agg(id ORDER BY email) INTO owner_ids
    FROM auth.users
    WHERE email LIKE 'owner%@example.com';

    FOR i IN 1..array_length(business_names, 1) LOOP
        owner_user_id := owner_ids[1 + ((i-1) % array_length(owner_ids, 1))];
        IF NOT EXISTS (SELECT 1 FROM org_businesses WHERE business_name = business_names[i]) THEN
            INSERT INTO org_businesses (
                owner_user_id, business_name, legal_name, slug, timezone, currency_code, status, business_category
            ) VALUES (
                owner_user_id,
                business_names[i],
                business_names[i] || ' LLC',
                lower(regexp_replace(business_names[i], ' ', '-', 'g')),
                'America/New_York',
                'USD',
                'active',
                categories[i]
            )
            RETURNING id INTO v_business_id;

            -- No longer need to store business_category in sys_settings
        END IF;
    END LOOP;
END $$;

-- ---------------------------------------------------------
-- 4. Tenant‑Scoped Roles & Permissions
-- ---------------------------------------------------------
DO $$
DECLARE
    b RECORD;
    role_admin_id uuid;
    role_manager_id uuid;
    role_cashier_id uuid;
    perm_read uuid;
BEGIN
    SELECT id INTO perm_read FROM auth_permissions WHERE permission_key = 'read:all';

    FOR b IN SELECT id FROM org_businesses LOOP
        -- Admin role
        INSERT INTO auth_roles (business_id, role_name, description, is_system_role)
        VALUES (b.id, 'admin', 'Full access to all features', true)
        ON CONFLICT (business_id, role_name) DO NOTHING
        RETURNING id INTO role_admin_id;

        IF role_admin_id IS NULL THEN
            SELECT id INTO role_admin_id FROM auth_roles WHERE business_id = b.id AND role_name = 'admin';
        END IF;

        -- Manager role
        INSERT INTO auth_roles (business_id, role_name, description, is_system_role)
        VALUES (b.id, 'manager', 'Manage day‑to‑day operations', false)
        ON CONFLICT (business_id, role_name) DO NOTHING
        RETURNING id INTO role_manager_id;

        IF role_manager_id IS NULL THEN
            SELECT id INTO role_manager_id FROM auth_roles WHERE business_id = b.id AND role_name = 'manager';
        END IF;

        -- Cashier role
        INSERT INTO auth_roles (business_id, role_name, description, is_system_role)
        VALUES (b.id, 'cashier', 'Process sales only', false)
        ON CONFLICT (business_id, role_name) DO NOTHING
        RETURNING id INTO role_cashier_id;

        IF role_cashier_id IS NULL THEN
            SELECT id INTO role_cashier_id FROM auth_roles WHERE business_id = b.id AND role_name = 'cashier';
        END IF;

        -- Assign permissions
        INSERT INTO auth_role_permissions (business_id, role_id, permission_id)
        SELECT b.id, role_admin_id, id FROM auth_permissions
        ON CONFLICT (role_id, permission_id) DO NOTHING;

        INSERT INTO auth_role_permissions (business_id, role_id, permission_id)
        SELECT b.id, role_manager_id, id FROM auth_permissions WHERE permission_key != 'delete:all'
        ON CONFLICT (role_id, permission_id) DO NOTHING;

        INSERT INTO auth_role_permissions (business_id, role_id, permission_id)
        VALUES (b.id, role_cashier_id, perm_read)
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END LOOP;
END $$;

-- ---------------------------------------------------------
-- 5. Assign Users to Businesses with Roles (one role per business)
-- ---------------------------------------------------------
DO $$
DECLARE
    b RECORD;
    employee_ids uuid[];
    emp_idx int;
    role_admin_id uuid;
    role_manager_id uuid;
    role_cashier_id uuid;
    assigned_role_id uuid;
BEGIN
    SELECT array_agg(id ORDER BY email) INTO employee_ids
    FROM auth.users
    WHERE email LIKE 'emp%@example.com';

    FOR b IN SELECT ob.id, ob.owner_user_id FROM org_businesses ob LOOP
        -- Owner gets admin
        SELECT id INTO role_admin_id FROM auth_roles WHERE business_id = b.id AND role_name = 'admin';
        INSERT INTO auth_user_business_roles (business_id, user_id, role_id, assigned_by_user_id)
        VALUES (b.id, b.owner_user_id, role_admin_id, b.owner_user_id)
        ON CONFLICT (business_id, user_id) DO UPDATE SET
            role_id = EXCLUDED.role_id,
            assigned_by_user_id = EXCLUDED.assigned_by_user_id,
            assigned_at = NOW();

        -- Employee roles: first 2 employees in this business get manager, rest cashier
        SELECT id INTO role_manager_id FROM auth_roles WHERE business_id = b.id AND role_name = 'manager';
        SELECT id INTO role_cashier_id FROM auth_roles WHERE business_id = b.id AND role_name = 'cashier';

        FOR emp_idx IN 1..array_length(employee_ids, 1) LOOP
            assigned_role_id := CASE WHEN emp_idx <= 2 THEN role_manager_id ELSE role_cashier_id END;
            INSERT INTO auth_user_business_roles (business_id, user_id, role_id, assigned_by_user_id)
            VALUES (b.id, employee_ids[emp_idx], assigned_role_id, b.owner_user_id)
            ON CONFLICT (business_id, user_id) DO UPDATE SET
                role_id = EXCLUDED.role_id,
                assigned_by_user_id = EXCLUDED.assigned_by_user_id,
                assigned_at = NOW();
        END LOOP;
    END LOOP;
END $$;

-- ---------------------------------------------------------
-- 6. Departments
-- ---------------------------------------------------------
INSERT INTO org_departments (business_id, department_name, code)
SELECT b.id, 'Sales', 'SALES'
FROM org_businesses b
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE business_id = b.id AND department_name = 'Sales');

INSERT INTO org_departments (business_id, department_name, code)
SELECT b.id, 'Operations', 'OPS'
FROM org_businesses b
WHERE NOT EXISTS (SELECT 1 FROM org_departments WHERE business_id = b.id AND department_name = 'Operations');

-- ---------------------------------------------------------
-- 7. Employees (each employee user assigned to ONE business only)
-- ---------------------------------------------------------
DO $$
DECLARE
    emp_user RECORD;
    b RECORD;
    dept_id uuid;
    v_employee_code text;
    v_full_name text;
    v_first_name text;
    v_last_name text;
    employee_counter int := 1;
    employees_per_business int := 5;
BEGIN
    -- Loop through businesses
    FOR b IN SELECT id FROM org_businesses ORDER BY business_name LOOP
        -- For each business, take the next batch of 5 employees
        FOR i IN 1..employees_per_business LOOP
            -- Get the next employee user (by order of email)
            SELECT u.id, u.email, u.raw_user_meta_data->>'full_name' AS full_name
            INTO emp_user
            FROM auth.users u
            WHERE u.email LIKE 'emp%@example.com'
            ORDER BY u.email
            LIMIT 1 OFFSET (employee_counter - 1);

            IF emp_user IS NULL THEN
                EXIT; -- No more employees
            END IF;

            v_full_name := emp_user.full_name;
            v_first_name := split_part(v_full_name, ' ', 1);
            v_last_name := split_part(v_full_name, ' ', 2);

            SELECT id INTO dept_id FROM org_departments WHERE business_id = b.id AND department_name = 'Sales' LIMIT 1;
            v_employee_code := 'EMP' || substr(md5(random()::text), 1, 6);

            INSERT INTO org_employees (
                business_id, department_id, employee_code, first_name, last_name,
                email, phone, job_title, employment_status, hired_at
            ) VALUES (
                b.id,
                dept_id,
                v_employee_code,
                v_first_name,
                v_last_name,
                emp_user.email,
                '+1' || (1000000000 + floor(random() * 900000000)::bigint),
                CASE WHEN random() < 0.3 THEN 'Manager' ELSE 'Associate' END,
                'active',
                CURRENT_DATE - (random() * 365)::int
            );

            employee_counter := employee_counter + 1;
        END LOOP;
    END LOOP;
END $$;

-- ---------------------------------------------------------
-- 8. Catalog Categories & Products
-- ---------------------------------------------------------
DO $$
DECLARE
    b RECORD;
    cat_id uuid;
    prod_id uuid;
    i int;
BEGIN
    FOR b IN SELECT id, business_name FROM org_businesses LOOP
        -- Default category
        IF NOT EXISTS (SELECT 1 FROM catalog_categories WHERE business_id = b.id AND category_name = 'General') THEN
            INSERT INTO catalog_categories (business_id, category_name, slug)
            VALUES (b.id, 'General', 'general')
            RETURNING id INTO cat_id;
        ELSE
            SELECT id INTO cat_id FROM catalog_categories WHERE business_id = b.id AND category_name = 'General';
        END IF;

        -- Products
        FOR i IN 1..10 LOOP
            INSERT INTO catalog_products (
                business_id, sku, barcode, product_name, description,
                uom, default_price, cost_price, is_active, image_url
            ) VALUES (
                b.id,
                'SKU-' || b.id::text || '-' || i,
                'BAR' || floor(random() * 1000000)::text,
                'Product ' || i || ' of ' || b.business_name,
                'Auto‑generated product',
                'ea',
                10 + (random() * 90)::int,
                5 + (random() * 40)::int,
                true, 'https://picsum.photos/200/200?random=' || floor(random() * 1000)::text
            )
            RETURNING id INTO prod_id;

            INSERT INTO catalog_product_categories (business_id, product_id, category_id, is_primary)
            VALUES (b.id, prod_id, cat_id, true)
            ON CONFLICT (product_id, category_id) DO NOTHING;

            INSERT INTO catalog_inventory (business_id, product_id, on_hand_qty, reorder_level)
            VALUES (b.id, prod_id, floor(random() * 100)::int, 10)
            ON CONFLICT (product_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- ---------------------------------------------------------
-- 9. Vendora Customers
-- ---------------------------------------------------------
DO $$
DECLARE
    b RECORD;
    i int;
BEGIN
    FOR b IN SELECT id FROM org_businesses LOOP
        FOR i IN 1..15 LOOP
            INSERT INTO pos_customers (business_id, customer_name, email, phone, loyalty_number)
            VALUES (
                b.id,
                'Customer ' || i,
                'cust' || i || '@example.com',
                '+1' || (2000000000 + floor(random() * 800000000)::bigint),
                'LY' || floor(random() * 10000)::text
            )
            ON CONFLICT (business_id, loyalty_number) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- ---------------------------------------------------------
-- 10. Sales Orders & Items
-- ---------------------------------------------------------
DO $$
DECLARE
    b RECORD;
    cust RECORD;
    prod RECORD;
    order_id uuid;
    order_number text;
    total numeric;
    qty int;
    unit_price numeric;
    cashier_employee_id uuid;
BEGIN
    FOR b IN SELECT id FROM org_businesses LOOP
        -- Pick a cashier employee
        SELECT e.id INTO cashier_employee_id
        FROM org_employees e
        JOIN auth_user_business_roles ubr ON ubr.business_id = e.business_id
        JOIN auth_roles r ON ubr.role_id = r.id
        WHERE e.business_id = b.id
          AND r.role_name = 'cashier'
          AND ubr.user_id = (SELECT user_id FROM auth_user_business_roles WHERE business_id = b.id AND role_id = r.id LIMIT 1)
        LIMIT 1;

        IF cashier_employee_id IS NULL THEN
            SELECT id INTO cashier_employee_id FROM org_employees WHERE business_id = b.id LIMIT 1;
        END IF;

        FOR cust IN SELECT id FROM pos_customers WHERE business_id = b.id LIMIT 10 LOOP
            FOR order_num IN 1..3 LOOP
                order_number := 'ORD-' || b.id::text || '-' || 
                                to_char(now(), 'YYYYMMDD') || '-' || 
                                floor(random() * 1000000)::text;

                INSERT INTO pos_sales_orders (
                    business_id, customer_id, cashier_employee_id, order_number,
                    order_date, status, payment_status, subtotal_amount, tax_amount, total_amount
                ) VALUES (
                    b.id, cust.id, cashier_employee_id, order_number,
                    now() - (random() * interval '30 days'),
                    'completed', 'paid', 0, 0, 0
                )
                RETURNING id INTO order_id;

                total := 0;
                FOR prod IN SELECT id, default_price FROM catalog_products WHERE business_id = b.id ORDER BY random() LIMIT (2 + floor(random() * 4)::int) LOOP
                    qty := 1 + floor(random() * 3)::int;
                    unit_price := prod.default_price;
                    total := total + (qty * unit_price);

                    INSERT INTO pos_sale_items (business_id, sales_order_id, product_id, quantity, unit_price)
                    VALUES (b.id, order_id, prod.id, qty, unit_price);
                END LOOP;

                UPDATE pos_sales_orders
                SET subtotal_amount = total,
                    tax_amount = total * 0.1,
                    total_amount = total * 1.1
                WHERE id = order_id;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- ---------------------------------------------------------
-- 11. Procurement: Suppliers & Purchase Orders
-- ---------------------------------------------------------
DO $$
DECLARE
    b RECORD;
    supplier_id uuid;
    po_id uuid;
    prod RECORD;
    total numeric;
BEGIN
    FOR b IN SELECT id, business_name FROM org_businesses LOOP
        INSERT INTO procurement_suppliers (business_id, supplier_name, contact_name, email, phone)
        VALUES (b.id, 'Supplier of ' || b.business_name, 'John Doe', 'supplier@example.com', '+1234567890')
        ON CONFLICT DO NOTHING
        RETURNING id INTO supplier_id;

        IF supplier_id IS NULL THEN
            SELECT id INTO supplier_id FROM procurement_suppliers WHERE business_id = b.id LIMIT 1;
        END IF;

        INSERT INTO procurement_purchase_orders (
            business_id, supplier_id, po_number, order_date, expected_date, status
        ) VALUES (
            b.id, supplier_id,
            'PO-' || b.id::text || '-' || to_char(now(), 'YYYYMMDD') || '-' || floor(random()*1000)::text,
            now() - interval '10 days',
            now() + interval '5 days',
            'ordered'
        )
        RETURNING id INTO po_id;

        total := 0;
        FOR prod IN SELECT id, cost_price FROM catalog_products WHERE business_id = b.id ORDER BY random() LIMIT 5 LOOP
            INSERT INTO procurement_po_items (business_id, purchase_order_id, product_id, quantity, unit_cost)
            VALUES (b.id, po_id, prod.id, 10 + floor(random() * 20)::int, prod.cost_price);
            total := total + (10 * prod.cost_price);
        END LOOP;

        UPDATE procurement_purchase_orders
        SET subtotal_amount = total,
            tax_amount = total * 0.1,
            total_amount = total * 1.1
        WHERE id = po_id;
    END LOOP;
END $$;

-- ---------------------------------------------------------
-- 12. System Audit Logs
-- ---------------------------------------------------------
DO $$
DECLARE
    user_ids uuid[];
    actions text[] := ARRAY['login', 'create_order', 'update_product', 'delete_customer'];
    entity_types text[] := ARRAY['pos_sales_orders', 'catalog_products', 'pos_customers'];
    i int;
    u RECORD;
    rand_business_id uuid;
BEGIN
    SELECT array_agg(id) INTO user_ids FROM auth.users WHERE email LIKE '%@example.com' LIMIT 10;

    FOR u IN SELECT unnest(user_ids) AS user_id LOOP
        FOR i IN 1..5 LOOP
            SELECT id INTO rand_business_id FROM org_businesses ORDER BY random() LIMIT 1;
            INSERT INTO sys_audit_logs (
                business_id, actor_user_id, action, entity_type, entity_id, before_data, after_data, request_id
            ) VALUES (
                rand_business_id,
                u.user_id,
                actions[1 + floor(random() * array_length(actions, 1))::int],
                entity_types[1 + floor(random() * array_length(entity_types, 1))::int],
                gen_random_uuid(),
                jsonb_build_object('old', 'value'),
                jsonb_build_object('new', 'value'),
                gen_random_uuid()::text
            );
        END LOOP;
    END LOOP;
END $$;

-- ---------------------------------------------------------
-- 13. User Settings (current business context)
-- ---------------------------------------------------------
DO $$
DECLARE
    user_record RECORD;
    business_id_for_user uuid;
BEGIN
    FOR user_record IN SELECT id FROM auth.users WHERE email LIKE '%@example.com' LOOP
        -- Try to get a business where the user is owner
        SELECT id INTO business_id_for_user
        FROM org_businesses
        WHERE owner_user_id = user_record.id
        LIMIT 1;

        -- If not owner, get any business where user has a role
        IF business_id_for_user IS NULL THEN
            SELECT business_id INTO business_id_for_user
            FROM auth_user_business_roles
            WHERE user_id = user_record.id
            LIMIT 1;
        END IF;

        -- Insert or update user_settings
        IF business_id_for_user IS NOT NULL THEN
            INSERT INTO user_settings (user_id, current_business_id)
            VALUES (user_record.id, business_id_for_user)
            ON CONFLICT (user_id) DO UPDATE SET current_business_id = EXCLUDED.current_business_id;
        END IF;
    END LOOP;
END $$;

-- ---------------------------------------------------------
-- Final Summary
-- ---------------------------------------------------------
SELECT
    'Seeding completed successfully!' AS status,
    (SELECT COUNT(*) FROM org_businesses) AS businesses,
    (SELECT COUNT(*) FROM auth_roles) AS roles,
    (SELECT COUNT(*) FROM auth_user_business_roles) AS user_assignments,
    (SELECT COUNT(*) FROM org_employees) AS employees,
    (SELECT COUNT(*) FROM catalog_products) AS products,
    (SELECT COUNT(*) FROM pos_sales_orders) AS sales_orders,
    (SELECT COUNT(*) FROM procurement_purchase_orders) AS purchase_orders,
    (SELECT COUNT(*) FROM sys_audit_logs) AS audit_logs;

COMMIT;