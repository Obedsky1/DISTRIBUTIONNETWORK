"""Configuration management for the community aggregator."""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Reddit API
    reddit_client_id: Optional[str] = None
    reddit_client_secret: Optional[str] = None
    reddit_user_agent: str = "CommunityAggregator/1.0"
    
    # Facebook API
    facebook_app_id: Optional[str] = None
    facebook_app_secret: Optional[str] = None
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./communities.db"
    
    # API Settings
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # Scraping Settings
    scrape_interval_hours: int = 24
    max_concurrent_requests: int = 5
    request_timeout: int = 30
    user_agent: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    
    # Rate Limiting (requests per minute)
    discord_rate_limit: int = 30
    reddit_rate_limit: int = 60
    telegram_rate_limit: int = 30
    quora_rate_limit: int = 20
    facebook_rate_limit: int = 20
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()
