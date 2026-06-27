from functools import lru_cache

from pydantic import EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Sales MIS API"
    app_version: str = "1.0.0"
    api_prefix: str = "/api"
    app_debug: bool = False

    database_url: str = "sqlite:///./salesmis.db"
    create_db_tables: bool = True
    seed_demo_data: bool = True

    jwt_secret_key: str = "replace-this-secret-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 8

    initial_admin_email: EmailStr = "admin@salesmis.com"
    initial_admin_password: str = "change-this-password"
    initial_admin_name: str = "Sales MIS Admin"

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
