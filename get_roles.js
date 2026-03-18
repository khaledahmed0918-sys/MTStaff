import fs from 'fs';
import { Client, GatewayIntentBits } from 'discord.js';

const env = fs.readFileSync('.env', 'utf8');
const token = env.split('\n').find(line => line.startsWith('DISCORD_BOT_TOKEN=')).split('=')[1];
const guildId = env.split('\n').find(line => line.startsWith('DISCORD_GUILD_ID=')).split('=')[1];

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('ready', async () => {
  const guild = await client.guilds.fetch(guildId);
  console.log('Roles:', guild.roles.cache.map(r => ({ id: r.id, name: r.name })));
  client.destroy();
});

client.login(token);
