import { getServerInfo, getStaffMembers } from '@/lib/bot';
import CachedImage from '@/components/cached-image';
import { Users, UserCheck, Shield, MessageSquare, Clock, Flame, Trophy, Crown, Medal, Star } from 'lucide-react';
import { StaffSection } from '@/components/staff-section';
import { TopUsersSection } from '@/components/top-users-section';

export const dynamic = 'force-dynamic';

export default async function DashboardHome() {
  const guildId = process.env.DISCORD_GUILD_ID;
  let serverInfo = null;
  let staffCategories: any[] = [];

  if (guildId) {
    serverInfo = await getServerInfo(guildId);
    staffCategories = await getStaffMembers(guildId);
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
        <div className="relative aspect-[4/1] md:aspect-[6/1] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10">
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
          
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex flex-col md:flex-row items-center md:items-end gap-4 text-center md:text-right">
            <div className="w-20 h-20 md:w-24 md:h-24 relative rounded-full overflow-hidden border-4 border-[#0a0f1a] shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0">
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
            <div className="mb-1 md:mb-2 flex-1">
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg mb-1">
                {displayInfo.name}
              </h1>
              <p className="text-blue-300 font-medium text-sm md:text-base">المجتمع الرسمي - لوحة التحكم</p>
            </div>
          </div>
        </div>
      </section>

      {/* Server Analytics */}
      <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-both">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">إحصائيات السيرفر</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-[#111827]/60 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-500/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium text-lg">إجمالي الأعضاء</h3>
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-4xl font-bold text-white">{typeof displayInfo.memberCount === 'number' ? displayInfo.memberCount.toLocaleString() : displayInfo.memberCount}</p>
          </div>

          <div className="bg-[#111827]/60 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium text-lg">الأعضاء المتصلين</h3>
              <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                <UserCheck className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <p className="text-4xl font-bold text-white">{typeof displayInfo.onlineCount === 'number' ? displayInfo.onlineCount.toLocaleString() : displayInfo.onlineCount}</p>
          </div>

          <div className="bg-[#111827]/60 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-yellow-500/30 transition-all duration-300 group sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium text-lg">أكثر شات تفاعلاً</h3>
              <div className="p-3 bg-yellow-500/10 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
                <MessageSquare className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white truncate">💬 الشات العام</p>
            <p className="text-sm text-gray-400 mt-2">أكثر من 10,000 رسالة اليوم</p>
          </div>
        </div>
      </section>

      {/* Top Users Section */}
      <TopUsersSection guildId={guildId || ''} />

      {/* Staff Team Section */}
      <StaffSection initialCategories={staffCategories} />
    </div>
  );
}
