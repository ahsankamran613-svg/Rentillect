from fastapi import APIRouter, Depends, status
from backend.app.models.auth import (
    SignUpRequest,
    LoginRequest,
    AuthResponse,
    UserProfile
)
from backend.app.services.auth_service import AuthService
from backend.app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(data: SignUpRequest):
    """Register a new user account with initial role (landlord or tenant)."""
    service = AuthService()
    return service.sign_up(data)


@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest):
    """Authenticate with email and password and receive JWT token."""
    service = AuthService()
    return service.login(data)


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: UserProfile = Depends(get_current_user)):
    """Retrieve the currently authenticated user's profile and roles."""
    return current_user
