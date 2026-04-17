CREATE TABLE pos_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    customer_name TEXT,
    email TEXT,
    phone TEXT,
    loyalty_number TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(business_id, loyalty_number)
);

CREATE TABLE pos_sales_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES pos_customers(id) ON DELETE SET NULL,
    cashier_employee_id UUID REFERENCES org_employees(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE,
    order_date TIMESTAMP DEFAULT NOW(),
    status TEXT DEFAULT 'draft',
    payment_status TEXT DEFAULT 'pending',
    subtotal_amount NUMERIC DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pos_sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    sales_order_id UUID NOT NULL REFERENCES pos_sales_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES catalog_products(id) ON DELETE SET NULL,
    quantity INT NOT NULL,
    unit_price NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    line_total NUMERIC GENERATED ALWAYS AS (quantity * unit_price - discount_amount + tax_amount) STORED,
    created_at TIMESTAMP DEFAULT NOW()
);