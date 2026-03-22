'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, ChevronDown, ChevronUp, ShieldAlert, Clock, Ban, Flame, MessageSquare, Calendar, ListTodo, Camera, CheckCircle2, History } from 'lucide-react';
import CachedImage from '@/components/cached-image';
import { formatDateEn, formatVoiceTime, parseDiscordEmoji, generateGradientColors } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { ScreenshotButton } from '@/components/screenshot-button';
import { RolesDisplay } from '@/components/roles-display';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(20);
  }, [results]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + 20);
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    return () => observer.disconnect();
  }, [results]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);

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
      <div className="bg-[#0a0f1a]/80 border border-blue-500/20 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none group-hover:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_70%)] transition-colors duration-700" />
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-blue-200 mb-8 flex items-center gap-4 relative z-10 tracking-tight drop-shadow-sm">
          <div className="p-3 bg-blue-500/20 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-500/30">
            <SearchIcon className="w-7 h-7 text-blue-400" />
          </div>
          البحث عن عضو
        </h1>
        
        <form onSubmit={handleSearch} className="relative z-10">
          <input
            type="text"
            placeholder="أدخل أيدي العضو (ID)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#0a0f1a] border border-blue-500/30 rounded-2xl py-5 pr-14 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner text-lg"
          />
          <SearchIcon className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-blue-600/50 disabled:to-blue-600/50 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] hover:-translate-y-0.5"
          >
            {loading ? 'جاري البحث...' : 'بحث'}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {results.length === 0 && !loading && query && (
          <div className="text-center py-16 bg-[#0a0f1a]/80 rounded-[2rem] border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
            <p className="text-gray-400 text-xl font-medium">لم يتم العثور على نتائج.</p>
          </div>
        )}

        {results.slice(0, visibleCount).map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (index % 20) * 0.05 }}
          >
            <ScreenshotButton 
              elementId={`search-card-${user.id}`} 
              fileName={`${user.username}-profile.png`}
              memberData={user}
            >
              <div id={`search-card-${user.id}`} className="bg-[#0a0f1a]/80 border border-blue-500/20 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all duration-500 relative group hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] hover:border-blue-500/50">
                {/* Banner */}
              {user.banner && (
                <div className="aspect-[5/2] w-full relative overflow-hidden">
                  <CachedImage src={user.banner} alt="Banner" fill className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a]/90 via-[#0a0f1a]/50 to-transparent z-20" />
                </div>
              )}

              <motion.div 
                className={`p-8 flex flex-col items-center md:items-start cursor-pointer hover:bg-white/5 transition-colors relative z-30 ${user.banner ? '-mt-16 md:-mt-24' : ''}`}
                onClick={() => toggleExpand(user.id)}
              >
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                  <div className="w-32 h-32 md:w-44 md:h-44 relative rounded-full overflow-hidden border-4 border-[#0a0f1a] bg-[#0a0f1a] z-10 shadow-[0_0_30px_rgba(0,0,0,0.8)] shrink-0 group-hover:scale-105 transition-transform duration-500">
                    {user.avatar ? (
                      <CachedImage src={user.avatar} alt={user.username} fill className="object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-5xl">{user.username.charAt(0)}</div>
                    )}
                  </div>
                  <div className="mb-4 text-center md:text-right">
                    <h3 className="font-black text-4xl md:text-5xl mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-colors tracking-tight" style={{ color: user.highestRoleColor || '#ffffff' }}>
                      {user.displayName}
                    </h3>
                    <p className="text-xl text-blue-200/70 font-medium tracking-wide">@{user.username}</p>
                    <p className="text-sm text-gray-500 mt-3 font-mono bg-[#0a0f1a]/80 px-4 py-1.5 rounded-xl inline-block border border-white/10 shadow-inner">ID: {user.id}</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mt-8 text-sm text-gray-400 w-full md:w-auto">
                  <div className="flex items-center gap-3 bg-[#0a0f1a]/80 px-5 py-3 rounded-2xl border border-white/10 w-full md:w-auto justify-center shadow-inner hover:bg-white/5 hover:border-blue-500/30 transition-all whitespace-nowrap">
                    <Calendar className="w-5 h-5 text-blue-400 shrink-0" />
                    <span className="font-medium text-xs sm:text-sm">تاريخ الإنشاء: {formatDateEn(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#0a0f1a]/80 px-5 py-3 rounded-2xl border border-white/10 w-full md:w-auto justify-center shadow-inner hover:bg-white/5 hover:border-purple-500/30 transition-all whitespace-nowrap">
                    <Calendar className="w-5 h-5 text-purple-400 shrink-0" />
                    <span className="font-medium text-xs sm:text-sm">تاريخ الانضمام: {formatDateEn(user.joinedAt)}</span>
                  </div>
                </div>
                
                {user.roles && user.roles.length > 0 && (
                  <RolesDisplay roles={user.roles} />
                )}
              </motion.div>

              {/* Expanded Details */}
              {expandedId === user.id && (
                <div className="border-t border-blue-500/20 bg-[#0a0f1a]/90 p-6 md:p-10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                  <div className="relative z-10">
                  {loadingDetails && (
                    <div className="flex justify-center py-12">
                      <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  )}

                  {!loadingDetails && expandedData?.error && (
                    <div className="flex justify-center py-8">
                      <p className="text-red-400 text-sm">حدث خطأ أثناء جلب البيانات: {expandedData.error}</p>
                    </div>
                  )}

                  {!loadingDetails && !expandedData?.error && expandedData?.db && (
                    <div className="space-y-8">
                      {/* New Stats Grid - Larger and more prominent */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Messages */}
                        <div className="bg-[#111827]/80 border border-blue-500/20 rounded-3xl p-8 shadow-2xl hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-500 group flex flex-col justify-between relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_70%)] group-hover:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_70%)] transition-colors" />
                          <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="p-3 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                <MessageSquare className="w-8 h-8 text-blue-400" />
                              </div>
                              <h4 className="font-black text-2xl text-blue-400 tracking-tight drop-shadow-sm">الرسائل</h4>
                            </div>
                            <div className="space-y-6">
                              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                <span className="text-gray-400 font-bold">المجموع:</span> 
                                <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tighter leading-none drop-shadow-md">{expandedData.db.messages?.all?.toLocaleString() || 0}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-3 pt-2">
                                <div className="text-center bg-white/5 p-2 rounded-xl border border-white/5 shadow-inner">
                                  <div className="text-[10px] text-gray-500 uppercase font-black">يوم</div>
                                  <div className="text-lg font-black text-white">{expandedData.db.messages?.top_day || 0}</div>
                                </div>
                                <div className="text-center bg-white/5 p-2 rounded-xl border border-white/5 shadow-inner">
                                  <div className="text-[10px] text-gray-500 uppercase font-black">أسبوع</div>
                                  <div className="text-lg font-black text-white">{expandedData.db.messages?.top_week || 0}</div>
                                </div>
                                <div className="text-center bg-white/5 p-2 rounded-xl border border-white/5 shadow-inner">
                                  <div className="text-[10px] text-gray-500 uppercase font-black">شهر</div>
                                  <div className="text-lg font-black text-white">{expandedData.db.messages?.top_month || 0}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Voice */}
                        <div className="bg-[#111827]/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 shadow-2xl hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:border-purple-500/40 hover:-translate-y-1 transition-all duration-500 group flex flex-col justify-between relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
                          <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="p-3 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                <Clock className="w-8 h-8 text-purple-400" />
                              </div>
                              <h4 className="font-black text-2xl text-purple-400 tracking-tight drop-shadow-sm">الفويس</h4>
                            </div>
                            <div className="space-y-6">
                              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                <span className="text-gray-400 font-bold">المجموع:</span> 
                                <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tighter leading-none drop-shadow-md">{formatVoiceTime(expandedData.db.voice?.all || 0)}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-3 pt-2">
                                <div className="text-center bg-white/5 p-2 rounded-xl border border-white/5 shadow-inner">
                                  <div className="text-[10px] text-gray-500 uppercase font-black">يوم</div>
                                  <div className="text-xs font-black text-white">{formatVoiceTime(expandedData.db.voice?.top_day || 0)}</div>
                                </div>
                                <div className="text-center bg-white/5 p-2 rounded-xl border border-white/5 shadow-inner">
                                  <div className="text-[10px] text-gray-500 uppercase font-black">أسبوع</div>
                                  <div className="text-xs font-black text-white">{formatVoiceTime(expandedData.db.voice?.top_week || 0)}</div>
                                </div>
                                <div className="text-center bg-white/5 p-2 rounded-xl border border-white/5 shadow-inner">
                                  <div className="text-[10px] text-gray-500 uppercase font-black">شهر</div>
                                  <div className="text-xs font-black text-white">{formatVoiceTime(expandedData.db.voice?.top_month || 0)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Streaks */}
                        <div className="bg-[#111827]/80 backdrop-blur-xl border border-orange-500/20 rounded-3xl p-8 shadow-2xl hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:border-orange-500/40 hover:-translate-y-1 transition-all duration-500 group flex flex-col justify-between relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full blur-2xl group-hover:bg-orange-500/10 transition-colors" />
                          <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                              <div className="p-3 bg-orange-500/10 rounded-2xl group-hover:bg-orange-500/20 group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                                <Flame className="w-8 h-8 text-orange-400" />
                              </div>
                              <h4 className="font-black text-2xl text-orange-400 tracking-tight drop-shadow-sm">الستريك</h4>
                            </div>
                            <div className="space-y-6">
                              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                <span className="text-gray-400 font-bold">الحالي:</span> 
                                <div className="flex items-center gap-3">
                                  <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tighter leading-none drop-shadow-md">{expandedData.db.streaks?.streak || 0}</span>
                                  {expandedData.db.streaks?.streak_emoji_url ? (
                                    <CachedImage src={expandedData.db.streaks.streak_emoji_url} alt="streak" width={32} height={32} className="drop-shadow-md" />
                                  ) : (
                                    <Flame className="w-8 h-8 text-orange-500 drop-shadow-md" />
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
                      </div>

                        {/* Tasks */}
                        <div className="lg:col-span-3 bg-[#111827]/80 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:border-blue-500/40 transition-all duration-500">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                          <div className="flex flex-col md:flex-row gap-8 relative z-10">
                            <div className="flex-1 space-y-6">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                  <ListTodo className="w-6 h-6 text-blue-400" />
                                </div>
                                <h4 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">المهام المتبقية</h4>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {(() => {
                                  const tasks = expandedData.db.tasks || [];
                                  const remaining = tasks.filter((t: any) => !t.completed);
                                  return remaining.length > 0 ? remaining.map((task: any, i: number) => (
                                    <div key={i} className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-300 shadow-sm hover:scale-105 transition-transform" style={{ animationDelay: `${i * 100}ms` }}>
                                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                                      {task.task_name} {task.remaining ? `(${task.remaining})` : ''}
                                    </div>
                                  )) : (
                                    <div className="text-gray-500 font-bold italic py-2">لا توجد مهام متبقية 🎉</div>
                                  );
                                })()}
                              </div>
                            </div>
                            
                            <div className="w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />
                            
                            <div className="flex-1 space-y-6">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h4 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">المهام المكتملة</h4>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {(() => {
                                  const tasks = expandedData.db.tasks || [];
                                  const completed = tasks.filter((t: any) => t.completed);
                                  if (expandedData.db.streaks?.daily_messages >= 100) {
                                    completed.push({ task_name: 'إنجاز مهمة الستريك بنجاح', completed: true });
                                  }
                                  return completed.length > 0 ? completed.map((task: any, i: number) => (
                                    <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in zoom-in duration-300 shadow-sm hover:scale-105 transition-transform" style={{ animationDelay: `${i * 100}ms` }}>
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                                      {task.task_name}
                                    </div>
                                  )) : (
                                    <div className="text-gray-500 font-bold italic py-2">لم يتم إكمال أي مهام بعد</div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Recent Purchases */}
                        <div className="lg:col-span-3 bg-[#111827]/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:border-purple-500/40 transition-all duration-500">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="p-2 bg-purple-500/10 rounded-2xl group-hover:bg-purple-500/20 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                                <History className="w-6 h-6 text-purple-400" />
                              </div>
                              <h4 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">آخر المشتريات</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                              {expandedData.db.coins?.last_5 && expandedData.db.coins.last_5.length > 0 ? (
                                expandedData.db.coins.last_5.map((purchase: any, i: number) => (
                                  <div key={i} className="bg-[#0a0f1a]/80 backdrop-blur-md border border-white/5 p-4 rounded-2xl hover:border-purple-500/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                                    <div className="mb-2">
                                      <h5 className="font-bold text-gray-200 text-sm truncate">{purchase.item_name}</h5>
                                      <span className="text-yellow-400 font-mono text-xs font-bold drop-shadow-sm">{purchase.price.toLocaleString()} عملة</span>
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                                      <Clock className="w-3 h-3" />
                                      <span>{purchase.date}</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="col-span-full text-gray-500 font-bold italic py-2">لا توجد مشتريات حديثة</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Coins */}
                        <div className="bg-gradient-to-br from-[#111827] to-[#0a0f1a] border-2 border-yellow-500/40 rounded-3xl p-8 shadow-2xl hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] hover:border-yellow-500/60 transition-all duration-500 group flex flex-col items-center justify-center text-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-bl-full blur-2xl group-hover:bg-yellow-500/20 transition-colors" />
                          <div className="relative z-10 flex flex-col items-center">
                            <div className="p-4 bg-yellow-500/20 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                              <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-2xl font-black text-black shadow-[0_0_20px_rgba(250,204,21,0.6)]">$</div>
                            </div>
                            <h4 className="font-black text-2xl text-yellow-400 mb-2 tracking-tight drop-shadow-sm">الرصيد الحالي</h4>
                            <div className="flex flex-col items-center">
                              <span className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tighter leading-none drop-shadow-lg">{expandedData.db.coins?.coins?.toLocaleString() || 0}</span>
                              <span className="text-sm text-gray-500 mt-4 font-bold uppercase tracking-[0.2em] opacity-60">عملة رقمية</span>
                            </div>
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
                        {expandedData.db.bans && (
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
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              )}
            </div>
          </ScreenshotButton>
          </motion.div>
        ))}
        {results.length > visibleCount && (
          <div ref={observerTarget} className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
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
