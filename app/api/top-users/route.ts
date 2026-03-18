import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/bot';

export async function GET(req: NextRequest) {
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!guildId) {
    return NextResponse.json({ error: 'Missing GUILD_ID in env' }, { status: 500 });
  }

  try {
    if (!client.isReady()) {
      await new Promise((resolve) => client.once('ready', resolve));
    }

    const guild = await client.guilds.fetch(guildId);
    await guild.members.fetch(); 

    const rolesToFetch = [
      { id: '1403330102149910528', key: 'topDay', title: 'Top Day', icon: '🔥' },
      { id: '1383190205103607873', key: 'topWeek', title: 'Top Week', icon: '⭐' },
      { id: '1383190135905976511', key: 'topOverall', title: 'Most Active', icon: '👑' }
    ];

    const result: any = {};

    for (const r of rolesToFetch) {
      const role = guild.roles.cache.get(r.id);
      if (role && role.members.size > 0) {
        // Get the first member with this role (or all of them)
        const members = Array.from(role.members.values()).slice(0, 3).map(member => {
          const user = member.user;
          return {
            id: user.id,
            username: user.username,
            displayName: user.globalName || user.displayName || user.username,
            avatar: user.displayAvatarURL({ forceStatic: false, size: 256 }),
            avatarDecoration: user.avatarDecorationURL({ size: 256 }),
            roleColor: role.hexColor !== '#000000' ? role.hexColor : '#ffffff',
            roleName: role.name
          };
        });
        result[r.key] = { ...r, members };
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Error fetching top users:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
