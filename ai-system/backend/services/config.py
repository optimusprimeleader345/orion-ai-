"""
Configuration management service for the AI system.
Handles environment variables and application settings.
"""

from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application configuration settings."""
    
    # Application
    app_name: str = Field(default="AI System", env="APP_NAME")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    debug: bool = Field(default=False, env="DEBUG")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    
    # Server
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    
    # LLM Provider Configuration
    llm_provider: str = Field(default="GEMINI", env="LLM_PROVIDER")
    
    # Gemini
    gemini_api_key: Optional[str] = Field(default=None, env="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-pro", env="GEMINI_MODEL")
    
    # OpenAI
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4o-mini", env="OPENAI_MODEL")
    openai_base_url: Optional[str] = Field(default="https://api.openai.com/v1", env="OPENAI_BASE_URL")
    
    # Claude
    claude_api_key: Optional[str] = Field(default=None, env="CLAUDE_API_KEY")
    claude_model: str = Field(default="claude-3-5-sonnet-20240620", env="CLAUDE_MODEL")
    
    # Agent Configuration
    max_retries: int = Field(default=3, env="MAX_RETRIES")
    timeout_seconds: int = Field(default=30, env="TIMEOUT_SECONDS")
    concurrent_agents: int = Field(default=5, env="CONCURRENT_AGENTS")
    
    # Database
    database_url: Optional[str] = Field(default=None, env="DATABASE_URL")
    db_user: Optional[str] = Field(default=None, env="DB_USER")
    db_password: Optional[str] = Field(default=None, env="DB_PASSWORD")
    db_name: Optional[str] = Field(default=None, env="DB_NAME")
    db_host: Optional[str] = Field(default="localhost", env="DB_HOST")
    db_port: int = Field(default=5432, env="DB_PORT")
    
    def validate_llm_config(self) -> bool:
        """Validate that the required LLM configuration is present."""
        provider = self.llm_provider.upper()
        
        if provider == "GEMINI":
            return self.gemini_api_key is not None
        elif provider == "OPENAI":
            return self.openai_api_key is not None
        elif provider == "CLAUDE":
            return self.claude_api_key is not None
        else:
            return False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()


def update_gemini_model(model_name: str) -> bool:
    """Update the Gemini model name in settings."""
    if model_name in ["gemini-pro", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-flash-latest"]:
        settings.gemini_model = model_name
        return True
    return False


def get_llm_config():
    """Get the LLM configuration based on the provider."""
    provider = settings.llm_provider.upper()
    
    if provider == "GEMINI":
        return {
            "provider": "gemini",
            "api_key": settings.gemini_api_key,
            "model": settings.gemini_model
        }
    elif provider == "OPENAI":
        return {
            "provider": "openai", 
            "api_key": settings.openai_api_key,
            "model": settings.openai_model,
            "base_url": settings.openai_base_url
        }
    elif provider == "CLAUDE":
        return {
            "provider": "claude",
            "api_key": settings.claude_api_key,
            "model": settings.claude_model
        }
    else:
        raise ValueError(f"Unsupported LLM provider: {provider}")