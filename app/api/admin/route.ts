import { NextResponse } from 'next/server';
import { getAdminWithStats } from '@/lib/bot';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const guildId = process.env.DISCORD_GUILD_ID;
    if (!guildId) {
      return NextResponse.json({ error: 'Discord Guild ID is not configured' }, { status: 500 });
    }

    const adminCategories = await getAdminWithStats(guildId);
    return NextResponse.json(adminCategories);
  } catch (error) {
    console.error('Error fetching admin:', error);
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}
