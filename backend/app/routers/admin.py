from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from backend.app.models.auth import UserProfile, UserRoleEnum, UserStatusEnum
from backend.app.dependencies import require_role, get_supabase_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


class UserStatusUpdateRequest(BaseModel):
    status: UserStatusEnum


@router.get("/users")
async def list_all_users(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    admin_user: UserProfile = Depends(require_role(UserRoleEnum.ADMIN))
):
    """Admin-only endpoint to list all platform users with their roles."""
    supabase = get_supabase_admin()
    if not supabase:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="DB unavailable")

    res = supabase.table("profiles").select("*").range(offset, offset + limit - 1).order("created_at", desc=True).execute()

    # Attach roles for each user
    users_with_roles = []
    for u in res.data:
        roles_res = supabase.table("user_roles").select("role").eq("user_id", u["id"]).execute()
        roles = [r["role"] for r in roles_res.data if r.get("role")]
        u["roles"] = roles
        users_with_roles.append(u)

    return {
        "count": len(users_with_roles),
        "limit": limit,
        "offset": offset,
        "users": users_with_roles
    }


@router.patch("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    data: UserStatusUpdateRequest,
    admin_user: UserProfile = Depends(require_role(UserRoleEnum.ADMIN))
):
    """Admin-only endpoint to suspend or reinstate an account."""
    supabase = get_supabase_admin()
    if not supabase:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="DB unavailable")

    res = supabase.table("profiles").update({"status": data.status.value}).eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {
        "message": f"User status updated to '{data.status.value}'",
        "user_id": user_id,
        "new_status": data.status.value
    }
