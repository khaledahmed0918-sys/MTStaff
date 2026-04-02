import { Client, GatewayIntentBits } from 'discord.js';
import { query } from '@/lib/db';
import { ADMIN_GROUPS } from '@/lib/constants';

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
      premiumTier: guild.premium_tier || 0,
      premiumSubscriptionCount: guild.premium_subscription_count || 0,
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
      nickname: member.nickname,
      discriminator: user.discriminator,
      tag: user.tag,
      avatar: user.displayAvatarURL({ forceStatic: false, size: 512 }),
      avatarDecoration: user.avatarDecorationURL({ size: 512 }),
      banner: user.bannerURL({ forceStatic: false, size: 1024 }),
      nameplate: user.bannerURL({ forceStatic: false, size: 1024 }),
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
        nickname: null,
        discriminator: user.discriminator,
        tag: user.tag,
        avatar: user.displayAvatarURL({ forceStatic: false, size: 512 }),
        avatarDecoration: user.avatarDecorationURL({ size: 512 }),
        banner: user.bannerURL({ forceStatic: false, size: 1024 }),
        nameplate: user.bannerURL({ forceStatic: false, size: 1024 }),
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

let cachedAdminMembers: any = null;
let lastAdminFetch = 0;
let isFetchingAdmin = false;

async function fetchAdminMembersBackground(guildId: string) {
  if (isFetchingAdmin) return;
  isFetchingAdmin = true;
  try {
    if (!client.isReady()) {
      await new Promise((resolve) => client.once('ready', resolve));
    }

    const guild = await client.guilds.fetch(guildId);
    
    // Fetch all members using Gateway (much faster than REST chunks)
    await guild.members.fetch();
    const allMembers = Array.from(guild.members.cache.values());

    const result = [];
    const processedUserIds = new Set();

    // Flatten all role IDs to determine global priority
    const allRoleIds = ADMIN_GROUPS.flatMap(g => g.roles.map(r => r.id));

    for (const group of ADMIN_GROUPS) {
      const groupRoles = [];
      
      for (const roleConfig of group.roles) {
        const role = guild.roles.cache.get(roleConfig.id);
        if (!role) continue;

        const roleMembers = [];
        // Find members whose HIGHEST admin role is this one
        const membersWithRole = allMembers.filter(m => {
          if (processedUserIds.has(m.user.id)) return false;
          
          const memberRoleIds = Array.from(m.roles.cache.keys());
          
          // Check if this is their highest role among all admin roles
          const memberAdminRoles = memberRoleIds.filter(rId => allRoleIds.includes(rId));
          if (memberAdminRoles.length === 0) return false;
          
          // Find the index of each role in allRoleIds (lower index = higher priority)
          const highestRoleIndex = Math.min(...memberAdminRoles.map(rId => allRoleIds.indexOf(rId)));
          
          if (allRoleIds[highestRoleIndex] === roleConfig.id) {
            processedUserIds.add(m.user.id);
            return true;
          }
          return false;
        });

        for (const member of membersWithRole) {
          const user = member.user;
          
          // Find highest role color for the member
          let highestPosition = -1;
          let highestColor = '#ffffff';
          for (const r of member.roles.cache.values()) {
            if (r.position > highestPosition) {
              highestPosition = r.position;
              highestColor = r.hexColor !== '#000000' ? r.hexColor : '#ffffff';
            }
          }

          roleMembers.push({
            id: user.id,
            username: user.username,
            displayName: user.globalName || user.username,
            avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256` : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || '0') % 5}.png`,
            avatarDecoration: (user as any).avatarDecoration ? `https://cdn.discordapp.com/avatar-decoration-presets/${(user as any).avatarDecoration}.png?size=256` : null,
            highestRoleColor: highestColor,
          });
        }

        if (roleMembers.length > 0) {
          groupRoles.push({
            id: role.id,
            name: role.name,
            color: role.hexColor !== '#000000' ? role.hexColor : '#ffffff',
            icon: role.iconURL(),
            members: roleMembers
          });
        }
      }

      if (groupRoles.length > 0) {
        result.push({
          name: group.name,
          roles: groupRoles
        });
      }
    }

    cachedAdminMembers = result;
    lastAdminFetch = Date.now();
  } catch (err) {
    console.error('Error fetching admin members in background:', err);
  } finally {
    isFetchingAdmin = false;
  }
}

