from fastapi import APIRouter
from backend.app.config import get_settings
from backend.app.dependencies import get_supabase_admin

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def health_check():
    settings = get_settings()
    supabase = get_supabase_admin()
    
    db_status = "configured" if supabase is not None else "pending_credentials"
    
    return {
        "status": "ok",
        "service": "rentillect-api",
        "environment": settings.ENV,
        "database": db_status,
        "version": "0.1.0"
    }
