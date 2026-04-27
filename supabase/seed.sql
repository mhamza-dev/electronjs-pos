BEGIN;

-- =========================================================
-- 0. SAFE MODE
-- =========================================================
SET session_replication_role = replica;

-- =========================================================
-- 1. AUTH USERS + IDENTITIES
-- =========================================================

WITH users_raw AS (
    SELECT
        gen_random_uuid() AS id,
        CASE
            WHEN i <= 10 THEN 'owner' || i || '@example.com'
            ELSE 'emp' || (i - 10) || '@example.com'
        END AS email,
        extensions.crypt('password123', extensions.gen_salt('bf')) AS password,
        jsonb_build_object(
            'full_name',
            CASE
                WHEN i <= 10 THEN 'Owner ' || i
                ELSE 'Employee ' || (i - 10)
            END
        ) AS meta
    FROM generate_series(1, 260) i
),
deduped AS (
    SELECT DISTINCT ON (email) *
    FROM users_raw
    ORDER BY email, id
),
insert_users AS (
    INSERT INTO auth.users (
        instance_id, id, aud, role, email,
        encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data,
        created_at, updated_at,
        confirmation_token, email_change,
        email_change_token_new, recovery_token
    )
    SELECT
        '00000000-0000-0000-0000-000000000000',
        id,
        'authenticated',
        'authenticated',
        email,
        password,
        now(),
        '{"provider":"email","providers":["email"]}',
        meta,
        now(), now(),
        '', '', '', ''
    FROM deduped
    RETURNING id, email
)
INSERT INTO auth.identities (
    id, provider_id, user_id,
    identity_data, provider,
    created_at, updated_at
)
SELECT
    gen_random_uuid(),
    id,
    id,
    jsonb_build_object('sub', id::text, 'email', email),
    'email',
    now(), now()
FROM insert_users;

-- =========================================================
-- 2. BUSINESSES
-- =========================================================

WITH owners AS (
    SELECT id, row_number() OVER (ORDER BY id) rn
    FROM auth.users
    WHERE email LIKE 'owner%'
)
INSERT INTO businesses (
    id, name, type, owner_id, email, phone, address
)
SELECT
    gen_random_uuid(),
    'Business ' || i,
    (ARRAY['retail','restaurant','salon','hospital','pharmacy','warehouse'])[1 + (i % 6)],
    o.id,
    'biz' || i || '@example.com',
    '+92300' || (1000000 + i),
    'City ' || i
FROM generate_series(1, 15) i
JOIN owners o ON o.rn = 1 + ((i - 1) % (SELECT count(*) FROM owners));

-- =========================================================
-- 3. BRANCHES
-- =========================================================

INSERT INTO branches (id, business_id, name, address)
SELECT
    gen_random_uuid(),
    b.id,
    'Branch ' || gs.n,
    'Address ' || gs.n
FROM businesses b
JOIN LATERAL generate_series(1, 3) gs(n) ON true;

-- =========================================================
-- 4. USER PROFILES (IDEMPOTENT)
-- =========================================================

-- Owners get the business they own, role = 'owner'
INSERT INTO user_profiles (
    id, business_id, branch_id, role, full_name, email, phone, is_active
)
SELECT
    u.id,
    b.id,
    NULL,
    'owner',
    u.raw_user_meta_data->>'full_name',
    u.email,
    '+923001111111',
    true
FROM auth.users u
JOIN businesses b ON b.owner_id = u.id
WHERE u.email LIKE 'owner%'
ON CONFLICT (id) DO NOTHING;

-- Employees get randomly assigned to businesses, role = 'staff' (or other)
INSERT INTO user_profiles (
    id, business_id, branch_id, role, full_name, email, phone, is_active
)
SELECT
    u.id,
    biz.id,
    br.id,
    (ARRAY['staff','cashier','manager','receptionist'])[1 + (row_number() OVER () % 4)],
    u.raw_user_meta_data->>'full_name',
    u.email,
    '+923002222222',
    true
