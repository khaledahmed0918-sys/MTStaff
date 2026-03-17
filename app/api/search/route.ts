import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserInfo, getRandomMembers } from '@/lib/bot';

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
        const [warnsRes, timeoutsRes, bansRes, streaksRes] = await Promise.allSettled([
          query(`SELECT COUNT(*) as count FROM "warns_${member.id}"`),
          query(`SELECT COUNT(*) as count FROM "timeouts_${member.id}"`),
          query(`SELECT COUNT(*) as count FROM "bans_${member.id}"`),
          query(`SELECT * FROM streaks WHERE user_id = $1`, [member.id])
        ]);

        const warnsCount = warnsRes.status === 'fulfilled' ? parseInt(warnsRes.value.rows[0]?.count || '0', 10) : 0;
        const timeoutsCount = timeoutsRes.status === 'fulfilled' ? parseInt(timeoutsRes.value.rows[0]?.count || '0', 10) : 0;
        const bansCount = bansRes.status === 'fulfilled' ? parseInt(bansRes.value.rows[0]?.count || '0', 10) : 0;
        const streaks = streaksRes.status === 'fulfilled' && streaksRes.value.rows.length > 0 ? streaksRes.value.rows[0] : null;

        return {
          ...member,
          stats: {
            warns: warnsCount,
            timeouts: timeoutsCount,
            bans: bansCount,
            streaks: streaks?.streak || 0,
          }
        };
      }));

      return NextResponse.json({ results });
    }

    // If the query is an ID, we can fetch their info directly
    const discordInfo = await getUserInfo(guildId, q);

    if (discordInfo) {
      const [warnsRes, timeoutsRes, bansRes, streaksRes] = await Promise.allSettled([
        query(`SELECT COUNT(*) as count FROM "warns_${q}"`),
        query(`SELECT COUNT(*) as count FROM "timeouts_${q}"`),
        query(`SELECT COUNT(*) as count FROM "bans_${q}"`),
        query(`SELECT * FROM streaks WHERE user_id = $1`, [q])
      ]);

      const warnsCount = warnsRes.status === 'fulfilled' ? parseInt(warnsRes.value.rows[0]?.count || '0', 10) : 0;
      const timeoutsCount = timeoutsRes.status === 'fulfilled' ? parseInt(timeoutsRes.value.rows[0]?.count || '0', 10) : 0;
      const bansCount = bansRes.status === 'fulfilled' ? parseInt(bansRes.value.rows[0]?.count || '0', 10) : 0;
      const streaks = streaksRes.status === 'fulfilled' && streaksRes.value.rows.length > 0 ? streaksRes.value.rows[0] : null;

      return NextResponse.json({
        results: [
          {
            ...discordInfo,
            stats: {
              warns: warnsCount,
              timeouts: timeoutsCount,
              bans: bansCount,
              streaks: streaks?.streak || 0,
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
