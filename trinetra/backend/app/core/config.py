"""TRINETRA — Application Configuration."""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
import json
import os


class Settings(BaseSettings):
    # Application
    APP_ENV: str = "development"
    APP_NAME: str = "TRINETRA"
    APP_VERSION: str = "1.0.0"
    SECRET_KEY: str = "dev-secret-key-CHANGE-IN-PRODUCTION"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://trinetra:password@localhost:5432/trinetra"
    DATABASE_URL_SYNC: str = "postgresql://trinetra:password@localhost:5432/trinetra"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, tuple)):
            return list(v)
        return ["http://localhost:5173", "http://localhost:3000"]

    # File storage
    UPLOAD_DIR: str = "./data/uploads"
    MAX_UPLOAD_SIZE_MB: int = 500

    # Quantum
    QAOA_BACKEND: str = "aer_simulator"
    QAOA_MAX_QUBITS: int = 10
    QAOA_DEFAULT_P: int = 1
    QAOA_MAX_SHOTS: int = 1024

    # Demo account passwords
    DEMO_ADMIN_PASSWORD: str = "Trinetra@Admin2024"
    DEMO_LAND_AUTHORITY_PASSWORD: str = "Trinetra@LandAuth2024"
    DEMO_GIS_OFFICER_PASSWORD: str = "Trinetra@GIS2024"
    DEMO_URBAN_PLANNER_PASSWORD: str = "Trinetra@Urban2024"
    DEMO_REVIEW_OFFICER_PASSWORD: str = "Trinetra@Review2024"
    DEMO_CITIZEN_PASSWORD: str = "Trinetra@Citizen2024"

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    AUTH_RATE_LIMIT_PER_MINUTE: int = 10

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
