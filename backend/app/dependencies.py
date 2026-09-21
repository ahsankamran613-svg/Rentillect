from functools import lru_cache
from typing import Optional
from backend.app.config import get_settings

# Supabase python client wrapper
try:
    from supabase import create_client, Client
except ImportError:
    create_client = None  # type: ignore
    Client = None  # type: ignore


@lru_cache()
def get_supabase_admin() -> Optional["Client"]:
    """Returns the Supabase client initialized with the service role key for admin/backend queries."""
    settings = get_settings()
    if create_client and settings.SUPABASE_URL and not settings.SUPABASE_URL.startswith("https://placeholder"):
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
    return None
