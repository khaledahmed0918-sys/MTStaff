'use client';

import { useState, useEffect } from 'react';
import CachedImage from '@/components/cached-image';
import { Shield, MessageSquare, Flame, AlertTriangle, Loader2, ChevronDown, ChevronUp, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ScreenshotButton } from '@/components/screenshot-button';

export function StaffSection({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(initialCategories.length === 0);
  const router = useRouter();

  useEffect(() => {
    if (initialCategories.length === 0) {
      async function fetchStaff() {
        try {
          const res = await fetch('/api/staff');
          if (res.ok) {
            const json = await res.json();
            setCategories(json.staff || []);
          }
        } catch (err) {
          // Silent error
        } finally {
          setLoading(false);
        }
      }
      fetchStaff();
    }
  }, [initialCategories]);

  if (loading) {
    return (
      <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">فريق الإدارة</h2>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">فريق الإدارة</h2>
        </div>
        <div className="flex justify-center py-12 text-gray-500">
          لا يوجد أعضاء في فريق الإدارة حالياً
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Shield className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">فريق الإدارة</h2>
      </div>

      <div className="space-y-12">
        {categories.map((category) => (
          <div key={category.id} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-white/10" />
              <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-[#111827]/80 backdrop-blur-md shadow-lg" style={{ borderColor: `${category.roleInfo?.color}40` }}>
                {category.roleInfo?.icon && (
                  <CachedImage src={category.roleInfo.icon} alt={category.name} width={24} height={24} />
                )}
                <h3 className="text-lg font-bold" style={{ color: category.roleInfo?.color || '#fff' }}>
                  {category.name}
                </h3>
                <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
                  {category.members.length}
                </span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-white/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {category.members.map((member: any) => (
                <motion.div
                  key={member.id}
                  id={`staff-card-${member.id}`}
                  whileHover={{ y: -4, scale: 1.01 }}
                  onClick={() => router.push(`/dashboard/search?q=${member.id}`)}
                  className="bg-[#111827]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  style={{ borderTopColor: `${member.highestRoleColor}80`, borderTopWidth: '2px' }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-50 pointer-events-none" style={{ backgroundImage: `linear-gradient(to bottom right, ${member.highestRoleColor}20, transparent)` }} />
                  
                  <div className="absolute top-4 left-4 z-20">
                    <ScreenshotButton elementId={`staff-card-${member.id}`} fileName={`${member.username}-staff-card.png`} />
                  </div>

                  <div className="flex items-start gap-4 relative z-10">
                    <div className="relative w-16 h-16 shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#111827] shadow-md" style={{ borderColor: member.highestRoleColor }}>
                        <CachedImage src={member.avatar} alt={member.displayName} fill className="object-cover" />
                      </div>
                      {member.avatarDecoration && (
                        <div className="absolute -inset-3 z-20 pointer-events-none">
                          <CachedImage src={member.avatarDecoration} alt="Decoration" fill className="object-cover" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors" style={{ color: member.highestRoleColor }}>
                        {member.displayName}
                      </h4>
                      <p className="text-sm text-gray-400 truncate">@{member.username}</p>
                    </div>
                  </div>

                  {member.stats && (
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="bg-[#0a0f1a] rounded-xl p-3 border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                          <span>الرسائل</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-white">{member.stats.messages.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                          <span>ي: {member.stats.messages.daily}</span>
                          <span>أ: {member.stats.messages.weekly}</span>
                          <span>ش: {member.stats.messages.monthly}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="bg-[#0a0f1a] rounded-xl p-2.5 border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                            <Flame className="w-3.5 h-3.5 text-orange-400" />
                            <span>الستريك</span>
                          </div>
                          <span className="text-sm font-bold text-white">{member.stats.streak}</span>
                        </div>
                        
                        <div className="bg-[#0a0f1a] rounded-xl p-2.5 border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                            <span>تحذيرات إدارية</span>
                          </div>
                          <span className={`text-sm font-bold ${member.stats.swarns > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {member.stats.swarns}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
