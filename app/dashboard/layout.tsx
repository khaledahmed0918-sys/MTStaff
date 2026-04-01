import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { hasRole } from '@/lib/bot';
import { NavProvider } from '@/components/nav-context';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || !session.user) {
    redirect('/');
  }

  const guildId = process.env.DISCORD_GUILD_ID;
  const roleId = process.env.DISCORD_REQUIRED_ROLE_ID;

  if (guildId && roleId) {
    const hasRequiredRole = await hasRole(guildId, session.user.id, roleId);
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center text-white">
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl max-w-md text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
            <p className="text-gray-300">You do not have the required role to access this dashboard.</p>
          </div>
        </div>
      );
    }
  }

  return (
    <NavProvider>
      <div className="flex h-[100dvh] text-white overflow-hidden font-sans relative bg-transparent">
        <Sidebar />
        <div className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
          <Topbar user={session.user} />
          <main id="dashboard-content" className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 custom-scrollbar relative z-0">
            {children}
          </main>
        </div>
      </div>
    </NavProvider>
  );
}
