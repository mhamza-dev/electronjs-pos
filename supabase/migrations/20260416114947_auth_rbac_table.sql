CREATE TABLE auth_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(business_id, role_name)
);

CREATE TABLE auth_user_business_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES auth_roles(id) ON DELETE CASCADE,
    assigned_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

CREATE TABLE auth_role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES auth_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES auth_permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

CREATE TABLE auth_user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    active_business_id UUID REFERENCES org_businesses(id) ON DELETE SET NULL,
    session_token_hash TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_seen_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    revoked_at TIMESTAMP
);