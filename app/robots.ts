import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/platform/',
                    '/submit-to-*',
                    '/startup-directories',
                    '/startup-communities',
                    '/startup-telegram-groups',
                    '/startup-discord-groups',
                    '/startup-slack-groups',
                    '/best/',
                    '/compare/',
                    '/for/',
                    '/promote/',
                    '/locations/',
                    '/tag/',
                    '/alternatives/',
                    '/free-startup-directories',
                    '/glossary',
                ],
                disallow: [
                    '/api/',
                    '/dashboard/',
                    '/workspace/',
                    '/onboarding/',
                    '/profile/',
                    '/account/',
                    '/payment/',
                    '/premium/',
                ],
            },
        ],
        sitemap: 'https://distriburst.com/sitemap.xml',
    };
}
