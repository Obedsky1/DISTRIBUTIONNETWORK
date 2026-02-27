import { NextResponse } from 'next/server';
import directoriesData from '@/data/directories.json';

export async function GET() {
    try {
        // Extract the directories array from the JSON structure
        const directories = directoriesData.directories || [];

        return NextResponse.json({
            directories,
            total: directories.length,
            categories: directoriesData.categories
        });
    } catch (error) {
        console.error('Error loading directories:', error);
        return NextResponse.json(
            { error: 'Failed to load directories' },
            { status: 500 }
        );
    }
}
