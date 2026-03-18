import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const guildId = process.env.DISCORD_GUILD_ID;
    const token = process.env.DISCORD_BOT_TOKEN;
    
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: await res.text() });
    }
    
    const members = await res.json();
    return NextResponse.json({ count: members.length });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
