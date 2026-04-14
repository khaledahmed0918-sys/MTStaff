import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    // Create table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS invites (
        user_id TEXT PRIMARY KEY,
        invite_link TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Generate link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
    const inviteLink = `${baseUrl}/invite/${userId}`;

    // Insert or update
    await query(`
      INSERT INTO invites (user_id, invite_link)
      VALUES ($1, $2)
      ON CONFLICT (user_id) DO UPDATE SET invite_link = EXCLUDED.invite_link, created_at = CURRENT_TIMESTAMP
    `, [userId, inviteLink]);

    return NextResponse.json({ success: true, inviteLink });
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  try {
    const result = await query('SELECT invite_link FROM invites WHERE user_id = $1', [userId]);
    if (result.rows.length > 0) {
      return NextResponse.json({ exists: true, inviteLink: result.rows[0].invite_link });
    }
    return NextResponse.json({ exists: false });
  } catch (error) {
    // If table doesn't exist, it means no invites have been created yet
    return NextResponse.json({ exists: false });
  }
}
