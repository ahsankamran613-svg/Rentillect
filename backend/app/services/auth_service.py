from typing import Optional, List
from fastapi import HTTPException, status
from backend.app.dependencies import get_supabase_admin, get_supabase_anon
from backend.app.models.auth import (
    SignUpRequest,
    LoginRequest,
    UserProfile,
    UserRoleEnum,
    UserStatusEnum,
    ProfileUpdateRequest,
    AuthResponse
)


class AuthService:
    def __init__(self):
        self.supabase = get_supabase_admin()
        if not self.supabase:
            raise RuntimeError("Supabase client is not configured in backend!")

    def sign_up(self, data: SignUpRequest) -> AuthResponse:
        """Register a new user in Supabase Auth, insert profile, and grant initial role."""
        try:
            auth_res = self.supabase.auth.admin.create_user({
                "email": data.email,
                "password": data.password,
                "email_confirm": True,
                "user_metadata": {"full_name": data.full_name}
            })
        except Exception as e:
            err_msg = str(e)
            if "already registered" in err_msg.lower() or "already exists" in err_msg.lower():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="An account with this email address already exists."
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration failed: {err_msg}"
            )

        if not auth_res or not auth_res.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User creation failed in authentication service."
            )

        user_id = str(auth_res.user.id)

        # 1. Create or upsert profile
        profile_data = {
            "id": user_id,
            "full_name": data.full_name,
            "phone": data.phone,
            "city": data.city,
            "cnic": data.cnic,
            "status": UserStatusEnum.ACTIVE.value,
        }
        try:
            self.supabase.table("profiles").upsert(profile_data).execute()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create user profile: {str(e)}"
            )

        # 2. Assign initial role
        role_data = {
            "user_id": user_id,
            "role": data.role.value,
        }
        try:
            self.supabase.table("user_roles").upsert(role_data, on_conflict="user_id, role").execute()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to assign user role: {str(e)}"
            )

        # 3. Auto-confirm email via Admin API so user can log in immediately
        try:
            self.supabase.auth.admin.update_user_by_id(user_id, {"email_confirm": True})
        except Exception:
            pass

        # 4. Generate active access token via anon client
        token = ""
        anon_client = get_supabase_anon()
        if anon_client:
            try:
                sign_in_res = anon_client.auth.sign_in_with_password({
                    "email": data.email,
                    "password": data.password
                })
                if sign_in_res and sign_in_res.session:
                    token = sign_in_res.session.access_token
            except Exception:
                pass

        user_profile = self.get_profile(user_id, email=data.email)
        return AuthResponse(
            access_token=token,
            token_type="bearer",
            user=user_profile
        )

    def login(self, data: LoginRequest) -> AuthResponse:
        """Authenticate user with email and password via Supabase Auth using anon client."""
        anon_client = get_supabase_anon()
        if not anon_client:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Auth service client not available."
            )

        try:
            auth_res = anon_client.auth.sign_in_with_password({
                "email": data.email,
                "password": data.password,
            })
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        if not auth_res or not auth_res.user or not auth_res.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed. Please verify your credentials."
            )

        user_id = str(auth_res.user.id)
        token = auth_res.session.access_token
        user_profile = self.get_profile(user_id, email=data.email)

        if user_profile.status == UserStatusEnum.SUSPENDED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been suspended by an administrator."
            )

        return AuthResponse(
            access_token=token,
            token_type="bearer",
            user=user_profile
        )

    def get_profile(self, user_id: str, email: Optional[str] = None) -> UserProfile:
        """Fetch profile and all assigned roles for a user."""
        res = self.supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not res.data:
            # Fallback if profile doesn't exist yet
            profile_dict = {
                "id": user_id,
                "full_name": email.split("@")[0] if email else "User",
                "status": UserStatusEnum.ACTIVE.value,
            }
            self.supabase.table("profiles").upsert(profile_dict).execute()
            res = self.supabase.table("profiles").select("*").eq("id", user_id).execute()

        raw_profile = res.data[0]

        # Fetch roles
        roles_res = self.supabase.table("user_roles").select("role").eq("user_id", user_id).execute()
        roles = [UserRoleEnum(r["role"]) for r in roles_res.data if r.get("role")]

        # If user has no roles assigned yet, default to tenant
        if not roles:
            self.supabase.table("user_roles").insert({"user_id": user_id, "role": UserRoleEnum.TENANT.value}).execute()
            roles = [UserRoleEnum.TENANT]

        user_email = email or ""
        if not user_email:
            try:
                user_info = self.supabase.auth.admin.get_user_by_id(user_id)
                if user_info and user_info.user:
                    user_email = user_info.user.email or ""
            except Exception:
                pass

        return UserProfile(
            id=raw_profile["id"],
            email=user_email,
            full_name=raw_profile.get("full_name") or "User",
            phone=raw_profile.get("phone"),
            cnic=raw_profile.get("cnic"),
            avatar_url=raw_profile.get("avatar_url"),
            city=raw_profile.get("city"),
            address=raw_profile.get("address"),
            status=UserStatusEnum(raw_profile.get("status", "active")),
            roles=roles,
            created_at=raw_profile.get("created_at"),
            updated_at=raw_profile.get("updated_at")
        )

    def update_profile(self, user_id: str, data: ProfileUpdateRequest) -> UserProfile:
        """Update user profile fields."""
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_dict:
            return self.get_profile(user_id)

        try:
            self.supabase.table("profiles").update(update_dict).eq("id", user_id).execute()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to update profile: {str(e)}"
            )

        return self.get_profile(user_id)

    def add_role(self, user_id: str, role: UserRoleEnum) -> UserProfile:
        """Add a role (e.g. landlord or tenant) to support dual-role accounts."""
        try:
            self.supabase.table("user_roles").upsert(
                {"user_id": user_id, "role": role.value},
                on_conflict="user_id, role"
            ).execute()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to add role: {str(e)}"
            )

        return self.get_profile(user_id)
