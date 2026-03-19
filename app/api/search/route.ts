import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserInfo, getRandomMembers } from '@/lib/bot';
import fs from 'fs/promises';

async function readUserJson(userId: string) {
  try {
    const data = await fs.readFile(`/root/mtcoins/data/users/${userId}.json`, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!guildId) {
    return NextResponse.json({ error: 'Missing GUILD_ID' }, { status: 500 });
  }

  try {
    if (!q) {
      const randomMembers = await getRandomMembers(guildId, 10);
      
      // Fetch stats for these random members
      const results = await Promise.all(randomMembers.map(async (member) => {
        const [warnsRes, timeoutsRes, bansRes, streaksRes, userJson] = await Promise.allSettled([
          query(`SELECT COUNT(*) as count FROM "warns_${member.id}"`),
          query(`SELECT COUNT(*) as count FROM "timeouts_${member.id}"`),
          query(`SELECT COUNT(*) as count FROM "bans_${member.id}"`),
          query(`SELECT * FROM streaks WHERE user_id = $1`, [member.id]),
          readUserJson(member.id)
        ]);

        const warnsCount = warnsRes.status === 'fulfilled' ? parseInt(warnsRes.value.rows[0]?.count || '0', 10) : 0;
        const timeoutsCount = timeoutsRes.status === 'fulfilled' ? parseInt(timeoutsRes.value.rows[0]?.count || '0', 10) : 0;
        const bansCount = bansRes.status === 'fulfilled' ? parseInt(bansRes.value.rows[0]?.count || '0', 10) : 0;
        const streaks = streaksRes.status === 'fulfilled' && streaksRes.value.rows.length > 0 ? streaksRes.value.rows[0] : null;
        
        const userData = userJson.status === 'fulfilled' && userJson.value ? userJson.value : { data: { coins: 0, tasks_remaining: 0, tasks_completed: 0, last_5: [] }, tasks: [] };

        return {
          ...member,
          stats: {
            warns: warnsCount,
            timeouts: timeoutsCount,
            bans: bansCount,
            streaks: streaks?.streak || 0,
            completed_today: streaks?.completed_today || false,
            tasks_remaining: userData.data?.tasks_remaining || 0,
            tasks_completed: userData.data?.tasks_completed || 0,
          }
        };
      }));

      return NextResponse.json({ results });
    }

    // If the query is an ID, we can fetch their info directly
    const discordInfo = await getUserInfo(guildId, q);

    if (discordInfo) {
      const [warnsRes, timeoutsRes, bansRes, streaksRes, userJson] = await Promise.allSettled([
        query(`SELECT COUNT(*) as count FROM "warns_${q}"`),
        query(`SELECT COUNT(*) as count FROM "timeouts_${q}"`),
        query(`SELECT COUNT(*) as count FROM "bans_${q}"`),
        query(`SELECT * FROM streaks WHERE user_id = $1`, [q]),
        readUserJson(q)
      ]);

      const warnsCount = warnsRes.status === 'fulfilled' ? parseInt(warnsRes.value.rows[0]?.count || '0', 10) : 0;
      const timeoutsCount = timeoutsRes.status === 'fulfilled' ? parseInt(timeoutsRes.value.rows[0]?.count || '0', 10) : 0;
      const bansCount = bansRes.status === 'fulfilled' ? parseInt(bansRes.value.rows[0]?.count || '0', 10) : 0;
      const streaks = streaksRes.status === 'fulfilled' && streaksRes.value.rows.length > 0 ? streaksRes.value.rows[0] : null;
      
      const userData = userJson.status === 'fulfilled' && userJson.value ? userJson.value : { data: { coins: 0, tasks_remaining: 0, tasks_completed: 0, last_5: [] }, tasks: [] };

      return NextResponse.json({
        results: [
          {
            ...discordInfo,
            stats: {
              warns: warnsCount,
              timeouts: timeoutsCount,
              bans: bansCount,
              streaks: streaks?.streak || 0,
              completed_today: streaks?.completed_today || false,
              tasks_remaining: userData.data?.tasks_remaining || 0,
              tasks_completed: userData.data?.tasks_completed || 0,
            },
          },
        ],
      });
    }

    return NextResponse.json({ results: [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
