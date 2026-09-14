import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # App general settings
    APP_NAME: str = "Aadi Vaani Translation Router"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Config files
    ROUTING_CONFIG_PATH: str = str(BASE_DIR / "config" / "routing_config.yaml")

    # Bhashini ULCA API Credentials
    BHASHINI_USER_ID: str = Field(default="", description="Bhashini ULCA User ID")
    BHASHINI_API_KEY: str = Field(default="", description="Bhashini ULCA API Key")
    BHASHINI_INFERENCE_KEY: str = Field(default="", description="Bhashini Inference Pipeline Auth Key")
    BHASHINI_PIPELINE_URL: str = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

    # IndicTrans2 Self-Hosted endpoint
    INDICTRANS2_ENDPOINT: str = "http://localhost:8001/translate"

    # NLLB-200 Evaluation endpoint
    NLLB_ENDPOINT: str = "http://localhost:8002/translate"

    # Custom Mundari Model Endpoint
    MUNDARI_ENDPOINT: str = "http://localhost:8003/translate"

    # Caching
    CACHE_BACKEND: str = "memory" # "memory" or "redis"
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_SECONDS: int = 86400 # 24 hours

    # Feedback dataset persistence
    FEEDBACK_DATASET_DIR: str = str(BASE_DIR / "data" / "feedback")
settings = Settings()
