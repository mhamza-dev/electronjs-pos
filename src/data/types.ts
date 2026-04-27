// ── Common helpers ──────────────────────────────────────────────

export interface SoftDelete {
  deleted_at: string | null;
}

export interface Timestamps {
  created_at: string;
  updated_at?: string;
}

export type InsertPayload<T> = Omit<
  T,
  "id" | "created_at" | "updated_at" | "deleted_at"
>;

export type UpdatePayload<T> = { id: string } & Partial<Omit<T, "id">>;

// ── Enums & literals ────────────────────────────────────────────

export type BusinessType =
  | "retail"
  | "restaurant"
  | "salon"
  | "hospital"
  | "pharmacy"
  | "warehouse"
  | "hybrid";

export type UserRole =
  | "owner"
  | "admin"
  | "manager"
  | "cashier"
  | "staff"
  | "doctor"
  | "receptionist";

export type InventoryMovementType = "in" | "out" | "adjustment";
export type SaleItemType = "product" | "service" | "package" | "deal";
export type PaymentMethod = "cash" | "card" | "wallet" | "bank" | "other";
export type RestaurantTableStatus =
  | "available"
  | "occupied"
  | "reserved"
  | "maintenance";
export type KitchenOrderStatus = "pending" | string;
export type KitchenOrderPriority = "normal" | string;

// ── Forward declarations (to avoid circular reference issues) ──
// All interfaces are defined below, but TypeScript hoists them. We're fine.

// ── Businesses ──────────────────────────────────────────────────

export interface Business extends SoftDelete, Timestamps {
  id: string;
  name: string;
  type: BusinessType;
  owner_id: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  timezone: string;
  currency: string;
  updated_at: string; // always present here

  // Relations
  owner?: UserProfile | null;
  branches?: Branch[];
  user_profiles?: UserProfile[];
  customers?: Customer[];
  doctors?: Doctor[];
  medical_records?: MedicalRecord[];
  products?: Product[];
  inventory_movements?: InventoryMovement[];
  services?: Service[];
  packages?: Package[];
  deals?: Deal[];
  appointments?: Appointment[];
  suppliers?: Supplier[];
  purchases?: Purchase[];
  sales?: Sale[];
  restaurant_tables?: RestaurantTable[];
  kitchen_orders?: KitchenOrder[];
  audit_logs?: AuditLog[];
}

export type BusinessInsert = InsertPayload<Business>;
export type BusinessUpdate = UpdatePayload<Business>;

// ── Branches ────────────────────────────────────────────────────

export interface Branch extends SoftDelete {
  id: string;
  business_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;

  // Relations
  business?: Business;
  user_profiles?: UserProfile[];
  doctors?: Doctor[];
  products?: Product[];
  inventory_movements?: InventoryMovement[];
  services?: Service[];
  packages?: Package[];
  deals?: Deal[];
  appointments?: Appointment[];
  purchases?: Purchase[];
  sales?: Sale[];
  restaurant_tables?: RestaurantTable[];
  kitchen_orders?: KitchenOrder[];
}

export type BranchInsert = InsertPayload<Branch>;
export type BranchUpdate = UpdatePayload<Branch>;

// ── User Profiles ──────────────────────────────────────────────

export interface UserProfile extends SoftDelete {
  id: string; // matches auth.users.id
  business_id: string;
  branch_id: string | null;
  role: UserRole;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;

  // Relations
  businesses?: Business[];
  branch?: Branch | null;
  // reverse: businesses owned (for owner_id) – handled on Business
  created_inventory_movements?: InventoryMovement[]; // created_by
  created_appointments?: Appointment[]; // created_by
  created_purchases?: Purchase[]; // created_by
  created_sales?: Sale[]; // created_by
  audit_logs?: AuditLog[];
}

export type UserProfileInsert = InsertPayload<UserProfile>;
export type UserProfileUpdate = UpdatePayload<UserProfile>;

// ── Customers ──────────────────────────────────────────────────

export interface Customer extends SoftDelete {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  loyalty_points: number;
  created_at: string;

  // Relations
  business?: Business;
  medical_records?: MedicalRecord[];
  appointments?: Appointment[];
  sales?: Sale[];
}

export type CustomerInsert = InsertPayload<Customer>;
export type CustomerUpdate = UpdatePayload<Customer>;

// ── Doctors ────────────────────────────────────────────────────

export interface Doctor extends SoftDelete {
  id: string;
  business_id: string;
  branch_id: string | null;
  specialization: string | null;
  license_number: string | null;
  created_at: string;

  // Relations
  business?: Business;
  branch?: Branch | null;
  medical_records?: MedicalRecord[];
}

export type DoctorInsert = InsertPayload<Doctor>;
export type DoctorUpdate = UpdatePayload<Doctor>;

