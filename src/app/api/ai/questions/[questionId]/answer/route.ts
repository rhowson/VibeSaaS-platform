import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { questionId: string } }) {
  try {
    const body = await request.json();
    const { answer } = body;
    const { questionId } = params;

    if (!answer) {
      return NextResponse.json({ error: 'Answer is required' }, { status: 400 });
    }

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    return NextResponse.json({
      message: 'Answer submitted successfully',
      questionId,
      answer
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 });
  }
}
