import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserInfo } from '@/lib/bot';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!guildId) {
    return NextResponse.json({ error: 'Missing GUILD_ID in env' }, { status: 500 });
  }

  try {
    // Fetch Discord Info
    const discordInfo = await getUserInfo(guildId, id);

    // Fetch Postgres Info
    // Note: The prompt specified tables like warns_userId, timeouts_userId, bans_userId
    // We need to dynamically query them. If they don't exist, we should catch the error and return empty arrays.
    
    let warns = [];
    let timeouts = [];
    let bans = [];
    let streaks = null;

    try {
      const warnsRes = await query(`SELECT * FROM "warns_${id}" ORDER BY date_warn DESC`);
      warns = warnsRes.rows;
    } catch (e) {
      // Table might not exist
    }

    try {
      const timeoutsRes = await query(`SELECT * FROM "timeouts_${id}" ORDER BY date DESC`);
      timeouts = timeoutsRes.rows;
    } catch (e) {
      // Table might not exist
    }

    try {
      const bansRes = await query(`SELECT * FROM "bans_${id}" ORDER BY date DESC`);
      bans = bansRes.rows;
    } catch (e) {
      // Table might not exist
    }

    try {
      const streaksRes = await query(`SELECT * FROM streaks WHERE user_id = $1`, [id]);
      if (streaksRes.rows.length > 0) {
        streaks = streaksRes.rows[0];
      }
    } catch (e) {
      // Table might not exist
    }

    return NextResponse.json({
      discord: discordInfo,
      db: {
        warns,
        timeouts,
        bans,
        streaks,
      },
    });
  } catch (err) {
    console.error('Error fetching user data:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
