/**
 * Seed script: Populate Firestore 'platforms' collection with sample data.
 * Usage: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed-platforms.ts
 * Or:    node -e "require('./scripts/seed-platforms.ts')"
 *
 * Requires FIREBASE_ADMIN_* env variables to be set.
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (!getApps().length) {
    initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
}

const db = getFirestore();

const samplePlatforms = [
    {
        name: 'Product Hunt',
        slug: 'product-hunt',
        type: 'directory',
        category: 'startup directory',
        description: 'Product Hunt is a startup launch platform where founders share new products with a community of early adopters, investors, and tech enthusiasts. It is one of the most popular platforms for launching SaaS products and getting initial traction.',
        domainAuthority: 91,
        backlinkType: 'nofollow',
        submissionLink: 'https://producthunt.com',
        pricing: 'free',
        approval_time: '24 hours',
        requirements: ['startup product', 'logo', 'description', 'screenshots'],
        submission_steps: ['Create Product Hunt account', 'Submit product', 'Add screenshots', 'Write launch description'],
        rules: 'No spam. Must be a real product. One launch per product.',
        best_time_to_post: 'Midnight PST',
        audience: 'startup founders, early adopters, tech enthusiasts',
        geo_focus: 'global',
        contact_or_support_link: 'https://producthunt.com/support',
        tags: ['startup', 'launch', 'saas', 'product'],
        last_verified_at: '2026-03-01',
        createdAt: new Date().toISOString(),
    },
    {
        name: 'BetaList',
        slug: 'beta-list',
        type: 'directory',
        category: 'startup directory',
        description: 'BetaList is a platform for discovering and getting early access to upcoming internet startups. Founders can submit their beta products to reach early adopters who are eager to try new tools and provide valuable feedback.',
        domainAuthority: 65,
        backlinkType: 'dofollow',
        submissionLink: 'https://betalist.com/submit',
        pricing: 'freemium',
        approval_time: '3-5 days',
        requirements: ['beta product', 'landing page', 'description'],
        submission_steps: ['Create account', 'Fill submission form', 'Add product details', 'Wait for review'],
        rules: 'Product must be in beta or recently launched. No established products.',
        best_time_to_post: 'Weekdays',
        audience: 'startup founders, beta testers, early adopters',
        geo_focus: 'global',
        contact_or_support_link: 'https://betalist.com/contact',
        tags: ['startup', 'beta', 'launch', 'early access'],
        last_verified_at: '2026-02-15',
        createdAt: new Date().toISOString(),
    },
    {
        name: 'Indie Hackers',
        slug: 'indie-hackers',
        type: 'community',
        category: 'startup community',
        description: 'Indie Hackers is a community of developers and founders who share their revenue numbers, strategies, and stories of building profitable online businesses. It is one of the top communities for bootstrapped founders.',
        domainAuthority: 72,
        backlinkType: 'nofollow',
        submissionLink: 'https://indiehackers.com',
        pricing: 'free',
        approval_time: 'instant',
        requirements: ['account', 'product or idea'],
        submission_steps: ['Create account', 'Post in community', 'Share your product story'],
        rules: 'Be genuine, no spam, share real revenue numbers if possible.',
        best_time_to_post: 'Weekday mornings EST',
        audience: 'indie hackers, solo founders, bootstrapped entrepreneurs',
        geo_focus: 'global',
        contact_or_support_link: 'https://indiehackers.com/contact',
        tags: ['indie', 'startup', 'bootstrap', 'community'],
        last_verified_at: '2026-02-20',
        createdAt: new Date().toISOString(),
    },
    {
        name: 'Hacker News',
        slug: 'hacker-news',
        type: 'community',
        category: 'startup community',
        description: 'Hacker News is a social news website focusing on computer science and entrepreneurship. Run by Y Combinator, it is one of the most influential platforms for tech startups to gain visibility among developers and investors.',
        domainAuthority: 93,
        backlinkType: 'nofollow',
        submissionLink: 'https://news.ycombinator.com/submit',
        pricing: 'free',
        approval_time: 'instant',
        requirements: ['account', 'interesting content'],
        submission_steps: ['Create account', 'Submit link or Show HN post', 'Engage in comments'],
        rules: 'No clickbait. Content must be intellectually interesting. Follow guidelines.',
        best_time_to_post: 'Weekday mornings EST',
        audience: 'developers, startup founders, investors, tech enthusiasts',
        geo_focus: 'global',
        contact_or_support_link: 'mailto:hn@ycombinator.com',
        tags: ['startup', 'tech', 'developer', 'community'],
        last_verified_at: '2026-03-01',
        createdAt: new Date().toISOString(),
    },
    {
        name: 'Startup Stash',
        slug: 'startup-stash',
        type: 'directory',
        category: 'startup directory',
        description: 'Startup Stash is a curated directory of resources and tools for startups. Founders can list their tools to gain visibility among entrepreneurs looking for new solutions to common startup challenges.',
        domainAuthority: 58,
        backlinkType: 'dofollow',
        submissionLink: 'https://startupstash.com/add-listing',
        pricing: 'free',
        approval_time: '2-3 days',
        requirements: ['product', 'description', 'logo', 'website URL'],
        submission_steps: ['Visit submission page', 'Fill in product details', 'Upload logo', 'Submit for review'],
        rules: 'Must be a startup tool or resource. No duplicates.',
        best_time_to_post: 'Anytime',
        audience: 'startup founders, entrepreneurs',
        geo_focus: 'global',
        contact_or_support_link: 'https://startupstash.com/contact',
        tags: ['startup', 'tools', 'directory', 'resources'],
        last_verified_at: '2026-02-10',
        createdAt: new Date().toISOString(),
    },
    {
        name: 'SaaS Hub',
        slug: 'saas-hub',
        type: 'directory',
        category: 'saas directory',
        description: 'SaaS Hub is a comprehensive directory of SaaS products. It helps users discover and compare software alternatives. Listing your SaaS product helps with SEO backlinks and product discovery.',
        domainAuthority: 55,
        backlinkType: 'dofollow',
        submissionLink: 'https://www.saashub.com/submit',
        pricing: 'free',
        approval_time: '1-2 days',
        requirements: ['saas product', 'description', 'website'],
        submission_steps: ['Create account', 'Submit your SaaS', 'Add description and features', 'Wait for approval'],
        rules: 'Must be a SaaS product. Accurate information required.',
        best_time_to_post: 'Anytime',
        audience: 'saas users, developers, businesses',
        geo_focus: 'global',
        contact_or_support_link: 'https://www.saashub.com/contact',
        tags: ['saas', 'software', 'directory', 'alternatives'],
        last_verified_at: '2026-02-25',
        createdAt: new Date().toISOString(),
    },
    {
        name: 'Startup Founders Telegram',
        slug: 'startup-founders-telegram',
        type: 'group',
        category: 'startup community',
        description: 'A Telegram group for startup founders to network, share ideas, get feedback, and find co-founders. Active community with daily discussions on growth strategies and fundraising.',
        domainAuthority: 20,
        backlinkType: 'none',
        submissionLink: 'https://t.me/startupfounders',
        pricing: 'free',
        approval_time: 'instant',
        requirements: ['telegram account'],
        submission_steps: ['Join the Telegram group', 'Introduce yourself', 'Share your startup'],
        rules: 'No spam. Be respectful. Share value.',
        best_time_to_post: 'Evenings',
        audience: 'startup founders',
        geo_focus: 'global',
        contact_or_support_link: 'https://t.me/startupfounders',
        tags: ['startup', 'telegram', 'founders', 'networking'],
        last_verified_at: '2026-02-28',
        createdAt: new Date().toISOString(),
    },
    {
        name: 'SaaS Community Discord',
        slug: 'saas-community-discord',
        type: 'group',
        category: 'saas community',
        description: 'A Discord server dedicated to SaaS builders, marketers, and founders. Channels cover growth, marketing, development, and funding. Great place to get feedback on your SaaS product.',
        domainAuthority: 15,
        backlinkType: 'none',
        submissionLink: 'https://discord.gg/saascommunity',
        pricing: 'free',
        approval_time: 'instant',
        requirements: ['discord account'],
        submission_steps: ['Join the Discord server', 'Complete onboarding', 'Post in the right channel'],
        rules: 'Follow channel guidelines. No excessive self-promotion.',
        best_time_to_post: 'Weekday afternoons',
        audience: 'saas founders, marketers, developers',
        geo_focus: 'global',
        contact_or_support_link: 'https://discord.gg/saascommunity',
        tags: ['saas', 'discord', 'community', 'marketing'],
        last_verified_at: '2026-02-20',
        createdAt: new Date().toISOString(),
    },
    {
        name: 'AI Tools Directory',
        slug: 'ai-tools-directory',
        type: 'directory',
        category: 'ai directory',
        description: 'AI Tools Directory is a curated list of the best AI tools and products. Submit your AI-powered product to gain visibility among users searching for AI solutions across various categories.',
        domainAuthority: 42,
        backlinkType: 'dofollow',
        submissionLink: 'https://aitoolsdirectory.com/submit',
        pricing: 'freemium',
        approval_time: '3-5 days',
        requirements: ['ai product', 'description', 'logo', 'use case'],
        submission_steps: ['Visit submit page', 'Fill in AI tool details', 'Select categories', 'Submit for review'],
        rules: 'Must involve AI/ML technology. No vaporware.',
        best_time_to_post: 'Anytime',
        audience: 'ai enthusiasts, developers, businesses',
        geo_focus: 'global',
        contact_or_support_link: 'https://aitoolsdirectory.com/contact',
        tags: ['ai', 'artificial intelligence', 'tools', 'directory'],
        last_verified_at: '2026-02-15',
        createdAt: new Date().toISOString(),
    },
    {
        name: 'Founders India Slack',
        slug: 'founders-india-slack',
        type: 'group',
        category: 'startup community',
        description: 'A Slack community for Indian startup founders to connect, share resources, discuss fundraising, and collaborate. One of the largest startup Slack groups focused on the Indian ecosystem.',
        domainAuthority: 10,
        backlinkType: 'none',
        submissionLink: 'https://foundersindia.slack.com',
        pricing: 'free',
        approval_time: '1 day',
        requirements: ['slack account', 'founder or co-founder'],
        submission_steps: ['Request invite', 'Join Slack workspace', 'Introduce yourself in #intros'],
        rules: 'India-focused startups preferred. Be respectful.',
        best_time_to_post: 'IST business hours',
        audience: 'startup founders, indian founders',
        geo_focus: 'india',
        contact_or_support_link: 'https://foundersindia.slack.com',
        tags: ['startup', 'slack', 'india', 'founders'],
        last_verified_at: '2026-02-10',
        createdAt: new Date().toISOString(),
    },
];

async function seed() {
    console.log('🌱 Seeding platforms collection...');
    const batch = db.batch();

    for (const platform of samplePlatforms) {
        const ref = db.collection('platforms').doc(platform.slug);
        batch.set(ref, platform, { merge: true });
        console.log(`  ✓ ${platform.name} (${platform.slug})`);
    }

    await batch.commit();
    console.log(`\n✅ Seeded ${samplePlatforms.length} platforms successfully!`);

    // Also create sample redirects
    console.log('\n🔄 Seeding platform_redirects...');
    const rdBatch = db.batch();
    const sampleRedirects = [
        { old_slug: 'producthunt', new_slug: 'product-hunt' },
        { old_slug: 'betalist', new_slug: 'beta-list' },
    ];

    for (const redirect of sampleRedirects) {
        const ref = db.collection('platform_redirects').doc(redirect.old_slug);
        rdBatch.set(ref, redirect, { merge: true });
        console.log(`  ✓ ${redirect.old_slug} → ${redirect.new_slug}`);
    }

    await rdBatch.commit();
    console.log(`\n✅ Seeded ${sampleRedirects.length} redirects successfully!`);
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
