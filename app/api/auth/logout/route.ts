import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function GET(req: NextRequest) {
  const appUrl = process.env.APP_URL || '';
  
  const cookie = serialize('auth_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 0,
    path: '/',
  });

  const response = NextResponse.redirect(appUrl ? new URL('/', appUrl) : new URL('/', req.url));
  response.headers.set('Set-Cookie', cookie);

  return response;
}
