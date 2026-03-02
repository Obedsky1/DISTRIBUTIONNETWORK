import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '@/lib/firebase/admin';
import { LaunchProject } from '@/types/distribution';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
        }

        let projects: LaunchProject[] = [];
        try {
            if (adminDb) {
                const projectsSnapshot = await adminDb
                    .collection('launch_projects')
                    .where('user_id', '==', userId)
                    .orderBy('created_at', 'desc')
                    .get();

                projects = projectsSnapshot.docs.map(doc => doc.data() as LaunchProject);
            }
        } catch (dbError) {
            console.warn('Firebase error on GET projects', dbError);
        }

        return NextResponse.json({ projects });
    } catch (error) {
        console.error('Error fetching distribute projects:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user_id, name, goal_type } = body;

        if (!user_id || !name || !goal_type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newProject: LaunchProject = {
            id: uuidv4(),
            user_id,
            name,
            goal_type,
            created_at: new Date(),
            updated_at: new Date()
        };

        try {
            if (adminDb) {
                await adminDb.collection('launch_projects').doc(newProject.id).set(newProject);
            }
        } catch (dbError) {
            console.warn('Firebase error (likely unconfigured), returning success for optimistic UI', dbError);
        }

        return NextResponse.json({ project: newProject }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating distribute project:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
