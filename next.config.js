/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['cdn.discordapp.com', 'i.redd.it', 't.me', 'firebasestorage.googleapis.com'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.discord.com',
            },
            {
                protocol: 'https',
                hostname: '**.reddit.com',
            },
            {
                protocol: 'https',
                hostname: '**.telegram.org',
            },
        ],
    },
    // Tell webpack NOT to bundle these heavy server-only packages.
    // They will be resolved at runtime by Node.js instead, dramatically speeding up compilation.
    serverExternalPackages: [
        'discord.js',
        'puppeteer',
        'puppeteer-core',
        'firebase-admin',
        'firebase-admin/app',
        'firebase-admin/firestore',
        'firebase-admin/auth',
        '@google-cloud/firestore',
        'stripe',
        'cheerio',
        '@xpoz/xpoz',
        'groq-sdk',
    ],
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    webpack: (config) => {
        // Keep these for any remaining native module references
        config.externals.push('zlib-sync', 'bufferutil', 'utf-8-validate');
        return config;
    },
};

module.exports = nextConfig;
