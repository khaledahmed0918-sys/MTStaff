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
