from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Hermes PQRSD API"
    VERSION: str = "0.2.0"
    DATABASE_URL: Optional[str] = None
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    GROQ_API_URL: str = "https://api.groq.com/openai/v1/chat/completions"
    HUGGINGFACE_API_KEY: Optional[str] = None
    HUGGINGFACE_EMBEDDING_MODEL: str = "Loo0115/pqrsd-medellin"
    HUGGINGFACE_CLASSIFY_MODEL: str = "meta-llama/Meta-Llama-3.1-8B-Instruct"
    HUGGINGFACE_CLASSIFY_URL: str = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-8B-Instruct"
    AI_TIMEOUT_SECONDS: int = 10

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
