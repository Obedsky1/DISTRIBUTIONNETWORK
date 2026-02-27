# 🚀 Quick Start Guide

## Get Your Professional AI Dashboard Running in 5 Minutes

### Step 1: Get Your API Keys

#### Google Gemini API (Required for AI Features)
1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy your API key

#### Stripe (Required for Payments)
1. Create account at https://stripe.com
2. Go to Dashboard → Developers → API keys
3. Copy your **Test** keys (Secret key and Publishable key)
4. Go to Dashboard → Developers → Webhooks
5. Add endpoint: `http://localhost:3000/api/stripe/webhook`
6. Copy the webhook secret

### Step 2: Configure Environment

Create a `.env` file in the project root:

```bash
# Copy from .env.example
cp .env.example .env
```

Edit `.env` and add your keys:

```bash
GOOGLE_GEMINI_API_KEY=your_actual_gemini_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Create Stripe Products (Optional for Testing Payments)

1. Go to Stripe Dashboard → Products
2. Create two products:
   - **Pro Plan**: $29/month recurring
   - **Enterprise Plan**: $99/month recurring
3. Copy the Price IDs
4. Update `lib/stripe/config.ts`:
   ```typescript
   PRO: {
       priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_YOUR_PRO_PRICE_ID',
   },
   ENTERPRISE: {
       priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_YOUR_ENTERPRISE_PRICE_ID',
   },
   ```

### Step 4: Run the Application

```bash
npm run dev
```

Visit http://localhost:3000

### Step 5: Test the Features

#### Test Brand Analysis
1. Go to http://localhost:3000/dashboard/brand-analysis
2. Enter your brand details
3. Click "Analyze My Brand"
4. See AI-powered insights!

#### Test Content Generation
1. Go to http://localhost:3000/dashboard/content-studio
2. Select content type
3. Fill in details
4. Generate content with AI!

#### Test SEO Tools
1. Go to http://localhost:3000/dashboard/seo-tools
2. Try keyword research
3. Generate meta tags
4. Analyze content!

---

## 🎯 What You Can Do Now

### Free Features (No Payment Required)
- ✅ 1 brand analysis per day
- ✅ 5 SEO analyses per month
- ✅ Browse 500+ directories
- ✅ View pricing plans

### With Gemini API Key
- ✅ AI brand analysis
- ✅ AI content generation (with Pro plan)
- ✅ SEO keyword research
- ✅ Meta tag generation
- ✅ Content analysis

### With Stripe Setup
- ✅ Accept payments
- ✅ Manage subscriptions
- ✅ Unlock Pro/Enterprise features

---

## 🔧 Troubleshooting

### "Failed to analyze brand"
- Check if `GOOGLE_GEMINI_API_KEY` is set in `.env`
- Verify API key is valid
- Check console for errors

### "Failed to create checkout session"
- Verify Stripe keys in `.env`
- Check if price IDs are correct
- Ensure Stripe is in test mode

### TypeScript Errors
- Run `npm install` again
- Restart your IDE
- Clear `.next` folder: `rm -rf .next`

---

## 📚 Next Steps

1. **Customize Branding**: Update colors in `tailwind.config.ts`
2. **Add Authentication**: Integrate Firebase Auth or NextAuth
3. **Deploy**: Deploy to Vercel or your preferred platform
4. **Go Live**: Switch Stripe to live mode
5. **Monitor Usage**: Track API costs in Google Cloud Console

---

## 💰 Estimated Costs

- **Google Gemini API**: ~$0.02-0.05 per brand analysis
- **Stripe**: 2.9% + $0.30 per transaction
- **Hosting**: Free on Vercel (Hobby plan)

---

## 🎉 You're All Set!

Your professional AI-powered dashboard is ready to help users:
- Analyze their brands
- Generate content
- Optimize SEO
- Find communities
- Grow their business

**Happy building!** 🚀
