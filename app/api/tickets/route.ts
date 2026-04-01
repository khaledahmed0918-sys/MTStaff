import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { getUserInfo } from '@/lib/bot';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ticketsJsonPath = '/root/MTC-System/data/Tickets/tickets.json';
    const guildId = process.env.DISCORD_GUILD_ID;

    if (!guildId) {
      return NextResponse.json({ error: 'Discord Guild ID is not configured' }, { status: 500 });
    }

    let ticketsData: any = {};
    try {
      const ticketsRaw = await fs.readFile(ticketsJsonPath, 'utf-8');
      const parsed = JSON.parse(ticketsRaw);
      const serverId = Object.keys(parsed)[0];
      if (serverId) {
        ticketsData = parsed[serverId];
      }
    } catch (err) {
      console.error('Error reading tickets.json:', err);
      return NextResponse.json([]);
    }

    const tickets = [];
    for (const [ticketId, details] of Object.entries(ticketsData)) {
      if (ticketId === 'messageInfo') continue;
      tickets.push({
        ticketId,
        ...(details as any),
      });
    }

    // Sort by createdAt descending
    tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}
