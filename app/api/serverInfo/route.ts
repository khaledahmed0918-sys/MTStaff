import { NextRequest, NextResponse } from 'next/server';
import { getServerInfo } from '@/lib/bot';

export async function GET(req: NextRequest) {
  const guildId = req.nextUrl.searchParams.get('guildId');

  if (!guildId) {
    return NextResponse.json({ error: 'Missing guildId' }, { status: 400 });
  }

  try {
    const info = await getServerInfo(guildId);
    if (!info) {
      return NextResponse.json({ error: 'Could not fetch server info' }, { status: 500 });
    }
    return NextResponse.json(info);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
