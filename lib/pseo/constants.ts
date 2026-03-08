import { PersonaDefinition, UseCaseDefinition } from '@/types/platform';

// ─── Site configuration ───
export const SITE_URL = 'https://distriburst.com';
export const SITE_NAME = 'DistriBurst';
export const ITEMS_PER_PAGE = 50;
export const MAX_COMPARISONS_PER_CATEGORY = 10; // top N platforms per category for comparisons
export const ISR_REVALIDATE = 86400; // 24 hours in seconds

// ─── Category route mappings ───
export const CATEGORY_ROUTES: Record<string, { title: string; description: string; type?: string; platformFilter?: string }> = {
    'startup-directories': {
        title: 'Startup Directories',
        description: 'Discover the best startup directories to list your product, gain backlinks, and boost visibility.',
        type: 'directory',
    },
    'startup-communities': {
        title: 'Startup Communities',
        description: 'Find active startup communities to network, get feedback, and grow your audience.',
        type: 'community',
    },
    'startup-telegram-groups': {
        title: 'Startup Telegram Groups',
        description: 'Join the best Telegram groups for startups, SaaS founders, and indie hackers.',
        type: 'group',
        platformFilter: 'telegram',
    },
    'startup-discord-groups': {
        title: 'Startup Discord Groups',
        description: 'Find the most active Discord servers for startup founders and SaaS builders.',
        type: 'group',
        platformFilter: 'discord',
    },
    'startup-slack-groups': {
        title: 'Startup Slack Groups',
        description: 'Discover the best Slack communities for startup founders and marketers.',
        type: 'group',
        platformFilter: 'slack',
    },
};

// ─── Persona definitions ───
export const PERSONAS: PersonaDefinition[] = [
    {
        slug: 'startup-founders',
        label: 'Startup Founders',
        description: 'The best directories and communities for startup founders to launch, distribute, and grow their products.',
        keywords: ['startup', 'founder', 'launch', 'product'],
        audienceMatch: ['startup founders', 'founders', 'entrepreneurs', 'startup'],
    },
    {
        slug: 'saas-marketers',
        label: 'SaaS Marketers',
        description: 'Top platforms for SaaS marketers to distribute products, build backlinks, and reach target audiences.',
        keywords: ['saas', 'marketing', 'growth', 'backlinks'],
        audienceMatch: ['saas', 'marketers', 'marketing', 'growth'],
    },
    {
        slug: 'indie-hackers',
        label: 'Indie Hackers',
        description: 'The best platforms for indie hackers to share projects, get feedback, and find early users.',
        keywords: ['indie', 'hacker', 'solo', 'bootstrap'],
        audienceMatch: ['indie hackers', 'indie', 'bootstrapped', 'solo founder'],
    },
];

// ─── Use-case definitions ───
export const USE_CASES: UseCaseDefinition[] = [
    {
        slug: 'startup',
        label: 'Distribute Your Startup',
        description: 'Find the best platforms to distribute your startup, get early users, and build traction.',
        keywords: ['startup', 'launch', 'distribute'],
        categoryMatch: ['startup directory', 'startup', 'launch'],
    },
    {
        slug: 'saas-product',
        label: 'Distribute Your SaaS Product',
        description: 'Discover directories and communities to distribute your SaaS product and acquire customers.',
        keywords: ['saas', 'product', 'software'],
        categoryMatch: ['saas', 'software', 'product'],
    },
    {
        slug: 'ai-tool',
        label: 'Distribute Your AI Tool',
        description: 'Find the best platforms to launch and distribute your AI tool to early adopters.',
        keywords: ['ai', 'artificial intelligence', 'tool', 'machine learning'],
        categoryMatch: ['ai', 'artificial intelligence', 'tool'],
    },
];

// ─── Required fields for indexing ───
export const REQUIRED_FIELDS: (keyof import('@/types/platform').SEOPlatform)[] = [
    'name',
    'slug',
    'type',
    'category',
    'description',
    'submissionLink',
];

export const MIN_DESCRIPTION_LENGTH = 50;
