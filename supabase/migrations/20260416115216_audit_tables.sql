CREATE TABLE sys_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL,
    setting_value JSONB,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(business_id, setting_key)
);

CREATE TABLE sys_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    before_data JSONB,
    after_data JSONB,
    request_id TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);