'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/components/settings-context';
import { motion } from 'motion/react';
import { 
  Users, 
  MessageSquare, 
  Activity, 
  TrendingUp, 
  Award, 
  Star, 
  Flame, 
  Crown,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import CachedImage from '@/components/cached-image';

interface ServerInfo {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  memberCount: number;
  onlineCount: number;
  description?: string;
}

interface TopUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  avatarDecoration: string | null;
  roleColor: string;
  roleName: string;
}

interface TopUsersData {
  topDay?: { title: string; icon: string; members: TopUser[] };
  topWeek?: { title: string; icon: string; members: TopUser[] };
  topOverall?: { title: string; icon: string; members: TopUser[] };
}

export default function DashboardHome() {
  const { t, settings } = useSettings();
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [topUsers, setTopUsers] = useState<TopUsersData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [serverRes, topRes] = await Promise.all([
          fetch('/api/bot?action=getServerInfo'),
          fetch('/api/bot?action=getTopUsers')
        ]);
        
        if (serverRes.ok) setServerInfo(await serverRes.json());
        if (topRes.ok) setTopUsers(await topRes.json());
      } catch (e) {
        console.error('Failed to fetch dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const isRtl = settings.language === 'ar';

  return (
    <div className="space-y-8 pb-12">
      {/* Server Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-[#111827]/60 border border-white/10 p-8"
      >
        {/* Background Banner Blur */}
        {serverInfo?.banner && (
          <div className="absolute inset-0 z-0 opacity-20 blur-3xl">
            <CachedImage src={serverInfo.banner} alt="Banner" fill className="object-cover" referrerPolicy="no-referrer" />
          </div>
        )}
        
        <div className={`relative z-10 flex flex-col md:flex-row items-center gap-8 ${isRtl ? '' : 'md:flex-row-reverse'}`}>
          <div className="relative w-32 h-32 shrink-0">
            <div className="w-full h-full rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
              {serverInfo?.icon ? (
                <CachedImage src={serverInfo.icon} alt={serverInfo.name} fill className="object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-blue-600 flex items-center justify-center text-4xl font-black">
                  {serverInfo?.name?.[0] || 'S'}
                </div>
              )}
            </div>
            <div className={`absolute -bottom-2 ${isRtl ? '-right-2' : '-left-2'} bg-emerald-500 w-8 h-8 rounded-full border-4 border-[#111827] flex items-center justify-center`}>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </div>
          </div>

          <div className={`flex-1 space-y-4 text-center ${isRtl ? 'md:text-right' : 'md:text-left'}`}>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                {serverInfo?.name || t('serverName')}
              </h1>
              <p className="text-gray-400 text-lg mt-2 font-medium">
                {serverInfo?.description || t('serverDescription')}
              </p>
            </div>

            <div className={`flex flex-wrap gap-4 justify-center ${isRtl ? 'md:justify-start' : 'md:justify-end'}`}>
              <div className={`bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 ${isRtl ? '' : 'flex-row-reverse'}`}>
                <Users className="w-5 h-5 text-blue-400" />
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{t('totalMembersLabel')}</p>
                  <p className="text-xl font-black text-white">{serverInfo?.memberCount?.toLocaleString() || '0'}</p>
                </div>
              </div>
              <div className={`bg-white/5 backdrop-blur-md border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 ${isRtl ? '' : 'flex-row-reverse'}`}>
                <Activity className="w-5 h-5 text-emerald-400" />
                <div className={isRtl ? 'text-right' : 'text-left'}>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{t('onlineMembersLabel')}</p>
                  <p className="text-xl font-black text-white">{serverInfo?.onlineCount?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Users Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Day */}
        <TopCard 
          data={topUsers?.topDay} 
          title={t('topDaily')} 
          icon={<Flame className="w-6 h-6 text-orange-500" />}
          delay={0.1}
          isRtl={isRtl}
          t={t}
        />
        {/* Top Week */}
        <TopCard 
          data={topUsers?.topWeek} 
          title={t('topWeekly')} 
          icon={<Star className="w-6 h-6 text-yellow-500" />}
          delay={0.2}
          isRtl={isRtl}
          t={t}
        />
        {/* Most Active */}
        <TopCard 
          data={topUsers?.topOverall} 
          title={t('topMonthly')} 
          icon={<Crown className="w-6 h-6 text-purple-500" />}
          delay={0.3}
          isRtl={isRtl}
          t={t}
        />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          icon={<MessageSquare className="w-6 h-6 text-blue-400" />}
          label={t('totalMessagesLabel')}
          value="1,240,582"
          trend="+12%"
          delay={0.4}
          isRtl={isRtl}
        />
        <StatCard 
          icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
          label={t('serverActivity')}
          value="98.2%"
          trend={t('excellent')}
          delay={0.5}
          isRtl={isRtl}
        />
        <StatCard 
          icon={<Award className="w-6 h-6 text-emerald-400" />}
          label={t('serverLevel')}
          value={t('serverLevelValue')}
          trend={t('maxBoost')}
          delay={0.6}
          isRtl={isRtl}
        />
        <StatCard 
          icon={<Users className="w-6 h-6 text-rose-400" />}
          label={t('newMembersToday')}
          value="+142"
          trend={t('continuousGrowth')}
          delay={0.7}
          isRtl={isRtl}
        />
      </div>
    </div>
  );
}

function TopCard({ data, title, icon, delay, isRtl, t }: { data: any, title: string, icon: React.ReactNode, delay: number, isRtl: boolean, t: any }) {
  if (!data || !data.members || data.members.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#111827]/60 border border-white/10 rounded-3xl p-6 relative overflow-hidden group"
    >
      <div className={`flex items-center justify-between mb-6 ${isRtl ? '' : 'flex-row-reverse'}`}>
        <div className={`flex items-center gap-3 ${isRtl ? '' : 'flex-row-reverse'}`}>
          <div className="p-2 bg-white/5 rounded-xl">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        {isRtl ? <ChevronLeft className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
      </div>

      <div className="space-y-4">
        {data.members.map((member: TopUser, idx: number) => (
          <div key={member.id} className={`flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 transition-all ${isRtl ? '' : 'flex-row-reverse'}`}>
            <div className="relative w-12 h-12 shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/10">
                <CachedImage src={member.avatar} alt={member.displayName} fill className="object-cover" referrerPolicy="no-referrer" />
              </div>
              {member.avatarDecoration && (
                <div className="absolute -inset-2 z-10 pointer-events-none">
                  <CachedImage src={member.avatarDecoration} alt="Decoration" fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              <div className={`absolute -top-1 ${isRtl ? '-right-1' : '-left-1'} w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-[#111827] ${
                idx === 0 ? 'bg-yellow-500 text-black' : 
                idx === 1 ? 'bg-gray-300 text-black' : 
                'bg-amber-700 text-white'
              }`}>
                {idx + 1}
              </div>
            </div>
            <div className={`flex-1 min-w-0 ${isRtl ? 'text-right' : 'text-left'}`}>
              <p className="font-bold text-white truncate" style={{ color: member.roleColor }}>
                {member.displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">{member.roleName}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, trend, delay, isRtl }: { icon: React.ReactNode, label: string, value: string, trend: string, delay: number, isRtl: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-[#111827]/60 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all group ${isRtl ? 'text-right' : 'text-left'}`}
    >
      <div className={`flex items-center justify-between mb-4 ${isRtl ? '' : 'flex-row-reverse'}`}>
        <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
          {trend}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400 mb-1">{label}</p>
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}
