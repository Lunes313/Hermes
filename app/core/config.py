from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "PQRSD API"
    VERSION: str = "0.1.0"
    DATABASE_URL: str = "sqlite:///./pqrsd.db"
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    GROQ_API_URL: str = "https://api.groq.com/openai/v1/chat/completions"
    HUGGINGFACE_API_KEY: Optional[str] = None
    HUGGINGFACE_EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    AI_TIMEOUT_SECONDS: int = 8

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
