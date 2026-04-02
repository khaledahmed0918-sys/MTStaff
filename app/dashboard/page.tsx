'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/components/settings-context';
import { motion } from 'motion/react';
import { Users, UserCheck, Shield, MessageSquare, Loader2, Award } from 'lucide-react';
import CachedImage from '@/components/cached-image';
import { TopUsersSection } from '@/components/top-users-section';
import { fetchWithRetry } from '@/lib/utils';

export default function DashboardHome() {
  const { t, settings } = useSettings();
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [totalMessages, setTotalMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  const guildId = '852218081837449246';
  const isRtl = settings.language === 'ar';

  useEffect(() => {
    async function fetchData() {
      try {
        const [serverRes, messagesRes] = await Promise.all([
          fetchWithRetry(`/api/bot?action=getServerInfo&guildId=${guildId}`),
          fetchWithRetry('/api/bot?action=getTotalMessages')
        ]);
        
        if (serverRes.ok) setServerInfo(await serverRes.json());
        if (messagesRes.ok) {
          const data = await messagesRes.json();
          setTotalMessages(data.total || 0);
        }
      } catch (e) {
        console.error('Failed to fetch dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [guildId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const displayInfo = serverInfo || {
    name: t('serverUnavailable') || 'السيرفر غير متاح',
    icon: null,
    banner: null,
    memberCount: 0,
    onlineCount: 0,
    premiumTier: 0,
    premiumSubscriptionCount: 0,
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
          
          <div className={`absolute bottom-0 left-0 right-0 p-6 flex flex-col md:flex-row items-center md:items-end gap-4 text-center ${isRtl ? 'md:text-right' : 'md:text-left'}`}>
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
              <p className="text-blue-300 font-medium text-sm md:text-base">{t('serverDescription')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Server Analytics */}
      <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100 fill-mode-both">
        <div className={`flex items-center gap-4 px-2 ${isRtl ? 'flex-row' : 'flex-row'}`}>
          <div className="p-3 bg-blue-500/20 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-500/30">
            <Shield className="w-7 h-7 text-blue-400" />
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-blue-200 tracking-tight drop-shadow-sm">{t('serverStats')}</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Total Members */}
          <div className="relative overflow-hidden bg-[#0a0f1a]/80 border border-blue-500/20 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] hover:border-blue-500/50 hover:-translate-y-2 transition-all duration-500 group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_70%)] group-hover:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_70%)] transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="relative z-10">
              <div className={`flex items-center justify-between mb-8 ${isRtl ? 'flex-row' : 'flex-row'}`}>
                <h3 className="text-blue-100/70 font-bold text-xl tracking-wide">{t('totalMembersLabel')}</h3>
                <div className="p-4 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_20px_rgba(59,130,246,0.15)] border border-blue-500/20">
                  <Users className="w-7 h-7 text-blue-400" />
                </div>
              </div>
              <p className="text-5xl md:text-6xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {typeof displayInfo.memberCount === 'number' ? displayInfo.memberCount.toLocaleString() : displayInfo.memberCount}
              </p>
            </div>
          </div>

          {/* Online Members */}
          <div className="relative overflow-hidden bg-[#0a0f1a]/80 border border-emerald-500/20 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:border-emerald-500/50 hover:-translate-y-2 transition-all duration-500 group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_70%)] group-hover:bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.25),transparent_70%)] transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="relative z-10">
              <div className={`flex items-center justify-between mb-8 ${isRtl ? 'flex-row' : 'flex-row'}`}>
                <h3 className="text-emerald-100/70 font-bold text-xl tracking-wide">{t('onlineMembersLabel')}</h3>
                <div className="p-4 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] border border-emerald-500/20">
                  <UserCheck className="w-7 h-7 text-emerald-400" />
                </div>
              </div>
              <p className="text-5xl md:text-6xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {typeof displayInfo.onlineCount === 'number' ? displayInfo.onlineCount.toLocaleString() : displayInfo.onlineCount}
              </p>
            </div>
          </div>

          {/* Total Messages */}
          <div className="relative overflow-hidden bg-[#0a0f1a]/80 border border-yellow-500/20 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(245,158,11,0.2)] hover:border-yellow-500/50 hover:-translate-y-2 transition-all duration-500 group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_70%)] group-hover:bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.25),transparent_70%)] transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 to-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="relative z-10">
              <div className={`flex items-center justify-between mb-8 ${isRtl ? 'flex-row' : 'flex-row'}`}>
                <h3 className="text-yellow-100/70 font-bold text-xl tracking-wide">{t('totalMessagesLabel')}</h3>
                <div className="p-4 bg-yellow-500/10 rounded-2xl group-hover:bg-yellow-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] border border-yellow-500/20">
                  <MessageSquare className="w-7 h-7 text-yellow-400" />
                </div>
              </div>
              <p className="text-5xl md:text-6xl font-black text-white font-mono tracking-tighter truncate drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {totalMessages.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Server Level / Boosts */}
          <div className="relative overflow-hidden bg-[#0a0f1a]/80 border border-purple-500/20 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] hover:border-purple-500/50 hover:-translate-y-2 transition-all duration-500 group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_70%)] group-hover:bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.25),transparent_70%)] transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="relative z-10">
              <div className={`flex items-center justify-between mb-8 ${isRtl ? 'flex-row' : 'flex-row'}`}>
                <h3 className="text-purple-100/70 font-bold text-xl tracking-wide">{t('serverLevel')}</h3>
                <div className="p-4 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-[0_0_20px_rgba(168,85,247,0.15)] border border-purple-500/20">
                  <Award className="w-7 h-7 text-purple-400" />
                </div>
              </div>
              <p className="text-5xl md:text-6xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {displayInfo.premiumTier}
              </p>
              <p className="text-sm text-purple-300 mt-2 font-bold">{displayInfo.premiumSubscriptionCount} Boosts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Users Section */}
      <TopUsersSection guildId={guildId} />
    </div>
  );
}
