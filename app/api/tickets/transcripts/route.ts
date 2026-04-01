import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getUserInfo } from '@/lib/bot';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const transcriptsDir = '/root/MTC-System/transcripts/';
    const ticketsJsonPath = '/root/MTC-System/data/Tickets/tickets.json';
    const guildId = process.env.DISCORD_GUILD_ID;

    if (!guildId) {
      return NextResponse.json({ error: 'Discord Guild ID is not configured' }, { status: 500 });
    }

    // Read transcripts directory
    let files: string[] = [];
    try {
      files = await fs.readdir(transcriptsDir);
    } catch (err) {
      console.error('Error reading transcripts directory:', err);
      // Fallback for dev environment
      files = [];
    }

    // Read tickets.json
    let ticketsData: any = {};
    try {
      const ticketsRaw = await fs.readFile(ticketsJsonPath, 'utf-8');
      const parsed = JSON.parse(ticketsRaw);
      // The JSON has server ID at the root, we need to get the inner object
      const serverId = Object.keys(parsed)[0];
      if (serverId) {
        ticketsData = parsed[serverId];
      }
    } catch (err) {
      console.error('Error reading tickets.json:', err);
    }

    const transcripts = [];

    for (const file of files) {
      if (!file.endsWith('.html')) continue;

      // Filename format: {creatorId}_{transcrip_Date}.html
      // Example: 968563794974478366_2026-04-01.html
      const match = file.match(/^(\d+)_([^\.]+)\.html$/);
      if (!match) continue;

      const creatorId = match[1];
      const dateStr = match[2]; // Might not be ISO, but we'll try to parse it

      // Read HTML file to extract ticket ID
      let ticketId = null;
      try {
        const htmlContent = await fs.readFile(path.join(transcriptsDir, file), 'utf-8');
        // Extract ticket ID: ايدي التذكرة: 1488852700249456660
        const idMatch = htmlContent.match(/ايدي التذكرة:\s*(\d+)/);
        if (idMatch) {
          ticketId = idMatch[1];
        }
      } catch (err) {
        console.error(`Error reading HTML file ${file}:`, err);
      }

      let ticketDetails = null;
      if (ticketId && ticketsData[ticketId]) {
        ticketDetails = ticketsData[ticketId];
      }

      transcripts.push({
        fileName: file,
        creatorId,
        date: new Date(dateStr).toISOString(),
        ticketId,
        details: ticketDetails,
      });
    }

    // Sort by date descending
    transcripts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Enrich with user info
    const enrichedTranscripts = await Promise.all(
      transcripts.map(async (t) => {
        const creatorUser = t.creatorId ? await getUserInfo(guildId, t.creatorId) : null;
        const claimerUser = t.details?.claimedBy ? await getUserInfo(guildId, t.details.claimedBy) : null;
        
        return {
          ...t,
          creator: creatorUser,
          claimer: claimerUser,
        };
      })
    );

    return NextResponse.json(enrichedTranscripts);
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    return NextResponse.json({ error: 'Failed to fetch transcripts' }, { status: 500 });
  }
}
