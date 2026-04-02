import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserInfo, getRandomMembers } from '@/lib/bot';
import { getSession } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

async function getPrivacyData() {
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'privacy.json'), 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!guildId) {
    return NextResponse.json({ error: 'Missing GUILD_ID' }, { status: 500 });
  }

  try {
    const session = await getSession();
    const viewerId = session?.user?.id;

    if (!q) {
      const randomMembers = await getRandomMembers(guildId, 10);
      const privacyData = await getPrivacyData();
      
      // Fetch stats for these random members
      const results = await Promise.all(randomMembers.map(async (member) => {
        const userPrivacy = privacyData[member.id] || { 
          showProfile: true, 
          hideStats: false,
          pointsVisibility: 'everyone'
        };
        
        const isSelf = viewerId === member.id;
        const isFriend = !!viewerId; // Simple logic: any logged in user is a "friend" in this community context

        const canSeeProfile = userPrivacy.showProfile || isSelf;
        const canSeeStats = !userPrivacy.hideStats || isSelf;
        const canSeePoints = 
          userPrivacy.pointsVisibility === 'everyone' || 
          (userPrivacy.pointsVisibility === 'friends' && isFriend) || 
          isSelf;

        if (!canSeeProfile) {
          return {
            ...member,
            isHidden: true,
            stats: null
          };
        }
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

        let coinsData = { tasks_remaining: 0, tasks_completed: 0 };
        if (canSeePoints) {
          try {
            const coinsPath = path.join('/root/mtcoins/data/users', `${member.id}.json`);
            const coinsContent = await fs.readFile(coinsPath, 'utf-8');
            const parsedCoins = JSON.parse(coinsContent);
            if (parsedCoins && parsedCoins.data) {
              coinsData = {
                tasks_remaining: parsedCoins.data.tasks_remaining || 0,
                tasks_completed: parsedCoins.data.tasks_completed || 0
              };
            }
          } catch (e) {
            // Ignore if file doesn't exist
          }
        }

        return {
          ...member,
          isHidden: false,
          hideStats: !canSeeStats,
          hidePoints: !canSeePoints,
          stats: canSeeStats ? {
            warns: warnsCount,
            timeouts: timeoutsCount,
            bans: bansCount,
            streaks: streaks?.streak || 0,
            completed_today: streaks?.completed_today || false,
            tasks_remaining: coinsData.tasks_remaining,
            tasks_completed: coinsData.tasks_completed,
          } : null
        };
      }));

      return NextResponse.json({ results });
    }

    // If the query is an ID, we can fetch their info directly
    const discordInfo = await getUserInfo(guildId, q);
    const privacyData = await getPrivacyData();
    const userPrivacy = privacyData[q] || { 
      showProfile: true, 
      hideStats: false,
      pointsVisibility: 'everyone'
    };

    const isSelf = viewerId === q;
    const isFriend = !!viewerId;

    const canSeeProfile = userPrivacy.showProfile || isSelf;
    const canSeeStats = !userPrivacy.hideStats || isSelf;
    const canSeePoints = 
      userPrivacy.pointsVisibility === 'everyone' || 
      (userPrivacy.pointsVisibility === 'friends' && isFriend) || 
      isSelf;

    if (discordInfo) {
      if (!canSeeProfile) {
        return NextResponse.json({
          results: [
            {
              ...discordInfo,
              isHidden: true,
              stats: null
            }
          ]
        });
      }
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

      let coinsData = { tasks_remaining: 0, tasks_completed: 0 };
      if (canSeePoints) {
        try {
          const coinsPath = path.join('/root/mtcoins/data/users', `${q}.json`);
          const coinsContent = await fs.readFile(coinsPath, 'utf-8');
          const parsedCoins = JSON.parse(coinsContent);
          if (parsedCoins && parsedCoins.data) {
            coinsData = {
              tasks_remaining: parsedCoins.data.tasks_remaining || 0,
              tasks_completed: parsedCoins.data.tasks_completed || 0
            };
          }
        } catch (e) {
          // Ignore if file doesn't exist
        }
      }

      return NextResponse.json({
        results: [
          {
            ...discordInfo,
            isHidden: false,
            hideStats: !canSeeStats,
            hidePoints: !canSeePoints,
            stats: canSeeStats ? {
              warns: warnsCount,
              timeouts: timeoutsCount,
              bans: bansCount,
              streaks: streaks?.streak || 0,
              completed_today: streaks?.completed_today || false,
              tasks_remaining: coinsData.tasks_remaining,
              tasks_completed: coinsData.tasks_completed,
            } : null,
          },
        ],
      });
    }

    return NextResponse.json({ results: [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