FROM auth.users u
CROSS JOIN LATERAL (
    SELECT id
    FROM businesses
    ORDER BY random()
    LIMIT 1
) biz
JOIN branches br ON br.business_id = biz.id
WHERE u.email NOT LIKE 'owner%'
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- 5. CUSTOMERS
-- =========================================================

INSERT INTO customers (business_id, name, phone)
SELECT
    b.id,
    'Customer ' || gs.n,
    '+92300' || (2000000 + gs.n)
FROM businesses b
JOIN LATERAL generate_series(1, 20) gs(n) ON true;

-- =========================================================
-- 6. PRODUCTS
-- =========================================================

INSERT INTO products (
    business_id, name, sku, price, stock_quantity
)
SELECT
    b.id,
    'Product ' || gs.n,
    'SKU-' || gs.n || '-' || substr(b.id::text,1,8),
    100 + gs.n,
    (gs.n * 7) % 50
FROM businesses b
JOIN LATERAL generate_series(1, 15) gs(n) ON true;

-- =========================================================
-- 7. SERVICES
-- =========================================================

INSERT INTO services (
    business_id, name, price, duration_minutes
)
SELECT
    b.id,
    'Service ' || gs.n,
    50 + (gs.n * 10),
    15 + (gs.n * 5)
FROM businesses b
JOIN LATERAL generate_series(1, 5) gs(n) ON true;

-- =========================================================
-- 8. PACKAGES
-- =========================================================

INSERT INTO packages (
    business_id, name, price, duration_minutes
)
SELECT
    b.id,
    'Package ' || gs.n,
    200 + (gs.n * 20),
    60 + (gs.n * 30)
FROM businesses b
JOIN LATERAL generate_series(1, 3) gs(n) ON true;

-- =========================================================
-- 9. SUPPLIERS
-- =========================================================

INSERT INTO suppliers (
    business_id, name, phone, email
)
SELECT
    b.id,
    'Supplier ' || gs.n,
    '+92300' || (3000000 + gs.n),
    'supplier' || gs.n || '@example.com'
FROM businesses b
JOIN LATERAL generate_series(1, 3) gs(n) ON true;

-- =========================================================
-- 10. DEALS
-- =========================================================

WITH deals AS (
    SELECT
        gen_random_uuid() id,
        b.id business_id,
        'Deal ' || gs.n name,
        300 + (gs.n * 50) total_price
    FROM businesses b
    JOIN LATERAL generate_series(1, 2) gs(n) ON true
)
INSERT INTO deals (id, business_id, name, total_price)
SELECT * FROM deals;

-- =========================================================
-- 11. DEAL SERVICES
-- =========================================================

INSERT INTO deal_services (
    deal_id, service_id, quantity, discount_percent
)
SELECT
    d.id,
    s.id,
    1,
    0
FROM deals d
JOIN LATERAL (
    SELECT id FROM services WHERE business_id = d.business_id LIMIT 3
) s ON true
ON CONFLICT (deal_id, service_id) DO NOTHING;   -- safe when double‑seeded

-- =========================================================
-- 12. DOCTORS
-- =========================================================

INSERT INTO doctors (
    business_id, branch_id, specialization, license_number
)
SELECT
    b.id,
    br.id,
    (ARRAY['Cardiology','Dermatology','Pediatrics'])[1 + (gs.n % 3)],
    'LIC-' || gs.n || '-' || substr(b.id::text,1,6)
FROM businesses b
JOIN LATERAL (
    SELECT id FROM branches WHERE business_id = b.id LIMIT 2
) br ON true
JOIN LATERAL generate_series(1, 2) gs(n) ON true;

-- =========================================================
-- 13. MEDICAL RECORDS
-- =========================================================

INSERT INTO medical_records (
    business_id, customer_id, doctor_id,
    diagnosis, prescription, notes
)
SELECT
    d.business_id,
    c.id,
    d.id,
    'Diagnosis ' || gs.n,
    'Prescription ' || gs.n,
    'Notes ' || gs.n
