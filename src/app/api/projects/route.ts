import { NextRequest, NextResponse } from 'next/server';

// Mock project storage (in a real app, this would be a database)
const projects: any[] = [];

function getNextProjectId(): string {
  return `project_${projects.length + 1}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, idea_text } = body;

    // Validate required fields
    if (!name || !idea_text) {
      return NextResponse.json({ error: 'Project name and idea text are required' }, { status: 400 });
    }

    // Create new project
    const newProject = {
      id: getNextProjectId(),
      name,
      idea_text,
      status: 'created',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user_1', // Mock user ID
      files: [],
      phases: [],
      tasks: [],
      ai_analysis: {
        status: 'pending',
        extracted_items: [],
        questions: [],
        plan: null
      }
    };

    // Add to projects array
    projects.push(newProject);

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      projects,
      success: true
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
