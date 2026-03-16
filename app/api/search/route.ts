import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserInfo } from '@/lib/bot';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!guildId) {
    return NextResponse.json({ error: 'Missing GUILD_ID' }, { status: 500 });
  }

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  try {
    // If the query is an ID, we can fetch their info directly
    const discordInfo = await getUserInfo(guildId, q);

    if (discordInfo) {
      let warnsCount = 0;
      let timeoutsCount = 0;
      let bansCount = 0;
      let streaks = null;

      try {
        const warnsRes = await query(`SELECT COUNT(*) as count FROM "warns_${q}"`);
        warnsCount = parseInt(warnsRes.rows[0].count, 10);
      } catch (e) {}

      try {
        const timeoutsRes = await query(`SELECT COUNT(*) as count FROM "timeouts_${q}"`);
        timeoutsCount = parseInt(timeoutsRes.rows[0].count, 10);
      } catch (e) {}

      try {
        const bansRes = await query(`SELECT COUNT(*) as count FROM "bans_${q}"`);
        bansCount = parseInt(bansRes.rows[0].count, 10);
      } catch (e) {}

      try {
        const streaksRes = await query(`SELECT * FROM streaks WHERE user_id = $1`, [q]);
        if (streaksRes.rows.length > 0) {
          streaks = streaksRes.rows[0];
        }
      } catch (e) {}

      return NextResponse.json({
        results: [
          {
            id: discordInfo.id,
            username: discordInfo.username,
            tag: discordInfo.tag,
            avatar: discordInfo.avatar,
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
    console.error('Search error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
