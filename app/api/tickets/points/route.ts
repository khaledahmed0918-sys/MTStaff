import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { getUserInfo } from '@/lib/bot';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pointsJsonPath = '/root/MTC-System/data/Tickets/points.json';
    const guildId = process.env.DISCORD_GUILD_ID || '852218081837449246';

    let pointsData: any = {};
    try {
      const pointsRaw = await fs.readFile(pointsJsonPath, 'utf-8');
      const parsed = JSON.parse(pointsRaw);
      
      // The JSON has server ID at the root, we need to get the inner object
      if (parsed['852218081837449246']) {
        pointsData = parsed['852218081837449246'];
      } else if (parsed[guildId]) {
        pointsData = parsed[guildId];
      } else {
        pointsData = parsed; // Fallback if it's directly at root
      }
    } catch (err) {
      console.error('Error reading points.json:', err);
      pointsData = {};
    }

    // Convert to array and sort by points
    const pointsArray = Object.entries(pointsData).map(([userId, data]: [string, any]) => {
      // Handle both formats: { "userId": 10 } OR { "userId": { "points": 10, "tickets": [...] } }
      const points = typeof data === 'object' ? (data.points || 0) : Number(data);
      const tickets = typeof data === 'object' ? (data.tickets || []) : [];
      
      return {
        userId,
        points,
        tickets,
      };
    });

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