FROM doctors d
JOIN LATERAL (
    SELECT id FROM customers WHERE business_id = d.business_id LIMIT 3
) c ON true
JOIN LATERAL generate_series(1, 3) gs(n) ON true;

-- =========================================================
-- 14. RESTAURANT TABLES
-- =========================================================

INSERT INTO restaurant_tables (
    business_id, branch_id, table_number, capacity
)
SELECT
    b.id,
    br.id,
    'T' || gs.n,
    2 + (gs.n % 4)
FROM businesses b
JOIN branches br ON br.business_id = b.id
JOIN LATERAL generate_series(1, 5) gs(n) ON true
WHERE b.type = 'restaurant';

-- =========================================================
-- 15. SALES
-- =========================================================

WITH sales AS (
    SELECT
        gen_random_uuid() id,
        b.id business_id,
        c.id customer_id
    FROM businesses b
    JOIN LATERAL (
        SELECT id FROM customers WHERE business_id = b.id LIMIT 5
    ) c ON true
)
INSERT INTO sales (id, business_id, customer_id, total)
SELECT id, business_id, customer_id, 0 FROM sales;

-- =========================================================
-- 16. SALE ITEMS
-- =========================================================

INSERT INTO sale_items (
    sale_id, item_type, product_id,
    quantity, unit_price, total_price
)
SELECT
    s.id,
    'product',
    p.id,
    (gs.n % 3) + 1,
    p.price,
    p.price * ((gs.n % 3) + 1)
FROM sales s
JOIN LATERAL (
    SELECT id, price FROM products
    WHERE business_id = s.business_id LIMIT 3
) p ON true
JOIN LATERAL generate_series(1, 3) gs(n) ON true;

-- =========================================================
-- 17. APPOINTMENTS
-- =========================================================

INSERT INTO appointments (
    business_id, branch_id, customer_id,
    service_id, scheduled_at, status, created_by
)
SELECT
    b.id,
    br.id,
    c.id,
    s.id,
    now() + (gs.n || ' days')::interval,
    (ARRAY['scheduled','confirmed','completed'])[1 + (gs.n % 3)],
    u.id
FROM businesses b
JOIN LATERAL (SELECT id FROM branches WHERE business_id = b.id LIMIT 1) br ON true
JOIN LATERAL (SELECT id FROM customers WHERE business_id = b.id LIMIT 3) c ON true
JOIN LATERAL (SELECT id FROM services WHERE business_id = b.id LIMIT 1) s ON true
JOIN LATERAL (
    SELECT id FROM auth.users WHERE email LIKE 'owner%' LIMIT 1
) u ON true
JOIN LATERAL generate_series(1, 5) gs(n) ON true;

-- =========================================================
-- 18. AUDIT LOGS
-- =========================================================

INSERT INTO audit_logs (
    business_id, user_id, action,
    entity, entity_id, metadata
)
SELECT
    b.id,
    u.id,
    (ARRAY['create','update','delete','login'])[1 + (gs.n % 4)],
    (ARRAY['business','product','sale','customer'])[1 + (gs.n % 4)],
    gen_random_uuid(),
    jsonb_build_object('seed', gs.n)
FROM businesses b
JOIN LATERAL (
    SELECT id FROM auth.users WHERE email LIKE 'owner%' LIMIT 1
) u ON true
JOIN LATERAL generate_series(1, 5) gs(n) ON true;

-- =========================================================
-- FINALIZE
-- =========================================================

SET session_replication_role = origin;

-- Summary of generated rows
SELECT
    (SELECT COUNT(*) FROM auth.users) AS users,
    (SELECT COUNT(*) FROM auth.identities) AS identities,
    (SELECT COUNT(*) FROM businesses) AS businesses,
    (SELECT COUNT(*) FROM user_profiles) AS profiles,
    (SELECT COUNT(*) FROM customers) AS customers,
    (SELECT COUNT(*) FROM products) AS products,
    (SELECT COUNT(*) FROM sales) AS sales,
    (SELECT COUNT(*) FROM sale_items) AS sale_items;

COMMIT;