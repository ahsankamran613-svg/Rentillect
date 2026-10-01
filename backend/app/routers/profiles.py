from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.models.auth import (
    UserProfile,
    PublicUserProfile,
    ProfileUpdateRequest,
    AddRoleRequest
)
from backend.app.services.auth_service import AuthService
from backend.app.dependencies import get_current_user, get_supabase_admin

router = APIRouter(prefix="/profiles", tags=["Profiles"])


@router.get("/me", response_model=UserProfile)
async def get_my_profile(current_user: UserProfile = Depends(get_current_user)):
    """Retrieve full profile of the authenticated user."""
    return current_user


@router.patch("/me", response_model=UserProfile)
async def update_my_profile(
    data: ProfileUpdateRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    """Update profile fields (full name, phone, city, CNIC, avatar)."""
    service = AuthService()
    return service.update_profile(current_user.id, data)


@router.post("/me/roles", response_model=UserProfile)
async def add_role_to_me(
    data: AddRoleRequest,
    current_user: UserProfile = Depends(get_current_user)
):
    """Add a role to the account (e.g. enabling Landlord mode on a Tenant account)."""
    service = AuthService()
    return service.add_role(current_user.id, data.role)


@router.get("/{user_id}", response_model=PublicUserProfile)
async def get_public_profile(user_id: str):
    """Retrieve public profile information for a user (omits phone and CNIC)."""
    supabase = get_supabase_admin()
    if not supabase:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database service unavailable."
        )

    res = supabase.table("profiles").select("id, full_name, avatar_url, city, created_at").eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    roles_res = supabase.table("user_roles").select("role").eq("user_id", user_id).execute()
    roles = [r["role"] for r in roles_res.data if r.get("role")]

    user_data = res.data[0]
    return PublicUserProfile(
        id=user_data["id"],
        full_name=user_data["full_name"],
        avatar_url=user_data.get("avatar_url"),
        city=user_data.get("city"),
        roles=roles,
        created_at=user_data.get("created_at")
    )
