// Enums
export type UserRole = 'admin' | 'employee';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled';

export type PaymentMethod = 'cash' | 'card' | 'digital';

// Base types
export type UUID = string;

// Business Types
export interface BusinessType {
    id: UUID;
    name: string;
    description?: string;
    created_at: string;
}

// Businesses
export interface Business {
    id: UUID;
    name: string;
    owner_id: UUID;
    business_type_id: UUID;
    subscription_tier: SubscriptionTier;
    subscription_status: SubscriptionStatus;
    trial_ends_at: string;
    created_at: string;
}

// Profiles
export interface Profile {
    id: UUID;
    full_name?: string;
    current_business_id?: UUID;
    phone?: string;
    email?: string;
    created_at: string;
    business_access?: BusinessAccess[];
}

// Business Access
export interface BusinessAccess {
    id: UUID;
    profile_id: UUID;
    user_id: UUID;
    business_id: UUID;
    role: UserRole;
    created_at: string;
    business?: Business;
}

// Products
export interface Product {
    id: UUID;
    business_id: UUID;
    name: string;
    category: string;
    image?: string;
    price: number;
    stock_quantity: number;
    created_at: string;
}

// Orders
export interface Order {
    id: UUID;
    business_id: UUID;
    employee_id?: UUID;
    subtotal: number;
    tax: number;
    total: number;
    payment_method: PaymentMethod;
    created_at: string;
}

// Order Items
export interface OrderItem {
    id: UUID;
    order_id: UUID;
    product_id?: UUID;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
}

// Cart Item (for POS frontend)
export interface CartItem extends Product {
    quantity: number;
}
