'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, ChevronDown, ChevronUp, ShieldAlert, Clock, Ban, Flame, MessageSquare, Calendar, ListTodo, Camera, CheckCircle2 } from 'lucide-react';
import CachedImage from '@/components/cached-image';
import { formatDateEn, formatVoiceTime, parseDiscordEmoji, generateGradientColors } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { ScreenshotButton } from '@/components/screenshot-button';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchDefault = async () => {
      try {
        if (initialQuery) {
          const res = await fetch(`/api/search?q=${encodeURIComponent(initialQuery)}`);
          const data = await res.json();
          setResults(data.results || []);
          if (data.results && data.results.length > 0) {
            toggleExpand(data.results[0].id);
          }
        } else {
          const res = await fetch('/api/search');
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        // Error handling removed
      } finally {
        setLoading(false);
      }
    };
    fetchDefault();
  }, [initialQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setExpandedId(null);
    setExpandedData(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
      if (data.results && data.results.length > 0) {
        toggleExpand(data.results[0].id);
      }
    } catch (err) {
      // Error handling removed
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedData(null);
      return;
    }

    setExpandedId(id);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/user/${id}`);
      const data = await res.json();
      setExpandedData(data);
    } catch (err) {
      // Error handling removed
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <SearchIcon className="w-6 h-6 text-blue-400" />
          البحث عن عضو
        </h1>
        
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="أدخل أيدي العضو (ID)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl py-4 pr-12 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? 'جاري البحث...' : 'بحث'}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {results.length === 0 && !loading && query && (
          <div className="text-center py-12 bg-[#111827]/40 rounded-3xl border border-white/5">
            <p className="text-gray-400 text-lg">لم يتم العثور على نتائج.</p>
          </div>
        )}

        {results.map((user) => (
          <ScreenshotButton 
            key={user.id} 
            elementId={`search-card-${user.id}`} 
            fileName={`${user.username}-profile.png`}
            memberData={user}
          >
            <div id={`search-card-${user.id}`} className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 relative group">
              {/* Banner */}
              {user.banner && (
                <div className="aspect-[5/2] w-full relative overflow-hidden">
                  <CachedImage src={user.banner} alt="Banner" fill className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent z-20" />
                </div>
              )}

              <motion.div 
                className={`p-6 flex flex-col items-center md:items-start cursor-pointer hover:bg-white/5 transition-colors relative z-30 ${user.banner ? '-mt-16 md:-mt-24' : ''}`}
                onClick={() => toggleExpand(user.id)}
              >
                <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
                  <div className="w-32 h-32 md:w-40 md:h-40 relative rounded-full overflow-hidden border-4 border-[#111827] bg-[#111827] z-10 shadow-2xl">
                    {user.avatar ? (
                      <CachedImage src={user.avatar} alt={user.username} fill className="object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-4xl">{user.username.charAt(0)}</div>
                    )}
                  </div>
                  <div className="mb-2 text-center md:text-right">
                    <h3 className="font-black text-3xl md:text-4xl mb-1" style={{ color: user.highestRoleColor || '#ffffff' }}>
                      {user.displayName}
                    </h3>
                    <p className="text-lg text-gray-400">({user.username})</p>
                    <p className="text-sm text-gray-500 mt-2 font-mono bg-white/5 px-3 py-1 rounded-full inline-block">ID: {user.id}</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8 mt-6 text-sm text-gray-400 w-full md:w-auto">
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 w-full md:w-auto justify-center">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span>تاريخ الإنشاء: {formatDateEn(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5 w-full md:w-auto justify-center">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>تاريخ الانضمام: {formatDateEn(user.joinedAt)}</span>
                  </div>
                </div>
                
                {user.roles && user.roles.length > 0 && (
                  <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-2">
                    {user.roles.map((role: any) => {
                      const roleColor = role.color !== '#000000' ? role.color : '#ffffff';
                      const { primaryColor, secondaryColor, tertiaryColor } = generateGradientColors(roleColor);
                      return (
                        <div 
                          key={role.id} 
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border border-white/10 backdrop-blur-md"
                          style={{ 
                            backgroundImage: `linear-gradient(to right, ${primaryColor}20, ${secondaryColor}20, ${tertiaryColor}20)`, 
                            color: primaryColor 
                          }}
                        >
                          {role.icon && <CachedImage src={role.icon} alt={role.name} width={18} height={18} />}
                          {role.name}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Expanded Details */}
              {expandedId === user.id && (
                <div className="border-t border-white/10 bg-[#0a0f1a]/90 p-6 md:p-8">
                  {loadingDetails ? (
                    <div className="flex justify-center py-12">
                      <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  ) : expandedData?.error ? (
                    <div className="flex justify-center py-8">
                      <p className="text-red-400 text-sm">حدث خطأ أثناء جلب البيانات: {expandedData.error}</p>
                    </div>
                  ) : expandedData?.db ? (
                    <div className="space-y-8">
                      {/* New Stats Grid - Larger and more prominent */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Messages */}
                        <div className="bg-[#111827] border-2 border-blue-500/30 rounded-3xl p-8 shadow-2xl hover:border-blue-500/60 transition-all group flex flex-col justify-between">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-blue-500/20 rounded-2xl group-hover:bg-blue-500/30 transition-colors">
                              <MessageSquare className="w-8 h-8 text-blue-400" />
                            </div>
                            <h4 className="font-black text-2xl text-blue-400 tracking-tight">الرسائل</h4>
                          </div>
                          <div className="space-y-6">
                            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                              <span className="text-gray-400 font-bold">المجموع:</span> 
                              <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tighter leading-none">{expandedData.db.messages?.all?.toLocaleString() || 0}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 pt-2">
                              <div className="text-center bg-white/5 p-2 rounded-xl">
                                <div className="text-[10px] text-gray-500 uppercase font-black">يوم</div>
                                <div className="text-lg font-black text-white">{expandedData.db.messages?.top_day || 0}</div>
                              </div>
                              <div className="text-center bg-white/5 p-2 rounded-xl">
                                <div className="text-[10px] text-gray-500 uppercase font-black">أسبوع</div>
                                <div className="text-lg font-black text-white">{expandedData.db.messages?.top_week || 0}</div>
                              </div>
                              <div className="text-center bg-white/5 p-2 rounded-xl">
                                <div className="text-[10px] text-gray-500 uppercase font-black">شهر</div>
                                <div className="text-lg font-black text-white">{expandedData.db.messages?.top_month || 0}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Voice */}
                        <div className="bg-[#111827] border-2 border-purple-500/30 rounded-3xl p-8 shadow-2xl hover:border-purple-500/60 transition-all group flex flex-col justify-between">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-purple-500/20 rounded-2xl group-hover:bg-purple-500/30 transition-colors">
                              <Clock className="w-8 h-8 text-purple-400" />
                            </div>
                            <h4 className="font-black text-2xl text-purple-400 tracking-tight">الفويس</h4>
                          </div>
                          <div className="space-y-6">
                            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                              <span className="text-gray-400 font-bold">المجموع:</span> 
                              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tighter leading-none">{formatVoiceTime(expandedData.db.voice?.all || 0)}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3 pt-2">
                              <div className="text-center bg-white/5 p-2 rounded-xl">
                                <div className="text-[10px] text-gray-500 uppercase font-black">يوم</div>
                                <div className="text-xs font-black text-white">{formatVoiceTime(expandedData.db.voice?.top_day || 0)}</div>
                              </div>
                              <div className="text-center bg-white/5 p-2 rounded-xl">
                                <div className="text-[10px] text-gray-500 uppercase font-black">أسبوع</div>
                                <div className="text-xs font-black text-white">{formatVoiceTime(expandedData.db.voice?.top_week || 0)}</div>
                              </div>
                              <div className="text-center bg-white/5 p-2 rounded-xl">
                                <div className="text-[10px] text-gray-500 uppercase font-black">شهر</div>
                                <div className="text-xs font-black text-white">{formatVoiceTime(expandedData.db.voice?.top_month || 0)}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Streaks */}
                        <div className="bg-[#111827] border-2 border-orange-500/30 rounded-3xl p-8 shadow-2xl hover:border-orange-500/60 transition-all group flex flex-col justify-between">
                          <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-orange-500/20 rounded-2xl group-hover:bg-orange-500/30 transition-colors">
                              <Flame className="w-8 h-8 text-orange-400" />
                            </div>
                            <h4 className="font-black text-2xl text-orange-400 tracking-tight">الستريك</h4>
                          </div>
                          <div className="space-y-6">
                            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                              <span className="text-gray-400 font-bold">الحالي:</span> 
                              <div className="flex items-center gap-3">
                                <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tighter leading-none">{expandedData.db.streaks?.streak || 0}</span>
                                {expandedData.db.streaks?.streak_emoji_url ? (
                                  <CachedImage src={expandedData.db.streaks.streak_emoji_url} alt="streak" width={32} height={32} />
                                ) : (
                                  <Flame className="w-8 h-8 text-orange-500" />
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between text-base"><span className="text-gray-400 font-bold">الحمايات:</span> <span className="text-white font-black">{expandedData.db.streaks?.shields || 0}</span></div>
                            <div className="space-y-2">
                              <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5">
                                <div 
                                  className="bg-gradient-to-r from-orange-600 to-orange-400 h-full rounded-full transition-all duration-1000 ease-out" 
                                  style={{ width: `${Math.min(100, ((expandedData.db.streaks?.daily_messages || 0) / 100) * 100)}%` }}
                                />
                              </div>
                              <div className="text-xs text-center text-gray-500 font-bold">{expandedData.db.streaks?.daily_messages || 0} / 100 رسالة اليوم</div>
                            </div>
                          </div>
                        </div>

                        {/* Tasks */}
                        <div className="lg:col-span-3 bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full blur-3xl" />
                          <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1 space-y-6">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                  <ListTodo className="w-6 h-6 text-blue-400" />
                                </div>
                                <h4 className="text-2xl font-black text-white tracking-tight">المهام المتبقية</h4>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {(() => {
                                  const remaining = expandedData.db.stats?.tasks_remaining ? expandedData.db.stats.tasks_remaining.split(',').filter(Boolean) : [];
                                  if (!expandedData.db.stats?.completed_today) {
                                    remaining.push("إكمال مهمة الستريك");
                                  }
                                  return remaining.length > 0 ? remaining.map((task: string, i: number) => (
                                    <div key={i} className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                      {task}
                                    </div>
                                  )) : (
                                    <div className="text-gray-500 font-bold italic py-2">لا توجد مهام متبقية 🎉</div>
                                  );
                                })()}
                              </div>
                            </div>
                            
                            <div className="w-px bg-white/5 hidden md:block" />
                            
                            <div className="flex-1 space-y-6">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h4 className="text-2xl font-black text-white tracking-tight">المهام المكتملة</h4>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {(() => {
                                  const completed = expandedData.db.stats?.tasks_completed ? expandedData.db.stats.tasks_completed.split(',').filter(Boolean) : [];
                                  return completed.length > 0 ? completed.map((task: string, i: number) => (
                                    <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      {task}
                                    </div>
                                  )) : (
                                    <div className="text-gray-500 font-bold italic py-2">لم يتم إكمال أي مهام بعد</div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Coins */}
                        <div className="bg-gradient-to-br from-[#111827] to-[#0a0f1a] border-2 border-yellow-500/40 rounded-3xl p-8 shadow-2xl hover:border-yellow-500/70 transition-all group flex flex-col items-center justify-center text-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-bl-full blur-2xl" />
                          <div className="p-4 bg-yellow-500/20 rounded-full mb-6 group-hover:scale-110 transition-transform">
                            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-2xl font-black text-black shadow-[0_0_20px_rgba(250,204,21,0.4)]">$</div>
                          </div>
                          <h4 className="font-black text-2xl text-yellow-400 mb-2 tracking-tight">الرصيد الحالي</h4>
                          <div className="flex flex-col items-center">
                            <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tighter leading-none drop-shadow-lg">{expandedData.db.coins?.coins?.toLocaleString() || 0}</span>
                            <span className="text-sm text-gray-500 mt-4 font-bold uppercase tracking-[0.2em] opacity-60">عملة رقمية</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Admin Warns (swarns) */}
                        <div className="bg-[#111827] border border-red-500/20 rounded-2xl overflow-hidden flex flex-col h-80 shadow-lg group hover:border-red-500/40 transition-all">
                          <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-red-400">تحذيرات إدارية ({expandedData.db.swarns?.length || 0})</h4>
                          </div>
                          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                            {(!expandedData.db.swarns || expandedData.db.swarns.length === 0) ? (
                              <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                <CheckCircle2 className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-sm">سجل نظيف</p>
                              </div>
                            ) : (
                              expandedData.db.swarns.map((w: any, i: number) => (
                                <div key={i} className="bg-white/5 border border-white/5 hover:border-red-500/30 rounded-xl p-4 text-sm transition-all">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-mono text-red-300 bg-red-500/20 px-2 py-0.5 rounded-md text-xs">#{w.warn_number}</span>
                                    <span className="text-[10px] text-gray-500">{formatDateEn(w.date_warn)}</span>
                                  </div>
                                  <p className="text-gray-200 leading-relaxed">{w.reason}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Warns */}
                        <div className="bg-[#111827] border border-yellow-500/20 rounded-2xl overflow-hidden flex flex-col h-80 shadow-lg group hover:border-yellow-500/40 transition-all">
                          <div className="bg-yellow-500/10 p-4 border-b border-yellow-500/20 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-yellow-400">التحذيرات ({expandedData.db.warns?.length || 0})</h4>
                          </div>
                          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                            {(!expandedData.db.warns || expandedData.db.warns.length === 0) ? (
                              <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                <CheckCircle2 className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-sm">سجل نظيف</p>
                              </div>
                            ) : (
                              expandedData.db.warns.map((w: any, i: number) => (
                                <div key={i} className="bg-white/5 border border-white/5 hover:border-yellow-500/30 rounded-xl p-4 text-sm transition-all">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-mono text-yellow-300 bg-yellow-500/20 px-2 py-0.5 rounded-md text-xs">#{w.warn_number}</span>
                                    <span className="text-[10px] text-gray-500">{formatDateEn(w.date_warn)}</span>
                                  </div>
                                  <p className="text-gray-200 leading-relaxed">{w.reason}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Timeouts */}
                        <div className="bg-[#111827] border border-orange-500/20 rounded-2xl overflow-hidden flex flex-col h-80 shadow-lg group hover:border-orange-500/40 transition-all">
                          <div className="bg-orange-500/10 p-4 border-b border-orange-500/20 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-orange-400">التايم أوت ({expandedData.db.timeouts?.length || 0})</h4>
                          </div>
                          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                            {(!expandedData.db.timeouts || expandedData.db.timeouts.length === 0) ? (
                              <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                <CheckCircle2 className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-sm">سجل نظيف</p>
                              </div>
                            ) : (
                              expandedData.db.timeouts.map((t: any, i: number) => (
                                <div key={i} className="bg-white/5 border border-white/5 hover:border-orange-500/30 rounded-xl p-4 text-sm transition-all">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-mono text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded-md text-xs">#{t.timeout_number}</span>
                                    <span className="text-[10px] text-gray-500">{formatDateEn(t.date)}</span>
                                  </div>
                                  <div className="text-xs text-orange-300 mb-2 bg-orange-500/10 inline-block px-2 py-0.5 rounded font-bold">المدة: {t.time}</div>
                                  <p className="text-gray-200 leading-relaxed">{t.reason}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Bans */}
                        <div className="bg-[#111827] border border-red-500/20 rounded-2xl overflow-hidden flex flex-col h-80 shadow-lg group hover:border-red-500/40 transition-all">
                          <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex items-center gap-2">
                            <Ban className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                            <h4 className="font-bold text-red-400">الباند ({expandedData.db.bans?.length || 0})</h4>
                          </div>
                          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                            {(!expandedData.db.bans || expandedData.db.bans.length === 0) ? (
                              <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                <CheckCircle2 className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-sm">سجل نظيف</p>
                              </div>
                            ) : (
                              expandedData.db.bans.map((b: any, i: number) => (
                                <div key={i} className="bg-white/5 border border-white/5 hover:border-red-500/30 rounded-xl p-4 text-sm transition-all">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-mono text-red-300 bg-red-500/20 px-2 py-0.5 rounded-md text-xs">#{b.ban_number}</span>
                                    <span className="text-[10px] text-gray-500">{formatDateEn(b.date)}</span>
                                  </div>
                                  <div className="flex gap-2 mb-2">
                                    <span className="text-xs text-red-300 bg-red-500/10 px-2 py-0.5 rounded font-bold">المدة: {b.time}</span>
                                    {b.unbanned && (
                                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">مفكوك</span>
                                    )}
                                  </div>
                                  <p className="text-gray-200 leading-relaxed">{b.reason}</p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </ScreenshotButton>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
