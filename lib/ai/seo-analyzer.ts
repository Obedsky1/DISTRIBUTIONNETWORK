import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY || '');

export interface SEOAnalysisInput {
    url?: string;
    content?: string;
    targetKeyword?: string;
    title?: string;
    description?: string;
}

export interface SEOAnalysisResult {
    score: number; // 0-100
    keywords: Array<{
        keyword: string;
        volume: string;
        difficulty: string;
        relevance: number;
    }>;
    metaTags: {
        title: string;
        description: string;
        ogTitle: string;
        ogDescription: string;
    };
    recommendations: Array<{
        category: string;
        issue: string;
        suggestion: string;
        priority: 'high' | 'medium' | 'low';
    }>;
    contentAnalysis: {
        readability: string;
        wordCount: number;
        headingStructure: string[];
        keywordDensity: number;
    };
}

/**
 * Analyze content for SEO optimization
 */
export async function analyzeSEO(input: SEOAnalysisInput): Promise<SEOAnalysisResult> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert SEO analyst. Analyze the following content and provide comprehensive SEO recommendations.

${input.url ? `URL: ${input.url}` : ''}
${input.title ? `Title: ${input.title}` : ''}
${input.description ? `Meta Description: ${input.description}` : ''}
${input.targetKeyword ? `Target Keyword: ${input.targetKeyword}` : ''}
${input.content ? `Content: ${input.content.substring(0, 2000)}` : ''}

Provide analysis in the following JSON format:
{
    "score": 0-100,
    "keywords": [
        {
            "keyword": "keyword phrase",
            "volume": "high/medium/low",
            "difficulty": "easy/medium/hard",
            "relevance": 0-100
        }
    ],
    "metaTags": {
        "title": "Optimized title (50-60 chars)",
        "description": "Optimized description (150-160 chars)",
        "ogTitle": "Open Graph title",
        "ogDescription": "Open Graph description"
    },
    "recommendations": [
        {
            "category": "Title/Content/Meta/Technical",
            "issue": "What needs improvement",
            "suggestion": "How to fix it",
            "priority": "high/medium/low"
        }
    ],
    "contentAnalysis": {
        "readability": "Easy/Medium/Hard",
        "wordCount": number,
        "headingStructure": ["H1", "H2", "H3"],
        "keywordDensity": 0-100
    }
}

Be specific and actionable in your recommendations.
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse SEO analysis');
        }

        const analysis = JSON.parse(jsonMatch[0]) as SEOAnalysisResult;
        return analysis;
    } catch (error) {
        console.error('SEO analysis error:', error);
        throw new Error('Failed to analyze SEO. Please try again.');
    }
}

/**
 * Generate keyword suggestions based on topic
 */
export async function generateKeywords(topic: string, count: number = 15): Promise<string[]> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Generate ${count} highly relevant SEO keywords for the topic: "${topic}"

Requirements:
- Mix of short-tail and long-tail keywords
- Include question-based keywords
- Consider search intent
- Focus on commercial and informational keywords
- Return as a simple comma-separated list

Just return the keywords, nothing else.
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const keywords = text
            .split(',')
            .map(k => k.trim())
            .filter(k => k.length > 0)
            .slice(0, count);

        return keywords;
    } catch (error) {
        console.error('Keyword generation error:', error);
        throw new Error('Failed to generate keywords.');
    }
}

/**
 * Generate optimized meta tags
 */
export async function generateMetaTags(input: {
    topic: string;
    description?: string;
    keywords?: string[];
}): Promise<{
    title: string;
    description: string;
    keywords: string;
}> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Generate SEO-optimized meta tags for:

Topic: ${input.topic}
Description: ${input.description || 'Not provided'}
Keywords: ${input.keywords?.join(', ') || 'Not provided'}

Requirements:
- Title: 50-60 characters, compelling and keyword-rich
- Description: 150-160 characters, includes call-to-action
- Keywords: Comma-separated list of 5-10 relevant keywords

Return in this exact format:
TITLE: [your title]
DESCRIPTION: [your description]
KEYWORDS: [keyword1, keyword2, keyword3]
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const titleMatch = text.match(/TITLE:\s*(.+)/i);
        const descMatch = text.match(/DESCRIPTION:\s*(.+)/i);
        const keywordsMatch = text.match(/KEYWORDS:\s*(.+)/i);

        return {
            title: titleMatch?.[1]?.trim() || input.topic,
            description: descMatch?.[1]?.trim() || input.description || '',
            keywords: keywordsMatch?.[1]?.trim() || input.keywords?.join(', ') || '',
        };
    } catch (error) {
        console.error('Meta tag generation error:', error);
        throw new Error('Failed to generate meta tags.');
    }
}

/**
 * Analyze competitor SEO
 */
export async function analyzeCompetitor(competitorUrl: string): Promise<{
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
}> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Analyze the SEO strategy of this competitor: ${competitorUrl}

Based on common SEO best practices, provide:
1. 3-5 SEO strengths they likely have
2. 3-5 potential SEO weaknesses to exploit
3. 3-5 opportunities for differentiation

Return in JSON format:
{
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "opportunities": ["opportunity1", "opportunity2"]
}
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse competitor analysis');
        }

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Competitor analysis error:', error);
        throw new Error('Failed to analyze competitor.');
    }
}
