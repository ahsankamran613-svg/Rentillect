from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from backend.app.dependencies import get_supabase_admin
from backend.app.models.property import (
    PropertyCreateRequest,
    PropertyUpdateRequest,
    PropertyResponse,
    PropertyImageResponse,
    CityResponse,
    AreaResponse,
    PropertyStatusEnum,
    PropertyTypeEnum
)


class PropertyService:
    def __init__(self):
        self.supabase = get_supabase_admin()
        if not self.supabase:
            raise RuntimeError("Database client not available.")

    def list_cities(self) -> List[CityResponse]:
        """Fetch all Pakistani cities available for property listings."""
        res = self.supabase.table("cities").select("*").order("name").execute()
        return [CityResponse(**c) for c in (res.data or [])]

    def list_areas(self, city_id: int) -> List[AreaResponse]:
        """Fetch all sectors/areas for a specific city."""
        res = self.supabase.table("areas").select("*").eq("city_id", city_id).order("name").execute()
        return [AreaResponse(**a) for a in (res.data or [])]

    def get_or_create_area(self, city_id: int, name: str) -> AreaResponse:
        """Fetch an existing area or dynamically register a new one for the city."""
        clean_name = name.strip()
        existing = (
            self.supabase.table("areas")
            .select("*")
            .eq("city_id", city_id)
            .ilike("name", clean_name)
            .execute()
        )
        if existing.data and len(existing.data) > 0:
            return AreaResponse(**existing.data[0])

        res = self.supabase.table("areas").insert({"city_id": city_id, "name": clean_name}).execute()
        if res.data and len(res.data) > 0:
            return AreaResponse(**res.data[0])
        raise HTTPException(status_code=400, detail="Could not create new sector or area.")

    def create_property(self, owner_id: str, data: PropertyCreateRequest) -> PropertyResponse:
        """Create a new property listing and associate amenities."""
        prop_dict = {
            "owner_id": owner_id,
            "title": data.title,
            "description": data.description,
            "property_type": data.property_type.value,
            "status": PropertyStatusEnum.ACTIVE.value,
            "city_id": data.city_id,
            "area_id": data.area_id,
            "street_address": data.street_address,
            "latitude": data.latitude,
            "longitude": data.longitude,
            "rent_amount": data.rent_amount,
            "security_deposit": data.security_deposit,
            "bedrooms": data.bedrooms,
            "bathrooms": data.bathrooms,
            "area_sqft": data.area_sqft,
            "is_furnished": data.is_furnished,
            "available_from": data.available_from.isoformat() if data.available_from else None,
        }

        try:
            res = self.supabase.table("properties").insert(prop_dict).execute()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create property: {str(e)}"
            )

        if not res.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save property.")

        property_id = res.data[0]["id"]

        # Insert amenities
        if data.amenities:
            amenity_rows = [{"property_id": property_id, "amenity": am.strip().lower()} for am in data.amenities if am.strip()]
            if amenity_rows:
                try:
                    self.supabase.table("property_amenities").insert(amenity_rows).execute()
                except Exception:
                    pass

        return self.get_property(property_id)

    def get_property(self, property_id: str) -> PropertyResponse:
        """Retrieve full details of a property with images, location, and owner profile."""
        res = self.supabase.table("properties").select("*").eq("id", property_id).execute()
        if not res.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property listing not found.")

        raw_prop = res.data[0]

        # Fetch images
        img_res = self.supabase.table("property_images").select("*").eq("property_id", property_id).order("is_cover", desc=True).order("display_order").execute()
        images = [PropertyImageResponse(**img) for img in (img_res.data or [])]

        # Fetch amenities
        am_res = self.supabase.table("property_amenities").select("amenity").eq("property_id", property_id).execute()
        amenities = [a["amenity"] for a in (am_res.data or [])]

        # Fetch city & area
        city_res = self.supabase.table("cities").select("*").eq("id", raw_prop["city_id"]).execute()
        city = CityResponse(**city_res.data[0]) if city_res.data else None

        area_res = self.supabase.table("areas").select("*").eq("id", raw_prop["area_id"]).execute()
        area = AreaResponse(**area_res.data[0]) if area_res.data else None

        # Fetch owner profile
        owner_res = self.supabase.table("profiles").select("full_name, avatar_url, phone").eq("id", raw_prop["owner_id"]).execute()
        owner_name = owner_res.data[0]["full_name"] if owner_res.data else None
        owner_avatar = owner_res.data[0]["avatar_url"] if owner_res.data else None
        owner_phone = owner_res.data[0]["phone"] if owner_res.data else None

        return PropertyResponse(
            **raw_prop,
            images=images,
            amenities=amenities,
            city=city,
            area=area,
            owner_name=owner_name,
            owner_avatar=owner_avatar,
            owner_phone=owner_phone
        )

    def list_properties(
        self,
        city_id: Optional[int] = None,
        area_id: Optional[int] = None,
        property_type: Optional[PropertyTypeEnum] = None,
        min_rent: Optional[float] = None,
        max_rent: Optional[float] = None,
        bedrooms: Optional[int] = None,
        is_furnished: Optional[bool] = None,
        search: Optional[str] = None,
        status_filter: Optional[PropertyStatusEnum] = PropertyStatusEnum.ACTIVE,
        owner_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[PropertyResponse]:
        """Search and filter property listings across Pakistan."""
        query = self.supabase.table("properties").select("*")

        if status_filter:
            query = query.eq("status", status_filter.value)
        if owner_id:
            query = query.eq("owner_id", owner_id)
        if city_id:
            query = query.eq("city_id", city_id)
        if area_id:
            query = query.eq("area_id", area_id)
        if property_type:
            query = query.eq("property_type", property_type.value)
        if min_rent is not None:
            query = query.gte("rent_amount", min_rent)
        if max_rent is not None:
            query = query.lte("rent_amount", max_rent)
        if bedrooms is not None:
            query = query.gte("bedrooms", bedrooms)
        if is_furnished is not None:
            query = query.eq("is_furnished", is_furnished)
        if search and search.strip():
            clean_search = search.strip().replace(",", " ")
            query = query.or_(f"title.ilike.%{clean_search}%,description.ilike.%{clean_search}%")

        res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        properties_data = res.data or []
        if not properties_data:
            return []

        pids = [p["id"] for p in properties_data]
        city_ids = list({p["city_id"] for p in properties_data if p.get("city_id")})
        area_ids = list({p["area_id"] for p in properties_data if p.get("area_id")})

        # Batch 1: All images for these properties
        images_by_pid: Dict[str, List[PropertyImageResponse]] = {pid: [] for pid in pids}
        if pids:
            try:
                img_res = self.supabase.table("property_images").select("*").in_("property_id", pids).order("is_cover", desc=True).order("display_order").execute()
                for img in (img_res.data or []):
                    images_by_pid.setdefault(img["property_id"], []).append(PropertyImageResponse(**img))
            except Exception:
                pass

        # Batch 2: All amenities for these properties
        amenities_by_pid: Dict[str, List[str]] = {pid: [] for pid in pids}
        if pids:
            try:
                am_res = self.supabase.table("property_amenities").select("property_id, amenity").in_("property_id", pids).execute()
                for am in (am_res.data or []):
                    amenities_by_pid.setdefault(am["property_id"], []).append(am["amenity"])
            except Exception:
                pass

        # Batch 3: All cities
        cities_by_id: Dict[int, CityResponse] = {}
        if city_ids:
            try:
                c_res = self.supabase.table("cities").select("*").in_("id", city_ids).execute()
                for c in (c_res.data or []):
                    cities_by_id[c["id"]] = CityResponse(**c)
            except Exception:
                pass

        # Batch 4: All areas
        areas_by_id: Dict[int, AreaResponse] = {}
        if area_ids:
            try:
                a_res = self.supabase.table("areas").select("*").in_("id", area_ids).execute()
                for a in (a_res.data or []):
                    areas_by_id[a["id"]] = AreaResponse(**a)
            except Exception:
                pass

        result = []
        for prop in properties_data:
            pid = prop["id"]
            result.append(
                PropertyResponse(
                    **prop,
                    images=images_by_pid.get(pid, []),
                    amenities=amenities_by_pid.get(pid, []),
                    city=cities_by_id.get(prop["city_id"]),
                    area=areas_by_id.get(prop["area_id"])
                )
            )

        return result

    def update_property(self, property_id: str, owner_id: str, data: PropertyUpdateRequest) -> PropertyResponse:
        """Update property fields (verifies owner permission)."""
        prop_res = self.supabase.table("properties").select("owner_id").eq("id", property_id).execute()
        if not prop_res.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")

        if prop_res.data[0]["owner_id"] != owner_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this property.")

        update_dict: Dict[str, Any] = {}
        for k, v in data.model_dump().items():
            if v is not None and k != "amenities":
                if isinstance(v, (PropertyTypeEnum, PropertyStatusEnum)):
                    update_dict[k] = v.value
                elif isinstance(v, date):
                    update_dict[k] = v.isoformat()
                else:
                    update_dict[k] = v

        if update_dict:
            self.supabase.table("properties").update(update_dict).eq("id", property_id).execute()

        # Update amenities if provided
        if data.amenities is not None:
            self.supabase.table("property_amenities").delete().eq("property_id", property_id).execute()
            amenity_rows = [{"property_id": property_id, "amenity": am.strip().lower()} for am in data.amenities if am.strip()]
            if amenity_rows:
                self.supabase.table("property_amenities").insert(amenity_rows).execute()

        return self.get_property(property_id)

    def delete_property(self, property_id: str, owner_id: str) -> bool:
        """Soft-delist a property."""
        prop_res = self.supabase.table("properties").select("owner_id").eq("id", property_id).execute()
        if not prop_res.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Property not found.")

        if prop_res.data[0]["owner_id"] != owner_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this property.")

        self.supabase.table("properties").update({"status": PropertyStatusEnum.DELISTED.value}).eq("id", property_id).execute()
        return True

    def add_image(self, property_id: str, owner_id: str, url: str, public_id: str, is_cover: bool = False) -> PropertyImageResponse:
        """Associate an uploaded image with a property."""
        prop_res = self.supabase.table("properties").select("owner_id").eq("id", property_id).execute()
        if not prop_res.data or prop_res.data[0]["owner_id"] != owner_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized.")

        if is_cover:
            # Set other images to non-cover
            self.supabase.table("property_images").update({"is_cover": False}).eq("property_id", property_id).execute()

        img_data = {
            "property_id": property_id,
            "cloudinary_url": url,
            "cloudinary_public_id": public_id,
            "is_cover": is_cover,
        }
        res = self.supabase.table("property_images").insert(img_data).execute()
        return PropertyImageResponse(**res.data[0])

    def delete_image(self, property_id: str, image_id: str, owner_id: str) -> bool:
        """Delete an image from property."""
        prop_res = self.supabase.table("properties").select("owner_id").eq("id", property_id).execute()
        if not prop_res.data or prop_res.data[0]["owner_id"] != owner_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized.")

        img_res = self.supabase.table("property_images").select("cloudinary_public_id").eq("id", image_id).execute()
        if not img_res.data:
            return False

        public_id = img_res.data[0]["cloudinary_public_id"]
        from backend.app.services.cloudinary_service import CloudinaryService
        cloud_svc = CloudinaryService()
        cloud_svc.delete_image(public_id)

        self.supabase.table("property_images").delete().eq("id", image_id).execute()
        return True
