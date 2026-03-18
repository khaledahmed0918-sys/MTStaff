import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/bot';

export async function GET() {
  try {
    const guildId = process.env.DISCORD_GUILD_ID;
    if (!client.isReady()) {
      await new Promise((resolve) => client.once('ready', resolve));
    }
    const guild = await client.guilds.fetch(guildId!);
    const member = await guild.members.fetch('1459876549384736874'); // Just a random member
    const user = await member.user.fetch();
    return NextResponse.json({ 
      theme_colors: user.themeColors, 
      accentColor: user.hexAccentColor,
      role: member.roles.highest.hexColor
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
