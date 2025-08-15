import { NextRequest, NextResponse } from 'next/server';

// Mock extracted data
const mockExtractedItems = [
  {
    id: '1',
    label: 'Project Requirements',
    value: 'Build a SaaS platform for project management',
    confidence: 0.95,
    selected: true,
    source_document_id: 'doc1'
  },
  {
    id: '2',
    label: 'Technology Stack',
    value: 'Next.js, TypeScript, Material-UI',
    confidence: 0.88,
    selected: true,
    source_document_id: 'doc1'
  },
  {
    id: '3',
    label: 'Timeline',
    value: '3-6 months development',
    confidence: 0.75,
    selected: false,
    source_document_id: 'doc2'
  },
  {
    id: '4',
    label: 'Budget',
    value: '$50,000 - $100,000',
    confidence: 0.82,
    selected: true,
    source_document_id: 'doc2'
  },
  {
    id: '5',
    label: 'Target Users',
    value: 'Small to medium businesses',
    confidence: 0.9,
    selected: true,
    source_document_id: 'doc1'
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  // Simulate some processing time but keep it fast
  await new Promise((resolve) => setTimeout(resolve, 100));

  return NextResponse.json(mockExtractedItems);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Simulate AI extraction process
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      message: 'Extraction started successfully',
      projectId
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start extraction' }, { status: 500 });
  }
}
