"""Simple test script to verify the project structure and basic functionality."""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def test_imports():
    """Test if all modules can be imported."""
    print("Testing imports...")
    
    try:
        from backend.config import settings
        print("✓ Config module imported successfully")
        print(f"  - Database URL: {settings.database_url}")
        print(f"  - API Port: {settings.api_port}")
    except Exception as e:
        print(f"✗ Error importing config: {e}")
        return False
    
    try:
        from backend.database.models import Community, ScrapingLog
        print("✓ Database models imported successfully")
    except Exception as e:
        print(f"✗ Error importing models: {e}")
        return False
    
    try:
        from backend.scrapers.discord_scraper import DiscordScraper
        from backend.scrapers.reddit_scraper import RedditScraper
        from backend.scrapers.telegram_scraper import TelegramScraper
        print("✓ All scrapers imported successfully")
    except Exception as e:
        print(f"✗ Error importing scrapers: {e}")
        return False
    
    try:
        from backend.api.routes import router
        print("✓ API routes imported successfully")
    except Exception as e:
        print(f"✗ Error importing routes: {e}")
        return False
    
    return True

def test_file_structure():
    """Test if all required files exist."""
    print("\nTesting file structure...")
    
    required_files = [
        'backend/config.py',
        'backend/main.py',
        'backend/scraper_manager.py',
        'backend/database/models.py',
        'backend/database/database.py',
        'backend/api/routes.py',
        'backend/scrapers/discord_scraper.py',
        'backend/scrapers/reddit_scraper.py',
        'backend/scrapers/telegram_scraper.py',
        'backend/scrapers/quora_scraper.py',
        'backend/scrapers/facebook_scraper.py',
        'backend/scrapers/directory_scraper.py',
        'frontend/index.html',
        'frontend/styles.css',
        'frontend/app.js',
        'README.md'
    ]
    
    base_dir = os.path.dirname(os.path.dirname(__file__))
    all_exist = True
    
    for file_path in required_files:
        full_path = os.path.join(base_dir, file_path)
        if os.path.exists(full_path):
            print(f"✓ {file_path}")
        else:
            print(f"✗ {file_path} - NOT FOUND")
            all_exist = False
    
    return all_exist

def main():
    """Run all tests."""
    print("=" * 60)
    print("Community Aggregator - System Test")
    print("=" * 60)
    
    structure_ok = test_file_structure()
    imports_ok = test_imports()
    
    print("\n" + "=" * 60)
    if structure_ok and imports_ok:
        print("✓ All tests passed!")
        print("\nNext steps:")
        print("1. Install dependencies: pip install -r backend/requirements.txt")
        print("2. Run scraper: python backend/scraper_manager.py")
        print("3. Start API: python backend/main.py")
        print("4. Open browser: http://localhost:8000")
    else:
        print("✗ Some tests failed. Please check the errors above.")
    print("=" * 60)

if __name__ == "__main__":
    main()
