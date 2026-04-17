CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE auth_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_key TEXT UNIQUE NOT NULL,
    module_name TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
