from enum import Enum
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel, Field


class PropertyTypeEnum(str, Enum):
    HOUSE = "house"
    APARTMENT = "apartment"
    ROOM = "room"
    PORTION = "portion"
    UPPER_PORTION = "upper_portion"
    LOWER_PORTION = "lower_portion"
    FARM_HOUSE = "farm_house"
    PENTHOUSE = "penthouse"


class PropertyStatusEnum(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    OCCUPIED = "occupied"
    DELISTED = "delisted"
    ORPHANED = "orphaned"


class PropertyImageResponse(BaseModel):
    id: str
    property_id: str
    cloudinary_url: str
    cloudinary_public_id: str
    is_cover: bool = False
    display_order: int = 0


class CityResponse(BaseModel):
    id: int
    name: str
    province: str


class AreaResponse(BaseModel):
    id: int
    city_id: int
    name: str


class AreaCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)


class PropertyCreateRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    description: Optional[str] = None
    property_type: PropertyTypeEnum
    city_id: int
    area_id: int
    street_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rent_amount: float = Field(..., gt=0, description="Monthly rent in Pakistani Rupees (PKR)")
    security_deposit: float = Field(default=0.0, ge=0, description="Security deposit in PKR")
    bedrooms: int = Field(default=1, ge=0)
    bathrooms: int = Field(default=1, ge=0)
    area_sqft: Optional[int] = Field(None, gt=0)
    is_furnished: bool = False
    available_from: Optional[date] = None
    amenities: List[str] = Field(default_factory=list)


class PropertyUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    description: Optional[str] = None
    property_type: Optional[PropertyTypeEnum] = None
    status: Optional[PropertyStatusEnum] = None
    city_id: Optional[int] = None
    area_id: Optional[int] = None
    street_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rent_amount: Optional[float] = Field(None, gt=0)
    security_deposit: Optional[float] = Field(None, ge=0)
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    area_sqft: Optional[int] = Field(None, gt=0)
    is_furnished: Optional[bool] = None
    available_from: Optional[date] = None
    amenities: Optional[List[str]] = None


class PropertyResponse(BaseModel):
    id: str
    owner_id: str
    title: str
    description: Optional[str] = None
    property_type: PropertyTypeEnum
    status: PropertyStatusEnum
    city_id: int
    area_id: int
    street_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rent_amount: float
    security_deposit: float = 0.0
    bedrooms: int
    bathrooms: int
    area_sqft: Optional[int] = None
    is_furnished: bool = False
    available_from: Optional[date] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    images: List[PropertyImageResponse] = []
    amenities: List[str] = []
    city: Optional[CityResponse] = None
    area: Optional[AreaResponse] = None
    owner_name: Optional[str] = None
    owner_avatar: Optional[str] = None
    owner_phone: Optional[str] = None
