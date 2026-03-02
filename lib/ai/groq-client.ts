import axios from 'axios';

export async function generateSocialReply(postContent: string, campaignContext: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        throw new Error("GROQ_API_KEY is not defined in environment variables.");
    }

    try {
        const systemPrompt = `You are a helpful and authentic growth marketer. 
        Your goal is to reply to a social media post in a way that is genuinely helpful to the user, 
        and naturally mentions a product as a solution.
        
        Product Context: ${campaignContext}
        
        Rules for the reply:
        1. Keep it short (under 280 characters if possible, similar to a tweet).
        2. Be extremely conversational and human. Do NOT sound like an AI.
        3. Empathize with their problem first, then suggest the product.
        4. Do not use hashtags or emojis excessively.
        5. Return ONLY the text of the reply.`;

        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `The post to reply to: "${postContent}"` }
                ],
                temperature: 0.7,
                max_tokens: 150
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const reply = response.data.choices[0].message.content.trim();
        return reply;

    } catch (error) {
        console.error("Error generating reply from Groq:", error);
        throw error;
    }
}
