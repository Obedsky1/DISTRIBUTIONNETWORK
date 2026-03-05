import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getDocument, setDocument, queryDocuments } from '@/lib/firebase/firestore';
import { getAuthUserId } from '@/lib/api-auth';
import { LaunchProject, SubmissionVersion, ActivityLog } from '@/types/distribution';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { directory_name, project_id, user_id, submission_id } = body;

        if (!directory_name || !project_id || !submission_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const authUserId = await getAuthUserId(req);
        if (!authUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch project details for context and ownership check
        const project = await getDocument<LaunchProject>('launch_projects', project_id);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (project.user_id !== authUserId) {
            return NextResponse.json({ error: 'Forbidden: You do not own this project' }, { status: 403 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are an expert copywriter and growth marketer. 
            I need platform-specific copy to submit a project to a directory.
            
            Platform/Directory Name: ${directory_name}
            Project Name: ${project.name}
            Project Goal: ${project.goal_type}
            
            Based on the platform name (e.g., Product Hunt, Hacker News, a general AI tool directory, a startup directory), tailor the tone, length, and focus of the pitch. 
            If it's a technical community, highlight the stack/API. If it's a general directory, focus on the user benefit and value proposition.
            
            Please provide the output EXACTLY in this JSON format without any markdown blocks or other text:
            {
                "title": "A short, punchy title/tagline (max 60 chars)",
                "description": "The full description or pitch tailored for this platform."
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        let generatedContent;
        try {
            // strip potential markdown codeblocks if AI includes them
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            generatedContent = JSON.parse(cleanJson);
        } catch (e) {
            console.error('Failed to parse AI output:', responseText);
            return NextResponse.json({ error: 'AI returned invalid format' }, { status: 500 });
        }

        // Get current max version number to save it automatically
        const existing = await queryDocuments<SubmissionVersion>(
            'submission_versions',
            [{ field: 'submission_id', operator: '==', value: submission_id }],
            'version_number',
            'desc',
            1
        );
        const version_number = existing.length > 0 ? existing[0].version_number + 1 : 1;

        const newVersion: SubmissionVersion = {
            id: uuidv4(),
            submission_id,
            title: generatedContent.title,
            description: generatedContent.description,
            version_number,
            created_at: new Date()
        };

        await setDocument('submission_versions', newVersion.id, newVersion as any);

        if (user_id) {
            const log: ActivityLog = {
                id: uuidv4(),
                project_id,
                user_id,
                action_type: 'ai_copy_generated',
                metadata: { directory_name, version_number },
                created_at: new Date()
            };
            await setDocument('activity_logs', log.id, log as any);
        }

        return NextResponse.json(generatedContent);

    } catch (error) {
        console.error('Error generating AI copy:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
