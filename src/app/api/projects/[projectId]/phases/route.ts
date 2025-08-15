import { NextRequest, NextResponse } from 'next/server';

// Mock phases data
const mockPhases = [
  {
    id: 'phase_1',
    projectId: 'project_1',
    name: 'Planning Phase',
    description: 'Initial project planning and requirements gathering',
    status: 'completed',
    order: 1,
    tasks: [
      {
        id: 'task_1',
        name: 'Define project scope',
        description: 'Clearly define what the project will deliver',
        status: 'completed',
        priority: 'high',
        assignee: 'user_1',
        dueDate: '2025-08-20T00:00:00.000Z'
      },
      {
        id: 'task_2',
        name: 'Create project timeline',
        description: 'Develop a detailed project schedule',
        status: 'completed',
        priority: 'high',
        assignee: 'user_1',
        dueDate: '2025-08-22T00:00:00.000Z'
      }
    ]
  },
  {
    id: 'phase_2',
    projectId: 'project_1',
    name: 'Development Phase',
    description: 'Core development and implementation',
    status: 'in_progress',
    order: 2,
    tasks: [
      {
        id: 'task_3',
        name: 'Set up development environment',
        description: 'Configure tools and development setup',
        status: 'completed',
        priority: 'medium',
        assignee: 'user_2',
        dueDate: '2025-08-25T00:00:00.000Z'
      },
      {
        id: 'task_4',
        name: 'Implement core features',
        description: 'Develop the main functionality',
        status: 'in_progress',
        priority: 'high',
        assignee: 'user_2',
        dueDate: '2025-09-05T00:00:00.000Z'
      }
    ]
  },
  {
    id: 'phase_3',
    projectId: 'project_1',
    name: 'Testing Phase',
    description: 'Quality assurance and testing',
    status: 'pending',
    order: 3,
    tasks: [
      {
        id: 'task_5',
        name: 'Unit testing',
        description: 'Write and run unit tests',
        status: 'pending',
        priority: 'medium',
        assignee: 'user_3',
        dueDate: '2025-09-10T00:00:00.000Z'
      },
      {
        id: 'task_6',
        name: 'Integration testing',
        description: 'Test component integration',
        status: 'pending',
        priority: 'high',
        assignee: 'user_3',
        dueDate: '2025-09-15T00:00:00.000Z'
      }
    ]
  }
];

export async function GET(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const { projectId } = params;

    // Filter phases for the specific project
    const projectPhases = mockPhases.filter((phase) => phase.projectId === projectId);

    return NextResponse.json(projectPhases);
  } catch (error) {
    console.error('Error fetching phases:', error);
    return NextResponse.json({ error: 'Failed to fetch phases' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { projectId: string } }) {
  try {
    const { projectId } = params;
    const body = await request.json();

    const newPhase = {
      id: `phase_${Date.now()}`,
      projectId,
      name: body.name,
      description: body.description || '',
      status: 'pending',
      order: body.order || 1,
      tasks: []
    };

    // In a real app, this would be saved to a database
    mockPhases.push(newPhase);

    return NextResponse.json(newPhase, { status: 201 });
  } catch (error) {
    console.error('Error creating phase:', error);
    return NextResponse.json({ error: 'Failed to create phase' }, { status: 500 });
  }
}
