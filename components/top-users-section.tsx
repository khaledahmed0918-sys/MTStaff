'use client';

import { useEffect, useState } from 'react';
import CachedImage from '@/components/cached-image';
import { Trophy, Flame, Star, Crown, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

export function TopUsersSection({ guildId }: { guildId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchTopUsers() {
      try {
        const res = await fetch('/api/top-users');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to fetch top users', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTopUsers();
  }, []);

  if (loading) {
    return (
      <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Trophy className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">أكثر الأعضاء تفاعلاً</h2>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </section>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return null; // Don't show if no data
  }

  const sections = [
    { key: 'topDay', title: 'الأكثر تفاعلاً لليوم', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    { key: 'topWeek', title: 'الأكثر تفاعلاً للأسبوع', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    { key: 'topOverall', title: 'الأكثر تفاعلاً بالسيرفر', icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' }
  ];

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Trophy className="w-6 h-6 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">أكثر الأعضاء تفاعلاً</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((sec) => {
          const roleData = data[sec.key];
          if (!roleData || !roleData.members || roleData.members.length === 0) return null;

          const member = roleData.members[0]; // Display the top one
          const Icon = sec.icon;

          return (
            <motion.div 
              key={sec.key}
              whileHover={{ y: -5 }}
              onClick={() => router.push(`/dashboard/search?q=${member.id}`)}
              className={`relative overflow-hidden rounded-3xl border ${sec.border} bg-[#111827]/80 backdrop-blur-xl p-6 shadow-xl cursor-pointer group`}
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${sec.bg.replace('/10', '')}`} />
              <div className="absolute -right-10 -top-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className="w-40 h-40" />
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`p-3 rounded-2xl ${sec.bg} mb-4`}>
                  <Icon className={`w-8 h-8 ${sec.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-4">{sec.title}</h3>
                
                <div className="relative w-24 h-24 mb-4">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#111827] shadow-lg relative z-10" style={{ borderColor: member.roleColor }}>
                    <CachedImage src={member.avatar} alt={member.displayName} fill className="object-cover" />
                  </div>
                  {member.avatarDecoration && (
                    <div className="absolute -inset-4 z-20 pointer-events-none">
                      <CachedImage src={member.avatarDecoration} alt="Decoration" fill className="object-cover" />
                    </div>
                  )}
                </div>

                <h4 className="text-xl font-bold text-white truncate w-full" style={{ color: member.roleColor }}>
                  {member.displayName}
                </h4>
                <p className="text-sm text-gray-400 mt-1">{member.roleName}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
