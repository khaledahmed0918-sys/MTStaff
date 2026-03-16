import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const appUrl = process.env.APP_URL;
  
  if (!clientId || !appUrl) {
    return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
  }

  const redirectUri = encodeURIComponent(`${appUrl}/api/auth/callback`);
  const scope = encodeURIComponent('identify guilds guilds.members.read');
  
  const discordLoginUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}`;
  
  return NextResponse.redirect(discordLoginUrl);
}
