import { NextRequest, NextResponse } from 'next/server';

// Mock next question
const mockNextQuestion = {
  id: '4',
  question_text: 'What are the key features you want to include in your MVP?',
  asked_at: new Date().toISOString()
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Simulate AI question generation
    await new Promise((resolve) => setTimeout(resolve, 200));

    return NextResponse.json(mockNextQuestion);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 });
  }
}