export async function getAdminMembers(guildId: string) {
  if (cachedAdminMembers && Date.now() - lastAdminFetch < 5 * 60 * 1000) {
    return cachedAdminMembers;
  }

  // If cache is empty or stale, trigger background fetch
  fetchAdminMembersBackground(guildId);

  // If we have stale cache, return it while fetching
  if (cachedAdminMembers) {
    return cachedAdminMembers;
  }

  // If no cache at all, wait a bit to see if it finishes quickly (e.g. first 1000 members)
  // But we don't want to block for 19 seconds. We'll wait up to 5 seconds.
  let retries = 0;
  while (!cachedAdminMembers && retries < 10) {
    await new Promise(resolve => setTimeout(resolve, 500));
    retries++;
  }

  return cachedAdminMembers || [];
}

export async function getAdminWithStats(guildId: string) {
  const adminCategories = await getAdminMembers(guildId);
  
  const userIds: string[] = [];
  for (const category of adminCategories) {
    for (const role of category.roles) {
      for (const member of role.members) {
        userIds.push(member.id);
      }
    }
  }

  if (userIds.length === 0) {
    return adminCategories;
  }

  const placeholders = userIds.map((_, i) => `$${i + 1}`).join(',');
  
  const [streaksRes, messagesRes] = await Promise.allSettled([
    query(`SELECT user_id, streak, completed_today FROM streaks WHERE user_id IN (${placeholders})`, userIds),
    query(`SELECT user_id, "all" as total, top_day as daily, top_week as weekly, top_month as monthly FROM messages WHERE user_id IN (${placeholders})`, userIds)
  ]);

  const streaksMap = new Map();
  if (streaksRes.status === 'fulfilled') {
    streaksRes.value.rows.forEach(row => streaksMap.set(row.user_id, { streak: row.streak, completed_today: row.completed_today }));
  }

  const messagesMap = new Map();
  if (messagesRes.status === 'fulfilled') {
    messagesRes.value.rows.forEach(row => messagesMap.set(row.user_id, row));
  }

  const coinsMap = new Map();
  try {
    const fs = require('fs/promises');
    const path = require('path');
    const coinsDir = '/root/mtcoins/data/users/';
    
    await Promise.all(userIds.map(async (userId) => {
      try {
        const content = await fs.readFile(path.join(coinsDir, `${userId}.json`), 'utf-8');
        const data = JSON.parse(content);
        if (data && data.data) {
          coinsMap.set(userId, {
            tasks_remaining: data.data.tasks_remaining || 0,
            tasks_completed: data.data.tasks_completed || 0
          });
        }
      } catch (e) {
        // Ignore individual file read errors
      }
    }));
  } catch (e) {
    console.error('Error reading mtcoins directory:', e);
  }

  const swarnsMap = new Map();
  const warnsMap = new Map();
  const timeoutsMap = new Map();
  const bansMap = new Map();

  // Read ticket points
  const pointsMap = new Map();
  try {
    const fs = require('fs/promises');
    const pointsRaw = await fs.readFile('/root/MTC-System/data/Tickets/points.json', 'utf-8');
    const pointsData = JSON.parse(pointsRaw);
    for (const [uid, pts] of Object.entries(pointsData)) {
      pointsMap.set(uid, Number(pts));
    }
  } catch (e) {
    // Ignore if file doesn't exist
  }

  await Promise.allSettled(userIds.map(async (id) => {
    try {
      const [swarnsRes, warnsRes, timeoutsRes] = await Promise.all([
        query(`SELECT * FROM "swarns_${id}" ORDER BY date DESC`),
        query(`SELECT * FROM "warns_${id}" ORDER BY date_warn DESC`),
        query(`SELECT * FROM "timeouts_${id}" ORDER BY date DESC`)
      ]);
      
      swarnsMap.set(id, swarnsRes.rows);
      warnsMap.set(id, warnsRes.rows);
      timeoutsMap.set(id, timeoutsRes.rows);
      bansMap.set(id, []); // Bans table not found
    } catch (e) {
      swarnsMap.set(id, []);
      warnsMap.set(id, []);
      timeoutsMap.set(id, []);
      bansMap.set(id, []);
    }
  }));

  for (const category of adminCategories) {
    for (const role of category.roles) {
      for (const member of role.members) {
        const streakData = streaksMap.get(member.id) || { streak: 0, completed_today: false };
        const coinData = coinsMap.get(member.id) || { tasks_remaining: '', tasks_completed: '' };
        (member as any).stats = {
          streak: streakData.streak,
          completed_today: streakData.completed_today,
          tasks_remaining: coinData.tasks_remaining,
          tasks_completed: coinData.tasks_completed,
          messages: messagesMap.get(member.id) || { total: 0, daily: 0, weekly: 0, monthly: 0 },
          swarns: swarnsMap.get(member.id) || [],
          warns: warnsMap.get(member.id) || [],
          timeouts: timeoutsMap.get(member.id) || [],
          bans: bansMap.get(member.id) || [],
          tickets: pointsMap.get(member.id) || 0
        };
      }
    }
  }

  return adminCategories;
}

