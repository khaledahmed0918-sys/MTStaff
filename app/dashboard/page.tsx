import { getServerInfo } from '@/lib/bot';
import CachedImage from '@/components/cached-image';
import { Users, UserCheck, Shield } from 'lucide-react';

export default async function DashboardHome() {
  const guildId = process.env.DISCORD_GUILD_ID;
  let serverInfo = null;

  if (guildId) {
    serverInfo = await getServerInfo(guildId);
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative h-64 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end gap-6">
          <div className="w-24 h-24 relative rounded-2xl overflow-hidden border-4 border-[#0a0f1a] shadow-[0_0_30px_rgba(59,130,246,0.5)]">
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
          <div className="mb-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
              {displayInfo.name}
            </h1>
            <p className="text-blue-300 font-medium mt-1">المجتمع الرسمي</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111827]/60 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium text-lg">إجمالي الأعضاء</h3>
            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white">{typeof displayInfo.memberCount === 'number' ? displayInfo.memberCount.toLocaleString() : displayInfo.memberCount}</p>
        </div>

        <div className="bg-[#111827]/60 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium text-lg">الأعضاء المتصلين</h3>
            <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
              <UserCheck className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white">{typeof displayInfo.onlineCount === 'number' ? displayInfo.onlineCount.toLocaleString() : displayInfo.onlineCount}</p>
        </div>

        <div className="bg-[#111827]/60 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium text-lg">معرف السيرفر</h3>
            <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <p className="text-xl font-mono text-gray-300 mt-2">{displayInfo.id}</p>
        </div>
      </div>
    </div>
  );
}
