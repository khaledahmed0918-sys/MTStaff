import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getUserInfo } from '@/lib/bot';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getPrivacyData() {
  try {
    const filePath = path.join(process.cwd(), 'privacy.json');
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    return {};
  }
}

export async function GET() {
  try {
    const session = await getSession();
    const viewerId = session?.user?.id;

    const pointsJsonPath = '/root/MTC-System/data/Tickets/points.json';
    const guildId = process.env.DISCORD_GUILD_ID || '852218081837449246';
    const privacyData = await getPrivacyData();

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

    // Convert to array and filter by privacy
    const pointsArray = await Promise.all(Object.entries(pointsData).map(async ([userId, data]: [string, any]) => {
      const userPrivacy = privacyData[userId] || { 
        showProfile: true, 
        hideStats: false,
        pointsVisibility: 'everyone'
      };

      const isSelf = viewerId === userId;
      const isFriend = !!viewerId;

      const canSeeProfile = userPrivacy.showProfile || isSelf;
      const canSeePoints = 
        userPrivacy.pointsVisibility === 'everyone' || 
        (userPrivacy.pointsVisibility === 'friends' && isFriend) || 
        isSelf;

      if (!canSeeProfile) return null;

      // Handle both formats: { "userId": 10 } OR { "userId": { "points": 10, "tickets": [...] } }
      const points = typeof data === 'object' ? (data.points || 0) : Number(data);
      const tickets = typeof data === 'object' ? (data.tickets || []) : [];
      
      const userInfo = await getUserInfo(guildId, userId);

      return {
        userId,
        points,
        tickets: canSeePoints ? tickets : [],
        user: userInfo,
        hidePoints: !canSeePoints
      };
    }));

    const enrichedPoints = pointsArray.filter(r => r !== null).sort((a: any, b: any) => b.points - a.points);

    return NextResponse.json(enrichedPoints);
  } catch (error) {
    console.error('Error fetching ticket points:', error);
    return NextResponse.json({ error: 'Failed to fetch ticket points' }, { status: 500 });
  }
}
