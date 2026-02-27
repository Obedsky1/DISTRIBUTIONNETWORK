# Professional AI Dashboard - README

## 🎯 Overview

A comprehensive AI-powered platform for brand analysis, content generation, and community discovery. Built with Next.js, Google Gemini AI, and Stripe.

## ✨ Features

### 🤖 AI-Powered Tools
- **Brand Analysis**: Deep insights into your brand, niche, and market position
- **Content Studio**: Generate comments, stories, posts, and descriptions
- **SEO Tools**: Keyword research, meta tags, and content optimization

### 💳 Subscription Tiers
- **Free**: Basic features with daily limits
- **Pro ($29/mo)**: Unlimited analysis + 100 AI generations/month
- **Enterprise ($99/mo)**: Unlimited everything + API access

### 🌐 Community Discovery
- 500+ curated directories
- AI-powered community recommendations
- Filtered by niche and relevance

## 🚀 Quick Start

See [QUICKSTART_AI_DASHBOARD.md](./QUICKSTART_AI_DASHBOARD.md) for detailed setup instructions.

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Add your API keys to .env

# 3. Run development server
npm run dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
app/
├── dashboard/
│   ├── page.tsx                 # Main dashboard
│   ├── brand-analysis/          # AI brand analysis
│   ├── content-studio/          # AI content generation
│   └── seo-tools/               # SEO tools suite
├── pricing/                     # Pricing page
└── api/
    ├── ai/                      # AI endpoints
    └── stripe/                  # Payment endpoints

lib/
├── ai/
│   ├── brand-analyzer.ts        # Brand analysis engine
│   ├── content-generator.ts     # Content generation
│   └── seo-analyzer.ts          # SEO tools
├── stripe/
│   └── config.ts                # Stripe configuration
└── subscription/
    └── feature-gates.ts         # Feature access control
```

## 🔑 Required API Keys

1. **Google Gemini API**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Stripe**: Get from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

## 🧪 Testing

```bash
# Run tests
npm test

# Test specific features
npm run test:api
```

## 📚 Documentation

- [Walkthrough](./brain/walkthrough.md) - Complete feature walkthrough
- [Implementation Plan](./brain/implementation_plan.md) - Technical architecture
- [Quick Start](./QUICKSTART_AI_DASHBOARD.md) - Setup guide

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **AI**: Google Gemini API
- **Payments**: Stripe
- **Styling**: Tailwind CSS + Framer Motion
- **State**: Zustand
- **Validation**: Zod

## 📊 Usage Limits

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Brand Analysis | 1/day | ∞ | ∞ |
| Content Gen | 0 | 100/mo | ∞ |
| SEO Analysis | 5/mo | ∞ | ∞ |

## 🚢 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Environment Variables
Set these in your deployment platform:
- `GOOGLE_GEMINI_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

## 📝 License

MIT

## 🤝 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Google Gemini AI
