import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  let appUrl = process.env.APP_URL || '';
  if (appUrl.endsWith('/')) {
    appUrl = appUrl.slice(0, -1);
  }
  
  const cookieStore = await cookies();
  // Delete using the store
  cookieStore.delete('auth_token');

  const response = NextResponse.redirect(appUrl ? new URL('/', appUrl) : new URL('/', req.url));
  
  // Manual deletion header to be absolutely sure across all browser behaviors in iframes
  response.headers.append('Set-Cookie', `auth_token=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
  
  // Force no-cache to ensure the browser doesn't reuse a cached session
  response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}
