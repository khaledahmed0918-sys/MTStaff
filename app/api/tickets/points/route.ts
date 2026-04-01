import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { getUserInfo } from '@/lib/bot';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pointsJsonPath = '/root/MTC-System/data/Tickets/points.json';
    const guildId = process.env.DISCORD_GUILD_ID;

    if (!guildId) {
      return NextResponse.json({ error: 'Discord Guild ID is not configured' }, { status: 500 });
    }

    let pointsData: any = {};
    try {
      const pointsRaw = await fs.readFile(pointsJsonPath, 'utf-8');
      pointsData = JSON.parse(pointsRaw);
    } catch (err) {
      console.error('Error reading points.json:', err);
      // Fallback for dev environment
      pointsData = {};
    }

    // Convert to array and sort by points
    const pointsArray = Object.entries(pointsData).map(([userId, points]) => ({
      userId,
      points: Number(points),
    }));

    pointsArray.sort((a, b) => b.points - a.points);

    // Fetch user info for each user
    const enrichedPoints = await Promise.all(
      pointsArray.map(async (item) => {
        const userInfo = await getUserInfo(guildId, item.userId);
        return {
          ...item,
          user: userInfo,
        };
      })
    );

    return NextResponse.json(enrichedPoints);
  } catch (error) {
    console.error('Error fetching ticket points:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket points' }, { status: 500 });
  }
}
