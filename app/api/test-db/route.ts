import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await query(`SELECT COUNT(DISTINCT user_id) FROM messages`);
    return NextResponse.json({ count: res.rows[0].count });
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