export async function getTopUsers(guildId: string) {
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

    return result;
  } catch (err) {
    console.error('Error fetching top users:', err);
    return null;
  }
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

export async function getAllUsersWithStats(guildId: string) {
  try {
    if (!client.isReady()) {
      await new Promise((resolve) => client.once('ready', resolve));
    }

    const guild = await client.guilds.fetch(guildId);
    
    // Fetch all members using Gateway (much faster than REST chunks)
    await guild.members.fetch();
    const allMembers = Array.from(guild.members.cache.values());

    const userIds = allMembers.map(m => m.user.id);
    
    if (userIds.length === 0) return [];

    // We need to query in chunks if there are too many users, but let's try to get all at once if < 10000
    // Actually, it's better to just get all records from the DB and map them.
    const [streaksRes, messagesRes, voiceRes] = await Promise.allSettled([
      query(`SELECT user_id, streak FROM streaks`),
      query(`SELECT user_id, "all" as total FROM messages`),
      query(`SELECT user_id, "all" as total FROM voice`)
    ]);

    const streaksMap = new Map();
    if (streaksRes.status === 'fulfilled') {
      streaksRes.value.rows.forEach(row => streaksMap.set(row.user_id, row.streak || 0));
    }

    const messagesMap = new Map();
    if (messagesRes.status === 'fulfilled') {
      messagesRes.value.rows.forEach(row => messagesMap.set(row.user_id, row.total || 0));
    }

    const voiceMap = new Map();
    if (voiceRes.status === 'fulfilled') {
      voiceRes.value.rows.forEach(row => voiceMap.set(row.user_id, row.total || 0));
    }

    // Read mtcoins from JSON files
    const mtcoinsMap = new Map();
    try {
      const fs = require('fs/promises');
      const path = require('path');
      const coinsDir = '/root/mtcoins/data/users/';
      const files = await fs.readdir(coinsDir);
      
      // Process in chunks of 100 to avoid EMFILE
      const chunkSize = 100;
      for (let i = 0; i < files.length; i += chunkSize) {
        const chunk = files.slice(i, i + chunkSize);
        await Promise.all(chunk.map(async (file: string) => {
          if (file.endsWith('.json')) {
            const userId = file.replace('.json', '');
            try {
              const content = await fs.readFile(path.join(coinsDir, file), 'utf-8');
              const data = JSON.parse(content);
              if (data && data.data && typeof data.data.coins === 'number') {
                mtcoinsMap.set(userId, data.data.coins);
              }
            } catch (e) {
              // Ignore individual file read errors
            }
          }
        }));
      }
    } catch (e) {
      console.error('Error reading mtcoins directory:', e);
    }

    // Read ticket points
    const pointsMap = new Map();
    try {
      const fs = require('fs/promises');
      const pointsRaw = await fs.readFile('/root/MTC-System/data/Tickets/points.json', 'utf-8');
      const pointsData = JSON.parse(pointsRaw);
      for (const [uid, pts] of Object.entries(pointsData)) {
        pointsMap.set(uid, Number(pts));
      }
    } catch (e) {
      // Ignore if file doesn't exist
    }

    const result = allMembers.map(member => {
      const user = member.user;
      
      // Find highest role
      let highestPosition = -1;
      let highestRoleName = '';
      let highestColor = '#ffffff';
      
      for (const r of member.roles.cache.values()) {
        if (r.position > highestPosition) {
          highestPosition = r.position;
          highestRoleName = r.name;
          highestColor = r.hexColor !== '#000000' ? r.hexColor : '#ffffff';
        }
      }

      return {
        id: user.id,
        username: user.username,
        displayName: user.globalName || user.displayName || user.username,
        avatar: user.displayAvatarURL({ forceStatic: false, size: 256 }),
        avatarDecoration: user.avatarDecorationURL({ size: 256 }),
        highestRoleColor: highestColor,
        highestRoleName: highestRoleName,
        rolesCount: member.roles.cache.size,
        stats: {
          streak: streaksMap.get(user.id) || 0,
          messages: messagesMap.get(user.id) || 0,
          voice: voiceMap.get(user.id) || 0,
          mtcoins: mtcoinsMap.get(user.id) || 0,
          tickets: pointsMap.get(user.id) || 0,
        }
      };
    });

    return result;
  } catch (err) {
    console.error('Error fetching all users with stats:', err);
    return [];
  }
}
