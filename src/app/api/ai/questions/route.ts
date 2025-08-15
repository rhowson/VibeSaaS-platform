import { NextRequest, NextResponse } from 'next/server';

// Mock questions data
const mockQuestions = [
  {
    id: '1',
    question_text: 'What is the primary goal of your project?',
    answer_text: 'To create a comprehensive SaaS platform for project management',
    asked_at: '2024-01-15T10:00:00Z',
    answered_at: '2024-01-15T10:05:00Z'
  },
  {
    id: '2',
    question_text: 'What is your target timeline for completion?',
    answer_text: 'We aim to complete the MVP within 3 months',
    asked_at: '2024-01-15T10:10:00Z',
    answered_at: '2024-01-15T10:15:00Z'
  },
  {
    id: '3',
    question_text: 'What is your budget range for this project?',
    answer_text: 'Our budget is between $50,000 and $100,000',
    asked_at: '2024-01-15T10:20:00Z',
    answered_at: '2024-01-15T10:25:00Z'
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

  return NextResponse.json(mockQuestions);
}