// ── Medical Records ────────────────────────────────────────────

export interface MedicalRecord extends SoftDelete {
  id: string;
  business_id: string;
  customer_id: string;
  doctor_id: string | null;
  diagnosis: string | null;
  prescription: string | null;
  notes: string | null;
  created_at: string;

  // Relations
  business?: Business;
  customer?: Customer;
  doctor?: Doctor | null;
}

export type MedicalRecordInsert = InsertPayload<MedicalRecord>;
export type MedicalRecordUpdate = UpdatePayload<MedicalRecord>;

// ── Products ───────────────────────────────────────────────────

export interface Product extends SoftDelete, Timestamps {
  id: string;
  business_id: string;
  branch_id: string | null;
  name: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  cost_price: number;
  stock_quantity: number;
  reorder_level: number;
  is_active: boolean;
  updated_at: string;

  // Relations
  business?: Business;
  branch?: Branch | null;
  inventory_movements?: InventoryMovement[];
  sale_items?: SaleItem[];
}

export type ProductInsert = InsertPayload<Product>;
export type ProductUpdate = UpdatePayload<Product>;

// ── Inventory Movements ────────────────────────────────────────

export interface InventoryMovement extends SoftDelete {
  id: string;
  business_id: string;
  branch_id: string | null;
  product_id: string;
  type: InventoryMovementType;
  quantity: number;
  reason: string | null;
  created_by: string | null;
  created_at: string;

  // Relations
  business?: Business;
  branch?: Branch | null;
  product?: Product;
  creator?: UserProfile | null;
}

export type InventoryMovementInsert = InsertPayload<InventoryMovement>;
export type InventoryMovementUpdate = UpdatePayload<InventoryMovement>;

// ── Services ───────────────────────────────────────────────────

export interface Service extends SoftDelete, Timestamps {
  id: string;
  business_id: string;
  branch_id: string | null;
  name: string;
  price: number;
  duration_minutes: number | null;
  is_active: boolean;
  updated_at: string;

  // Relations
  business?: Business;
  branch?: Branch | null;
  deal_services?: DealService[];
  appointments?: Appointment[];
  sale_items?: SaleItem[];
}

export type ServiceInsert = InsertPayload<Service>;
export type ServiceUpdate = UpdatePayload<Service>;

// ── Packages ───────────────────────────────────────────────────

export interface Package extends SoftDelete, Timestamps {
  id: string;
  business_id: string;
  branch_id: string | null;
  name: string;
  price: number;
  duration_minutes: number | null;
  is_active: boolean;
  updated_at: string;

  // Relations
  business?: Business;
  branch?: Branch | null;
  appointments?: Appointment[];
  sale_items?: SaleItem[];
}

export type PackageInsert = InsertPayload<Package>;
export type PackageUpdate = UpdatePayload<Package>;

// ── Deals ─────────────────────────────────────────────────────

export interface Deal extends SoftDelete, Timestamps {
  id: string;
  business_id: string;
  branch_id: string | null;
  name: string;
  total_price: number | null;
  is_active: boolean;
  updated_at: string;

  // Relations
  business?: Business;
  branch?: Branch | null;
  deal_services?: DealService[];
  appointments?: Appointment[];
  sale_items?: SaleItem[];
}

export type DealInsert = InsertPayload<Deal>;
export type DealUpdate = UpdatePayload<Deal>;

// ── Deal Services ──────────────────────────────────────────────

export interface DealService extends SoftDelete {
  deal_id: string;
  service_id: string;
  quantity: number;
  discount_percent: number;

  // Relations
  deal?: Deal;
  service?: Service;
}

export type DealServiceInsert = InsertPayload<DealService>;
export type DealServiceUpdate = UpdatePayload<DealService>;

// ── Appointments ──────────────────────────────────────────────

export interface Appointment extends SoftDelete {
  id: string;
  business_id: string;
  branch_id: string | null;
  customer_id: string | null;
  service_id: string | null;
  package_id: string | null;
  deal_id: string | null;
  scheduled_at: string;
  status: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;

  // Relations
  business?: Business;
  branch?: Branch | null;
  customer?: Customer | null;
  service?: Service | null;
  package?: Package | null;
  deal?: Deal | null;
  creator?: UserProfile | null;
}

export type AppointmentInsert = InsertPayload<Appointment>;
export type AppointmentUpdate = UpdatePayload<Appointment>;

// ── Suppliers ─────────────────────────────────────────────────

export interface Supplier extends SoftDelete {
  id: string;
  business_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;

  // Relations
  business?: Business | null;
  purchases?: Purchase[];
}

export type SupplierInsert = InsertPayload<Supplier>;
export type SupplierUpdate = UpdatePayload<Supplier>;

