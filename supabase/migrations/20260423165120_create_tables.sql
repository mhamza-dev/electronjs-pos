-- gen_random_uuid
CREATE EXTENSION IF NOT EXISTS pgcrypto;

---------------------------------------------------------------------
-- Businesses
---------------------------------------------------------------------
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('retail','restaurant','salon','hospital','pharmacy','warehouse','hybrid')),
  owner_id uuid references auth.users(id) on delete cascade,
  email text,
  phone text,
  address text,
  timezone text default 'Asia/Karachi',
  currency text default 'PKR',
  deleted_at timestamptz,                -- renamed from delete_at
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_businesses_owner_id on businesses (owner_id);

---------------------------------------------------------------------
-- Branches
---------------------------------------------------------------------
create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  address text,
  phone text,
  deleted_at timestamptz,                -- renamed from delete_at
  is_active boolean default true,
  created_at timestamptz default now(),
  unique (id, business_id)
);
create index if not exists idx_branches_business_id on branches (business_id);

---------------------------------------------------------------------
-- User Profiles
---------------------------------------------------------------------
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  branch_id uuid,
  role text not null check (role in ('super_admin', 'owner','admin','manager','cashier','staff','doctor','receptionist')),
  full_name text,
  email text,
  phone text,
  is_active boolean default true,
  deleted_at timestamptz,                -- renamed from delete_at
  created_at timestamptz default now(),
  constraint user_profiles_branch_fk
    foreign key (branch_id, business_id)
    references branches(id, business_id) on delete cascade
);
create index if not exists idx_user_profiles_business_id on user_profiles (business_id);
create index if not exists idx_user_profiles_branch_id on user_profiles (branch_id);

---------------------------------------------------------------------
-- Customers
---------------------------------------------------------------------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  loyalty_points int default 0,
  deleted_at timestamptz,                -- added
  created_at timestamptz default now(),
  unique (id, business_id)
);
create index if not exists idx_customers_business_id on customers (business_id);

---------------------------------------------------------------------
-- Doctors
---------------------------------------------------------------------
create table if not exists doctors (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,  -- made not null
  branch_id uuid references branches(id) on delete cascade,
  specialization text,
  license_number text,
  deleted_at timestamptz,                -- added
  created_at timestamptz default now()   -- changed to timestamptz
);
create index if not exists idx_doctors_business_id on doctors (business_id);
create index if not exists idx_doctors_branch_id on doctors (branch_id);

---------------------------------------------------------------------
-- Medical Records
---------------------------------------------------------------------
create table if not exists medical_records (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,  -- made not null
  customer_id uuid not null references customers(id) on delete cascade,  -- made not null
  doctor_id uuid references doctors(id) on delete cascade,
  diagnosis text,
  prescription text,
  notes text,
  deleted_at timestamptz,                -- added
  created_at timestamptz default now()   -- changed to timestamptz
);
create index if not exists idx_medical_records_business_id on medical_records (business_id);
create index if not exists idx_medical_records_customer_id on medical_records (customer_id);
create index if not exists idx_medical_records_doctor_id on medical_records (doctor_id);

---------------------------------------------------------------------
-- Products
---------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  branch_id uuid references branches(id) on delete cascade,
  name text not null,
  sku text,
  barcode text,
  price numeric(10,2) not null,
  cost_price numeric(10,2) default 0,
  stock_quantity int default 0,
  reorder_level int default 0,
  is_active boolean default true,
  deleted_at timestamptz,                -- added
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (business_id, sku),
  unique (id, business_id)
);
create index if not exists idx_products_business_id on products (business_id);
create index if not exists idx_products_branch_id on products (branch_id);

---------------------------------------------------------------------
-- Inventory Movements
---------------------------------------------------------------------
create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  branch_id uuid references branches(id) on delete cascade,
  product_id uuid not null,
  type text check (type in ('in','out','adjustment')),
  quantity int not null,
  reason text,
  created_by uuid references auth.users(id) on delete cascade,
  deleted_at timestamptz,                -- added
  created_at timestamptz default now(),
  constraint inventory_product_fk
    foreign key (product_id, business_id)
    references products(id, business_id)
);
create index if not exists idx_inventory_movements_business_id on inventory_movements (business_id);
create index if not exists idx_inventory_movements_product_id on inventory_movements (product_id);

---------------------------------------------------------------------
-- Services
---------------------------------------------------------------------
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  branch_id uuid references branches(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null,
  duration_minutes int,
  is_active boolean default true,
  deleted_at timestamptz,                -- added
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (id, business_id)
);
create index if not exists idx_services_business_id on services (business_id);

---------------------------------------------------------------------
-- Packages
---------------------------------------------------------------------
create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  branch_id uuid references branches(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null,
  duration_minutes int,
  is_active boolean default true,
  deleted_at timestamptz,                -- added
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (id, business_id)
);
create index if not exists idx_packages_business_id on packages (business_id);

---------------------------------------------------------------------
-- Deals
---------------------------------------------------------------------
create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  branch_id uuid references branches(id) on delete cascade,
  name text not null,
  total_price numeric(10,2),
  is_active boolean default true,
  deleted_at timestamptz,                -- added
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (id, business_id)
);
create index if not exists idx_deals_business_id on deals (business_id);

