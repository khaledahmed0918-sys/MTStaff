import { NextResponse } from 'next/server';
import { getAllUsersWithStats } from '@/lib/bot';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const guildId = process.env.DISCORD_GUILD_ID;
    if (!guildId) {
      return NextResponse.json({ error: 'No guild ID configured' }, { status: 500 });
    }

    const users = await getAllUsersWithStats(guildId);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
