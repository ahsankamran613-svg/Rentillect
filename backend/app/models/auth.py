from enum import Enum
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRoleEnum(str, Enum):
    ADMIN = "admin"
    LANDLORD = "landlord"
    TENANT = "tenant"


class UserStatusEnum(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    SOFT_DELETED = "soft_deleted"


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    full_name: str = Field(..., min_length=2, max_length=255)
    role: UserRoleEnum = Field(default=UserRoleEnum.TENANT, description="Initial role: landlord or tenant")
    phone: Optional[str] = Field(None, max_length=20)
    city: Optional[str] = Field(None, max_length=100)
    cnic: Optional[str] = Field(None, description="13-digit Pakistani CNIC without dashes")

    @field_validator("cnic")
    @classmethod
    def clean_cnic(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        cleaned = v.replace("-", "").strip()
        if len(cleaned) != 13 or not cleaned.isdigit():
            raise ValueError("Pakistani CNIC must be 13 digits (e.g., 37405-1234567-1 or 3740512345671)")
        return cleaned


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AddRoleRequest(BaseModel):
    role: UserRoleEnum


class UserProfile(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    cnic: Optional[str] = None
    avatar_url: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    status: UserStatusEnum = UserStatusEnum.ACTIVE
    roles: List[UserRoleEnum] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class PublicUserProfile(BaseModel):
    id: str
    full_name: str
    avatar_url: Optional[str] = None
    city: Optional[str] = None
    roles: List[UserRoleEnum] = []
    created_at: Optional[datetime] = None


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    cnic: Optional[str] = None
    city: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = None
    avatar_url: Optional[str] = None

    @field_validator("cnic")
    @classmethod
    def clean_cnic(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        cleaned = v.replace("-", "").strip()
        if len(cleaned) != 13 or not cleaned.isdigit():
            raise ValueError("Pakistani CNIC must be 13 digits (e.g., 37405-1234567-1 or 3740512345671)")
        return cleaned


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
