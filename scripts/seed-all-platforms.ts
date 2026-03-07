/**
 * Full Production Seed Script
 * Reads data/directories.json (577 entries) and data/communities.json (278 entries)
 * Transforms them to SEOPlatform format and writes to Firestore 'platforms' collection.
 *
 * Usage:
 *   npx tsx scripts/seed-all-platforms.ts
 *   OR
 *   npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed-all-platforms.ts
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, WriteBatch } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Manual .env.local parser (avoids dotenv dependency)
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) return;
        const key = trimmed.substring(0, eqIdx).trim();
        let value = trimmed.substring(eqIdx + 1).trim();
        // Remove surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (!process.env[key]) {
            process.env[key] = value;
        }
    });
}

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

// ─── Slug generator ───
function toSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 80);
}

// ─── Determine platform type from category/platform field ───
function inferType(dir: any): 'directory' | 'community' | 'group' {
    const cat = (dir.category || '').toLowerCase();
    const platform = (dir.platform || '').toLowerCase();
    const url = (dir.url || '').toLowerCase();

    if (url.includes('reddit.com') || url.includes('discord') || url.includes('t.me') || url.includes('slack')) {
        return 'community';
    }
    if (cat.includes('community') || cat.includes('communities') || cat.includes('reddit')) {
        return 'community';
    }
    return 'directory';
}

function inferCommunityType(comm: any): 'community' | 'group' {
    const platform = (comm.platform || '').toLowerCase();
    if (platform === 'telegram' || platform === 'discord' || platform === 'slack') {
        return 'group';
    }
    return 'community';
}

function inferCategoryFromDir(dir: any): string {
    const cat = (dir.category || '').toLowerCase();
    if (cat.includes('ai')) return 'ai directory';
    if (cat.includes('saas') || cat.includes('software')) return 'saas directory';
    if (cat.includes('product launch') || cat.includes('launch')) return 'startup directory';
    if (cat.includes('seo') || cat.includes('guest post')) return 'seo directory';
    if (cat.includes('startup network') || cat.includes('investor')) return 'startup network';
    if (cat.includes('cloud') || cat.includes('marketplace')) return 'cloud marketplace';
    if (cat.includes('design') || cat.includes('dev')) return 'design & dev directory';
    if (cat.includes('solopreneur') || cat.includes('solo')) return 'solopreneur directory';
    if (cat.includes('beta')) return 'beta testing directory';
    if (cat.includes('review')) return 'software review directory';
    return 'startup directory';
}

function inferCategoryFromComm(comm: any): string {
    const platform = (comm.platform || '').toLowerCase();
    const categories = (comm.categories || []).map((c: string) => c.toLowerCase());

    if (platform === 'telegram') return 'telegram community';
    if (platform === 'discord') return 'discord community';
    if (platform === 'slack') return 'slack community';
    if (platform === 'reddit') return 'reddit community';
    if (categories.some((c: string) => c.includes('saas'))) return 'saas community';
    if (categories.some((c: string) => c.includes('startup'))) return 'startup community';
    if (categories.some((c: string) => c.includes('marketing'))) return 'marketing community';
    if (categories.some((c: string) => c.includes('design'))) return 'design community';
    if (categories.some((c: string) => c.includes('develop'))) return 'developer community';
    return 'startup community';
}

function inferPricing(dir: any): string {
    const p = (dir.pricing || '').toLowerCase();
    if (p.includes('free/paid') || p.includes('freemium')) return 'freemium';
    if (p.includes('paid')) return 'paid';
    if (p.includes('revenue')) return 'revenue share';
    if (p.includes('free')) return 'free';
    return 'free';
}

function inferTags(item: any, isDirectory: boolean): string[] {
    const tags = new Set<string>();

    if (isDirectory) {
        const bestFor = item.best_for || [];
        bestFor.forEach((b: string) => tags.add(b.toLowerCase()));
        const cat = (item.category || '').toLowerCase();
        if (cat.includes('ai')) tags.add('ai');
        if (cat.includes('saas')) tags.add('saas');
        if (cat.includes('startup')) tags.add('startup');
        if (cat.includes('beta')) tags.add('beta');
        if (cat.includes('launch')) tags.add('launch');
        if (cat.includes('seo')) tags.add('seo');
        if (cat.includes('review')) tags.add('reviews');
        if (cat.includes('design')) tags.add('design');
        if (cat.includes('dev')) tags.add('developer');
        if (cat.includes('cloud')) tags.add('cloud');
        if (cat.includes('marketplace')) tags.add('marketplace');
        if (cat.includes('solopreneur')) tags.add('solopreneur');
    } else {
        const categories = item.categories || [];
        categories.forEach((c: string) => tags.add(c.toLowerCase()));
        const useCases = item.use_cases || [];
        useCases.forEach((u: string) => tags.add(u.toLowerCase().replace(/\s+/g, '-')));
        const platform = (item.platform || '').toLowerCase();
        if (platform) tags.add(platform);
    }

    return Array.from(tags).slice(0, 10); // Max 10 tags
}

function inferAudience(item: any, isDirectory: boolean): string {
    if (isDirectory) {
        const bestFor = item.best_for || [];
        if (bestFor.length > 0) return bestFor.join(', ').toLowerCase();
        return 'startup founders, saas builders';
    } else {
        const categories = item.categories || [];
        if (categories.length > 0) return categories.join(', ').toLowerCase();
        return 'startup founders, entrepreneurs';
    }
}

// ─── Transform directory entry ───
function transformDirectory(dir: any): any {
    const slug = toSlug(dir.name || dir.id);
    return {
        name: dir.name,
        slug,
        type: inferType(dir),
        category: inferCategoryFromDir(dir),
        description: dir.description || `${dir.name} is a platform for discovering and listing startup products.`,
        domainAuthority: dir.domain_authority || 0,
        backlinkType: (dir.backlink_type || 'nofollow').toLowerCase(),
        submissionLink: dir.submission_url || dir.url,
        pricing: inferPricing(dir),
        approval_time: dir.approval_time || '2-5 days',
        requirements: ['product or startup', 'description', 'website url'],
        submission_steps: [
            `Visit ${dir.name} submission page`,
            'Create an account or sign in',
            'Fill in product details and description',
            'Submit and wait for review'
        ],
        rules: dir.rules || `Follow ${dir.name} submission guidelines. No spam or duplicate listings.`,
        best_time_to_post: 'Weekdays',
        audience: inferAudience(dir, true),
        geo_focus: 'global',
        contact_or_support_link: dir.url,
        tags: inferTags(dir, true),
        last_verified_at: '2026-03-01',
        createdAt: new Date().toISOString(),
    };
}

// ─── Transform community entry ───
function transformCommunity(comm: any): any {
    const slug = toSlug(comm.name || comm.id);
    const platform = (comm.platform || '').toLowerCase();

    return {
        name: comm.name,
        slug,
        type: inferCommunityType(comm),
        category: inferCategoryFromComm(comm),
        description: comm.description || `${comm.name} is a community for startup founders and builders.`,
        domainAuthority: platform === 'reddit' ? 91 : platform === 'discord' ? 15 : platform === 'telegram' ? 20 : platform === 'slack' ? 10 : 30,
        backlinkType: platform === 'reddit' ? 'nofollow' : 'none',
        submissionLink: comm.invite_link || comm.url,
        pricing: 'free',
        approval_time: platform === 'slack' ? '1-2 days' : 'instant',
        requirements: platform === 'reddit'
            ? ['reddit account', 'follow subreddit rules']
            : platform === 'discord'
                ? ['discord account']
                : platform === 'telegram'
                    ? ['telegram account']
                    : platform === 'slack'
                        ? ['slack account', 'request invite']
                        : ['account'],
        submission_steps: platform === 'reddit'
            ? ['Create Reddit account', `Join ${comm.name}`, 'Read rules', 'Post relevant content']
            : platform === 'discord'
                ? ['Create Discord account', `Join ${comm.name} server`, 'Complete onboarding', 'Post in relevant channel']
                : platform === 'telegram'
                    ? ['Open Telegram', `Join ${comm.name} group`, 'Introduce yourself', 'Share your startup']
                    : platform === 'slack'
                        ? ['Request invite to Slack workspace', 'Create Slack account', 'Join relevant channels', 'Introduce yourself']
                        : ['Create account', `Join ${comm.name}`, 'Introduce yourself'],
        rules: `Follow ${comm.name} community guidelines. No spam. Be respectful and provide value.`,
        best_time_to_post: platform === 'reddit' ? 'Weekday mornings EST' : 'Anytime',
        audience: inferAudience(comm, false),
        geo_focus: (comm.language || 'en') === 'en' ? 'global' : comm.language,
        contact_or_support_link: comm.url,
        tags: inferTags(comm, false),
        member_count: comm.member_count || 0,
        last_verified_at: '2026-03-01',
        createdAt: new Date().toISOString(),
    };
}

// ─── Main seed function ───
async function seedAllPlatforms() {
    console.log('🚀 Full Production Seed — Reading local JSON files...\n');

    // Read JSON files
    const dirPath = path.join(process.cwd(), 'data', 'directories.json');
    const commPath = path.join(process.cwd(), 'data', 'communities.json');

    const dirData = JSON.parse(fs.readFileSync(dirPath, 'utf-8'));
    const commData = JSON.parse(fs.readFileSync(commPath, 'utf-8'));

    const directories = dirData.directories || [];
    const communities = commData.communities || [];

    console.log(`📂 Found ${directories.length} directories`);
    console.log(`👥 Found ${communities.length} communities`);
    console.log(`📊 Total: ${directories.length + communities.length} platforms\n`);

    // Transform all entries
    const allPlatforms: any[] = [];
    const slugSet = new Set<string>();

    // Transform directories
    for (const dir of directories) {
        const transformed = transformDirectory(dir);
        // Handle duplicate slugs by appending suffix
        let slug = transformed.slug;
        let suffix = 1;
        while (slugSet.has(slug)) {
            slug = `${transformed.slug}-${suffix}`;
            suffix++;
        }
        transformed.slug = slug;
        slugSet.add(slug);
        allPlatforms.push(transformed);
    }
    console.log(`✅ Transformed ${directories.length} directories`);

    // Transform communities
    for (const comm of communities) {
        const transformed = transformCommunity(comm);
        let slug = transformed.slug;
        let suffix = 1;
        while (slugSet.has(slug)) {
            slug = `${transformed.slug}-${suffix}`;
            suffix++;
        }
        transformed.slug = slug;
        slugSet.add(slug);
        allPlatforms.push(transformed);
    }
    console.log(`✅ Transformed ${communities.length} communities`);
    console.log(`\n📝 Writing ${allPlatforms.length} platforms to Firestore...\n`);

    // Firestore batch limit is 500 per commit
    const BATCH_SIZE = 450;
    let written = 0;

    for (let i = 0; i < allPlatforms.length; i += BATCH_SIZE) {
        const chunk = allPlatforms.slice(i, i + BATCH_SIZE);
        const batch: WriteBatch = db.batch();

        for (const platform of chunk) {
            const ref = db.collection('platforms').doc(platform.slug);
            batch.set(ref, platform, { merge: true });
        }

        await batch.commit();
        written += chunk.length;
        console.log(`  📦 Batch ${Math.ceil((i + 1) / BATCH_SIZE)}/${Math.ceil(allPlatforms.length / BATCH_SIZE)} — ${written}/${allPlatforms.length} written`);
    }

    console.log(`\n✅ Successfully seeded ${allPlatforms.length} platforms to Firestore!`);

    // Stats summary
    const types = { directory: 0, community: 0, group: 0 };
    const categories = new Set<string>();
    const tags = new Set<string>();

    allPlatforms.forEach((p) => {
        types[p.type as keyof typeof types]++;
        categories.add(p.category);
        p.tags?.forEach((t: string) => tags.add(t));
    });

    console.log('\n📊 Stats:');
    console.log(`  Directories: ${types.directory}`);
    console.log(`  Communities: ${types.community}`);
    console.log(`  Groups: ${types.group}`);
    console.log(`  Unique categories: ${categories.size}`);
    console.log(`  Unique tags: ${tags.size}`);

    // Create common redirects
    console.log('\n🔄 Setting up common redirects...');
    const redirectBatch = db.batch();
    const commonRedirects = [
        { old_slug: 'producthunt', new_slug: 'product-hunt' },
        { old_slug: 'betalist', new_slug: 'betalist' },
        { old_slug: 'hackernews', new_slug: 'hacker-news-show-hn' },
        { old_slug: 'indiehackers', new_slug: 'indie-hackers' },
        { old_slug: 'g2-reviews', new_slug: 'g2' },
    ];

    for (const redirect of commonRedirects) {
        const ref = db.collection('platform_redirects').doc(redirect.old_slug);
        redirectBatch.set(ref, redirect, { merge: true });
    }

    await redirectBatch.commit();
    console.log(`✅ Created ${commonRedirects.length} redirects`);

    console.log('\n🎉 All done! Your PSEO system now has full production data.');
    process.exit(0);
}

seedAllPlatforms().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
