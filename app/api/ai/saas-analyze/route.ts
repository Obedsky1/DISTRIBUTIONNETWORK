import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

export async function POST(request: NextRequest) {
    try {
        const { name, url, description } = await request.json();

        if (!name && !description) {
            return NextResponse.json(
                { success: false, error: 'Provide at least a SaaS name or description.' },
                { status: 400 }
            );
        }

        if (!apiKey) {
            // Return a graceful mock when no API key is set
            return NextResponse.json({
                success: true,
                data: {
                    positioning: `${name || 'Your SaaS'} is positioned as a powerful solution for modern teams seeking efficiency and growth.`,
                    targetAudience: 'SaaS founders, startups, freelancers, and digital agencies',
                    usp: [
                        'Fast time-to-value for small teams',
                        'Affordable pricing compared to enterprise alternatives',
                        'Intuitive UX with minimal learning curve',
                    ],
                    keywords: ['saas', 'productivity', 'automation', 'growth', 'startup tools'],
                    contentAngles: [
                        'Share how it solves a painful workflow problem',
                        'Before/after comparison post',
                        'Feature highlight with a real use case',
                        'User success story or testimonial',
                    ],
                    toneRecommendation: 'casual',
                    note: 'AI key not configured — showing example output. Add GEMINI_API_KEY to .env for live analysis.',
                },
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a SaaS marketing expert. Analyze the following product and return a JSON object with these fields:
- positioning (string): 1-2 sentence positioning statement
- targetAudience (string): who this is best for
- usp (array of 3 strings): unique selling points
- keywords (array of 5-8 strings): SEO/marketing keywords
- contentAngles (array of 4 strings): content ideas for social media / community posts
- toneRecommendation (string): one of "professional", "casual", "friendly", "technical"

Product Name: ${name || 'Unknown'}
Website: ${url || 'Not provided'}
Description: ${description || 'Not provided'}

Respond ONLY with valid JSON, no markdown, no explanation.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();

        // Strip markdown code fences if present
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        } catch {
            return NextResponse.json({ success: false, error: 'AI returned invalid JSON. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: parsed });
    } catch (error) {
        console.error('SaaS analyze error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Analysis failed' },
            { status: 500 }
        );
    }
}
