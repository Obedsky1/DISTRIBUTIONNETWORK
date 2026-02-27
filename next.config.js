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
        config.externals.push('zlib-sync', 'bufferutil', 'utf-8-validate');
        return config;
    },
};

module.exports = nextConfig;
