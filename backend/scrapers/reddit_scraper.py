"""Reddit community scraper using Reddit API and web scraping."""
import aiohttp
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import logging
from aiolimiter import AsyncLimiter
from backend.config import settings

logger = logging.getLogger(__name__)


class RedditScraper:
    """Scrapes Reddit communities from various sources."""
    
    def __init__(self):
        self.rate_limiter = AsyncLimiter(settings.reddit_rate_limit, 60)
        self.headers = {
            'User-Agent': settings.user_agent
        }
    
    async def scrape_reddit_search(self, query: str, limit: int = 100) -> List[Dict]:
        """
        Search for subreddits using Reddit's public search.
        
        Args:
            query: Search query
            limit: Maximum number of results
            
        Returns:
            List of community dictionaries
        """
        communities = []
        
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                async with self.rate_limiter:
                    # Use Reddit's JSON API (no auth required for public data)
                    url = f"https://www.reddit.com/subreddits/search.json"
                    params = {
                        'q': query,
                        'limit': min(limit, 100),
                        'sort': 'relevance'
                    }
                    
                    try:
                        async with session.get(url, params=params, timeout=settings.request_timeout) as response:
                            if response.status != 200:
                                logger.warning(f"Reddit API returned status {response.status}")
                                return communities
                            
                            data = await response.json()
                            
                            for child in data.get('data', {}).get('children', []):
                                subreddit_data = child.get('data', {})
                                community = self._parse_subreddit_data(subreddit_data)
                                if community:
                                    communities.append(community)
                            
                            logger.info(f"Found {len(communities)} subreddits for query '{query}'")
                            
                    except asyncio.TimeoutError:
                        logger.error(f"Timeout searching Reddit for '{query}'")
                        
        except Exception as e:
            logger.error(f"Error scraping Reddit: {e}")
        
        return communities
    
    def _parse_subreddit_data(self, data: Dict) -> Optional[Dict]:
        """Parse Reddit API subreddit data into community format."""
        try:
            name = data.get('display_name')
            if not name:
                return None
            
            description = data.get('public_description') or data.get('description', '')
            subscribers = data.get('subscribers', 0)
            url = f"https://www.reddit.com/r/{name}"
            
            # Get icon/image
            icon_img = data.get('icon_img') or data.get('community_icon', '')
            if icon_img:
                # Clean up the URL
                icon_img = icon_img.split('?')[0]
            
            # Get categories from subreddit type and tags
            categories = []
            if data.get('subreddit_type'):
                categories.append(data['subreddit_type'])
            
            return {
                'name': f"r/{name}",
                'description': description[:500] if description else None,
                'platform': 'Reddit',
                'url': url,
                'invite_link': url,
                'member_count': subscribers,
                'categories': categories,
                'image_url': icon_img if icon_img else None,
                'metadata': {
                    'source': 'reddit_api',
                    'over18': data.get('over18', False),
                    'created_utc': data.get('created_utc'),
                    'active_users': data.get('active_user_count', 0)
                }
            }
        except Exception as e:
            logger.error(f"Error parsing subreddit data: {e}")
            return None
    
    async def scrape_popular_subreddits(self, limit: int = 100) -> List[Dict]:
        """
        Scrape popular/trending subreddits.
        
        Args:
            limit: Maximum number of results
            
        Returns:
            List of community dictionaries
        """
        communities = []
        
        try:
            async with aiohttp.ClientSession(headers=self.headers) as session:
                async with self.rate_limiter:
                    url = "https://www.reddit.com/subreddits/popular.json"
                    params = {'limit': min(limit, 100)}
                    
                    try:
                        async with session.get(url, params=params, timeout=settings.request_timeout) as response:
                            if response.status != 200:
                                logger.warning(f"Reddit API returned status {response.status}")
                                return communities
                            
                            data = await response.json()
                            
                            for child in data.get('data', {}).get('children', []):
                                subreddit_data = child.get('data', {})
                                community = self._parse_subreddit_data(subreddit_data)
                                if community:
                                    communities.append(community)
                            
                            logger.info(f"Found {len(communities)} popular subreddits")
                            
                    except asyncio.TimeoutError:
                        logger.error("Timeout fetching popular subreddits")
                        
        except Exception as e:
            logger.error(f"Error scraping popular subreddits: {e}")
        
        return communities
    
    async def scrape_by_category(self, categories: List[str]) -> List[Dict]:
        """
        Scrape subreddits by multiple categories.
        
        Args:
            categories: List of category keywords to search
            
        Returns:
            List of community dictionaries
        """
        all_communities = []
        seen_names = set()
        
        for category in categories:
            communities = await self.scrape_reddit_search(category, limit=50)
            
            # Deduplicate
            for community in communities:
                if community['name'] not in seen_names:
                    all_communities.append(community)
                    seen_names.add(community['name'])
        
        return all_communities
    
    async def scrape_all(self) -> List[Dict]:
        """Scrape from all Reddit sources."""
        all_communities = []
        
        # Get popular subreddits
        logger.info("Fetching popular subreddits...")
        popular = await self.scrape_popular_subreddits(limit=100)
        all_communities.extend(popular)
        
        # Search by common categories
        categories = [
            'gaming', 'technology', 'programming', 'science', 'art',
            'music', 'sports', 'fitness', 'cooking', 'books',
            'movies', 'photography', 'travel', 'education', 'business'
        ]
        
        logger.info(f"Searching {len(categories)} categories...")
        category_communities = await self.scrape_by_category(categories)
        
        # Deduplicate
        seen_names = {c['name'] for c in all_communities}
        for community in category_communities:
            if community['name'] not in seen_names:
                all_communities.append(community)
                seen_names.add(community['name'])
        
        logger.info(f"Total Reddit communities found: {len(all_communities)}")
        return all_communities


import asyncio
