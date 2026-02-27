# 🔓 How to Access the Professional Dashboard

## Quick Access for Testing

Since you're developing the application, here's how to gain access to all premium features:

### Option 1: Modify Subscription Store (Temporary Testing)

1. Open your browser's Developer Console (F12)
2. Go to the **Application** tab → **Local Storage** → `http://localhost:3000`
3. Find the key `subscription-storage`
4. Replace its value with:

```json
{
  "state": {
    "subscription": {
      "planId": "PRO",
      "status": "active",
      "currentPeriodEnd": "2026-12-31T00:00:00.000Z",
      "customerId": "test_customer_123"
    },
    "usage": {
      "brandAnalysisToday": 0,
      "contentGenerationThisMonth": 0,
      "seoAnalysisThisMonth": 0,
      "lastResetDate": "2026-02-10T00:00:00.000Z"
    }
  },
  "version": 0
}
```

5. Refresh the page
6. You now have **Pro Plan** access! 🎉

### Option 2: Use Browser Console (Quick Method)

1. Open Developer Console (F12)
2. Paste this code:

```javascript
localStorage.setItem('subscription-storage', JSON.stringify({
  state: {
    subscription: {
      planId: "PRO",
      status: "active",
      currentPeriodEnd: "2026-12-31T00:00:00.000Z",
      customerId: "test_customer_123"
    },
    usage: {
      brandAnalysisToday: 0,
      contentGenerationThisMonth: 0,
      seoAnalysisThisMonth: 0,
      lastResetDate: "2026-02-10T00:00:00.000Z"
    }
  },
  version: 0
}));
location.reload();
```

3. Press Enter
4. Page will reload with Pro access!

### Option 3: Enterprise Access

For **Enterprise** features, use the same method but change `"planId": "PRO"` to `"planId": "ENTERPRISE"`.

---

## What You Can Access

### ✅ With Pro/Enterprise Plan:

1. **500+ Directories** (`/dashboard/directories`)
   - Full access to all curated directories
   - Advanced search and filtering
   - Export capabilities

2. **Unlimited Brand Analysis** (`/dashboard/brand-analysis`)
   - No daily limits
   - Save and export analyses

3. **AI Content Studio** (`/dashboard/content-studio`)
   - 100 generations/month (Pro)
   - Unlimited (Enterprise)

4. **SEO Tools** (`/dashboard/seo-tools`)
   - Unlimited keyword research
   - Meta tag generation
   - Content analysis

---

## Dashboard Navigation

Once you have access, navigate to:

- **Main Dashboard**: `http://localhost:3000/dashboard`
- **Brand Analysis**: `http://localhost:3000/dashboard/brand-analysis`
- **Content Studio**: `http://localhost:3000/dashboard/content-studio`
- **SEO Tools**: `http://localhost:3000/dashboard/seo-tools`
- **500+ Directories**: `http://localhost:3000/dashboard/directories` ⭐ NEW!

---

## Features of the Directories Page

### 🔍 Search & Filter
- Search by name, description, or tags
- Filter by category (Product Launch, SEO, AI Tools, etc.)
- Real-time filtering

### 📊 Directory Information
Each directory shows:
- Name and description
- Category badge
- Pricing information
- Direct link to visit

### 🎨 Premium UI
- Glassmorphism design
- Smooth animations
- Mobile-responsive
- Premium badge indicators

---

## Resetting to Free Plan

To test the free plan limitations:

```javascript
localStorage.setItem('subscription-storage', JSON.stringify({
  state: {
    subscription: {
      planId: "FREE",
      status: "active"
    },
    usage: {
      brandAnalysisToday: 0,
      contentGenerationThisMonth: 0,
      seoAnalysisThisMonth: 0,
      lastResetDate: "2026-02-10T00:00:00.000Z"
    }
  },
  version: 0
}));
location.reload();
```

With Free plan, you'll see:
- Lock icon on premium features
- "Upgrade to Access" message
- Upgrade prompts

---

## Production Setup

For production, users will:
1. Visit `/pricing`
2. Click "Start Pro Trial" or "Contact Sales"
3. Complete Stripe checkout
4. Automatically get access based on their subscription

The subscription state will be managed by:
- Stripe webhooks
- Database records
- Server-side session management

---

## Troubleshooting

**Can't see directories?**
- Make sure you set the plan to "PRO" or "ENTERPRISE"
- Refresh the page after updating localStorage
- Check browser console for errors

**Still showing as Free?**
- Clear browser cache
- Try incognito/private mode
- Verify localStorage value is correct

**Directories not loading?**
- Check that `/api/directories` endpoint is working
- Verify `data/directories.json` file exists
- Check browser network tab for errors

---

## 🎉 You're All Set!

You now have full access to the professional AI dashboard with all premium features unlocked for development and testing!

**Happy exploring!** 🚀
