import { getServerInfo, getTopUsers } from '@/lib/bot';
import { query } from '@/lib/db';
import CachedImage from '@/components/cached-image';
import { Users, UserCheck, Shield, MessageSquare, Clock, Flame, Trophy, Crown, Medal, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardHome() {
  const guildId = process.env.DISCORD_GUILD_ID;
  let serverInfo = null;
  let totalMessages = 0;
  let topUsersData = null;

  try {
    const res = await query(`SELECT SUM("all") as total FROM messages`);
    if (res.rows[0] && res.rows[0].total) {
      totalMessages = parseInt(res.rows[0].total, 10);
    }
  } catch (e) {
    // Silent error
  }

  if (guildId) {
    serverInfo = await getServerInfo(guildId);
    try {
      topUsersData = await getTopUsers(guildId);
    } catch (e) {
      console.error('Error fetching top users on server:', e);
    }
  }

  const displayInfo = serverInfo || {
    id: guildId || 'لا يوجد',
    name: 'السيرفر غير متاح',
    icon: null,
    banner: null,
    memberCount: 'لا يوجد',
    onlineCount: 'لا يوجد',
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Server Header */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative min-h-[200px] md:min-h-[250px] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          {displayInfo.banner ? (
            <CachedImage
              src={displayInfo.banner}
              alt="Server Banner"
              fill
              className="object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-[#0a0f1a]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/60 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-right">
            <div className="w-24 h-24 relative rounded-full overflow-hidden border-4 border-[#0a0f1a] shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0">
              {displayInfo.icon ? (
                <CachedImage
                  src={displayInfo.icon}
                  alt="Server Icon"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-blue-600 flex items-center justify-center text-3xl font-bold">
                  {displayInfo.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="mb-2 flex-1">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg mb-1">
                {displayInfo.name}
              </h1>
              <p className="text-blue-300 font-medium text-sm md:text-base">المجتمع الرسمي - لوحة التحكم</p>
            </div>
          </div>
        </div>
      </section>

      {/* Server Analytics */}
      <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-both">
        <div className="flex items-center gap-4 px-2">
          <div className="p-3 bg-blue-500/20 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-500/30">
            <Shield className="w-7 h-7 text-blue-400" />
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-blue-200 tracking-tight drop-shadow-sm">إحصائيات السيرفر</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="relative overflow-hidden bg-[#0a0f1a]/80 border border-blue-500/20 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] hover:border-blue-500/50 hover:-translate-y-2 transition-all duration-500 group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_70%)] group-hover:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_70%)] transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-blue-100/70 font-bold text-xl tracking-wide">إجمالي الأعضاء</h3>
                <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] border border-blue-500/20">
                  <Users className="w-7 h-7 text-blue-400" />
                </div>
              </div>
              <p className="text-5xl md:text-6xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{typeof displayInfo.memberCount === 'number' ? displayInfo.memberCount.toLocaleString() : displayInfo.memberCount}</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-[#0a0f1a]/80 border border-emerald-500/20 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:border-emerald-500/50 hover:-translate-y-2 transition-all duration-500 group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_70%)] group-hover:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.25),transparent_70%)] transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-emerald-100/70 font-bold text-xl tracking-wide">الأعضاء المتصلين</h3>
                <div className="p-4 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] border border-emerald-500/20">
                  <UserCheck className="w-7 h-7 text-emerald-400" />
                </div>
              </div>
              <p className="text-5xl md:text-6xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{typeof displayInfo.onlineCount === 'number' ? displayInfo.onlineCount.toLocaleString() : displayInfo.onlineCount}</p>
            </div>
          </div>

          <div className="relative overflow-hidden bg-[#0a0f1a]/80 border border-yellow-500/20 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(245,158,11,0.2)] hover:border-yellow-500/50 hover:-translate-y-2 transition-all duration-500 group sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_70%)] group-hover:bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.25),transparent_70%)] transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 to-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-yellow-100/70 font-bold text-xl tracking-wide">إجمالي الرسائل</h3>
                <div className="p-4 bg-yellow-500/10 rounded-2xl group-hover:bg-yellow-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] border border-yellow-500/20">
                  <MessageSquare className="w-7 h-7 text-yellow-400" />
                </div>
              </div>
              <p className="text-5xl md:text-6xl font-black text-white font-mono tracking-tighter truncate drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{totalMessages.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Users Section */}
    </div>
  );
}
