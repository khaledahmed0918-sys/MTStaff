import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserInfo, getEmojiDetails } from '@/lib/bot';
import fs from 'fs/promises';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!guildId) {
    return NextResponse.json({ error: 'Missing GUILD_ID in env' }, { status: 500 });
  }

  try {
    // Run all queries concurrently to improve speed
    const [discordRes, warnsRes, swarnsRes, timeoutsRes, bansRes, streaksRes, messagesRes, voiceRes] = await Promise.allSettled([
      getUserInfo(guildId, id),
      query(`SELECT * FROM "warns_${id}" ORDER BY date_warn DESC`),
      query(`SELECT * FROM "swarns_${id}" ORDER BY date_warn DESC`),
      query(`SELECT * FROM "timeouts_${id}" ORDER BY date DESC`),
      query(`SELECT * FROM "bans_${id}" ORDER BY date DESC`),
      query(`SELECT * FROM streaks WHERE user_id = $1`, [id]),
      query(`SELECT * FROM messages WHERE user_id = $1`, [id]),
      query(`SELECT * FROM voice WHERE user_id = $1`, [id])
    ]);

    const discordInfo = discordRes.status === 'fulfilled' ? discordRes.value : null;
    const warns = warnsRes.status === 'fulfilled' ? warnsRes.value.rows : [];
    const swarns = swarnsRes.status === 'fulfilled' ? swarnsRes.value.rows : [];
    const timeouts = timeoutsRes.status === 'fulfilled' ? timeoutsRes.value.rows : [];
    const bans = bansRes.status === 'fulfilled' ? bansRes.value.rows : [];
    const streaks = streaksRes.status === 'fulfilled' && streaksRes.value.rows.length > 0 ? streaksRes.value.rows[0] : null;
    const messages = messagesRes.status === 'fulfilled' && messagesRes.value.rows.length > 0 ? messagesRes.value.rows[0] : null;
    const voice = voiceRes.status === 'fulfilled' && voiceRes.value.rows.length > 0 ? voiceRes.value.rows[0] : null;

    let coinsData = { coins: 0, tasks_remaining: 0, tasks_completed: 0, last_5: [] };
    let tasksList = [];
    try {
      const coinsPath = path.join('/root/mtcoins/data/users', `${id}.json`);
      const coinsContent = await fs.readFile(coinsPath, 'utf-8');
      const parsedCoins = JSON.parse(coinsContent);
      if (parsedCoins && parsedCoins.data) {
        coinsData = {
          coins: parsedCoins.data.coins || 0,
          tasks_remaining: parsedCoins.data.tasks_remaining || 0,
          tasks_completed: parsedCoins.data.tasks_completed || 0,
          last_5: parsedCoins.data.last_5 || []
        };
      }
      if (parsedCoins && parsedCoins.tasks) {
        tasksList = parsedCoins.tasks;
      }
    } catch (e) {
      // Ignore if file doesn't exist
    }

    let ticketsCount = 0;
    try {
      const pointsPath = path.join(process.cwd(), '..', 'MTC-System', 'data', 'Tickets', 'points.json');
      const pointsData = await fs.readFile(pointsPath, 'utf-8');
      const points = JSON.parse(pointsData);
      if (points[id]) {
        ticketsCount = points[id];
      }
    } catch (e) {
      console.error('Error reading ticket points:', e);
    }

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
        tickets: ticketsCount,
        coins: {
          coins: coinsData.coins || 0,
          tasks_remaining: coinsData.tasks_remaining || 0,
          tasks_completed: coinsData.tasks_completed || 0,
          last_5: coinsData.last_5 || []
        },
        tasks: tasksList
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
