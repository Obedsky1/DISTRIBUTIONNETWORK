import { generateText } from './gemini';
import { ContentType, Platform } from '@/types';

interface ContentGenerationOptions {
    type: ContentType;
    prompt: string;
    platform?: Platform;
    context?: string;
    tone?: 'professional' | 'casual' | 'friendly' | 'humorous';
    length?: 'short' | 'medium' | 'long';
}

/**
 * Generate AI content for premium users
 */
export async function generateContent(options: ContentGenerationOptions): Promise<string> {
    const { type, prompt, platform, context, tone = 'friendly', length = 'medium' } = options;

    let systemPrompt = '';

    switch (type) {
        case 'comment':
            systemPrompt = buildCommentPrompt(prompt, platform, tone, context);
            break;
        case 'story':
            systemPrompt = buildStoryPrompt(prompt, length, tone);
            break;
        case 'post':
            systemPrompt = buildPostPrompt(prompt, platform, length, tone);
            break;
        case 'caption':
            systemPrompt = buildCaptionPrompt(prompt, platform, tone);
            break;
        case 'bio':
            systemPrompt = buildBioPrompt(prompt, platform, tone);
            break;
        case 'reply':
            systemPrompt = buildReplyPrompt(prompt, context, tone);
            break;
        default:
            throw new Error(`Unsupported content type: ${type}`);
    }

    try {
        const generatedText = await generateText(systemPrompt);
        return generatedText.trim();
    } catch (error) {
        console.error('Error generating content:', error);
        throw new Error('Failed to generate content');
    }
}

/**
 * Build prompt for comment generation
 */
function buildCommentPrompt(
    topic: string,
    platform?: Platform,
    tone?: string,
    context?: string
): string {
    const platformGuidance = getPlatformGuidance(platform);
    const toneGuidance = getToneGuidance(tone);

    return `Generate an engaging, thoughtful comment for a ${platform || 'social media'} post about: "${topic}"

${context ? `Context: ${context}` : ''}

Requirements:
- ${toneGuidance}
- ${platformGuidance}
- Be authentic and add value to the conversation
- Keep it concise (2-3 sentences)
- Avoid generic responses
- Don't use hashtags unless specifically requested

Generate only the comment text, nothing else.`;
}

/**
 * Build prompt for story generation
 */
function buildStoryPrompt(topic: string, length?: string, tone?: string): string {
    const lengthGuidance = getLengthGuidance(length);
    const toneGuidance = getToneGuidance(tone);

    return `Write a compelling story about: "${topic}"

Requirements:
- ${toneGuidance}
- ${lengthGuidance}
- Create a clear narrative arc (beginning, middle, end)
- Include vivid details and emotions
- Make it engaging and relatable
- Use natural, flowing language

Generate only the story text, nothing else.`;
}

/**
 * Build prompt for post generation
 */
function buildPostPrompt(
    topic: string,
    platform?: Platform,
    length?: string,
    tone?: string
): string {
    const platformGuidance = getPlatformGuidance(platform);
    const lengthGuidance = getLengthGuidance(length);
    const toneGuidance = getToneGuidance(tone);

    return `Create an engaging ${platform || 'social media'} post about: "${topic}"

Requirements:
- ${toneGuidance}
- ${lengthGuidance}
- ${platformGuidance}
- Hook readers in the first sentence
- Provide value or insight
- Include a call-to-action if appropriate
- Format for readability (use line breaks, emojis if suitable)

Generate only the post text, nothing else.`;
}

/**
 * Build prompt for caption generation
 */
function buildCaptionPrompt(topic: string, platform?: Platform, tone?: string): string {
    const platformGuidance = getPlatformGuidance(platform);
    const toneGuidance = getToneGuidance(tone);

    return `Create a catchy caption for an image/video about: "${topic}"

Requirements:
- ${toneGuidance}
- ${platformGuidance}
- Keep it short and punchy (1-2 sentences)
- Make it memorable and shareable
- Capture the essence of the content
- Use emojis strategically if appropriate

Generate only the caption text, nothing else.`;
}

/**
 * Build prompt for bio generation
 */
function buildBioPrompt(description: string, platform?: Platform, tone?: string): string {
    const platformGuidance = getPlatformGuidance(platform);
    const toneGuidance = getToneGuidance(tone);

    return `Create a compelling bio/profile description based on: "${description}"

Requirements:
- ${toneGuidance}
- ${platformGuidance}
- Keep it concise (2-3 sentences or 150 characters max)
- Highlight key strengths and interests
- Make it memorable and authentic
- Include personality

Generate only the bio text, nothing else.`;
}

/**
 * Build prompt for reply generation
 */
function buildReplyPrompt(message: string, context?: string, tone?: string): string {
    const toneGuidance = getToneGuidance(tone);

    return `Generate a thoughtful reply to this message: "${message}"

${context ? `Context: ${context}` : ''}

Requirements:
- ${toneGuidance}
- Be helpful and constructive
- Address the main points
- Keep it concise (2-3 sentences)
- Sound natural and conversational

Generate only the reply text, nothing else.`;
}

/**
 * Get platform-specific guidance
 */
function getPlatformGuidance(platform?: Platform): string {
    switch (platform) {
        case 'discord':
            return 'Use Discord-friendly formatting (markdown, code blocks if relevant). Keep it conversational.';
        case 'reddit':
            return 'Use Reddit-style formatting (markdown). Be informative and add to the discussion.';
        case 'telegram':
            return 'Keep it concise and mobile-friendly. Use emojis sparingly.';
        default:
            return 'Use clear, accessible language suitable for any platform.';
    }
}

/**
 * Get tone guidance
 */
function getToneGuidance(tone?: string): string {
    switch (tone) {
        case 'professional':
            return 'Use a professional, polished tone. Be formal and authoritative.';
        case 'casual':
            return 'Use a casual, relaxed tone. Sound like a friend chatting.';
        case 'friendly':
            return 'Use a warm, friendly tone. Be approachable and positive.';
        case 'humorous':
            return 'Use a light, humorous tone. Be witty and entertaining.';
        default:
            return 'Use a friendly, approachable tone.';
    }
}

/**
 * Get length guidance
 */
function getLengthGuidance(length?: string): string {
    switch (length) {
        case 'short':
            return 'Keep it brief (50-100 words).';
        case 'medium':
            return 'Use moderate length (100-200 words).';
        case 'long':
            return 'Create detailed content (200-400 words).';
        default:
            return 'Use appropriate length for the content type.';
    }
}

/**
 * Validate content generation limits
 */
export async function checkGenerationLimit(
    userId: string,
    isPremium: boolean
): Promise<{ allowed: boolean; remaining: number }> {
    // This would query the database to check usage
    // For now, returning mock data
    const limit = isPremium ? 50 : 5;
    const used = 0; // Would fetch from database

    return {
        allowed: used < limit,
        remaining: limit - used,
    };
}
