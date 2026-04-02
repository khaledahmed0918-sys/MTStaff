'use client';

import { useEffect, useState } from 'react';
import CachedImage from '@/components/cached-image';
import { Trophy, Flame, Star, Crown, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ScreenshotButton } from '@/components/screenshot-button';
import { fetchWithRetry } from '@/lib/utils';
import { useSettings } from '@/components/settings-context';

export function TopUsersSection({ guildId, initialData }: { guildId: string, initialData?: any }) {
  const [data, setData] = useState<any>(initialData || null);
  const [loading, setLoading] = useState(!initialData); 
  const router = useRouter();
  const { t, settings } = useSettings();
  const isRtl = settings.language === 'ar';

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      return;
    }

    async function fetchTopUsers() {
      try {
        const res = await fetchWithRetry('/api/top-users');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch top users', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopUsers();
  }, [initialData]);

  const sections = [
    { key: 'topDay', title: t('topDaily'), icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', glow: 'rgba(249,115,22,0.15)' },
    { key: 'topWeek', title: t('topWeekly'), icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', glow: 'rgba(234,179,8,0.15)' },
    { key: 'topOverall', title: t('topMonthly'), icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', glow: 'rgba(168,85,247,0.15)' }
  ];

  const hasAnyMembers = data && sections.some(sec => data[sec.key]?.members?.length > 0);

  if (loading && !hasAnyMembers) {
    return (
      <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
        <div className={`flex items-center gap-4 px-2 ${isRtl ? '' : 'flex-row-reverse'}`}>
          <div className="p-3 bg-purple-500/20 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-purple-500/30">
            <Trophy className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-purple-200 tracking-tight drop-shadow-sm">{t('topUsers')}</h2>
        </div>
        <div className="flex justify-center py-20 bg-[#0a0f1a]/80 backdrop-blur-2xl rounded-[2rem] border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
        </div>
      </section>
    );
  }

  if (!hasAnyMembers) {
    return (
      <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
        <div className={`flex items-center gap-4 px-2 ${isRtl ? '' : 'flex-row-reverse'}`}>
          <div className="p-3 bg-purple-500/20 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-purple-500/30">
            <Trophy className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-purple-200 tracking-tight drop-shadow-sm">{t('topUsers')}</h2>
        </div>
        <div className="flex justify-center py-20 text-gray-400 bg-[#0a0f1a]/80 backdrop-blur-2xl rounded-[2rem] border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] font-medium text-lg">
          {t('noData')}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
      <div className={`flex items-center gap-4 px-2 ${isRtl ? 'flex-row' : 'flex-row'}`}>
        <div className="p-3 bg-purple-500/20 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-purple-500/30">
          <Trophy className="w-7 h-7 text-purple-400" />
        </div>
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-purple-200 tracking-tight drop-shadow-sm">{t('topUsers')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {sections.map((sec) => {
          const roleData = data[sec.key];
          if (!roleData || !roleData.members || roleData.members.length === 0) return null;

          const member = roleData.members[0]; // Display the top one
          const Icon = sec.icon;

          return (
            <ScreenshotButton 
              key={sec.key}
              elementId={`top-user-card-${member.id}`} 
              fileName={`${member.username}-top-user.png`}
              className="block"
            >
              <motion.div 
                id={`top-user-card-${member.id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                onClick={() => router.push(`/dashboard/search?q=${member.id}`)}
                className={`relative overflow-hidden rounded-[2rem] border ${sec.border} bg-[#0a0f1a]/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.5)] cursor-pointer group h-full hover:shadow-[0_0_40px_${sec.glow}] transition-all duration-500`}
              >
                <div className={`absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_at_top_right,${sec.glow.replace('0.15', '0.2')},transparent_70%)] group-hover:bg-[radial-gradient(circle_at_top_right,${sec.glow.replace('0.15', '0.3')},transparent_70%)] transition-colors duration-700`} />
                <div className={`absolute bottom-0 left-0 w-full h-1 ${sec.bg.replace('/10', '')} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
                <div className="absolute -right-12 -top-12 opacity-5 group-hover:opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
                  <Icon className="w-48 h-48" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`p-4 rounded-2xl ${sec.bg} mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-[0_0_20px_${sec.glow}] border ${sec.border}`}>
                    <Icon className={`w-8 h-8 ${sec.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white/90 mb-6 tracking-wide">{sec.title}</h3>
                  
                  <div className="relative w-28 h-28 mb-6 group-hover:scale-110 transition-transform duration-500">
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#0a0f1a] shadow-[0_0_20px_rgba(0,0,0,0.5)] relative z-10" style={{ borderColor: member.roleColor }}>
                      <CachedImage src={member.avatar} alt={member.displayName} fill className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                    {member.avatarDecoration && (
                      <div className="absolute -inset-5 z-20 pointer-events-none">
                        <CachedImage src={member.avatarDecoration} alt="Decoration" fill className="object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full blur-md -z-10 opacity-50 transition-opacity duration-500 group-hover:opacity-100" style={{ backgroundColor: member.roleColor }} />
                  </div>

                  <h4 className="text-2xl font-black text-white truncate w-full drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] mb-1" style={{ color: member.roleColor }}>
                    {member.displayName}
                  </h4>
                  <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">{member.roleName}</p>
                </div>
              </motion.div>
            </ScreenshotButton>
          );
        })}
      </div>
    </section>
  );
}
