import { getAllUsersWithStats } from '@/lib/bot';
import { LeaderboardClient } from './client';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

export default async function LeaderboardPage() {
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!guildId) return null;

  const users = await getAllUsersWithStats(guildId);

  return <LeaderboardClient initialUsers={users} />;
}
