CREATE TABLE user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_business_id UUID REFERENCES org_businesses(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);