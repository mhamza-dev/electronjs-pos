-- =========================================================
-- EXTENSIONS
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- BUSINESS TYPES
-- =========================================================
CREATE TABLE business_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

-- =========================================================
-- BUSINESSES
-- =========================================================
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id),
    business_type_id UUID REFERENCES business_types(id),
    name TEXT NOT NULL,
    currency TEXT DEFAULT 'PKR',
    timezone TEXT DEFAULT 'Asia/Karachi',
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- FEATURES
-- =========================================================
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE business_type_features (
    business_type_id UUID REFERENCES business_types(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    PRIMARY KEY (business_type_id, feature_id)
);

CREATE TABLE business_features (
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES features(id),
    is_enabled BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (business_id, feature_id)
);

-- =========================================================
-- ROLES & PERMISSIONS
-- =========================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- =========================================================
-- BUSINESS USERS
-- =========================================================
CREATE TABLE business_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id),
    status TEXT DEFAULT 'active',
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, business_id)
);

-- =========================================================
-- BRANCHES
-- =========================================================
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- EMPLOYEES
-- =========================================================
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    business_id UUID REFERENCES businesses(id),
    designation TEXT,
    salary NUMERIC,
    hired_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE employee_branches (
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    PRIMARY KEY (employee_id, branch_id)
);

CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id),
    branch_id UUID REFERENCES branches(id),
    start_time TIMESTAMP,
    end_time TIMESTAMP
);

-- =========================================================
-- CUSTOMERS
-- =========================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id),
    name TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- ITEMS
-- =========================================================
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id),
    name TEXT NOT NULL,
    type TEXT,
    sku TEXT,
    barcode TEXT,
    image TEXT,
    price NUMERIC,
    cost NUMERIC,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE item_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES items(id),
    name TEXT,
    sku TEXT,
    price NUMERIC
);

-- =========================================================
-- INVENTORY
-- =========================================================
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES items(id),
    branch_id UUID REFERENCES branches(id),
    quantity NUMERIC DEFAULT 0,
    low_stock_threshold NUMERIC DEFAULT 5
);

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID,
    branch_id UUID,
    change NUMERIC,
    type TEXT,
    reference_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID,
    branch_id UUID,
    quantity NUMERIC,
    expiry_date DATE,
    cost NUMERIC
);

-- =========================================================
-- ORDERS
-- =========================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID,
    branch_id UUID,
    customer_id UUID,
    created_by UUID,
    order_type TEXT,
    total_amount NUMERIC,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    item_id UUID,
    quantity NUMERIC,
    price NUMERIC
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    method TEXT,
    amount NUMERIC,
    paid_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- RESTAURANT
-- =========================================================
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id),
    table_number TEXT,
    capacity INT,
    status TEXT DEFAULT 'available'
);

-- =========================================================
-- APPOINTMENTS
-- =========================================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id),
    name TEXT,
    price NUMERIC,
    duration_minutes INT
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id),
    branch_id UUID REFERENCES branches(id),
    customer_id UUID REFERENCES customers(id),
    service_id UUID REFERENCES items(id),
    employee_id UUID,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status TEXT
);

-- =========================================================
-- SUPPLIERS / PURCHASES
-- =========================================================
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id),
    name TEXT,
    contact TEXT
);

CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id),
    business_id UUID REFERENCES businesses(id),
    total_amount NUMERIC,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
    item_id UUID,
    quantity NUMERIC,
    cost NUMERIC
);

-- =========================================================
-- FINANCE
-- =========================================================
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID,
    name TEXT,
    type TEXT
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES accounts(id),
    amount NUMERIC,
    type TEXT,
    reference_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID,
    customer_id UUID,
    total NUMERIC,
    status TEXT,
    due_date DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- LOGS
-- =========================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_business_id UUID REFERENCES businesses(id),
  updated_at TIMESTAMP DEFAULT NOW()
);