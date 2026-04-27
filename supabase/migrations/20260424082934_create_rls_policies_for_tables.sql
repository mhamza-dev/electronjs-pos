---------------------------------------------------------------------
-- 1.  SCHEMA UPDATE: super_admin role
---------------------------------------------------------------------
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_role_check
    CHECK (role IN ('super_admin','owner','admin','manager','cashier','staff','doctor','receptionist'));

---------------------------------------------------------------------
-- 2.  Helper functions (order matters: independent first, then dependent)
---------------------------------------------------------------------
create or replace function current_business_id()
returns uuid
language sql stable
as $$
  select (auth.jwt() ->> 'business_id')::uuid;
$$;

create or replace function current_user_role()
returns text
language sql stable
as $$
  select auth.jwt() ->> 'role';
$$;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT current_user_role() = 'super_admin';
$$;

---------------------------------------------------------------------
-- 3.  Enable RLS on all tables
---------------------------------------------------------------------
alter table businesses enable row level security;
alter table branches enable row level security;
alter table user_profiles enable row level security;
alter table customers enable row level security;
alter table products enable row level security;
alter table inventory_movements enable row level security;
alter table services enable row level security;
alter table packages enable row level security;
alter table deals enable row level security;
alter table deal_services enable row level security;
alter table appointments enable row level security;
alter table suppliers enable row level security;
alter table purchases enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table payments enable row level security;
alter table doctors enable row level security;
alter table medical_records enable row level security;
alter table restaurant_tables enable row level security;
alter table kitchen_orders enable row level security;
alter table audit_logs enable row level security;

---------------------------------------------------------------------
-- 4.  Super‑Admin Bypass Policies (allow everything for super_admin)
---------------------------------------------------------------------
create policy "super_admin bypass" on businesses for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on branches for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on user_profiles for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on customers for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on products for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on inventory_movements for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on services for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on packages for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on deals for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on deal_services for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on appointments for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on suppliers for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on purchases for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on sales for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on sale_items for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on payments for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on doctors for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on medical_records for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on restaurant_tables for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on kitchen_orders for all using (is_super_admin()) with check (is_super_admin());
create policy "super_admin bypass" on audit_logs for all using (is_super_admin()) with check (is_super_admin());

---------------------------------------------------------------------
-- 5.  Business‑Specific Policies
---------------------------------------------------------------------
-- 5.1 Businesses
-- Allow read for own businesses (owned or assigned via user_profiles)
create policy "users can read own businesses"
on businesses
for select
using (owner_id = auth.uid());

create policy "users can read assigned business"
on businesses
for select
using (
  id in (
    select business_id from user_profiles
    where id = auth.uid() and deleted_at is null
  )
);

-- Business‑context read/update (when JWT has business_id)
create policy "business read"
on businesses for select
using (id = current_business_id());

create policy "business update"
on businesses for update
using (id = current_business_id());

-- 5.2 Branches
create policy "branches access"
on branches for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- 5.3 User Profiles
create policy "users access"
on user_profiles for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- Always allow a user to read their own profile (needed for login)
create policy "users can read own profile"
on user_profiles
for select
using (auth.uid() = id);

-- 5.4 Customers
create policy "customers access"
on customers for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- 5.5 Products
create policy "products access"
on products for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- 5.6 Inventory Movements
create policy "inventory access"
on inventory_movements for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- 5.7 Services
create policy "services access"
on services for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- 5.8 Packages
create policy "packages access"
on packages for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- 5.9 Deals
create policy "deals access"
on deals for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- 5.10 Deal Services
create policy "deal services access"
on deal_services for all
using (
  deal_id in (
    select id from deals where business_id = current_business_id()
  )
)
with check (
  deal_id in (
    select id from deals where business_id = current_business_id()
  )
);

-- 5.11 Appointments
create policy "appointments access"
on appointments for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- 5.12 Suppliers
create policy "suppliers access"
on suppliers for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- 5.13 Purchases
create policy "purchases access"
on purchases for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- 5.14 Sales
create policy "sales access"
on sales for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- 5.15 Sale Items
create policy "sale items access"
on sale_items for all
using (
  sale_id in (
    select id from sales where business_id = current_business_id()
  )
)
with check (
  sale_id in (
    select id from sales where business_id = current_business_id()
  )
);

-- 5.16 Payments
create policy "payments access"
on payments for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- 5.17 Doctors
create policy "doctors access"
on doctors for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- 5.18 Medical Records
create policy "medical records access"
on medical_records for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- 5.19 Restaurant Tables
create policy "restaurant tables access"
on restaurant_tables for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- 5.20 Kitchen Orders (linked to business via sale)
create policy "kitchen orders access"
on kitchen_orders for all
using (
  sale_id in (
    select id from sales where business_id = current_business_id()
  )
)
with check (
  sale_id in (
    select id from sales where business_id = current_business_id()
  )
);

-- 5.21 Audit Logs
create policy "audit logs access"
on audit_logs for all
using (business_id = current_business_id())
with check (business_id = current_business_id());

-- 5.22 Products admin‑only delete (still applies; super_admin is covered by bypass)
create policy "only admin delete"
on products for delete
using (current_user_role() in ('owner','admin'));