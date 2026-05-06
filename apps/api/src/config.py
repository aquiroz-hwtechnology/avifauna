from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Azure PostgreSQL
    AZURE_PG_HOST: str = ""
    AZURE_PG_PORT: int = 5432
    AZURE_PG_DB: str = "avifauna"
    AZURE_PG_USER: str = ""
    AZURE_PG_PASSWORD: str = ""

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql+asyncpg://{self.AZURE_PG_USER}:{self.AZURE_PG_PASSWORD}"
            f"@{self.AZURE_PG_HOST}:{self.AZURE_PG_PORT}/{self.AZURE_PG_DB}"
            f"?ssl=require"
        )

    # Azure Blob Storage
    AZURE_STORAGE_CONNECTION_STRING: str = ""
    AZURE_STORAGE_CONTAINER: str = "bird-photos"

    # iNaturalist
    INATURALIST_API_URL: str = "https://api.inaturalist.org/v1"
    INATURALIST_API_TOKEN: str = ""

    # eBird
    EBIRD_API_KEY: str = ""
    EBIRD_API_URL: str = "https://api.ebird.org/v2"

    # Auth
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]


settings = Settings()
