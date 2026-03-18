import { Client, GatewayIntentBits } from 'discord.js';
import { query } from '@/lib/db';

// Use a singleton pattern to prevent multiple clients in dev
const globalForDiscord = global as unknown as { discordClient: Client };

export const client =
  globalForDiscord.discordClient ||
  new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences],
  });

if (process.env.NODE_ENV !== 'production') globalForDiscord.discordClient = client;

let isReady = false;

client.once('ready', () => {
  isReady = true;
  // Removed console.log

});

if (!isReady && process.env.DISCORD_BOT_TOKEN) {
  client.login(process.env.DISCORD_BOT_TOKEN).catch(() => {});
}

export async function getEmojiDetails(guildId: string, emojiIdOrString: string) {
  try {
    if (!emojiIdOrString) return null;
    
    let emojiId = emojiIdOrString;
    const match = emojiIdOrString.match(/<a?:[^:]+:(\d+)>/);
    if (match) {
      emojiId = match[1];
    }

    if (!client.isReady()) {
      await new Promise((resolve) => client.once('ready', resolve));
    }

    const guild = await client.guilds.fetch(guildId);
    const emoji = guild.emojis.cache.get(emojiId);
    
    if (emoji) {
      return {
        name: emoji.name,
        animated: emoji.animated,
        url: emoji.url
      };
    }
    return null;
  } catch (err) {
    return null;
  }
}

export async function hasRole(guildId: string, userId: string, roleId: string) {
  try {
    if (!client.isReady()) {
      await new Promise((resolve) => client.once('ready', resolve));
    }

    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    return member.roles.cache.has(roleId);
  } catch (err) {
    return false;
  }
}

export async function getServerInfo(guildId: string) {
  try {
    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }

    const guild = await response.json();
    return {
      id: guild.id,
      name: guild.name,
      icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith('a_') ? 'gif' : 'png'}?size=512` : null,
      banner: guild.banner ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.${guild.banner.startsWith('a_') ? 'gif' : 'png'}?size=1024` : null,
      memberCount: guild.approximate_member_count || 0,
      onlineCount: guild.approximate_presence_count || 0,
      ownerId: guild.owner_id,
    };
  } catch (err) {
    return null;
  }
}

export async function getUserInfo(guildId: string, userId: string) {
  try {
    if (!client.isReady()) {
      await new Promise((resolve) => client.once('ready', resolve));
    }

    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    const user = await member.user.fetch(); // Fetch full user to get banner

    const highestRole = member.roles.highest;
    const highestRoleColor = highestRole.hexColor !== '#000000' ? highestRole.hexColor : '#ffffff';

    return {
      id: user.id,
      username: user.username,
      displayName: user.globalName || user.displayName || user.username,
      discriminator: user.discriminator,
      tag: user.tag,
      avatar: user.displayAvatarURL({ forceStatic: false, size: 512 }),
      avatarDecoration: user.avatarDecorationURL({ size: 512 }),
      banner: user.bannerURL({ forceStatic: false, size: 1024 }),
      bannerColor: user.hexAccentColor,
      createdAt: user.createdAt,
      joinedAt: member.joinedAt,
      highestRoleColor,
      roles: member.roles.cache
        .filter(r => r.name !== '@everyone')
        .sort((a, b) => b.position - a.position)
        .map((r) => ({ id: r.id, name: r.name, color: r.hexColor, icon: r.iconURL() })),
    };
  } catch (err) {
    try {
      const user = await client.users.fetch(userId, { force: true });
      return {
        id: user.id,
        username: user.username,
        displayName: user.globalName || user.displayName || user.username,
        discriminator: user.discriminator,
        tag: user.tag,
        avatar: user.displayAvatarURL({ forceStatic: false, size: 512 }),
        avatarDecoration: user.avatarDecorationURL({ size: 512 }),
        banner: user.bannerURL({ forceStatic: false, size: 1024 }),
        bannerColor: user.hexAccentColor,
        createdAt: user.createdAt,
        joinedAt: null,
        highestRoleColor: '#ffffff',
        roles: [],
      };
    } catch (fallbackErr) {
      return null;
    }
  }
}

let cachedStaffMembers: any = null;
let lastStaffFetch = 0;
let isFetchingStaff = false;

