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
      const serverId = '852218081837449246';
      if (parsed[serverId]) {
        ticketsData = parsed[serverId];
      } else {
        const firstKey = Object.keys(parsed)[0];
        if (firstKey) ticketsData = parsed[firstKey];
      }
    } catch (err) {
      console.error('Error reading tickets.json:', err);
    }

    const transcripts = [];

    for (const file of files) {
      if (!file.endsWith('.html')) continue;

      let creatorId = 'Unknown';
      let dateStr = new Date().toISOString();
      let ticketId = null;
      let ticketName = file.replace('.html', '');

      // Try to parse filename: {creatorId}_{transcrip_Date}.html
      const match = file.match(/^(\d+)_([^\.]+)\.html$/);
      if (match) {
        creatorId = match[1];
        dateStr = match[2];
      }

      // Read HTML file to extract ticket ID and other info
      try {
        const htmlContent = await fs.readFile(path.join(transcriptsDir, file), 'utf-8');
        
        // Extract ticket ID: ايدي التذكرة: 1488852700249456660
        const idMatch = htmlContent.match(/ايدي التذكرة:\s*(\d+)/);
        if (idMatch) {
          ticketId = idMatch[1];
        }

        // Extract creator ID from claimed by if not in filename
        if (creatorId === 'Unknown') {
           const creatorMatch = htmlContent.match(/المُنشئ:\s*<@(\d+)>/) || htmlContent.match(/المُنشئ:\s*([^\n<]+)/);
           if (creatorMatch) {
               // We might just get the name if it's not a mention, but let's try
               creatorId = creatorMatch[1].trim();
           }
        }
        
        // Extract ticket name (usually at the top like #🎟️〡221k)
        const nameMatch = htmlContent.match(/#([^\n<]+)/);
        if (nameMatch) {
            ticketName = nameMatch[1].trim();
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
        ticketName,
        creatorId,
        date: new Date(dateStr).toString() !== 'Invalid Date' ? new Date(dateStr).toISOString() : new Date().toISOString(),
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
