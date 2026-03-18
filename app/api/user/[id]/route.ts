import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserInfo, getEmojiDetails } from '@/lib/bot';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!guildId) {
    return NextResponse.json({ error: 'Missing GUILD_ID in env' }, { status: 500 });
  }

  try {
    // Run all queries concurrently to improve speed
    const [discordRes, warnsRes, swarnsRes, timeoutsRes, bansRes, streaksRes, messagesRes, voiceRes, coinsRes, tasksRes] = await Promise.allSettled([
      getUserInfo(guildId, id),
      query(`SELECT * FROM "warns_${id}" ORDER BY date_warn DESC`),
      query(`SELECT * FROM "swarns_${id}" ORDER BY date_warn DESC`),
      query(`SELECT * FROM "timeouts_${id}" ORDER BY date DESC`),
      query(`SELECT * FROM "bans_${id}" ORDER BY date DESC`),
      query(`SELECT * FROM streaks WHERE user_id = $1`, [id]),
      query(`SELECT * FROM messages WHERE user_id = $1`, [id]),
      query(`SELECT * FROM voice WHERE user_id = $1`, [id]),
      query(`SELECT * FROM coins WHERE user_id = $1`, [id]),
      query(`SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC`, [id])
    ]);

    const discordInfo = discordRes.status === 'fulfilled' ? discordRes.value : null;
    const warns = warnsRes.status === 'fulfilled' ? warnsRes.value.rows : [];
    const swarns = swarnsRes.status === 'fulfilled' ? swarnsRes.value.rows : [];
    const timeouts = timeoutsRes.status === 'fulfilled' ? timeoutsRes.value.rows : [];
    const bans = bansRes.status === 'fulfilled' ? bansRes.value.rows : [];
    const streaks = streaksRes.status === 'fulfilled' && streaksRes.value.rows.length > 0 ? streaksRes.value.rows[0] : null;
    const messages = messagesRes.status === 'fulfilled' && messagesRes.value.rows.length > 0 ? messagesRes.value.rows[0] : null;
    const voice = voiceRes.status === 'fulfilled' && voiceRes.value.rows.length > 0 ? voiceRes.value.rows[0] : null;
    const coins = coinsRes.status === 'fulfilled' && coinsRes.value.rows.length > 0 ? coinsRes.value.rows[0] : null;
    const tasks = tasksRes.status === 'fulfilled' ? tasksRes.value.rows : [];

    if (streaks && streaks.streak_emoji) {
      const emojiDetails = await getEmojiDetails(guildId, streaks.streak_emoji);
      if (emojiDetails) {
        streaks.streak_emoji_url = emojiDetails.url;
      }
    }

    return NextResponse.json({
      discord: discordInfo,
      db: {
        warns,
        swarns,
        timeouts,
        bans,
        streaks,
        messages,
        voice,
        coins,
        tasks,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
