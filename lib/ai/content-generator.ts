import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || '');

export type ContentType = 'comment' | 'story' | 'post' | 'description';

export interface ContentGenerationInput {
    type: ContentType;
    context: {
        productName?: string;
        brandVoice?: 'professional' | 'casual' | 'friendly' | 'technical';
        targetAudience?: string;
        topic?: string;
        platform?: string;
        additionalContext?: string;
    };
}

export interface GeneratedContent {
    content: string;
    variations?: string[];
    suggestions?: string[];
}

/**
 * Generate AI-powered content for various purposes
 */
export async function generateContent(input: ContentGenerationInput): Promise<GeneratedContent> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompts = {
        comment: generateCommentPrompt(input.context),
        story: generateStoryPrompt(input.context),
        post: generatePostPrompt(input.context),
        description: generateDescriptionPrompt(input.context),
    };

    const prompt = prompts[input.type];

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the response to extract content and variations
        const lines = text.split('\n').filter(line => line.trim());
        const content = lines[0] || text;
        const variations = lines.slice(1, 4).filter(v => v.trim());

        return {
            content,
            variations: variations.length > 0 ? variations : undefined,
            suggestions: [
                'Consider personalizing with specific details',
                'Add relevant hashtags or mentions',
                'Include a call-to-action',
            ],
        };
    } catch (error) {
        console.error('Content generation error:', error);
        throw new Error('Failed to generate content. Please try again.');
    }
}

function generateCommentPrompt(context: ContentGenerationInput['context']): string {
    return `
Generate an engaging, authentic comment for a ${context.platform || 'social media'} post about ${context.topic || 'a relevant topic'}.

Context:
- Brand/Product: ${context.productName || 'Not specified'}
- Voice: ${context.brandVoice || 'professional'}
- Target Audience: ${context.targetAudience || 'general'}
- Additional Context: ${context.additionalContext || 'None'}

Requirements:
- Be genuine and conversational
- Add value to the discussion
- Avoid being overly promotional
- Keep it concise (2-3 sentences)
- Match the specified brand voice

Generate 3 variations of the comment, each on a new line.
`;
}

function generateStoryPrompt(context: ContentGenerationInput['context']): string {
    return `
Create a compelling brand story or narrative for ${context.productName || 'a product/brand'}.

Context:
- Brand/Product: ${context.productName || 'Not specified'}
- Voice: ${context.brandVoice || 'professional'}
- Target Audience: ${context.targetAudience || 'general'}
- Topic/Theme: ${context.topic || 'brand origin story'}
- Additional Context: ${context.additionalContext || 'None'}

Requirements:
- Make it authentic and relatable
- Include emotional elements
- Highlight the problem being solved
- Keep it engaging (150-200 words)
- Match the specified brand voice

Generate the story followed by 2 alternative angles on separate lines.
`;
}

function generatePostPrompt(context: ContentGenerationInput['context']): string {
    return `
Create an engaging ${context.platform || 'social media'} post for ${context.productName || 'a product/brand'}.

Context:
- Brand/Product: ${context.productName || 'Not specified'}
- Voice: ${context.brandVoice || 'professional'}
- Target Audience: ${context.targetAudience || 'general'}
- Topic: ${context.topic || 'product announcement'}
- Platform: ${context.platform || 'general social media'}
- Additional Context: ${context.additionalContext || 'None'}

Requirements:
- Hook readers in the first line
- Include clear value proposition
- Add a call-to-action
- Optimize for ${context.platform || 'social media'} best practices
- Match the specified brand voice
- Keep it concise and scannable

Generate the main post followed by 2 variations on separate lines.
`;
}

function generateDescriptionPrompt(context: ContentGenerationInput['context']): string {
    return `
Write a compelling product description for ${context.productName || 'a product'}.

Context:
- Product Name: ${context.productName || 'Not specified'}
- Voice: ${context.brandVoice || 'professional'}
- Target Audience: ${context.targetAudience || 'general'}
- Additional Context: ${context.additionalContext || 'None'}

Requirements:
- Lead with benefits, not features
- Address customer pain points
- Use persuasive language
- Include social proof elements if relevant
- Keep it scannable with short paragraphs
- Match the specified brand voice
- Aim for 100-150 words

Generate the main description followed by 2 alternative versions on separate lines.
`;
}

/**
 * Batch generate multiple content pieces
 */
export async function batchGenerateContent(
    inputs: ContentGenerationInput[]
): Promise<GeneratedContent[]> {
    const results = await Promise.all(inputs.map(input => generateContent(input)));
    return results;
}
