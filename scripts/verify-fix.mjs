import { getAllCommunities, getRelatedCommunities } from '../lib/community.ts';

async function test() {
    try {
        console.log("Fetching all communities...");
        const all = await getAllCommunities();
        console.log(`Fetched ${all.length} communities.`);

        if (all.length === 0) {
            console.error("No communities found!");
            return;
        }

        const first = all[0];
        console.log(`Testing related communities for: ${first.name} (Slug: ${first.slug})`);
        console.log(`Category:`, first.category);

        const related = await getRelatedCommunities(first, 3);
        console.log(`Found ${related.length} related communities.`);

        // Test with a mock community that has NO category at all
        const mockCommunity = {
            id: 'mock-1',
            name: 'Mock Community',
            slug: 'mock-slug',
            // category is missing
        };

        console.log("Testing with mock community (missing category)...");
        const relatedMock = await getRelatedCommunities(mockCommunity, 3);
        console.log(`Found ${relatedMock.length} related communities for mock.`);

        console.log("Verification successful!");
    } catch (error) {
        console.error("Verification failed:", error);
        process.exit(1);
    }
}

test();
