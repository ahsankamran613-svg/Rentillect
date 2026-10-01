from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import get_settings
from backend.app.routers import health, auth, profiles, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    settings = get_settings()
    print(f"Starting Rentillect API in {settings.ENV} mode")
    yield
    # Shutdown tasks
    print("Shutting down Rentillect API")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Rentillect API",
        description="Property Rental Management Platform Backend for Pakistan",
        version="0.1.0",
        lifespan=lifespan
    )

    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount routers under /api/v1
    app.include_router(health.router, prefix=settings.API_V1_PREFIX)
    app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
    app.include_router(profiles.router, prefix=settings.API_V1_PREFIX)
    app.include_router(admin.router, prefix=settings.API_V1_PREFIX)

    @app.get("/")
    async def root():
        return {
            "name": "Rentillect API",
            "status": "online",
            "docs": "/docs",
            "health": f"{settings.API_V1_PREFIX}/health"
        }

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
