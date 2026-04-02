import { NextResponse } from 'next/server';
import { getAdminWithStats } from '@/lib/bot';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

async function getPrivacyData() {
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'privacy.json'), 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

export async function GET() {
  try {
    const guildId = process.env.DISCORD_GUILD_ID;
    if (!guildId) {
      return NextResponse.json({ error: 'Discord Guild ID is not configured' }, { status: 500 });
    }

    const adminCategories = await getAdminWithStats(guildId);
    const privacyData = await getPrivacyData();

    // Map through categories and members to apply privacy settings
    const processedCategories = adminCategories.map((category: any) => ({
      ...category,
      roles: category.roles.map((role: any) => ({
        ...role,
        members: role.members.map((member: any) => {
          const userPrivacy = privacyData[member.id] || { hideStats: false };
          if (userPrivacy.hideStats) {
            return {
              ...member,
              hideStats: true,
              stats: null
            };
          }
          return {
            ...member,
            hideStats: false
          };
        })
      }))
    }));

    return NextResponse.json(processedCategories);
  } catch (error) {
    console.error('Error fetching admin:', error);
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}
