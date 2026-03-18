import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/bot';

export async function GET() {
  try {
    const guildId = process.env.DISCORD_GUILD_ID;
    if (!client.isReady()) {
      await new Promise((resolve) => client.once('ready', resolve));
    }
    const guild = await client.guilds.fetch(guildId!);
    return NextResponse.json(guild.roles.cache.map(r => ({ id: r.id, name: r.name })));
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
