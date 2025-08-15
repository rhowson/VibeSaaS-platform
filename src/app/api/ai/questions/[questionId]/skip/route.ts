import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { questionId: string } }) {
  try {
    const { questionId } = params;

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    return NextResponse.json({
      message: 'Question skipped successfully',
      questionId
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to skip question' }, { status: 500 });
  }
}
