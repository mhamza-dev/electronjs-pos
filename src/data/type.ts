// =========================================================
// ENUMS (based on schema constraints)
// =========================================================

export type UserRole = "admin" | "manager" | "cashier"; // from roles.name
export type PaymentMethod = "cash" | "card" | "mobile";
export type OrderStatus = "pending" | "completed" | "cancelled";
export type AppointmentStatus = "scheduled" | "completed" | "cancelled";
export type BusinessUserStatus = "active" | "inactive";

// =========================================================
// BASE TYPES
// =========================================================

export type UUID = string;

// =========================================================
// BUSINESS TYPES
// =========================================================

export interface BusinessType {
  id: UUID;
  name: string; // e.g., 'Restaurant', 'Retail', 'Cafe', 'Salon'
  description?: string;
}

// =========================================================
// FEATURES & BUSINESS FEATURES
// =========================================================

export interface Feature {
  id: UUID;
  name: string; // 'inventory', 'pos', 'appointments', 'reports', 'multi_branch'
}

export interface BusinessTypeFeature {
  business_type_id: UUID;
  feature_id: UUID;
}

export interface BusinessFeature {
  business_id: UUID;
  feature_id: UUID;
  is_enabled: boolean;
}

// =========================================================
// BUSINESS
// =========================================================

export interface Business {
  id: UUID;
  owner_id: UUID; // references auth.users
  business_type_id: UUID;
  name: string;
  currency: string; // default 'PKR'
  timezone: string; // default 'Asia/Karachi'
  address?: string;
  created_at: string; // timestamp
}

// =========================================================
// ROLES & PERMISSIONS
// =========================================================

export interface Role {
  id: UUID;
  business_id: UUID;
  name: string; // 'admin', 'manager', 'cashier'
}

export interface Permission {
  id: UUID;
  name: string; // 'create', 'read', 'update', 'delete'
}

export interface RolePermission {
  role_id: UUID;
  permission_id: UUID;
}

// =========================================================
// BUSINESS USERS (user membership)
// =========================================================

export interface BusinessUser {
  id: UUID;
  user_id: UUID; // references auth.users
  business_id: UUID;
  role_id: UUID;
  status: BusinessUserStatus; // 'active' etc.
  joined_at: string;
  // Joined fields (for convenience)
  role?: Role;
  business?: Business;
}

// Flattened version for profile return
export interface BusinessUserWithRole {
  id: UUID;
  status: BusinessUserStatus;
  joined_at: string;
  business: Business | null;
  role_name: string | undefined; // e.g., 'admin'
}

// =========================================================
// USER PROFILE (return type of getProfile)
// =========================================================

export interface UserProfile {
  id: UUID;
  email: string | undefined;
  full_name: string | null;
  business_users: BusinessUserWithRole[];
  current_business_id: UUID | null; // from user_settings (optional)
}

// =========================================================
// USER SETTINGS (for storing current_business_id)
// =========================================================

export interface UserSettings {
  user_id: UUID;
  current_business_id: UUID | null;
  updated_at: string;
}

// =========================================================
// BRANCHES
// =========================================================

export interface Branch {
  id: UUID;
  business_id: UUID;
  name: string;
  address?: string;
  phone?: string;
  created_at: string;
}

// =========================================================
// EMPLOYEES
// =========================================================

export interface Employee {
  id: UUID;
  user_id: UUID; // references auth.users
  business_id: UUID;
  designation?: string;
  salary?: number;
  hired_at: string; // date
}

export interface EmployeeBranch {
  employee_id: UUID;
  branch_id: UUID;
}

export interface Shift {
  id: UUID;
  employee_id: UUID;
  branch_id: UUID;
  start_time: string; // timestamp
  end_time: string; // timestamp
}

// =========================================================
// CUSTOMERS
// =========================================================

export interface Customer {
  id: UUID;
  business_id: UUID;
  name?: string;
  phone?: string;
  email?: string;
  created_at: string;
}

// =========================================================
// ITEMS (products / services)
// =========================================================

