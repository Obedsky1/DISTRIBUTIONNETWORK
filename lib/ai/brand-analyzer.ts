import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || '');

export interface BrandAnalysisInput {
    brandName: string;
    description: string;
    targetAudience?: string;
    industry?: string;
    goals?: string[];
}

export interface BrandAnalysisResult {
    niche: string;
    marketPosition: string;
    targetCommunities: string[];
    competitiveInsights: string[];
    brandSentiment: 'positive' | 'neutral' | 'negative';
    recommendedDirectories: Array<{
        name: string;
        category: string;
        relevanceScore: number;
        reason: string;
    }>;
    keyInsights: string[];
    suggestedKeywords: string[];
}

/**
 * Analyze a brand using AI to provide comprehensive insights
 */
export async function analyzeBrand(input: BrandAnalysisInput): Promise<BrandAnalysisResult> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are a professional brand analyst and marketing strategist. Analyze the following brand and provide comprehensive insights.

Brand Name: ${input.brandName}
Description: ${input.description}
Target Audience: ${input.targetAudience || 'Not specified'}
Industry: ${input.industry || 'Not specified'}
Goals: ${input.goals?.join(', ') || 'Not specified'}

Provide a detailed analysis in the following JSON format:
{
    "niche": "Specific niche/market segment",
    "marketPosition": "Brief market positioning statement",
    "targetCommunities": ["List of 5-7 specific community types where this brand should be active"],
    "competitiveInsights": ["3-5 key competitive insights"],
    "brandSentiment": "positive/neutral/negative based on market fit",
    "recommendedDirectories": [
        {
            "name": "Directory name",
            "category": "Product Launch/SEO/AI Tools/etc",
            "relevanceScore": 0-100,
            "reason": "Why this directory is relevant"
        }
    ],
    "keyInsights": ["5-7 actionable insights for growth"],
    "suggestedKeywords": ["10-15 SEO keywords relevant to this brand"]
}

Focus on actionable, specific recommendations. Be professional and data-driven.
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response (handle markdown code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response');
        }

        const analysis = JSON.parse(jsonMatch[0]) as BrandAnalysisResult;
        return analysis;
    } catch (error) {
        console.error('Brand analysis error:', error);
        throw new Error('Failed to analyze brand. Please try again.');
    }
}

/**
 * Filter directories based on brand analysis
 */
export function filterDirectoriesByBrand(
    analysis: BrandAnalysisResult,
    allDirectories: any[]
): any[] {
    const recommendedNames = analysis.recommendedDirectories.map(d => d.name.toLowerCase());
    const keywords = analysis.suggestedKeywords.map(k => k.toLowerCase());

    return allDirectories
        .map(directory => {
            let score = 0;

            // Check if directory is in recommended list
            if (recommendedNames.some(name => directory.name.toLowerCase().includes(name))) {
                score += 50;
            }

            // Check category match
            const dirCategory = directory.category?.toLowerCase() || '';
            if (analysis.recommendedDirectories.some(rd =>
                rd.category.toLowerCase() === dirCategory
            )) {
                score += 30;
            }

            // Check keyword relevance
            const dirText = `${directory.name} ${directory.description}`.toLowerCase();
            const matchingKeywords = keywords.filter(kw => dirText.includes(kw));
            score += matchingKeywords.length * 5;

            return { ...directory, relevanceScore: score };
        })
        .filter(d => d.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