---------------------------------------------------------------------
-- Deal Services
---------------------------------------------------------------------
create table if not exists deal_services (
  deal_id uuid references deals(id) on delete cascade,
  service_id uuid references services(id) on delete cascade,
  quantity int default 1,
  discount_percent numeric(5,2) default 0,
  deleted_at timestamptz,                -- added
  primary key (deal_id, service_id)
);

---------------------------------------------------------------------
-- Appointments
---------------------------------------------------------------------
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  branch_id uuid references branches(id) on delete cascade,
  customer_id uuid,
  service_id uuid references services(id) on delete cascade,
  package_id uuid references packages(id) on delete cascade,
  deal_id uuid references deals(id) on delete cascade,
  scheduled_at timestamptz not null,
  status text default 'scheduled',
  notes text,
  created_by uuid references auth.users(id) on delete cascade,
  deleted_at timestamptz,                -- added
  created_at timestamptz default now(),
  constraint appointment_customer_fk
    foreign key (customer_id, business_id)
    references customers(id, business_id)
);
create index if not exists idx_appointments_business_id on appointments (business_id);

---------------------------------------------------------------------
-- Suppliers
---------------------------------------------------------------------
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  deleted_at timestamptz,                -- added
  created_at timestamptz default now()
);
create index if not exists idx_suppliers_business_id on suppliers (business_id);

---------------------------------------------------------------------
-- Purchases
---------------------------------------------------------------------
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  branch_id uuid references branches(id) on delete cascade,
  supplier_id uuid references suppliers(id) on delete cascade,
  created_by uuid references auth.users(id) on delete cascade,
  total numeric(10,2) default 0,
  status text default 'pending',
  deleted_at timestamptz,                -- added
  created_at timestamptz default now(),
  unique (id, business_id)
);
create index if not exists idx_purchases_business_id on purchases (business_id);

---------------------------------------------------------------------
-- Sales
---------------------------------------------------------------------
create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  branch_id uuid references branches(id) on delete cascade,
  customer_id uuid,
  subtotal numeric(10,2) default 0,
  total numeric(10,2) default 0,
  created_by uuid references auth.users(id) on delete cascade,
  deleted_at timestamptz,                -- added
  created_at timestamptz default now(),
  unique (id, business_id)
);
create index if not exists idx_sales_business_id on sales (business_id);

---------------------------------------------------------------------
-- Sale Items
---------------------------------------------------------------------
create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid references sales(id) on delete cascade,
  item_type text not null check (item_type in ('product','service','package','deal')),
  product_id uuid references products(id) on delete cascade,
  service_id uuid references services(id) on delete cascade,
  package_id uuid references packages(id) on delete cascade,
  deal_id uuid references deals(id) on delete cascade,
  quantity int default 1,
  unit_price numeric(10,2) not null,
  total_price numeric(10,2) not null,
  deleted_at timestamptz                 -- added
);
create index if not exists idx_sale_items_sale_id on sale_items (sale_id);

---------------------------------------------------------------------
-- Payments
---------------------------------------------------------------------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  sale_id uuid,
  purchase_id uuid,
  amount numeric(10,2) not null,
  method text check (method in ('cash','card','wallet','bank','other')),
  deleted_at timestamptz,                -- added
  created_at timestamptz default now(),
  constraint payments_one_target
    check (
      (sale_id is not null and purchase_id is null) OR
      (sale_id is null and purchase_id is not null)
    ),
  constraint payments_sale_fk
    foreign key (sale_id, business_id)
    references sales(id, business_id) on delete cascade,
  constraint payments_purchase_fk
    foreign key (purchase_id, business_id)
    references purchases(id, business_id)
);
create index if not exists idx_payments_business_id on payments (business_id);

---------------------------------------------------------------------
-- Restaurant Tables
---------------------------------------------------------------------
create table if not exists restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade, -- made not null
  branch_id uuid not null references branches(id) on delete cascade,     -- made not null
  table_number text not null,
  capacity int,
  status text default 'available' check (status in ('available','occupied','reserved','maintenance')),
  deleted_at timestamptz,                -- added
  unique (branch_id, table_number)
);
create index if not exists idx_restaurant_tables_business_id on restaurant_tables (business_id);
create index if not exists idx_restaurant_tables_branch_id on restaurant_tables (branch_id);

---------------------------------------------------------------------
-- Kitchen Orders
---------------------------------------------------------------------
create table if not exists kitchen_orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade, -- made not null
  branch_id uuid not null references branches(id) on delete cascade,     -- made not null
  table_id uuid references restaurant_tables(id) on delete cascade,
  sale_id uuid references sales(id) on delete cascade,
  status text default 'pending',
  priority text default 'normal',
  deleted_at timestamptz,                -- added
  created_at timestamptz default now()   -- changed to timestamptz
);
create index if not exists idx_kitchen_orders_sale_id on kitchen_orders (sale_id);
create index if not exists idx_kitchen_orders_table_id on kitchen_orders (table_id);
create index if not exists idx_kitchen_orders_business_id on kitchen_orders (business_id);
create index if not exists idx_kitchen_orders_branch_id on kitchen_orders (branch_id);

---------------------------------------------------------------------
-- Audit Logs
---------------------------------------------------------------------
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  action text,
  entity text,
  entity_id uuid,
  metadata jsonb,
  deleted_at timestamptz,                -- added
  created_at timestamptz default now()
);
create index if not exists idx_audit_logs_business_id on audit_logs (business_id);