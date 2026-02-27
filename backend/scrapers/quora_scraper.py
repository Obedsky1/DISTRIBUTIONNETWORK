"""Quora Spaces scraper."""
import aiohttp
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import logging
from aiolimiter import AsyncLimiter
from backend.config import settings

logger = logging.getLogger(__name__)


class QuoraScraper:
    """Scrapes Quora Spaces from search and discovery."""
    
    def __init__(self):
        self.rate_limiter = AsyncLimiter(settings.quora_rate_limit, 60)
        self.headers = {
            'User-Agent': settings.user_agent
        }
    
    async def scrape_spaces_search(self, query: str, max_results: int = 50) -> List[Dict]:
        """
        Search for Quora Spaces by query.
        
        Args:
            query: Search query
            max_results: Maximum number of results
            
        Returns:
            List of community dictionaries
        """
        communities = []
        
        # Note: Quora's search requires authentication for full access
        # This is a simplified version that would need to be enhanced
        logger.info(f"Searching Quora Spaces for '{query}'")
        
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                async with self.rate_limiter:
                    url = f"https://www.quora.com/search?q={query}&type=space"
                    
                    try:
                        async with session.get(url, timeout=settings.request_timeout) as response:
                            if response.status != 200:
                                logger.warning(f"Quora returned status {response.status}")
                                return communities
                            
                            html = await response.text()
                            soup = BeautifulSoup(html, 'lxml')
                            
                            # Parse space results
                            # Note: Quora's HTML structure is complex and may require more sophisticated parsing
                            space_items = soup.find_all('div', class_='q-box')
                            
                            for item in space_items[:max_results]:
                                try:
                                    community = self._parse_space_item(item)
                                    if community:
                                        communities.append(community)
                                except Exception as e:
                                    logger.error(f"Error parsing Quora space: {e}")
                                    continue
                            
                            logger.info(f"Found {len(communities)} Quora Spaces for '{query}'")
                            
                    except asyncio.TimeoutError:
                        logger.error(f"Timeout searching Quora for '{query}'")
                        
        except Exception as e:
            logger.error(f"Error scraping Quora: {e}")
        
        return communities
    
    def _parse_space_item(self, item) -> Optional[Dict]:
        """Parse a Quora Space item into community data."""
        try:
            # This is a placeholder - actual implementation would depend on Quora's HTML structure
            name_elem = item.find('a', class_='space-name')
            if not name_elem:
                return None
            
            name = name_elem.text.strip()
            url = name_elem.get('href', '')
            if url and not url.startswith('http'):
                url = f"https://www.quora.com{url}"
            
            desc_elem = item.find('div', class_='space-description')
            description = desc_elem.text.strip() if desc_elem else None
            
            followers_elem = item.find('span', class_='followers-count')
            follower_count = 0
            if followers_elem:
                follower_text = followers_elem.text.strip().replace(',', '').replace('K', '000').replace('M', '000000')
                follower_count = int(''.join(filter(str.isdigit, follower_text)))
            
            return {
                'name': name,
                'description': description,
                'platform': 'Quora',
                'url': url,
                'invite_link': url,
                'member_count': follower_count,
                'categories': ['Quora Space'],
                'image_url': None,
                'metadata': {
                    'source': 'quora_search'
                }
            }
        except Exception as e:
            logger.error(f"Error parsing Quora space: {e}")
            return None
    
    async def scrape_all(self) -> List[Dict]:
        """Scrape Quora Spaces by searching popular topics."""
        all_communities = []
        
        # Search for spaces in various topics
        topics = [
            'technology', 'programming', 'science', 'business',
            'entrepreneurship', 'writing', 'philosophy', 'psychology',
            'health', 'fitness', 'travel', 'education'
        ]
        
        for topic in topics:
            logger.info(f"Searching Quora Spaces for topic: {topic}")
            communities = await self.scrape_spaces_search(topic, max_results=20)
            all_communities.extend(communities)
        
        # Deduplicate
        seen_names = set()
        unique_communities = []
        for community in all_communities:
            if community['name'] not in seen_names:
                unique_communities.append(community)
                seen_names.add(community['name'])
        
        logger.info(f"Total Quora Spaces found: {len(unique_communities)}")
        return unique_communities


import asyncio
