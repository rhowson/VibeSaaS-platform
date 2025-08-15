import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, contentType, projectId } = body;

    // Validate required fields
    if (!filename || !contentType || !projectId) {
      return NextResponse.json({ error: 'Filename, content type, and project ID are required' }, { status: 400 });
    }

    // Mock signed URL response (in a real app, this would integrate with Supabase Storage)
    const mockSignedUrl = {
      url: `https://mock-storage.example.com/upload/${projectId}`,
      fields: {
        'Content-Type': contentType,
        key: `projects/${projectId}/${filename}`,
        bucket: 'project-files',
        'X-Upload-Id': `upload_${Date.now()}`,
        policy: 'mock-policy-string',
        signature: 'mock-signature-string',
        'x-amz-algorithm': 'AWS4-HMAC-SHA256',
        'x-amz-credential': 'mock-credential',
        'x-amz-date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')
      }
    };

    return NextResponse.json(mockSignedUrl);
  } catch (error) {
    console.error('Error signing upload:', error);
    return NextResponse.json({ error: 'Failed to sign upload' }, { status: 500 });
  }
}
