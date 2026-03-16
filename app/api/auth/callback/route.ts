import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const appUrl = process.env.APP_URL;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';

  if (!code || !appUrl || !clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/?error=missing_config', req.url));
  }

  const redirectUri = `${appUrl}/api/auth/callback`;

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token error:', tokenData);
      return NextResponse.redirect(new URL('/?error=token_failed', req.url));
    }

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (userData.error) {
      console.error('User error:', userData);
      return NextResponse.redirect(new URL('/?error=user_failed', req.url));
    }

    // Create JWT
    const token = sign(
      {
        id: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        accessToken: tokenData.access_token,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const cookie = serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    const response = NextResponse.redirect(new URL('/dashboard', req.url));
    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch (err) {
    console.error('OAuth error:', err);
    return NextResponse.redirect(new URL('/?error=oauth_failed', req.url));
  }
}
