import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    return NextResponse.json(res.rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) });
  }
}
