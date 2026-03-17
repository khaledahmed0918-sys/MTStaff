import { NextRequest, NextResponse } from 'next/server';
import { hasRole } from '@/lib/bot';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const guildId = req.nextUrl.searchParams.get('guildId');
  const roleId = req.nextUrl.searchParams.get('roleId');

  if (!userId || !guildId || !roleId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const result = await hasRole(guildId, userId, roleId);
    return NextResponse.json({ hasRole: result });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
