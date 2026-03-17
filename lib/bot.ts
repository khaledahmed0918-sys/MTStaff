import { Client, GatewayIntentBits } from 'discord.js';

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
  client.login(process.env.DISCORD_BOT_TOKEN).catch(console.error);
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
    console.error('Error checking role:', err);
    return false;
  }
}

export async function getServerInfo(guildId: string) {
  try {
    if (!client.isReady()) {
      await new Promise((resolve) => client.once('ready', resolve));
    }

    const guild = await client.guilds.fetch({ guild: guildId, withCounts: true });

    return {
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL({ forceStatic: false, size: 512 }),
      banner: guild.bannerURL({ forceStatic: false, size: 1024 }),
      memberCount: guild.approximateMemberCount || guild.memberCount || 0,
      onlineCount: guild.approximatePresenceCount || 0,
      ownerId: guild.ownerId,
    };
  } catch (err) {
    console.error('Error fetching server info:', err);
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
        .map((r) => ({ id: r.id, name: r.name, color: r.hexColor })),
    };
  } catch (err) {
    console.error('Error fetching user info:', err);
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
      console.error('Error fetching fallback user info:', fallbackErr);
      return null;
    }
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
          .map((r) => ({ id: r.id, name: r.name, color: r.hexColor })),
      };
    }));
  } catch (err) {
    console.error('Error fetching random members:', err);
    return [];
  }
}
