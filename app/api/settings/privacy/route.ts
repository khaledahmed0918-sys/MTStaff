import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

const PRIVACY_FILE = path.join(process.cwd(), 'privacy.json');

export async function GET() {
  const session = await getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await fs.readFile(PRIVACY_FILE, 'utf-8');
    const privacyData = JSON.parse(data);
    const userPrivacy = privacyData[session.user.id] || {
      showProfile: true,
      hideStats: false,
      pointsVisibility: 'everyone'
    };
    return NextResponse.json(userPrivacy);
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      return NextResponse.json({
        showProfile: true,
        hideStats: false,
        pointsVisibility: 'everyone'
      });
    }
    return NextResponse.json({ error: 'Failed to read privacy settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    let privacyData: any = {};
    
    try {
      const data = await fs.readFile(PRIVACY_FILE, 'utf-8');
      privacyData = JSON.parse(data);
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e;
    }

    privacyData[session.user.id] = {
      ...privacyData[session.user.id],
      ...body,
      updatedAt: new Date().toISOString()
    };

    await fs.writeFile(PRIVACY_FILE, JSON.stringify(privacyData, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error saving privacy settings:', e);
    return NextResponse.json({ error: 'Failed to save privacy settings' }, { status: 500 });
  }
}
