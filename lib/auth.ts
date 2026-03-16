import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'fallback_secret');
    return decoded as {
      id: string;
      username: string;
      discriminator: string;
      avatar: string;
    };
  } catch (err) {
    return null;
  }
}
