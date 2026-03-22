'use client';

import { useState, useEffect } from 'react';
import CachedImage from '@/components/cached-image';
import { Shield, MessageSquare, Flame, Loader2, ChevronDown, ChevronUp, Camera, Ban, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ScreenshotButton } from '@/components/screenshot-button';
import { ImagePopup } from '@/components/image-popup';

export function StaffSection({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(initialCategories.length === 0);
  const [popupImage, setPopupImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (initialCategories.length === 0) {
      fetch('/api/staff')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setCategories(data);
          }
        })
        .catch(err => console.error('Failed to fetch staff:', err))
        .finally(() => setLoading(false));
    }
  }, [initialCategories]);

  useEffect(() => {
    if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = 'unset';
    }
    if (popupImage) {
        document.body.style.overflow = 'hidden';
    }
    return () => {
        document.body.style.overflow = 'unset';
    };
  }, [popupImage]);

  if (loading) {
    return (
      <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-blue-500/20 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">فريق الإدارة</h2>
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
          <div className="p-2 bg-blue-500/20 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">فريق الإدارة</h2>
        </div>
        <div className="flex justify-center py-12 text-gray-500 bg-[#111827]/40 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl">
          لا يوجد أعضاء في فريق الإدارة حالياً
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 bg-blue-500/20 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <Shield className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">فريق الإدارة</h2>
      </div>

      <div className="space-y-16">
        {categories.map((category: any, catIdx: number) => (
          <div key={catIdx} className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <h2 className="text-2xl font-black text-white tracking-widest uppercase px-8 py-3 bg-[#111827]/60 rounded-full border border-white/10 backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                {category.name}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="space-y-12">
              {category.roles.map((role: any, roleIdx: number) => (
                <div key={roleIdx} className="space-y-6">
                  <div className="flex items-center gap-4 px-4">
                    <div className="flex items-center gap-3 px-5 py-2 rounded-xl border border-white/5 bg-[#111827]/60 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform duration-300" style={{ borderColor: `${role.color}30` }}>
                      {role.icon ? (
                        <CachedImage src={role.icon} alt={role.name} width={24} height={24} className="object-contain drop-shadow-md" />
                      ) : (
                        <Shield className="w-5 h-5 drop-shadow-md" style={{ color: role.color }} />
                      )}
                      <h3 className="text-lg font-bold tracking-wide drop-shadow-sm" style={{ color: role.color }}>
                        {role.name}
                      </h3>
                      <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded-full text-gray-400 border border-white/5 shadow-inner">
                        {role.members.length}
                      </span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" style={{ backgroundColor: `${role.color}10` }} />
                  </div>

                  <div className="flex flex-col gap-4">
                    {role.members.map((member: any) => (
                      <ScreenshotButton 
                        key={member.id}
                        elementId={`staff-card-${member.id}`} 
                        fileName={`${member.username}-staff-card.png`} 
                        memberData={member}
                        className="w-full block"
                      >
                        <motion.div
                          id={`staff-card-${member.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          whileHover={{ y: -2, scale: 1.005 }}
                          transition={{ duration: 0.4 }}
                          onClick={() => router.push(`/dashboard/search?q=${member.id}`)}
                          className="bg-[#111827]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500 cursor-pointer group relative overflow-hidden w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                          style={{ borderRightColor: `${member.highestRoleColor}80`, borderRightWidth: '4px' }}
                        >
                          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-50 pointer-events-none blur-2xl group-hover:scale-150 transition-transform duration-700" style={{ backgroundImage: `linear-gradient(to bottom right, ${member.highestRoleColor}20, transparent)` }} />
                          
                          {/* User Info */}
                          <div className="flex items-center gap-4 relative z-10 shrink-0">
                            <div className="relative w-16 h-16 shrink-0 group/avatar">
                              <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#111827] shadow-xl relative z-10 bg-[#0a0f1a]" style={{ borderColor: member.highestRoleColor }}>
                                <CachedImage 
                                  src={member.avatar} 
                                  alt={member.displayName} 
                                  fill 
                                  className="object-cover rounded-full transition-transform duration-500 group-hover/avatar:scale-110" 
                                />
                              </div>
                              {member.avatarDecoration && (
                                <div className="absolute -inset-3 z-20 pointer-events-none">
                                  <CachedImage src={member.avatarDecoration} alt="Decoration" fill className="object-cover" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-black text-white truncate group-hover:text-blue-400 transition-colors drop-shadow-md" style={{ color: member.highestRoleColor }}>
                                {member.displayName}
                              </h4>
                              <p className="text-xs font-medium text-gray-400 truncate mt-0.5">@{member.username}</p>
                            </div>
                          </div>

                          {/* Stats */}
                          {member.stats && (
                            <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-6 relative z-10 w-full md:w-auto">
                              <div className="flex flex-col gap-1 bg-black/20 px-4 py-2 rounded-xl border border-white/5 flex-1 md:flex-none">
                                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold">
                                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                                  <span>الرسائل</span>
                                </div>
                                <div className="text-lg font-black text-white">{member.stats.messages.total.toLocaleString()}</div>
                                <div className="flex gap-2 text-[9px] text-gray-500 font-mono">
                                  <span>ي: {member.stats.messages.daily}</span>
                                  <span>أ: {member.stats.messages.weekly}</span>
                                  <span>ش: {member.stats.messages.monthly}</span>
                                </div>
                              </div>

                              <div className="flex flex-col gap-1 bg-black/20 px-4 py-2 rounded-xl border border-white/5 flex-1 md:flex-none">
                                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold">
                                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                                  <span>الستريك</span>
                                </div>
                                <div className="text-lg font-black text-white">{member.stats.streak}</div>
                                <div className="text-[9px] text-gray-500">
                                  {member.stats.completed_today ? <span className="text-emerald-400">مكتمل اليوم</span> : <span className="text-red-400">غير مكتمل</span>}
                                </div>
                              </div>

                              <div className="flex flex-col gap-1 bg-black/20 px-4 py-2 rounded-xl border border-white/5 flex-1 md:flex-none">
                                <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold">
                                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                                  <span>التحذيرات</span>
                                </div>
                                <div className="text-lg font-black text-white">{member.stats.warns.length}</div>
                                <div className="text-[9px] text-gray-500">
                                  تايم أوت: {member.stats.timeouts.length}
                                </div>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </ScreenshotButton>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {popupImage && <ImagePopup src={popupImage} onClose={() => setPopupImage(null)} />}
    </section>
  );
}
