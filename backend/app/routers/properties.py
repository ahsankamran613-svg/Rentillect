from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status

from backend.app.models.property import (
    PropertyCreateRequest,
    PropertyUpdateRequest,
    PropertyResponse,
    PropertyImageResponse,
    CityResponse,
    AreaResponse,
    AreaCreateRequest,
    PropertyTypeEnum,
    PropertyStatusEnum
)
from backend.app.models.auth import UserProfile, UserRoleEnum
from backend.app.dependencies import get_current_user, require_role
from backend.app.services.property_service import PropertyService
from backend.app.services.cloudinary_service import CloudinaryService

router = APIRouter(prefix="/properties", tags=["Properties"])


@router.get("/cities", response_model=List[CityResponse])
async def get_cities():
    """Retrieve all Pakistani cities configured for listings."""
    service = PropertyService()
    return service.list_cities()


@router.get("/cities/{city_id}/areas", response_model=List[AreaResponse])
async def get_areas_for_city(city_id: int):
    """Retrieve all residential sectors/societies for a given Pakistani city."""
    service = PropertyService()
    return service.list_areas(city_id)


@router.post("/cities/{city_id}/areas", response_model=AreaResponse)
async def create_area_for_city(
    city_id: int,
    payload: AreaCreateRequest
):
    """Allow landlords to register a new sector or housing society if not already listed."""
    service = PropertyService()
    return service.get_or_create_area(city_id, payload.name)


@router.get("", response_model=List[PropertyResponse])
async def search_properties(
    city_id: Optional[int] = Query(None, description="Filter by City ID"),
    area_id: Optional[int] = Query(None, description="Filter by Area/Sector ID"),
    property_type: Optional[PropertyTypeEnum] = Query(None, description="Filter by property type"),
    min_rent: Optional[float] = Query(None, ge=0, description="Minimum rent in PKR"),
    max_rent: Optional[float] = Query(None, ge=0, description="Maximum rent in PKR"),
    bedrooms: Optional[int] = Query(None, ge=0, description="Minimum bedrooms"),
    is_furnished: Optional[bool] = Query(None, description="Furnished status"),
    search: Optional[str] = Query(None, description="Free-text keyword search across title and description"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Public marketplace endpoint: Search and filter available residential rental listings across Pakistan."""
    service = PropertyService()
    return service.list_properties(
        city_id=city_id,
        area_id=area_id,
        property_type=property_type,
        min_rent=min_rent,
        max_rent=max_rent,
        bedrooms=bedrooms,
        is_furnished=is_furnished,
        search=search,
        status_filter=PropertyStatusEnum.ACTIVE,
        limit=limit,
        offset=offset
    )


@router.get("/mine", response_model=List[PropertyResponse])
async def get_my_properties(
    current_user: UserProfile = Depends(require_role(UserRoleEnum.LANDLORD))
):
    """Landlord-only endpoint: Retrieve all properties owned by the authenticated user."""
    service = PropertyService()
    return service.list_properties(
        owner_id=current_user.id,
        status_filter=None,  # Fetch draft, active, occupied
        limit=100
    )


@router.post("", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    data: PropertyCreateRequest,
    current_user: UserProfile = Depends(require_role(UserRoleEnum.LANDLORD))
):
    """Landlord-only endpoint: Create a new residential property listing."""
    service = PropertyService()
    return service.create_property(owner_id=current_user.id, data=data)


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property_detail(property_id: str):
    """Public endpoint: Retrieve full property details, images, amenities, and location."""
    service = PropertyService()
    return service.get_property(property_id)


@router.patch("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: str,
    data: PropertyUpdateRequest,
    current_user: UserProfile = Depends(require_role(UserRoleEnum.LANDLORD))
):
    """Landlord-only endpoint: Update details of an existing listing."""
    service = PropertyService()
    return service.update_property(property_id=property_id, owner_id=current_user.id, data=data)


@router.delete("/{property_id}")
async def delist_property(
    property_id: str,
    current_user: UserProfile = Depends(require_role(UserRoleEnum.LANDLORD))
):
    """Landlord-only endpoint: Delist a property."""
    service = PropertyService()
    success = service.delete_property(property_id=property_id, owner_id=current_user.id)
    return {"success": success, "message": "Property delisted successfully."}


@router.post("/{property_id}/images", response_model=PropertyImageResponse)
async def upload_property_image(
    property_id: str,
    file: UploadFile = File(...),
    is_cover: bool = Form(False),
    current_user: UserProfile = Depends(require_role(UserRoleEnum.LANDLORD))
):
    """Landlord-only endpoint: Upload an image to Cloudinary and attach it to the listing."""
    cloud_service = CloudinaryService()
    upload_res = await cloud_service.upload_property_image(file=file, property_id=property_id)

    prop_service = PropertyService()
    return prop_service.add_image(
        property_id=property_id,
        owner_id=current_user.id,
        url=upload_res["url"],
        public_id=upload_res["public_id"],
        is_cover=is_cover
    )


@router.delete("/{property_id}/images/{image_id}")
async def delete_property_image(
    property_id: str,
    image_id: str,
    current_user: UserProfile = Depends(require_role(UserRoleEnum.LANDLORD))
):
    """Landlord-only endpoint: Remove an image from Cloudinary and the listing."""
    service = PropertyService()
    success = service.delete_image(property_id=property_id, image_id=image_id, owner_id=current_user.id)
    return {"success": success, "message": "Image deleted."}
