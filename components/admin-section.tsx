'use client';

import { useState, useEffect } from 'react';
import CachedImage from '@/components/cached-image';
import { Shield, MessageSquare, Flame, Loader2, ChevronDown, ChevronUp, Camera, Ban, ShieldAlert, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ImagePopup } from '@/components/image-popup';
import { fetchWithRetry } from '@/lib/utils';

// Tooltip Component
function Tooltip({ children, text }: { children: React.ReactNode, text: string }) {
  const [show, setShow] = useState(false);
  
  return (
    <div 
      className="relative flex-1 md:flex-none"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={(e) => {
        e.stopPropagation();
        setShow(!show);
      }}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 border border-white/10 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-xl pointer-events-none"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AdminSection({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(initialCategories.length === 0);
  const [error, setError] = useState(false);
  const [popupImage, setPopupImage] = useState<string | null>(null);
  const router = useRouter();

  const fetchAdminData = () => {
    setLoading(true);
    setError(false);
    fetchWithRetry('/api/admin')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setError(true);
        }
      })
      .catch(err => {
        console.error('Failed to fetch admin data:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (initialCategories.length === 0) {
      const timer = setTimeout(() => {
        fetchAdminData();
      }, 0);
      return () => clearTimeout(timer);
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

  if (error || !categories || categories.length === 0) {
    return (
      <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-blue-500/20 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">فريق الإدارة</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 gap-4 bg-[#111827]/40 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl">
          <p className="text-gray-500">
            {error ? 'حدث خطأ أثناء جلب بيانات الإدارة' : 'لا يوجد أعضاء في فريق الإدارة حالياً'}
          </p>
          <button 
            onClick={fetchAdminData}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
          >
            إعادة المحاولة
          </button>
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
                        <motion.div
                          key={member.id}
                          id={`admin-card-${member.id}`}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-50px" }}
                          whileHover={{ y: -2, scale: 1.005 }}
                          transition={{ duration: 0.4 }}
                          onClick={() => router.push(`/dashboard/search?q=${member.id}`)}
                          className="bg-[#111827]/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500 cursor-pointer group relative w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
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
                          {member.hideStats ? (
                            <div className="flex-1 flex items-center justify-center relative z-10 w-full md:w-auto">
                              <div className="bg-blue-500/10 border border-blue-500/20 px-6 py-3 rounded-xl flex items-center gap-3">
                                <ShieldAlert className="w-5 h-5 text-blue-400" />
                                <span className="text-blue-200 font-medium text-sm">الإحصائيات مخفية من قبل المستخدم</span>
                              </div>
                            </div>
                          ) : member.stats && (
                            <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-6 relative z-10 w-full md:w-auto">
                              <Tooltip text="عدد الرسائل التي أرسلها العضو">
                                <div className="flex flex-col gap-1 bg-black/20 px-4 py-2 rounded-xl border border-white/5 w-full h-full">
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
                              </Tooltip>

                              <Tooltip text="عدد الأيام المتتالية التي أكمل فيها المهام">
                                <div className="flex flex-col gap-1 bg-black/20 px-4 py-2 rounded-xl border border-white/5 w-full h-full">
                                  <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold">
                                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                                    <span>الستريك</span>
                                  </div>
                                  <div className="text-lg font-black text-white">{member.stats.streak}</div>
                                  <div className="text-[9px] text-gray-500">
                                    {member.stats.completed_today ? <span className="text-emerald-400">مكتمل اليوم</span> : <span className="text-red-400">غير مكتمل</span>}
                                  </div>
                                </div>
                              </Tooltip>

                              <Tooltip text="عدد التحذيرات التي تلقاها العضو">
                                <div className="flex flex-col gap-1 bg-black/20 px-4 py-2 rounded-xl border border-white/5 w-full h-full">
                                  <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold">
                                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                                    <span>التحذيرات</span>
                                  </div>
                                  <div className="text-lg font-black text-white">{member.stats.warns.length}</div>
                                  <div className="text-[9px] text-gray-500">
                                    تايم أوت: {member.stats.timeouts.length}
                                  </div>
                                </div>
                              </Tooltip>

                              {member.stats.tickets >= 0 && (
                                <Tooltip text="عدد التذاكر التي استلمها العضو">
                                  <div className="flex flex-col gap-1 bg-black/20 px-4 py-2 rounded-xl border border-white/5 w-full h-full">
                                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold">
                                      <Ticket className="w-3.5 h-3.5 text-blue-400" />
                                      <span>النقاط</span>
                                    </div>
                                    <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                      {member.stats.tickets}
                                    </div>
                                    <div className="text-[9px] text-gray-500">
                                      مستلمة
                                    </div>
                                  </div>
                                </Tooltip>
                              )}
                            </div>
                          )}
                        </motion.div>
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