async function fetchStaffMembersBackground(guildId: string) {
  if (isFetchingStaff) return;
  isFetchingStaff = true;
  try {
    if (!client.isReady()) {
      await new Promise((resolve) => client.once('ready', resolve));
    }

    const guild = await client.guilds.fetch(guildId);
    
    // Fetch all members using REST to avoid gateway rate limits
    let allMembers: any[] = [];
    let lastId = '0';
    while (true) {
      const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000&after=${lastId}`, {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      });
      if (!res.ok) break;
      const members = await res.json();
      if (members.length === 0) break;
      allMembers = allMembers.concat(members);
      lastId = members[members.length - 1].user.id;
      if (members.length < 1000) break;
    }

    // The order of roles here determines the order of sections
    const roleIds = [
      '1465838966904197294', // Managers
      '1383128056708993219',
      '1404695448081662014',
      '1450422143274713191', // Affairs Team
      '1402719732334985247', // Tickets Helper
      '1383158445846560870', // Admin Of The Week
      '1383158823744966736', // Staff Roles...
      '1383161407742148761',
      '1384525033111552091',
      '1383170653636530318',
      '1383171427066450110',
      '1383172034892398612',
      '1383377717432422401',
      '1383172935753269368'
    ];

    const result = [];
    const processedUserIds = new Set();

    for (const roleId of roleIds) {
      const role = guild.roles.cache.get(roleId);
      if (!role) continue;

      const categoryMembers = [];
      const membersWithRole = allMembers.filter(m => m.roles.includes(roleId));
      
      for (const member of membersWithRole) {
        if (!processedUserIds.has(member.user.id)) {
          processedUserIds.add(member.user.id);
          const user = member.user;
          
          // Find highest role color
          let highestPosition = -1;
          let highestColor = '#ffffff';
          for (const rId of member.roles) {
            const r = guild.roles.cache.get(rId);
            if (r && r.position > highestPosition) {
              highestPosition = r.position;
              highestColor = r.hexColor !== '#000000' ? r.hexColor : '#ffffff';
            }
          }

          categoryMembers.push({
            id: user.id,
            username: user.username,
            displayName: user.global_name || user.username,
            avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256` : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || '0') % 5}.png`,
            avatarDecoration: user.avatar_decoration_data ? `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=256` : null,
            highestRoleColor: highestColor,
          });
        }
      }

      if (categoryMembers.length > 0) {
        result.push({
          id: role.id,
          name: role.name,
          roleInfo: {
            id: role.id,
            name: role.name,
            color: role.hexColor !== '#000000' ? role.hexColor : '#ffffff',
            icon: role.iconURL()
          },
          members: categoryMembers
        });
      }
    }

    cachedStaffMembers = result;
    lastStaffFetch = Date.now();
  } catch (err) {
    console.error('Error fetching staff members in background:', err);
  } finally {
    isFetchingStaff = false;
  }
}

export async function getStaffMembers(guildId: string) {
  if (cachedStaffMembers && Date.now() - lastStaffFetch < 5 * 60 * 1000) {
    return cachedStaffMembers;
  }

  // If cache is empty or stale, trigger background fetch
  fetchStaffMembersBackground(guildId);

  // If we have stale cache, return it while fetching
  if (cachedStaffMembers) {
    return cachedStaffMembers;
  }

  // If no cache at all, wait a bit to see if it finishes quickly (e.g. first 1000 members)
  // But we don't want to block for 19 seconds. We'll wait up to 5 seconds.
  let retries = 0;
  while (!cachedStaffMembers && retries < 10) {
    await new Promise(resolve => setTimeout(resolve, 500));
    retries++;
  }

  return cachedStaffMembers || [];
}

export async function getStaffWithStats(guildId: string) {
  const staffCategories = await getStaffMembers(guildId);
  
  const userIds: string[] = [];
  for (const category of staffCategories) {
    for (const member of category.members) {
      userIds.push(member.id);
    }
  }

  if (userIds.length === 0) {
    return staffCategories;
  }

  const placeholders = userIds.map((_, i) => `$${i + 1}`).join(',');
  
  const [streaksRes, messagesRes] = await Promise.allSettled([
    query(`SELECT user_id, streak FROM streaks WHERE user_id IN (${placeholders})`, userIds),
    query(`SELECT user_id, all as total, top_day as daily, top_week as weekly, top_month as monthly FROM messages WHERE user_id IN (${placeholders})`, userIds)
  ]);

  const streaksMap = new Map();
  if (streaksRes.status === 'fulfilled') {
    streaksRes.value.rows.forEach(row => streaksMap.set(row.user_id, row.streak));
  }

  const messagesMap = new Map();
  if (messagesRes.status === 'fulfilled') {
    messagesRes.value.rows.forEach(row => messagesMap.set(row.user_id, row));
  }

  const swarnsMap = new Map();
  await Promise.allSettled(userIds.map(async (id) => {
    try {
      const res = await query(`SELECT COUNT(*) FROM "swarns_${id}"`);
      swarnsMap.set(id, parseInt(res.rows[0].count, 10));
    } catch (e) {
      swarnsMap.set(id, 0);
    }
  }));

  for (const category of staffCategories) {
    for (const member of category.members) {
      (member as any).stats = {
        streak: streaksMap.get(member.id) || 0,
        messages: messagesMap.get(member.id) || { total: 0, daily: 0, weekly: 0, monthly: 0 },
        swarns: swarnsMap.get(member.id) || 0
      };
    }
  }

  return staffCategories;
}

export async function getRandomMembers(guildId: string, count: number = 10) {
  try {
    if (!client.isReady()) {
      await new Promise((resolve) => client.once('ready', resolve));
    }

    const guild = await client.guilds.fetch(guildId);
    // Fetch a chunk of members to pick from, or use cache if large
    const members = await guild.members.fetch({ limit: 100 });
    
    // Convert to array and shuffle
    const membersArray = Array.from(members.values());
    const shuffled = membersArray.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    return Promise.all(selected.map(async (member) => {
      const user = member.user;
      const highestRole = member.roles.highest;
      const highestRoleColor = highestRole.hexColor !== '#000000' ? highestRole.hexColor : '#ffffff';
      
      return {
        id: user.id,
        username: user.username,
        displayName: user.globalName || user.displayName || user.username,
        discriminator: user.discriminator,
        tag: user.tag,
        avatar: user.displayAvatarURL({ forceStatic: false, size: 512 }),
        avatarDecoration: user.avatarDecorationURL({ size: 512 }),
        banner: user.bannerURL({ forceStatic: false, size: 1024 }),
        createdAt: user.createdAt,
        joinedAt: member.joinedAt,
        highestRoleColor,
        roles: member.roles.cache
          .filter(r => r.name !== '@everyone')
          .sort((a, b) => b.position - a.position)
          .map((r) => ({ id: r.id, name: r.name, color: r.hexColor, icon: r.iconURL() })),
      };
    }));
  } catch (err) {
    return [];
  }
}
