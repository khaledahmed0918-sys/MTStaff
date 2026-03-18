import { NextRequest, NextResponse } from 'next/server';
import { getStaffMembers } from '@/lib/bot';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!guildId) {
    return NextResponse.json({ error: 'Missing GUILD_ID in env' }, { status: 500 });
  }

  try {
    const staffCategories = await getStaffMembers(guildId);
    
    // Collect all user IDs
    const userIds: string[] = [];
    for (const category of staffCategories) {
      for (const member of category.members) {
        userIds.push(member.id);
      }
    }

    if (userIds.length === 0) {
      return NextResponse.json({ staff: [] });
    }

    // Fetch stats for all users
    // We can use IN clause for streaks and messages
    const placeholders = userIds.map((_, i) => `$${i + 1}`).join(',');
    
    const [streaksRes, messagesRes] = await Promise.allSettled([
      query(`SELECT user_id, streak FROM streaks WHERE user_id IN (${placeholders})`, userIds),
      query(`SELECT user_id, "all" as total, top_day as daily, top_week as weekly, top_month as monthly FROM messages WHERE user_id IN (${placeholders})`, userIds)
    ]);

    const streaksMap = new Map();
    if (streaksRes.status === 'fulfilled') {
      streaksRes.value.rows.forEach(row => streaksMap.set(row.user_id, row.streak));
    }

    const messagesMap = new Map();
    if (messagesRes.status === 'fulfilled') {
      messagesRes.value.rows.forEach(row => messagesMap.set(row.user_id, row));
    }

    // For swarns, we need to check if the table exists for each user, or we can just query them individually
    // Since table names are dynamic (swarns_USERID), we have to query them one by one
    // To avoid too many queries, we'll do it concurrently
    const swarnsMap = new Map();
    await Promise.allSettled(userIds.map(async (id) => {
      try {
        const res = await query(`SELECT COUNT(*) FROM "swarns_${id}"`);
        swarnsMap.set(id, parseInt(res.rows[0].count, 10));
      } catch (e) {
        // Table might not exist, which is fine
        swarnsMap.set(id, 0);
      }
    }));

    // Attach stats to members
    for (const category of staffCategories) {
      for (const member of category.members) {
        (member as any).stats = {
          streak: streaksMap.get(member.id) || 0,
          messages: messagesMap.get(member.id) || { total: 0, daily: 0, weekly: 0, monthly: 0 },
          swarns: swarnsMap.get(member.id) || 0
        };
      }
    }

    return NextResponse.json({ staff: staffCategories });
  } catch (err) {
    console.error('Error in /api/staff:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
