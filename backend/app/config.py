import os
from pathlib import Path
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[str(BACKEND_DIR / ".env"), ".env"],
        env_file_encoding="utf-8",
        extra="ignore"
    )

    ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Supabase
    SUPABASE_URL: str = "https://placeholder.supabase.co"
    SUPABASE_ANON_KEY: str = "placeholder-anon-key"
    SUPABASE_SERVICE_ROLE_KEY: str = "placeholder-service-role-key"
    SUPABASE_JWT_SECRET: str = "placeholder-jwt-secret"

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Gemini
    GEMINI_API_KEY: str = ""

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


@lru_cache()
def get_settings() -> Settings:
    return Settings()
