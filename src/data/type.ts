// =========================================================
// TYPES for Multi-Tenant Business Schema (Supabase)
// =========================================================

// ---------------------------------------------------------
// Base Types (Timestamps, JSON)
// ---------------------------------------------------------
export type Timestamp = string; // ISO 8601
export type Json = Record<string, any>;

// ---------------------------------------------------------
// Enums / Literal Unions
// ---------------------------------------------------------
export type BusinessStatus = "active" | "inactive" | "suspended";
export type EmploymentStatus = "active" | "terminated" | "on_leave";
export type OrderStatus = "draft" | "completed" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PurchaseOrderStatus =
  | "draft"
  | "ordered"
  | "received"
  | "cancelled";
export type SupplierStatus = "active" | "inactive";

export interface AuthPermission {
  id: string;
  permission_key: string;
  module_name: string | null;
  description: string | null;
  created_at: Timestamp;
}

export interface UserSettings {
  user_id: string;
  current_business_id: string | null;
  updated_at: Timestamp;
}

export interface OrgBusiness {
  id: string;
  owner_user_id: string | null;
  business_name: string;
  legal_name: string | null;
  slug: string | null;
  timezone: string;
  currency_code: string;
  status: BusinessStatus;
  business_category?: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface AuthRole {
  id: string;
  business_id: string;
  role_name: string;
  description: string | null;
  is_system_role: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface AuthUserBusinessRole {
  id: string;
  business_id: string;
  user_id: string;
  role_id: string;
  assigned_by_user_id: string | null;
  assigned_at: Timestamp;
  // Expanded relations (optional)
  role?: AuthRole;
  business?: OrgBusiness;
}

export interface AuthRolePermission {
  id: string;
  business_id: string;
  role_id: string;
  permission_id: string;
  granted_at: Timestamp;
  permission?: AuthPermission;
  role?: AuthRole;
}

export interface AuthUserSession {
  id: string;
  user_id: string;
  active_business_id: string | null;
  session_token_hash: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Timestamp;
  last_seen_at: Timestamp;
  expires_at: Timestamp | null;
  revoked_at: Timestamp | null;
}

export interface OrgDepartment {
  id: string;
  business_id: string;
  department_name: string;
  code: string | null;
  description: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface OrgEmployee {
  id: string;
  business_id: string;
  department_id: string | null;
  employee_code: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  employment_status: EmploymentStatus;
  hired_at: string | null; // DATE
  created_at: Timestamp;
  updated_at: Timestamp;
  // Expanded
  department?: OrgDepartment;
}

export interface CatalogCategory {
  id: string;
  business_id: string;
  parent_category_id: string | null;
  category_name: string;
  slug: string | null;
  description: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CatalogProduct {
  id: string;
  business_id: string;
  sku: string | null;
  barcode: string | null;
  product_name: string;
  description: string | null;
  uom: string;
  image_url: string | null;
  default_price: number | null;
  cost_price: number | null;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface CartItem extends CatalogProduct {
  quantity: number;
}

export interface CatalogProductInsert {
  product_name: string;
  sku?: string | null;
  barcode?: string | null;
  description?: string | null;
  uom?: string;
  default_price?: number | null;
  cost_price?: number | null;
  is_active?: boolean;
  image_url?: File | string | null;
  track_inventory?: boolean;
  category_ids?: string[];
}

export interface CatalogProductCategory {
  id: string;
  business_id: string;
  product_id: string;
  category_id: string;
  is_primary: boolean;
  assigned_at: Timestamp;
  product?: CatalogProduct;
  category?: CatalogCategory;
}

export interface CatalogInventory {
  id: string;
  business_id: string;
  product_id: string;
  on_hand_qty: number;
  reserved_qty: number;
  reorder_level: number;
  average_cost: number | null;
  last_counted_at: Timestamp | null;
  updated_at: Timestamp;
  product?: CatalogProduct;
}

export interface PosCustomer {
  id: string;
  business_id: string;
  customer_name: string | null;
  email: string | null;
  phone: string | null;
  loyalty_number: string | null;
  status: "active" | "inactive";
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface PosSalesOrder {
  id: string;
  business_id: string;
  customer_id: string | null;
  cashier_employee_id: string | null;
  order_number: string | null;
  order_date: Timestamp;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  // Expanded
  customer?: PosCustomer;
  cashier?: OrgEmployee;
  items?: PosSaleItem[];
}

export interface PosSaleItem {
  id: string;
  business_id: string;
  sales_order_id: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  line_total: number; // generated column
  created_at: Timestamp;
  product?: CatalogProduct;
}

export interface ProcurementSupplier {
  id: string;
  business_id: string;
  supplier_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  tax_id: string | null;
  status: SupplierStatus;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface ProcurementProductSupplier {
  id: string;
  business_id: string;
  product_id: string;
  supplier_id: string;
  supplier_sku: string | null;
  cost_price: number | null;
  min_order_qty: number;
  lead_time_days: number | null;
  created_at: Timestamp;
  product?: CatalogProduct;
  supplier?: ProcurementSupplier;
}

export interface ProcurementPurchaseOrder {
  id: string;
  business_id: string;
  supplier_id: string;
  requester_employee_id: string | null;
  po_number: string | null;
  order_date: Timestamp;
  expected_date: Timestamp | null;
  status: PurchaseOrderStatus;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  created_at: Timestamp;
  updated_at: Timestamp;
  supplier?: ProcurementSupplier;
  requester?: OrgEmployee;
  items?: ProcurementPoItem[];
}

export interface ProcurementPoItem {
  id: string;
  business_id: string;
  purchase_order_id: string;
  product_id: string | null;
  quantity: number;
  unit_cost: number;
  tax_amount: number;
  line_total: number; // generated column
  created_at: Timestamp;
  product?: CatalogProduct;
}

export interface SysSetting {
  id: string;
  business_id: string;
  setting_key: string;
  setting_value: Json;
  updated_at: Timestamp;
}

export interface SysAuditLog {
  id: string;
  business_id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  before_data: Json | null;
  after_data: Json | null;
  request_id: string | null;
  created_at: Timestamp;
}

export interface BusinessUserMembership {
  business_id: string;
  business: OrgBusiness;
  role: Pick<AuthRole, "id" | "role_name" | "description"> | null; // single role
  joined_at: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name: string | null;
  business_users: BusinessUserMembership[];
  current_business_id: string | null;
}

export interface Employee {
  id: string; // user_id (auth.users.id)
  email: string | null;
  full_name: string | null;
  role: string | null; // primary_role
  status: string; // employment_status
  designation: string | null; // job_title
  salary: number | null; // not in schema, kept for compatibility
  hired_at: string | null;
  business_user_id: string; // employee_id (org_employees.id)
}

export interface EmployeeUpdatePayload {
  role?: string; // role_name
  status?: string; // employment_status
  designation?: string; // job_title
  salary?: number; // optional, not in base schema
}

export interface EmployeeDetailsView {
  employee_id: string;
  business_id: string;
  employee_code: string | null;
  first_name: string | null;
  last_name: string | null;
  employee_email: string | null;
  phone: string | null;
  job_title: string | null;
  employment_status: EmploymentStatus;
  hired_at: string | null;
  user_id: string | null;
  user_email: string | null;
  user_full_name: string | null;
  department_name: string | null;
  primary_role: string | null;
}

export interface UOMOption {
  label: string;
  value: string;
  categories: string[]; // business categories where this UOM is common; use ["all"] for universal
}
