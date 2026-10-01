from functools import lru_cache
from typing import Optional, Callable
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

from backend.app.config import get_settings
from backend.app.models.auth import UserProfile, UserRoleEnum, UserStatusEnum

try:
    from supabase import create_client, Client
except ImportError:
    create_client = None  # type: ignore
    Client = None  # type: ignore

security = HTTPBearer(auto_error=True)


@lru_cache()
def get_supabase_admin() -> Optional["Client"]:
    """Returns the Supabase client initialized with the service role key for backend queries."""
    settings = get_settings()
    if create_client and settings.SUPABASE_URL and not settings.SUPABASE_URL.startswith("https://placeholder"):
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    return None


def get_supabase_anon() -> Optional["Client"]:
    """Returns a Supabase client initialized with the public anon key for end-user auth."""
    settings = get_settings()
    if create_client and settings.SUPABASE_URL and not settings.SUPABASE_URL.startswith("https://placeholder"):
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> UserProfile:
    """Verifies JWT from Authorization header and returns full UserProfile with roles."""
    token = credentials.credentials
    settings = get_settings()
    supabase = get_supabase_admin()

    if not supabase:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database service unavailable."
        )

    user_id: Optional[str] = None
    user_email: Optional[str] = None

    # First attempt: Verify via Supabase Auth API
    try:
        auth_user = supabase.auth.get_user(token)
        if auth_user and auth_user.user:
            user_id = str(auth_user.user.id)
            user_email = auth_user.user.email
    except Exception:
        # Second attempt: Local JWT decode using secret
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
            user_id = payload.get("sub")
            user_email = payload.get("email")
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token."
            )

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials."
        )

    # Fetch profile from DB
    from backend.app.services.auth_service import AuthService
    auth_service = AuthService()
    profile = auth_service.get_profile(user_id, email=user_email)

    if profile.status == UserStatusEnum.SUSPENDED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended."
        )

    return profile


def require_role(role: UserRoleEnum) -> Callable:
    """Dependency that ensures the authenticated user possesses the specified role."""
    async def role_checker(current_user: UserProfile = Depends(get_current_user)) -> UserProfile:
        if role not in current_user.roles and UserRoleEnum.ADMIN not in current_user.roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: '{role.value}' role required."
            )
        return current_user
    return role_checker
