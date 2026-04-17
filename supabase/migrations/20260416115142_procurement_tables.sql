CREATE TABLE procurement_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    supplier_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    tax_id TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE procurement_product_suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES procurement_suppliers(id) ON DELETE CASCADE,
    supplier_sku TEXT,
    cost_price NUMERIC,
    min_order_qty INT DEFAULT 1,
    lead_time_days INT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(product_id, supplier_id)
);

CREATE TABLE procurement_purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES procurement_suppliers(id) ON DELETE RESTRICT,
    requester_employee_id UUID REFERENCES org_employees(id) ON DELETE SET NULL,
    po_number TEXT UNIQUE,
    order_date TIMESTAMP DEFAULT NOW(),
    expected_date TIMESTAMP,
    status TEXT DEFAULT 'draft',
    subtotal_amount NUMERIC DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE procurement_po_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    purchase_order_id UUID NOT NULL REFERENCES procurement_purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES catalog_products(id) ON DELETE SET NULL,
    quantity INT NOT NULL,
    unit_cost NUMERIC NOT NULL,
    tax_amount NUMERIC DEFAULT 0,
    line_total NUMERIC GENERATED ALWAYS AS (quantity * unit_cost + tax_amount) STORED,
    created_at TIMESTAMP DEFAULT NOW()
);