"""Central scraper manager that orchestrates all platform scrapers."""
import asyncio
import logging
from datetime import datetime
from typing import List, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.scrapers.discord_scraper import DiscordScraper
from backend.scrapers.reddit_scraper import RedditScraper
from backend.scrapers.telegram_scraper import TelegramScraper
from backend.scrapers.quora_scraper import QuoraScraper
from backend.scrapers.facebook_scraper import FacebookScraper
from backend.scrapers.directory_scraper import DirectoryScraper
from backend.database.models import Community, ScrapingLog
from backend.database.database import AsyncSessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ScraperManager:
    """Manages all platform scrapers and coordinates scraping operations."""
    
    def __init__(self):
        self.discord_scraper = DiscordScraper()
        self.reddit_scraper = RedditScraper()
        self.telegram_scraper = TelegramScraper()
        self.quora_scraper = QuoraScraper()
        self.facebook_scraper = FacebookScraper()
        self.directory_scraper = DirectoryScraper()
    
    async def scrape_all_platforms(self) -> Dict[str, int]:
        """
        Scrape communities from all platforms.
        
        Returns:
            Dictionary with platform names and counts of communities found
        """
        results = {}
        
        logger.info("Starting scraping from all platforms...")
        
        # Create tasks for parallel scraping
        tasks = [
            ("Discord", self.discord_scraper.scrape_all()),
            ("Reddit", self.reddit_scraper.scrape_all()),
            ("Telegram", self.telegram_scraper.scrape_all()),
            ("Quora", self.quora_scraper.scrape_all()),
            ("Facebook", self.facebook_scraper.scrape_all()),
            ("Directories", self.directory_scraper.scrape_all()),
        ]
        
        # Run all scrapers concurrently
        for platform, task in tasks:
            try:
                logger.info(f"Starting {platform} scraper...")
                communities = await task
                results[platform] = len(communities)
                
                # Save to database
                await self.save_communities(communities, platform)
                
                logger.info(f"Completed {platform} scraper: {len(communities)} communities")
            except Exception as e:
                logger.error(f"Error scraping {platform}: {e}")
                results[platform] = 0
        
        logger.info(f"Scraping completed. Total results: {results}")
        return results
    
    async def save_communities(self, communities: List[Dict], platform: str):
        """
        Save or update communities in the database.
        
        Args:
            communities: List of community dictionaries
            platform: Platform name for logging
        """
        if not communities:
            logger.info(f"No communities to save for {platform}")
            return
        
        async with AsyncSessionLocal() as session:
            log = ScrapingLog(
                platform=platform,
                source=communities[0].get('metadata', {}).get('source', 'unknown'),
                status='in_progress',
                communities_found=len(communities),
                started_at=datetime.utcnow()
            )
            session.add(log)
            await session.commit()
            
            added = 0
            updated = 0
            
            try:
                for community_data in communities:
                    try:
                        # Check if community already exists (by name and platform)
                        result = await session.execute(
                            select(Community).where(
                                Community.name == community_data['name'],
                                Community.platform == community_data['platform']
                            )
                        )
                        existing = result.scalar_one_or_none()
                        
                        if existing:
                            # Update existing community
                            existing.description = community_data.get('description')
                            existing.member_count = community_data.get('member_count', 0)
                            existing.categories = community_data.get('categories', [])
                            existing.image_url = community_data.get('image_url')
                            existing.url = community_data.get('url')
                            existing.invite_link = community_data.get('invite_link')
                            existing.metadata = community_data.get('metadata', {})
                            existing.last_scraped = datetime.utcnow()
                            updated += 1
                        else:
                            # Create new community
                            community = Community(**community_data)
                            session.add(community)
                            added += 1
                        
                    except Exception as e:
                        logger.error(f"Error saving community {community_data.get('name')}: {e}")
                        continue
                
                await session.commit()
                
                # Update log
                log.status = 'success'
                log.communities_added = added
                log.communities_updated = updated
                log.completed_at = datetime.utcnow()
                await session.commit()
                
                logger.info(f"Saved {platform} communities: {added} added, {updated} updated")
                
            except Exception as e:
                logger.error(f"Error saving communities for {platform}: {e}")
                log.status = 'failed'
                log.error_message = str(e)
                log.completed_at = datetime.utcnow()
                await session.commit()
    
    async def scrape_platform(self, platform: str) -> int:
        """
        Scrape communities from a specific platform.
        
        Args:
            platform: Platform name (Discord, Reddit, Telegram, etc.)
            
        Returns:
            Number of communities found
        """
        platform = platform.lower()
        
        if platform == 'discord':
            communities = await self.discord_scraper.scrape_all()
        elif platform == 'reddit':
            communities = await self.reddit_scraper.scrape_all()
        elif platform == 'telegram':
            communities = await self.telegram_scraper.scrape_all()
        elif platform == 'quora':
            communities = await self.quora_scraper.scrape_all()
        elif platform == 'facebook':
            communities = await self.facebook_scraper.scrape_all()
        elif platform == 'directories':
            communities = await self.directory_scraper.scrape_all()
        else:
            logger.error(f"Unknown platform: {platform}")
            return 0
        
        await self.save_communities(communities, platform.capitalize())
        return len(communities)


async def main():
    """Main function to run scraping."""
    from backend.database.database import init_db
    
    # Initialize database
    await init_db()
    
    # Create scraper manager and run
    manager = ScraperManager()
    results = await manager.scrape_all_platforms()
    
    print("\n=== Scraping Results ===")
    for platform, count in results.items():
        print(f"{platform}: {count} communities")
    print("========================\n")


if __name__ == "__main__":
    asyncio.run(main())
