"""Discord community scraper - scrapes from public Discord directories."""
import aiohttp
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import logging
from aiolimiter import AsyncLimiter
from backend.config import settings

logger = logging.getLogger(__name__)


class DiscordScraper:
    """Scrapes Discord communities from public directories."""
    
    def __init__(self):
        self.rate_limiter = AsyncLimiter(settings.discord_rate_limit, 60)
        self.headers = {
            'User-Agent': settings.user_agent
        }
    
    async def scrape_disboard(self, category: Optional[str] = None, max_pages: int = 5) -> List[Dict]:
        """
        Scrape Discord servers from Disboard.org
        
        Args:
            category: Optional category filter (e.g., 'gaming', 'music')
            max_pages: Maximum number of pages to scrape
            
        Returns:
            List of community dictionaries
        """
        communities = []
        base_url = "https://disboard.org/servers"
        
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                for page in range(1, max_pages + 1):
                    async with self.rate_limiter:
                        url = f"{base_url}/tag/{category}/{page}" if category else f"{base_url}/page/{page}"
                        
                        try:
                            async with session.get(url, timeout=settings.request_timeout) as response:
                                if response.status != 200:
                                    logger.warning(f"Disboard returned status {response.status} for page {page}")
                                    continue
                                
                                html = await response.text()
                                soup = BeautifulSoup(html, 'lxml')
                                
                                # Find server cards
                                server_cards = soup.find_all('div', class_='server-card')
                                
                                for card in server_cards:
                                    try:
                                        community = self._parse_disboard_card(card)
                                        if community:
                                            communities.append(community)
                                    except Exception as e:
                                        logger.error(f"Error parsing Disboard card: {e}")
                                        continue
                                
                                logger.info(f"Scraped page {page} from Disboard, found {len(server_cards)} servers")
                                
                        except asyncio.TimeoutError:
                            logger.error(f"Timeout scraping Disboard page {page}")
                            continue
                            
        except Exception as e:
            logger.error(f"Error scraping Disboard: {e}")
        
        return communities
    
    def _parse_disboard_card(self, card) -> Optional[Dict]:
        """Parse a Disboard server card into community data."""
        try:
            name_elem = card.find('a', class_='server-name')
            name = name_elem.text.strip() if name_elem else None
            
            desc_elem = card.find('div', class_='server-description')
            description = desc_elem.text.strip() if desc_elem else None
            
            members_elem = card.find('span', class_='member-count')
            member_count = 0
            if members_elem:
                member_text = members_elem.text.strip().replace(',', '')
                member_count = int(''.join(filter(str.isdigit, member_text)))
            
            invite_elem = card.find('a', class_='server-invite-button')
            invite_link = invite_elem.get('href') if invite_elem else None
            
            image_elem = card.find('img', class_='server-icon')
            image_url = image_elem.get('src') if image_elem else None
            
            # Extract tags/categories
            tags = []
            tag_elems = card.find_all('a', class_='tag')
            for tag in tag_elems:
                tags.append(tag.text.strip())
            
            if not name:
                return None
            
            return {
                'name': name,
                'description': description,
                'platform': 'Discord',
                'url': invite_link,
                'invite_link': invite_link,
                'member_count': member_count,
                'categories': tags,
                'image_url': image_url,
                'metadata': {
                    'source': 'disboard.org'
                }
            }
        except Exception as e:
            logger.error(f"Error parsing Disboard card: {e}")
            return None
    
    async def scrape_top_gg(self, max_pages: int = 3) -> List[Dict]:
        """
        Scrape Discord servers from Top.gg
        
        Args:
            max_pages: Maximum number of pages to scrape
            
        Returns:
            List of community dictionaries
        """
        communities = []
        base_url = "https://top.gg/servers"
        
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                for page in range(1, max_pages + 1):
                    async with self.rate_limiter:
                        url = f"{base_url}?page={page}"
                        
                        try:
                            async with session.get(url, timeout=settings.request_timeout) as response:
                                if response.status != 200:
                                    logger.warning(f"Top.gg returned status {response.status}")
                                    continue
                                
                                html = await response.text()
                                soup = BeautifulSoup(html, 'lxml')
                                
                                # Parse server listings
                                server_items = soup.find_all('div', class_='server-item')
                                
                                for item in server_items:
                                    try:
                                        community = self._parse_topgg_item(item)
                                        if community:
                                            communities.append(community)
                                    except Exception as e:
                                        logger.error(f"Error parsing Top.gg item: {e}")
                                        continue
                                
                                logger.info(f"Scraped page {page} from Top.gg")
                                
                        except asyncio.TimeoutError:
                            logger.error(f"Timeout scraping Top.gg page {page}")
                            continue
                            
        except Exception as e:
            logger.error(f"Error scraping Top.gg: {e}")
        
        return communities
    
    def _parse_topgg_item(self, item) -> Optional[Dict]:
        """Parse a Top.gg server item into community data."""
        # Similar parsing logic as Disboard
        # Implementation would depend on Top.gg's actual HTML structure
        return None
    
    async def scrape_all(self) -> List[Dict]:
        """Scrape from all Discord directory sources."""
        all_communities = []
        
        # Scrape Disboard
        logger.info("Starting Disboard scrape...")
        disboard_communities = await self.scrape_disboard(max_pages=5)
        all_communities.extend(disboard_communities)
        logger.info(f"Found {len(disboard_communities)} communities from Disboard")
        
        # Scrape Top.gg
        logger.info("Starting Top.gg scrape...")
        topgg_communities = await self.scrape_top_gg(max_pages=3)
        all_communities.extend(topgg_communities)
        logger.info(f"Found {len(topgg_communities)} communities from Top.gg")
        
        return all_communities


import asyncio
