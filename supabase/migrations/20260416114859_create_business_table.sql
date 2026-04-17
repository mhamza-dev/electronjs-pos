CREATE TABLE org_businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    business_name TEXT NOT NULL,
    legal_name TEXT,
    slug TEXT UNIQUE,
    timezone TEXT DEFAULT 'Asia/Karachi',
    currency_code TEXT DEFAULT 'PKR',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);