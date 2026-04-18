'use client';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, ShieldAlert, Clock, Flame, MessageSquare, Calendar, ListTodo, CheckCircle2, Ticket, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import CachedImage from '@/components/cached-image';
import { formatVoiceTime, fetchWithRetry } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { RolesDisplay } from '@/components/roles-display';
import { useSettings } from '@/components/settings-context';
import { InviteButton } from '@/components/invite-button';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, formatDate, settings } = useSettings();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const observerTarget = useRef<HTMLDivElement>(null);

  const isRtl = settings.language === 'ar';

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

  const fetchUserDetails = useCallback(async (id: string) => {
    setExpandedId(id);
    setLoadingDetails(true);
    try {
      const res = await fetchWithRetry(`/api/user/${id}`);
      const data = await res.json();
      setExpandedData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  const toggleExpand = useCallback(async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedData(null);
      return;
    }
    fetchUserDetails(id);
  }, [expandedId, fetchUserDetails]);

  useEffect(() => {
    const fetchDefault = async () => {
      try {
        if (initialQuery) {
          const res = await fetchWithRetry(`/api/search?q=${encodeURIComponent(initialQuery)}`);
          const data = await res.json();
          setResults(data.results || []);
          if (data.results && data.results.length > 0) {
            fetchUserDetails(data.results[0].id);
          }
        } else {
          const res = await fetchWithRetry('/api/search');
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDefault();
  }, [initialQuery, fetchUserDetails]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);

    setLoading(true);
    setExpandedId(null);
    setExpandedData(null);
    try {
      const res = await fetchWithRetry(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
      if (data.results && data.results.length > 0) {
        fetchUserDetails(data.results[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="bg-[#111827]/60 border border-white/10 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none group-hover:bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_70%)] transition-colors duration-700" />
        <h1 className={`text-3xl font-black text-white mb-8 flex items-center gap-4 relative z-10 tracking-tight ${isRtl ? 'flex-row' : 'flex-row'}`}>
          <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
            <SearchIcon className="w-7 h-7 text-blue-400" />
          </div>
          {t('searchUser')}
        </h1>
        
        <form onSubmit={handleSearch} className="relative z-10">
          <div className="relative">
            <input
              type="text"
              placeholder={t('enterUserId')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full bg-black/40 border border-white/10 rounded-2xl py-5 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-all text-lg ${isRtl ? 'pr-14 pl-4' : 'pl-14 pr-4'}`}
            />
            <SearchIcon className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 ${isRtl ? 'right-5' : 'left-5'}`} />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className={`absolute top-1/2 -translate-y-1/2 bg-[var(--color-primary)] hover:opacity-90 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all ${isRtl ? 'left-3' : 'right-3'}`}
          >
            {loading ? t('searchingBtn') : t('searchBtn')}
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {results.length === 0 && !loading && query && (
          <div className="text-center py-16 bg-[#111827]/60 rounded-3xl border border-white/5">
            <p className="text-gray-400 text-xl font-medium">{t('noResultsFound')}</p>
          </div>
        )}

        {results.slice(0, visibleCount).map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (index % 20) * 0.05 }}
          >
            <div id={`user-card-${user.id}`} className="bg-[#111827]/60 border border-white/10 rounded-3xl overflow-hidden shadow-lg transition-all duration-500 relative group hover:border-[var(--color-primary)]/50">
              
              {user.isHidden && (
                <div className="absolute inset-0 z-50 bg-[#0a0f1a]/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
                  <ShieldAlert className="w-16 h-16 text-[var(--color-primary)] mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">{t('privateProfile')}</h3>
                  <p className="text-gray-400">{t('privateProfileDesc')}</p>
                </div>
              )}

              {user.banner && (
                <div className="aspect-[5/2] w-full relative overflow-hidden">
                  <CachedImage src={user.banner} alt="Banner" fill className="object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent z-20" />
                </div>
              )}

              <div 
                className={`p-8 flex flex-col items-center md:items-start ${user.isHidden ? '' : 'cursor-pointer hover:bg-white/5'} transition-colors relative z-30 ${user.banner ? '-mt-16 md:-mt-24' : ''}`}
                onClick={() => !user.isHidden && toggleExpand(user.id)}
              >
                <div className={`flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 w-full ${isRtl ? 'flex-row' : 'flex-row'}`}>
                  <div className="w-32 h-32 md:w-44 md:h-44 relative rounded-full overflow-hidden border-4 border-[#111827] bg-[#111827] z-10 shadow-2xl shrink-0">
                    {user.avatar ? (
                      <CachedImage src={user.avatar} alt={user.username} fill className="object-cover rounded-full" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-5xl">{user.username.charAt(0)}</div>
                    )}
                  </div>
                  <div className={`mb-4 flex-1 text-center ${isRtl ? 'md:text-right' : 'md:text-left'}`}>
                    <h3 className="font-black text-4xl md:text-5xl mb-2 tracking-tight" style={{ color: user.highestRoleColor || '#ffffff' }}>
                      {user.displayName}
                    </h3>
                    <p className="text-xl text-gray-400 font-medium">@{user.username}</p>
                      <div className={`flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3 ${isRtl ? 'md:justify-start' : 'md:justify-start'}`}>
                        <p className="text-sm text-gray-500 font-mono bg-black/40 px-4 py-1.5 rounded-xl border border-white/10">{t('idLabel')}: {user.id}</p>
                        <InviteButton userId={user.id} />
                      </div>
                    </div>
                    {!user.isHidden && (
                      <div className="hidden md:flex flex-col items-end gap-2">
                        {expandedId === user.id ? <ChevronUp className="w-8 h-8 text-gray-500" /> : <ChevronDown className="w-8 h-8 text-gray-500" />}
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex flex-col md:flex-row items-center gap-4 md:gap-8 mt-8 text-sm text-gray-400 w-full md:w-auto ${isRtl ? 'flex-row' : 'flex-row'}`}>
                  <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-2xl border border-white/10 w-full md:w-auto justify-center shadow-inner">
                    <Calendar className="w-5 h-5 text-blue-400 shrink-0" />
                    <span className="font-medium">{t('createdAt')}: {formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-2xl border border-white/10 w-full md:w-auto justify-center shadow-inner">
                    <Calendar className="w-5 h-5 text-purple-400 shrink-0" />
                    <span className="font-medium">{t('joinedAt')}: {formatDate(user.joinedAt)}</span>
                  </div>
                </div>
                
                {user.roles && user.roles.length > 0 && (
                  <RolesDisplay roles={user.roles} />
                )}

                {user.hideStats && !user.isHidden && (
                  <div className="mt-6 w-full bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-center">
                    <p className="text-blue-400 font-medium flex items-center justify-center gap-2">
                      <ShieldAlert className="w-5 h-5" />
                      {t('statsHidden')}
                    </p>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {expandedId === user.id && !user.isHidden && !user.hideStats && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10 bg-black/20 overflow-hidden"
                  >
                    <div className="p-6 md:p-10 space-y-8">
                      {loadingDetails ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
                        </div>
                      ) : expandedData?.db ? (
                        <div className="space-y-8">
                          {/* Stats Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard 
                              icon={<MessageSquare className="w-8 h-8 text-blue-400" />}
                              label={t('messagesLabel')}
                              value={expandedData.db.messages?.all?.toLocaleString() || 0}
                              subStats={[
                                { label: t('day'), value: expandedData.db.messages?.top_day || 0 },
                                { label: t('week'), value: expandedData.db.messages?.top_week || 0 },
                                { label: t('month'), value: expandedData.db.messages?.top_month || 0 }
                              ]}
                              isRtl={isRtl}
                            />
                            <StatCard 
                              icon={<Clock className="w-8 h-8 text-purple-400" />}
                              label={t('voiceLabel')}
                              value={formatVoiceTime(expandedData.db.voice?.all || 0)}
                              subStats={[
                                { label: t('day'), value: formatVoiceTime(expandedData.db.voice?.top_day || 0) },
                                { label: t('week'), value: formatVoiceTime(expandedData.db.voice?.top_week || 0) },
                                { label: t('month'), value: formatVoiceTime(expandedData.db.voice?.top_month || 0) }
                              ]}
                              isRtl={isRtl}
                            />
                            <StatCard 
                              icon={<Flame className="w-8 h-8 text-orange-400" />}
                              label={t('streaksLabel')}
                              value={expandedData.db.streaks?.streak || 0}
                              subValue={expandedData.db.streaks?.completed_today ? t('completedToday') : t('notCompleted')}
                              subValueColor={expandedData.db.streaks?.completed_today ? 'text-emerald-400' : 'text-rose-400'}
                              isRtl={isRtl}
                            />
                            {!user.hidePoints && (
                              <StatCard 
                                icon={<Ticket className="w-8 h-8 text-emerald-400" />}
                                label={t('ticketsLabel')}
                                value={expandedData.db.tickets || 0}
                                isRtl={isRtl}
                              />
                            )}
                          </div>

                          {/* Coins & Tasks */}
                          {!user.hidePoints && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                                <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row'}`}>
                                  <ListTodo className="w-6 h-6 text-blue-400" />
                                  <h4 className="text-2xl font-black text-white">{t('tasks')}</h4>
                                </div>
                                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isRtl ? '' : 'text-left'}`}>
                                  <div className="space-y-3">
                                    <p className="text-sm font-bold text-gray-400">{t('tasksRemaining')}</p>
                                    <div className={`flex flex-wrap gap-2 ${isRtl ? 'flex-row' : 'flex-row'}`}>
                                      {(expandedData.db.tasks || []).filter((t: any) => !t.completed).map((task: any, i: number) => (
                                        <span key={i} className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-xl text-xs font-bold">
                                          {task.task_name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <p className="text-sm font-bold text-gray-400">{t('tasksCompleted')}</p>
                                    <div className={`flex flex-wrap gap-2 ${isRtl ? 'flex-row' : 'flex-row'}`}>
                                      {(expandedData.db.tasks || []).filter((t: any) => t.completed).map((task: any, i: number) => (
                                        <span key={i} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold">
                                          {task.task_name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/5 border border-yellow-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center text-2xl font-black text-black mb-4 shadow-lg shadow-yellow-500/20">$</div>
                                <h4 className="text-yellow-500 font-bold mb-1">{t('currentBalance')}</h4>
                                <p className="text-4xl font-black text-white">{expandedData.db.coins?.coins?.toLocaleString() || 0}</p>
                              </div>
                            </div>
                          )}

                          {/* Logs Sections */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <LogSection title={t('adminWarns')} items={expandedData.db.swarns} color="red" t={t} formatDate={formatDate} isRtl={isRtl} />
                            <LogSection title={t('warnings')} items={expandedData.db.warns} color="yellow" t={t} formatDate={formatDate} isRtl={isRtl} />
                            <LogSection title={t('timeouts')} items={expandedData.db.timeouts} color="orange" t={t} formatDate={formatDate} isRtl={isRtl} />
                            <LogSection title={t('bans')} items={expandedData.db.bans} color="rose" t={t} formatDate={formatDate} isRtl={isRtl} />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
        {results.length > visibleCount && (
          <div ref={observerTarget} className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subStats, subValue, subValueColor, isRtl }: any) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 hover:bg-white/10 transition-colors ${isRtl ? 'text-right' : 'text-left'}`}>
      <div className={`flex items-center gap-3 ${isRtl ? 'flex-row' : 'flex-row'}`}>
        <div className="p-2 bg-white/5 rounded-xl">{icon}</div>
        <h4 className="font-bold text-gray-400 text-sm">{label}</h4>
      </div>
      <div>
        <p className="text-3xl font-black text-white">{value}</p>
        {subValue && <p className={`text-xs font-bold mt-1 ${subValueColor}`}>{subValue}</p>}
      </div>
      {subStats && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
          {subStats.map((stat: any, i: number) => (
            <div key={i} className="text-center">
              <p className="text-[10px] text-gray-500 uppercase font-bold">{stat.label}</p>
              <p className="text-xs font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LogSection({ title, items, color, t, formatDate, isRtl }: any) {
  const colorClasses: any = {
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-64">
      <div className={`p-4 border-b border-white/10 font-bold text-sm ${colorClasses[color].split(' ')[0]} ${isRtl ? 'text-right' : 'text-left'}`}>
        {title} ({items?.length || 0})
      </div>
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
        {(!items || items.length === 0) ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
            <CheckCircle2 className="w-8 h-8 mb-2" />
            <p className="text-xs">{t('cleanRecord')}</p>
          </div>
        ) : (
          items.map((item: any, i: number) => (
            <div key={i} className={`bg-white/5 border border-white/5 rounded-xl p-3 text-xs ${isRtl ? 'text-right' : 'text-left'}`}>
              <div className={`flex justify-between items-center mb-1 ${isRtl ? '' : 'flex-row-reverse'}`}>
                <span className="text-gray-500">{formatDate(item.date || item.date_warn)}</span>
              </div>
              <p className="text-gray-300 line-clamp-2">{item.reason}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
