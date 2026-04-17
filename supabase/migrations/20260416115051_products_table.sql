CREATE TABLE catalog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    parent_category_id UUID REFERENCES catalog_categories(id) ON DELETE SET NULL,
    category_name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE catalog_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    sku TEXT,
    barcode TEXT,
    product_name TEXT NOT NULL,
    description TEXT,
    uom TEXT DEFAULT 'ea',
    default_price NUMERIC,
    cost_price NUMERIC,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(business_id, sku)
);

CREATE TABLE catalog_product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES catalog_categories(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    assigned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(product_id, category_id)
);

CREATE TABLE catalog_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
    on_hand_qty INT DEFAULT 0,
    reserved_qty INT DEFAULT 0,
    reorder_level INT DEFAULT 0,
    average_cost NUMERIC,
    last_counted_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(product_id)
);