export interface Item {
  id: UUID;
  business_id: UUID;
  name: string;
  type?: string; // 'food', 'clothing', 'service', etc.
  sku?: string;
  image?: string;
  barcode?: string;
  price: number;
  cost?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemVariant {
  id: UUID;
  item_id: UUID;
  name: string;
  sku?: string;
  price?: number;
}

// Cart item for POS frontend
export interface CartItem extends Item {
  quantity: number;
}

// =========================================================
// INVENTORY
// =========================================================

export interface Inventory {
  id: UUID;
  item_id: UUID;
  branch_id: UUID;
  quantity: number;
  low_stock_threshold: number; // default 5
  item?: Item;
  branch?: Branch;
}

export interface InventoryTransaction {
  id: UUID;
  item_id: UUID;
  branch_id: UUID;
  change: number; // positive = stock in, negative = stock out
  type: string; // 'purchase', 'sale', 'adjustment'
  reference_id?: UUID; // order_id, purchase_id, etc.
  created_at: string;
}

export interface ProductBatch {
  id: UUID;
  item_id: UUID;
  branch_id: UUID;
  quantity: number;
  expiry_date?: string; // date
  cost?: number;
}

// =========================================================
// ORDERS
// =========================================================

export interface Order {
  id: UUID;
  business_id: UUID;
  branch_id: UUID;
  customer_id?: UUID;
  created_by?: UUID; // user who created the order (employee)
  order_type: string; // 'sale', 'return'
  total_amount: number;
  status: string; // 'completed', 'pending', 'cancelled'
  created_at: string;
  // Joined fields
  customer?: Customer;
  items?: OrderItem[];
  payments?: Payment[];
}

export interface OrderItem {
  id: UUID;
  order_id: UUID;
  item_id: UUID;
  quantity: number;
  price: number; // unit price at time of order
  item?: Item;
}

export interface Payment {
  id: UUID;
  order_id: UUID;
  method: PaymentMethod;
  amount: number;
  paid_at: string;
}

// =========================================================
// RESTAURANT TABLES
// =========================================================

export interface Table {
  id: UUID;
  branch_id: UUID;
  table_number: string;
  capacity: number;
  status: string; // 'available', 'occupied', 'reserved'
}

// =========================================================
// SERVICES & APPOINTMENTS (Salon / Spa)
// =========================================================

export interface Service extends Item {
  // Service extends Item (type = 'service')
  duration_minutes?: number; // you may add this column later
}

export interface Appointment {
  id: UUID;
  business_id: UUID;
  branch_id: UUID;
  customer_id: UUID;
  service_id: UUID; // references items (service type)
  employee_id?: UUID; // references employees
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  // Joined fields
  customer?: Customer;
  service?: Item;
  employee?: Employee;
}

// =========================================================
// SUPPLIERS & PURCHASES
// =========================================================

export interface Supplier {
  id: UUID;
  business_id: UUID;
  name?: string;
  contact?: string;
}

export interface Purchase {
  id: UUID;
  supplier_id: UUID;
  business_id: UUID;
  total_amount: number;
  created_at: string;
  items?: PurchaseItem[];
}

export interface PurchaseItem {
  id: UUID;
  purchase_id: UUID;
  item_id: UUID;
  quantity: number;
  cost: number;
}

// =========================================================
// FINANCE
// =========================================================

export interface Account {
  id: UUID;
  business_id: UUID;
  name: string;
  type: string; // 'asset', 'liability', 'equity', 'income', 'expense'
}

export interface Transaction {
  id: UUID;
  account_id: UUID;
  amount: number;
  type: string; // 'income', 'expense'
  reference_id?: UUID; // order_id, invoice_id, etc.
  created_at: string;
}

export interface Invoice {
  id: UUID;
  business_id: UUID;
  customer_id: UUID;
  total: number;
  status: string; // 'paid', 'pending', 'overdue'
  due_date: string; // date
  created_at: string;
}

// =========================================================
// AUDIT LOGS
// =========================================================

export interface AuditLog {
  id: UUID;
  user_id: UUID; // references auth.users
  action: string; // 'login', 'create_order', 'update_inventory', 'delete_item'
  entity_type: string; // 'order', 'item', 'customer', 'inventory'
  entity_id?: UUID;
  metadata?: Record<string, any>; // JSONB
  created_at: string;
}

// =========================================================
// HELPERS & UTILITIES
// =========================================================

// Type for Supabase select queries (auto-generated by supabase-js)
export type Tables = {
  business_types: BusinessType;
  features: Feature;
  business_type_features: BusinessTypeFeature;
  business_features: BusinessFeature;
  businesses: Business;
  roles: Role;
  permissions: Permission;
  role_permissions: RolePermission;
  business_users: BusinessUser;
  branches: Branch;
  employees: Employee;
  employee_branches: EmployeeBranch;
  shifts: Shift;
  customers: Customer;
  items: Item;
  item_variants: ItemVariant;
  inventory: Inventory;
  inventory_transactions: InventoryTransaction;
  product_batches: ProductBatch;
  orders: Order;
  order_items: OrderItem;
  payments: Payment;
  tables: Table;
  appointments: Appointment;
  suppliers: Supplier;
  purchases: Purchase;
  purchase_items: PurchaseItem;
  accounts: Account;
  transactions: Transaction;
  invoices: Invoice;
  audit_logs: AuditLog;
  user_settings: UserSettings;
};

export type ItemInsert = Omit<Item, "id" | "created_at" | "updated_at">;
export type ItemUpdate = Partial<ItemInsert>;
