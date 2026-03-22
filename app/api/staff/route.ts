import { NextResponse } from 'next/server';
import { getStaffWithStats } from '@/lib/bot';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const guildId = process.env.DISCORD_GUILD_ID;
    if (!guildId) {
      return NextResponse.json({ error: 'Discord Guild ID is not configured' }, { status: 500 });
    }

    const staffCategories = await getStaffWithStats(guildId);
    return NextResponse.json(staffCategories);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff data' }, { status: 500 });
  }
}
