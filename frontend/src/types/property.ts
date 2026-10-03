export type PropertyType =
  | "house"
  | "apartment"
  | "room"
  | "portion"
  | "upper_portion"
  | "lower_portion"
  | "farm_house"
  | "penthouse";
export type PropertyStatus = "draft" | "active" | "occupied" | "delisted" | "orphaned";

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
  cloudinary_public_id: string;
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
  rent_amount: number;
  security_deposit: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft?: number;
  is_furnished: boolean;
  available_from?: string;
  created_at?: string;
  updated_at?: string;
  images: PropertyImage[];
  amenities: string[];
  city?: City;
  area?: Area;
  owner_name?: string;
  owner_avatar?: string;
  owner_phone?: string;
}

export interface PropertyCreateInput {
  title: string;
  description?: string;
  property_type: PropertyType;
  city_id: number;
  area_id: number;
  street_address?: string;
  latitude?: number;
  longitude?: number;
  rent_amount: number;
  security_deposit?: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft?: number;
  is_furnished?: boolean;
  available_from?: string;
  amenities?: string[];
}

export interface PropertyFilterParams {
  city_id?: number;
  area_id?: number;
  property_type?: PropertyType;
  min_rent?: number;
  max_rent?: number;
  bedrooms?: number;
  is_furnished?: boolean;
}
