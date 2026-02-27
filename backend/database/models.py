"""Database models for storing community data."""
from sqlalchemy import Column, Integer, String, DateTime, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()


class Community(Base):
    """Model for storing community information from various platforms."""
    
    __tablename__ = "communities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    platform = Column(String(50), nullable=False, index=True)  # Discord, Reddit, Quora, Facebook, Telegram, Other
    url = Column(String(500), nullable=True)
    invite_link = Column(String(500), nullable=True)
    member_count = Column(Integer, default=0, index=True)
    categories = Column(JSON, default=list)  # List of category tags
    image_url = Column(String(500), nullable=True)
    language = Column(String(10), default="en")
    
    # Metadata for platform-specific data
    metadata = Column(JSON, default=dict)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())
    last_scraped = Column(DateTime, default=func.now())
    
    def __repr__(self):
        return f"<Community(name='{self.name}', platform='{self.platform}', members={self.member_count})>"
    
    def to_dict(self):
        """Convert model to dictionary for API responses."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "platform": self.platform,
            "url": self.url,
            "invite_link": self.invite_link,
            "member_count": self.member_count,
            "categories": self.categories,
            "image_url": self.image_url,
            "language": self.language,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None,
        }


class ScrapingLog(Base):
    """Model for tracking scraping operations."""
    
    __tablename__ = "scraping_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(50), nullable=False, index=True)
    source = Column(String(100), nullable=False)  # e.g., "disboard.org", "reddit_api"
    status = Column(String(20), nullable=False)  # success, failed, partial
    communities_found = Column(Integer, default=0)
    communities_added = Column(Integer, default=0)
    communities_updated = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<ScrapingLog(platform='{self.platform}', source='{self.source}', status='{self.status}')>"
