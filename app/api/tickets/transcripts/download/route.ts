import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');

    if (!fileName || !fileName.endsWith('.html')) {
      return new NextResponse('Invalid file name', { status: 400 });
    }

    const transcriptsDir = '/root/MTC-System/transcripts/';
    const filePath = path.join(transcriptsDir, fileName);

    // Prevent directory traversal
    if (!filePath.startsWith(transcriptsDir)) {
      return new NextResponse('Invalid file path', { status: 400 });
    }

    const fileContent = await fs.readFile(filePath, 'utf-8');

    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error serving transcript:', error);
    return new NextResponse('Transcript not found', { status: 404 });
  }
}
