CREATE TABLE org_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    department_name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE org_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES org_businesses(id) ON DELETE CASCADE,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
    employee_code TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    job_title TEXT,
    employment_status TEXT DEFAULT 'active',
    hired_at DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(business_id, employee_code)
);