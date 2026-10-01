// ============================================================
// Rentillect Shared TypeScript Interfaces & Types
// ============================================================

export type UserRole = "admin" | "landlord" | "tenant";
export type UserStatus = "active" | "suspended" | "soft_deleted";
export type PropertyType = "house" | "apartment" | "room" | "portion";
export type PropertyStatus = "draft" | "active" | "occupied" | "delisted" | "orphaned";
export type LeaseStatus = "draft" | "active" | "expired" | "terminated" | "transferred";
export type PaymentStatus = "paid" | "unpaid" | "overdue" | "waived";
export type ApplicationStatus = "pending" | "under_review" | "accepted" | "rejected" | "withdrawn";

export interface UserProfile {
  id: string;
  email?: string;
  full_name: string;
  phone?: string;
  cnic?: string;
  avatar_url?: string;
  city?: string;
  address?: string;
  status: UserStatus;
  roles: UserRole[];
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface City {
  id: number;
  name: string;
  province: string;
}

export interface Area {
  id: number;
  city_id: number;
  name: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  cloudinary_url: string;
  is_cover: boolean;
  display_order: number;
}

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  property_type: PropertyType;
  status: PropertyStatus;
  city_id: number;
  area_id: number;
  street_address?: string;
  latitude?: number;
  longitude?: number;
  rent_amount: number; // PKR
  security_deposit: number; // PKR
  bedrooms: number;
  bathrooms: number;
  area_sqft?: number;
  is_furnished: boolean;
  available_from?: string;
  created_at: string;
  images?: PropertyImage[];
  city?: City;
  area?: Area;
}

export interface Lease {
  id: string;
  property_id: string;
  landlord_id: string;
  tenant_id: string;
  status: LeaseStatus;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  payment_due_day: number;
  lease_pdf_url?: string;
  created_at: string;
}

export interface RentPayment {
  id: string;
  lease_id: string;
  period_month: number;
  period_year: number;
  amount: number;
  status: PaymentStatus;
  marked_paid_at?: string;
  receipt_url?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  reference_id?: string;
  reference_type?: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}
