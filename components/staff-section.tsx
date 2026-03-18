'use client';

import { useState, useEffect } from 'react';
import CachedImage from '@/components/cached-image';
import { Shield, MessageSquare, Flame, AlertTriangle, Loader2, ChevronDown, ChevronUp, Camera, Ban, Clock, CheckCircle2 } from 'lucide-react';
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

      <div className="space-y-16">
        {categories.map((category: any, catIdx: number) => (
          <div key={catIdx} className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <h2 className="text-2xl font-black text-white tracking-widest uppercase px-8 py-3 bg-white/5 rounded-full border border-white/10 backdrop-blur-md shadow-2xl">
                {category.name}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="space-y-12">
              {category.roles.map((role: any, roleIdx: number) => (
                <div key={roleIdx} className="space-y-6">
                  <div className="flex items-center gap-4 px-4">
                    <div className="flex items-center gap-3 px-5 py-2 rounded-xl border border-white/5 bg-[#111827]/40 backdrop-blur-sm shadow-inner" style={{ borderColor: `${role.color}30` }}>
                      {role.icon ? (
                        <CachedImage src={role.icon} alt={role.name} width={24} height={24} className="object-contain" />
                      ) : (
                        <Shield className="w-5 h-5" style={{ color: role.color }} />
                      )}
                      <h3 className="text-lg font-bold tracking-wide" style={{ color: role.color }}>
                        {role.name}
                      </h3>
                      <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded-full text-gray-400 border border-white/5">
                        {role.members.length}
                      </span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/5 to-transparent" style={{ backgroundColor: `${role.color}10` }} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {role.members.map((member: any) => (
                      <ScreenshotButton 
                        key={member.id}
                        elementId={`staff-card-${member.id}`} 
                        fileName={`${member.username}-staff-card.png`} 
                        memberData={member}
                        className="h-full"
                      >
                        <motion.div
                          id={`staff-card-${member.id}`}
                          whileHover={{ y: -4, scale: 1.01 }}
                          onClick={() => router.push(`/dashboard/search?q=${member.id}`)}
                          className="bg-[#111827]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-lg hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] transition-all duration-300 cursor-pointer group relative overflow-hidden h-full"
                          style={{ borderTopColor: `${member.highestRoleColor}80`, borderTopWidth: '2px' }}
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full opacity-50 pointer-events-none" style={{ backgroundImage: `linear-gradient(to bottom right, ${member.highestRoleColor}20, transparent)` }} />
                          
                          <div className="flex items-start gap-4 relative z-10">
                            <div className="relative w-20 h-20 shrink-0 group/avatar">
                              <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#111827] shadow-md relative z-10 bg-[#0a0f1a]" style={{ borderColor: member.highestRoleColor }}>
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
                              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] z-15 pointer-events-none" />
                            </div>
                            
                            <div className="flex-1 min-w-0 pt-2">
                              <h4 className="text-xl font-bold text-white truncate group-hover:text-blue-400 transition-colors" style={{ color: member.highestRoleColor }}>
                                {member.displayName}
                              </h4>
                              <p className="text-base text-gray-400 truncate">@{member.username}</p>
                            </div>
                          </div>

                          {member.stats && (
                            <div className="mt-6 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#0a0f1a] rounded-2xl p-6 border border-white/10 flex flex-col gap-2 hover:bg-white/5 transition-all hover:scale-[1.02] shadow-inner">
                                  <div className="flex items-center gap-3 text-gray-400 text-sm font-bold">
                                    <MessageSquare className="w-5 h-5 text-blue-400" />
                                    <span className="tracking-wider">الرسائل</span>
                                  </div>
                                  <div className="text-4xl font-black text-white tracking-tighter">{member.stats.messages.total.toLocaleString()}</div>
                                  <div className="flex justify-between text-[11px] text-gray-500 mt-2 border-t border-white/5 pt-2 font-mono">
                                    <span className="bg-white/5 px-2 py-0.5 rounded">ي: {member.stats.messages.daily}</span>
                                    <span className="bg-white/5 px-2 py-0.5 rounded">أ: {member.stats.messages.weekly}</span>
                                    <span className="bg-white/5 px-2 py-0.5 rounded">ش: {member.stats.messages.monthly}</span>
                                  </div>
                                </div>

                                <div className="bg-[#0a0f1a] rounded-2xl p-6 border border-white/10 flex flex-col gap-2 hover:bg-white/5 transition-all hover:scale-[1.02] shadow-inner">
                                  <div className="flex items-center gap-3 text-gray-400 text-sm font-bold">
                                    <Flame className="w-5 h-5 text-orange-400" />
                                    <span className="tracking-wider">الستريك</span>
                                  </div>
                                  <div className="text-4xl font-black text-white tracking-tighter">{member.stats.streak}</div>
                                  <div className="flex items-center gap-2 text-red-400 text-[11px] font-bold mt-2 border-t border-white/5 pt-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>تحذيرات: {member.stats.warns.length}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Detailed Logs */}
                              <div className="space-y-3">
                                {member.stats.warns.length > 0 && (
                                  <div className="bg-[#0a0f1a] rounded-xl p-4 border border-white/5">
                                    <h5 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
                                      <Shield className="w-3.5 h-3.5" />
                                      التحذيرات ({member.stats.warns.length})
                                    </h5>
                                    <div className="space-y-1.5">
                                      {member.stats.warns.slice(0, 2).map((w: any, i: number) => (
                                        <div key={i} className="text-sm text-gray-300 truncate cursor-pointer hover:text-white bg-white/5 px-2 py-1 rounded" onClick={(e) => { e.stopPropagation(); w.attachments && setPopupImage(w.attachments[0]); }}>#{w.warn_number}: {w.reason}</div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {member.stats.timeouts.length > 0 && (
                                  <div className="bg-[#0a0f1a] rounded-xl p-4 border border-white/5">
                                    <h5 className="text-sm font-bold text-orange-400 mb-2 flex items-center gap-2">
                                      <Clock className="w-3.5 h-3.5" />
                                      التايم أوت ({member.stats.timeouts.length})
                                    </h5>
                                    <div className="space-y-1.5">
                                      {member.stats.timeouts.slice(0, 2).map((t: any, i: number) => (
                                        <div key={i} className="text-sm text-gray-300 truncate cursor-pointer hover:text-white bg-white/5 px-2 py-1 rounded" onClick={(e) => { e.stopPropagation(); t.attachments && setPopupImage(t.attachments[0]); }}>#{t.timeout_number}: {t.reason}</div>
                                      ))}
                                    </div>
                                  </div>
                                )}
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
