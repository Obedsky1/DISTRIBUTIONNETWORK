import communitiesData from './data/communities.json' assert { type: 'json' };
import { PERSONAS } from './lib/pseo/constants.ts';

function transformCommunityToSEO(c) {
    return {
        id: c.id,
        name: c.name,
        slug: c.slug || c.id || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type: 'community',
        category: (c.categories && c.categories.length > 0) ? c.categories[0] : (c.category || 'Uncategorized'),
        description: c.description || '',
    };
}

const persona = PERSONAS.find(p => p.slug === 'saas-marketers');
if (!persona) {
    console.error('Persona not found');
    process.exit(1);
}

const all = communitiesData.communities.map(transformCommunityToSEO);
const matched = all.filter(p =>
    persona.audienceMatch.some(a =>
        p.description?.toLowerCase().includes(a.toLowerCase()) ||
        p.category?.toLowerCase().includes(a.toLowerCase())
    )
);

console.log(`Found ${matched.length} platforms for ${persona.label}`);
matched.forEach(p => {
    console.log(`- ${p.name}: /platform/${p.slug}`);
});
