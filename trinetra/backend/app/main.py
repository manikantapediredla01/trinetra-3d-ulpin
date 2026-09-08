"""
TRINETRA — FastAPI Application Factory
3D ULPIN & Vertical Property Intelligence Platform
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import (
    auth, users, datasets, preprocessing,
    extraction, candidates, qubo, qaoa,
    validation, ulpin, passport, gis,
    utilities, audit, properties,
    encroachment, discrepancy, confidence,
    change_detection, assistant, reports, demo
)
from app.core.audit import audit_middleware

logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    logger.info("🚀 TRINETRA starting up...")
    # Ensure upload directories exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "lidar"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "gis"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "dem"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "drone"), exist_ok=True)
    os.makedirs(os.path.join(settings.UPLOAD_DIR, "floorplans"), exist_ok=True)
    logger.info("✅ TRINETRA ready.")
    yield
    logger.info("👋 TRINETRA shutting down.")


def create_app() -> FastAPI:
    app = FastAPI(
        title="TRINETRA — 3D Property Intelligence Platform",
        description=(
            "3D ULPIN & Vertical Property Mapping System | "
            "Department of Land Resources (DoLR) | SIH26011"
        ),
        version=settings.APP_VERSION,
        docs_url="/api/docs" if settings.DEBUG else None,
        redoc_url="/api/redoc" if settings.DEBUG else None,
        lifespan=lifespan,
    )

    # Security headers middleware
    @app.middleware("http")
    async def add_security_headers(request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    )

    # GZip compression
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # Rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Static files for uploads
    if os.path.exists(settings.UPLOAD_DIR):
        app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

    # Routers — prefix /api/v1
    prefix = "/api/v1"
    app.include_router(auth.router, prefix=prefix, tags=["Authentication"])
    app.include_router(users.router, prefix=prefix, tags=["Users"])
    app.include_router(datasets.router, prefix=prefix, tags=["Datasets"])
    app.include_router(preprocessing.router, prefix=prefix, tags=["Preprocessing"])
    app.include_router(extraction.router, prefix=prefix, tags=["Extraction"])
    app.include_router(candidates.router, prefix=prefix, tags=["Candidates"])
    app.include_router(qubo.router, prefix=prefix, tags=["QUBO"])
    app.include_router(qaoa.router, prefix=prefix, tags=["QAOA"])
    app.include_router(validation.router, prefix=prefix, tags=["Validation"])
    app.include_router(ulpin.router, prefix=prefix, tags=["ULPIN"])
    app.include_router(passport.router, prefix=prefix, tags=["Passport"])
    app.include_router(gis.router, prefix=prefix, tags=["GIS"])
    app.include_router(utilities.router, prefix=prefix, tags=["Utilities"])
    app.include_router(audit.router, prefix=prefix, tags=["Audit"])
    app.include_router(properties.router, prefix=prefix, tags=["Properties"])
    app.include_router(encroachment.router, prefix=prefix, tags=["Encroachment"])
    app.include_router(discrepancy.router, prefix=prefix, tags=["Discrepancy"])
    app.include_router(confidence.router, prefix=prefix, tags=["Confidence"])
    app.include_router(change_detection.router, prefix=prefix, tags=["Change Detection"])
    app.include_router(assistant.router, prefix=prefix, tags=["GIS Assistant"])
    app.include_router(reports.router, prefix=prefix, tags=["Reports"])
    app.include_router(demo.router, prefix=prefix, tags=["Demo"])

    @app.get("/health")
    @app.get(f"{prefix}/health")
    async def health():
        return {"status": "ok", "system": "TRINETRA", "version": settings.APP_VERSION}

    return app


app = create_app()
