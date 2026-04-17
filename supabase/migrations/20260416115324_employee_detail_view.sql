CREATE OR REPLACE VIEW employee_details AS
SELECT
    e.id AS employee_id,
    e.business_id,
    e.employee_code,
    e.first_name,
    e.last_name,
    e.email AS employee_email,
    e.phone,
    e.job_title,
    e.employment_status,
    e.hired_at,
    u.id AS user_id,
    u.email AS user_email,
    u.raw_user_meta_data->>'full_name' AS user_full_name,
    d.department_name,
    r.role_name AS primary_role
FROM org_employees e
LEFT JOIN auth.users u ON u.email = e.email   -- link based on email; adjust if you store user_id directly
LEFT JOIN org_departments d ON e.department_id = d.id
LEFT JOIN auth_user_business_roles ubr ON ubr.user_id = u.id AND ubr.business_id = e.business_id
LEFT JOIN auth_roles r ON ubr.role_id = r.id;

-- Grant access to authenticated users
GRANT SELECT ON employee_details TO authenticated;