import { NextRequest, NextResponse } from 'next/server';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';
import { getUserInfo } from '@/lib/bot';

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
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return NextResponse.redirect(new URL('/?error=token_failed', req.url));
    }

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (userData.error) {
      return NextResponse.redirect(new URL('/?error=user_failed', req.url));
    }

    // جلب بيانات المستخدم باستخدام البوت (بدون استخدام التوكن الخاص بالمستخدم)
    const botUserInfo = await getUserInfo(process.env.DISCORD_GUILD_ID!, userData.id);

    if (!botUserInfo) {
      return NextResponse.redirect(new URL('/?error=user_failed', req.url));
    }

    // Create JWT (بدون تخزين التوكن الخاص بالمستخدم)
    const token = sign(
      {
        id: botUserInfo.id,
        username: botUserInfo.username,
        displayName: botUserInfo.displayName,
        discriminator: botUserInfo.discriminator,
        avatar: botUserInfo.avatar,
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    const cookie = serialize('auth_token', token, {
      httpOnly: true,
      secure: false, // تم التعديل لجعل الموقع يعمل على HTTP
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    const response = NextResponse.redirect(new URL('/dashboard', req.url));
    response.headers.set('Set-Cookie', cookie);

    return response;
  } catch (err) {
    return NextResponse.redirect(new URL('/?error=oauth_failed', req.url));
  }
}
