import { NextRequest, NextResponse } from 'next/server';
import { getServerInfo } from '@/lib/bot';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const guildId = searchParams.get('guildId');

  if (action === 'getServerInfo') {
    if (!guildId) {
      return NextResponse.json({ error: 'Missing guildId' }, { status: 400 });
    }
    const info = await getServerInfo(guildId);
    if (!info) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }
    return NextResponse.json(info);
  }

  if (action === 'getTotalMessages') {
    try {
      const result = await query('SELECT SUM("all") as total FROM messages');
      const total = parseInt(result.rows[0]?.total || '0');
      return NextResponse.json({ total });
    } catch (err) {
      console.error('Error fetching total messages:', err);
      return NextResponse.json({ total: 0 });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
