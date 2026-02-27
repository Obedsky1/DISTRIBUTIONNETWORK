"""Telegram community scraper from public directories."""
import aiohttp
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import logging
from aiolimiter import AsyncLimiter
from backend.config import settings

logger = logging.getLogger(__name__)


class TelegramScraper:
    """Scrapes Telegram communities from public directories."""
    
    def __init__(self):
        self.rate_limiter = AsyncLimiter(settings.telegram_rate_limit, 60)
        self.headers = {
            'User-Agent': settings.user_agent
        }
    
    async def scrape_telegram_channels_me(self, category: Optional[str] = None, max_pages: int = 5) -> List[Dict]:
        """
        Scrape Telegram channels from TelegramChannels.me
        
        Args:
            category: Optional category filter
            max_pages: Maximum number of pages to scrape
            
        Returns:
            List of community dictionaries
        """
        communities = []
        base_url = "https://telegramchannels.me"
        
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                for page in range(1, max_pages + 1):
                    async with self.rate_limiter:
                        url = f"{base_url}/channels" if not category else f"{base_url}/channels/{category}"
                        if page > 1:
                            url += f"?page={page}"
                        
                        try:
                            async with session.get(url, timeout=settings.request_timeout) as response:
                                if response.status != 200:
                                    logger.warning(f"TelegramChannels.me returned status {response.status}")
                                    continue
                                
                                html = await response.text()
                                soup = BeautifulSoup(html, 'lxml')
                                
                                # Find channel cards
                                channel_cards = soup.find_all('div', class_='channel-card')
                                
                                for card in channel_cards:
                                    try:
                                        community = self._parse_telegram_card(card)
                                        if community:
                                            communities.append(community)
                                    except Exception as e:
                                        logger.error(f"Error parsing Telegram card: {e}")
                                        continue
                                
                                logger.info(f"Scraped page {page} from TelegramChannels.me")
                                
                        except asyncio.TimeoutError:
                            logger.error(f"Timeout scraping TelegramChannels.me page {page}")
                            continue
                            
        except Exception as e:
            logger.error(f"Error scraping TelegramChannels.me: {e}")
        
        return communities
    
    def _parse_telegram_card(self, card) -> Optional[Dict]:
        """Parse a Telegram channel card into community data."""
        try:
            name_elem = card.find('h3', class_='channel-name') or card.find('a', class_='channel-title')
            name = name_elem.text.strip() if name_elem else None
            
            desc_elem = card.find('p', class_='channel-description') or card.find('div', class_='description')
            description = desc_elem.text.strip() if desc_elem else None
            
            members_elem = card.find('span', class_='members') or card.find('div', class_='subscribers')
            member_count = 0
            if members_elem:
                member_text = members_elem.text.strip().replace(',', '').replace('K', '000').replace('M', '000000')
                member_count = int(''.join(filter(str.isdigit, member_text)))
            
            link_elem = card.find('a', class_='channel-link') or card.find('a', href=True)
            url = link_elem.get('href') if link_elem else None
            
            image_elem = card.find('img', class_='channel-avatar') or card.find('img')
            image_url = image_elem.get('src') if image_elem else None
            
            # Extract categories
            categories = []
            category_elems = card.find_all('span', class_='category') or card.find_all('a', class_='tag')
            for cat in category_elems:
                categories.append(cat.text.strip())
            
            if not name:
                return None
            
            return {
                'name': name,
                'description': description,
                'platform': 'Telegram',
                'url': url,
                'invite_link': url,
                'member_count': member_count,
                'categories': categories,
                'image_url': image_url,
                'metadata': {
                    'source': 'telegramchannels.me'
                }
            }
        except Exception as e:
            logger.error(f"Error parsing Telegram card: {e}")
            return None
    
    async def scrape_tgstat(self, max_items: int = 100) -> List[Dict]:
        """
        Scrape Telegram channels from TGStat
        
        Args:
            max_items: Maximum number of channels to scrape
            
        Returns:
            List of community dictionaries
        """
        communities = []
        # TGStat scraping would be implemented here
        # This is a placeholder for the actual implementation
        logger.info("TGStat scraping not yet implemented")
        return communities
    
    async def scrape_all(self) -> List[Dict]:
        """Scrape from all Telegram directory sources."""
        all_communities = []
        
        # Scrape TelegramChannels.me
        logger.info("Starting TelegramChannels.me scrape...")
        telegram_communities = await self.scrape_telegram_channels_me(max_pages=5)
        all_communities.extend(telegram_communities)
        logger.info(f"Found {len(telegram_communities)} communities from TelegramChannels.me")
        
        # Scrape TGStat
        logger.info("Starting TGStat scrape...")
        tgstat_communities = await self.scrape_tgstat(max_items=100)
        all_communities.extend(tgstat_communities)
        logger.info(f"Found {len(tgstat_communities)} communities from TGStat")
        
        return all_communities


import asyncio
