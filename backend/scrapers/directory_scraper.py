"""General community directory scraper for various websites."""
import aiohttp
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import logging
from aiolimiter import AsyncLimiter
from backend.config import settings

logger = logging.getLogger(__name__)


class DirectoryScraper:
    """Scrapes communities from general directory websites."""
    
    def __init__(self):
        self.rate_limiter = AsyncLimiter(30, 60)  # 30 requests per minute
        self.headers = {
            'User-Agent': settings.user_agent
        }
    
    async def scrape_directory_site(self, url: str, parser_func) -> List[Dict]:
        """
        Generic scraper for directory websites.
        
        Args:
            url: URL of the directory site
            parser_func: Function to parse the HTML content
            
        Returns:
            List of community dictionaries
        """
        communities = []
        
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                async with self.rate_limiter:
                    try:
                        async with session.get(url, timeout=settings.request_timeout) as response:
                            if response.status != 200:
                                logger.warning(f"Directory site returned status {response.status}")
                                return communities
                            
                            html = await response.text()
                            soup = BeautifulSoup(html, 'lxml')
                            
                            communities = parser_func(soup)
                            logger.info(f"Found {len(communities)} communities from {url}")
                            
                    except asyncio.TimeoutError:
                        logger.error(f"Timeout scraping {url}")
                        
        except Exception as e:
            logger.error(f"Error scraping directory site {url}: {e}")
        
        return communities
    
    def parse_generic_directory(self, soup: BeautifulSoup) -> List[Dict]:
        """
        Generic parser for community directory pages.
        
        Args:
            soup: BeautifulSoup object of the page
            
        Returns:
            List of community dictionaries
        """
        communities = []
        
        # Look for common patterns in directory listings
        # This is a generic approach that may need customization per site
        
        # Try to find community cards/items
        possible_containers = [
            soup.find_all('div', class_=['community', 'group', 'listing', 'card']),
            soup.find_all('article'),
            soup.find_all('li', class_=['item', 'entry'])
        ]
        
        for container_list in possible_containers:
            if container_list:
                for item in container_list:
                    try:
                        community = self._parse_directory_item(item)
                        if community:
                            communities.append(community)
                    except Exception as e:
                        logger.error(f"Error parsing directory item: {e}")
                        continue
                break
        
        return communities
    
    def _parse_directory_item(self, item) -> Optional[Dict]:
        """Parse a directory item into community data."""
        try:
            # Try to extract name
            name = None
            for tag in ['h1', 'h2', 'h3', 'h4']:
                name_elem = item.find(tag)
                if name_elem:
                    name = name_elem.text.strip()
                    break
            
            if not name:
                # Try to find any link text
                link_elem = item.find('a')
                if link_elem:
                    name = link_elem.text.strip()
            
            if not name:
                return None
            
            # Try to extract description
            description = None
            desc_elem = item.find('p') or item.find('div', class_=['description', 'desc', 'summary'])
            if desc_elem:
                description = desc_elem.text.strip()
            
            # Try to extract URL
            url = None
            link_elem = item.find('a', href=True)
            if link_elem:
                url = link_elem.get('href')
            
            # Try to extract member count
            member_count = 0
            member_elem = item.find(text=lambda t: t and ('member' in t.lower() or 'subscriber' in t.lower()))
            if member_elem:
                member_text = member_elem.strip().replace(',', '')
                digits = ''.join(filter(str.isdigit, member_text))
                if digits:
                    member_count = int(digits)
            
            return {
                'name': name,
                'description': description,
                'platform': 'Other',
                'url': url,
                'invite_link': url,
                'member_count': member_count,
                'categories': [],
                'image_url': None,
                'metadata': {
                    'source': 'directory_scraper'
                }
            }
        except Exception as e:
            logger.error(f"Error parsing directory item: {e}")
            return None
    
    async def scrape_all(self) -> List[Dict]:
        """Scrape from known community directory websites."""
        all_communities = []
        
        # List of community directory websites to scrape
        # These would be actual directory URLs in production
        directory_urls = [
            # Add actual directory URLs here
            # Example: "https://example-community-directory.com/communities"
        ]
        
        for url in directory_urls:
            logger.info(f"Scraping directory: {url}")
            communities = await self.scrape_directory_site(url, self.parse_generic_directory)
            all_communities.extend(communities)
        
        logger.info(f"Total communities from directories: {len(all_communities)}")
        return all_communities


import asyncio