// ── Purchases ─────────────────────────────────────────────────

export interface Purchase extends SoftDelete {
  id: string;
  business_id: string;
  branch_id: string | null;
  supplier_id: string | null;
  created_by: string | null;
  total: number;
  status: string;
  created_at: string;

  // Relations
  business?: Business;
  branch?: Branch | null;
  supplier?: Supplier | null;
  creator?: UserProfile | null;
  payments?: Payment[];
}

export type PurchaseInsert = InsertPayload<Purchase>;
export type PurchaseUpdate = UpdatePayload<Purchase>;

// ── Sales ─────────────────────────────────────────────────────

export interface Sale extends SoftDelete {
  id: string;
  business_id: string;
  branch_id: string | null;
  customer_id: string | null;
  subtotal: number;
  total: number;
  created_by: string | null;
  created_at: string;

  // Relations
  business?: Business;
  branch?: Branch | null;
  customer?: Customer | null;
  creator?: UserProfile | null;
  sale_items?: SaleItem[];
  payments?: Payment[];
  kitchen_orders?: KitchenOrder[];
}

export type SaleInsert = InsertPayload<Sale>;
export type SaleUpdate = UpdatePayload<Sale>;

// ── Sale Items ────────────────────────────────────────────────

export interface SaleItem extends SoftDelete {
  id: string;
  sale_id: string | null;
  item_type: SaleItemType;
  quantity: number;
  unit_price: number;
  total_price: number;

  // Relations
  sale?: Sale | null;
  product?: Product | null;
  service?: Service | null;
  package?: Package | null;
  deal?: Deal | null;
}

export interface ProductSaleItem extends SaleItem {
  product_id: string | null;
}
export interface ServiceSaleItem extends SaleItem {
  service_id: string | null;
}
export interface PackageSaleItem extends SaleItem {
  package_id: string | null;
}
export interface DealSaleItem extends SaleItem {
  deal_id: string | null;
}

export type SaleItemInsert =
  | InsertPayload<ProductSaleItem>
  | InsertPayload<ServiceSaleItem>
  | InsertPayload<PackageSaleItem>
  | InsertPayload<DealSaleItem>;
export type SaleItemUpdate =
  | UpdatePayload<ProductSaleItem>
  | UpdatePayload<ServiceSaleItem>
  | UpdatePayload<PackageSaleItem>
  | UpdatePayload<DealSaleItem>;

// ── Payments ──────────────────────────────────────────────────

export interface Payment extends SoftDelete {
  id: string;
  business_id: string;
  amount: number;
  method: PaymentMethod | null;
  created_at: string;

  // Relations
  sale?: Sale | null;
  purchase?: Purchase | null;
}

export interface SalePayment extends Payment {
  sale_id: string | null;
}

export interface PurchasePayment extends Payment {
  purchase_id: string | null;
}

export type PaymentInsert =
  | InsertPayload<SalePayment>
  | InsertPayload<PurchasePayment>;
export type PaymentUpdate =
  | UpdatePayload<SalePayment>
  | UpdatePayload<PurchasePayment>;

// ── Restaurant Tables ─────────────────────────────────────────

export interface RestaurantTable extends SoftDelete {
  id: string;
  business_id: string;
  branch_id: string;
  table_number: string;
  capacity: number | null;
  status: RestaurantTableStatus;

  // Relations
  business?: Business;
  branch?: Branch;
  kitchen_orders?: KitchenOrder[];
}

export type RestaurantTableInsert = InsertPayload<RestaurantTable>;
export type RestaurantTableUpdate = UpdatePayload<RestaurantTable>;

// ── Kitchen Orders ────────────────────────────────────────────

export interface KitchenOrder extends SoftDelete {
  id: string;
  business_id: string;
  branch_id: string;
  table_id: string | null;
  sale_id: string | null;
  status: KitchenOrderStatus;
  priority: KitchenOrderPriority;
  created_at: string;

  // Relations
  business?: Business;
  branch?: Branch;
  table?: RestaurantTable | null;
  sale?: Sale | null;
}

export type KitchenOrderInsert = InsertPayload<KitchenOrder>;
export type KitchenOrderUpdate = UpdatePayload<KitchenOrder>;

// ── Audit Logs ────────────────────────────────────────────────

export interface AuditLog extends SoftDelete {
  id: string;
  business_id: string | null;
  user_id: string | null;
  action: string | null;
  entity: string | null;
  entity_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;

  // Relations
  business?: Business | null;
  user?: UserProfile | null;
}

export type AuditLogInsert = InsertPayload<AuditLog>;
export type AuditLogUpdate = UpdatePayload<AuditLog>;

export interface CartItem {
  id: string;
  name: string; // product name
  price: number;
  quantity: number;
  image_url?: string | null; // optional
}
