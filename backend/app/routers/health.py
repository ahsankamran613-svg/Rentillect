from fastapi import APIRouter
from backend.app.config import get_settings
from backend.app.dependencies import get_supabase_admin

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
async def health_check():
    settings = get_settings()
    supabase = get_supabase_admin()
    
    db_status = "unconfigured"
    if supabase is not None:
        try:
            # Quick ping query
            res = supabase.table("cities").select("id").limit(1).execute()
            db_status = "connected" if res.data is not None else "degraded"
        except Exception as e:
            db_status = f"error: {str(e)[:50]}"
    
    return {
        "status": "ok",
        "service": "rentillect-api",
        "environment": settings.ENV,
        "database": db_status,
        "version": "0.1.0"
    }
