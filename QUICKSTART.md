# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
cd "c:\all my startup\community for me\backend"
pip install -r requirements.txt
```

### Step 2: Run the Scraper (Optional)

Scrape communities from all platforms:

```bash
python scraper_manager.py
```

This will populate the database with communities from Discord, Reddit, Telegram, Quora, and Facebook.

### Step 3: Start the Application

```bash
python main.py
```

Then open your browser to: **http://localhost:8000**

---

## 📦 What's Included

- ✅ **6 Platform Scrapers**: Discord, Reddit, Telegram, Quora, Facebook, Directories
- ✅ **REST API**: Full CRUD with filtering, search, and pagination
- ✅ **Premium UI**: Glassmorphism design with dark mode
- ✅ **SQLite Database**: Async support with SQLAlchemy
- ✅ **Documentation**: Complete README and walkthrough

---

## 🎯 Quick Commands

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run scraper only
python backend/scraper_manager.py

# Start API server
python backend/main.py

# Run with uvicorn (alternative)
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 🌐 API Endpoints

- **Frontend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Communities**: http://localhost:8000/api/communities
- **Stats**: http://localhost:8000/api/stats

---

## 🔍 Example Searches

Once the app is running, try:
- Search for "gaming" communities
- Filter by Discord platform
- Sort by member count
- Set minimum 1000 members

---

## 📝 Configuration

Edit `backend/.env` to customize:
- Database location
- API port
- Rate limits
- Scraping intervals

---

## 🎨 Features

### Search & Filter
- Real-time search with debouncing
- Platform filters (Discord, Reddit, etc.)
- Member count range
- Category filtering
- Multiple sort options

### UI/UX
- Glassmorphism effects
- Dark mode design
- Smooth animations
- Responsive layout
- Platform-specific colors

---

## 📚 Need Help?

- Check [README.md](file:///c:/all%20my%20startup/community%20for%20me/README.md) for detailed documentation
- View [walkthrough.md](file:///C:/Users/HP/.gemini/antigravity/brain/0aa8ff2e-d26e-4c89-82dd-d9908af0e8b8/walkthrough.md) for implementation details
- API documentation at http://localhost:8000/docs

---

## ⚡ Pro Tips

1. **First Run**: Run the scraper first to populate data
2. **Rate Limits**: Adjust in `.env` if getting blocked
3. **API Keys**: Add Reddit/Facebook credentials for better results
4. **Performance**: Use `--workers 4` with uvicorn for production

Enjoy discovering communities! 🎉
