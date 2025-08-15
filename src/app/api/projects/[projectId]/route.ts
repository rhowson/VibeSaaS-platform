import { NextRequest, NextResponse } from 'next/server';

// Mock project storage (in a real app, this would be a database)
const projects: any[] = [
  {
    id: 'project_1',
    name: 'Test Project',
    idea_text: 'This is a test project idea',
    status: 'created',
    created_at: '2025-08-15T08:43:26.348Z',
    updated_at: '2025-08-15T08:43:26.348Z',
    user_id: 'user_1',
    files: [],
    phases: [],
    tasks: [],
    ai_analysis: {
      status: 'pending',
      extracted_items: [],
      questions: [],
      plan: null
    }
  }
];

export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const { projectId } = params;

    const project = projects.find((p) => p.id === projectId);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const { projectId } = params;
    const body = await request.json();

    const projectIndex = projects.findIndex((p) => p.id === projectId);

    if (projectIndex === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Update project
    projects[projectIndex] = {
      ...projects[projectIndex],
      ...body,
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(projects[projectIndex]);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const { projectId } = params;

    const projectIndex = projects.findIndex((p) => p.id === projectId);

    if (projectIndex === -1) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    projects.splice(projectIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
