from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "AI Support Ticket Automation"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Gemini API Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    AI_TIMEOUT_SECONDS: int = 15
    USE_MOCK_FALLBACK_IF_KEY_MISSING: bool = True
    
    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_PUBLISHABLE_KEY: str = ""
    # This key is only used by the backend for privileged database operations.
    # It must never be exposed to the frontend or used as a JWT signing secret.
    SUPABASE_SECRET_KEY: str = ""
    SUPABASE_DB_URL: str = ""
    
    FRONTEND_URL: str = "http://localhost:5173"
    
    @property
    def cors_origins(self) -> List[str]:
        return [
            self.FRONTEND_URL,
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]

    @property
    def supabase_configured(self) -> bool:
        """Whether the backend has enough configuration to call Supabase."""
        return bool(
            self.SUPABASE_URL.strip()
            and self.SUPABASE_PUBLISHABLE_KEY.strip()
            and self.SUPABASE_SECRET_KEY.strip()
        )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
