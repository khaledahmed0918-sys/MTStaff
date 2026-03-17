'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, ChevronDown, ChevronUp, ShieldAlert, Clock, Ban, Flame, MessageSquare } from 'lucide-react';
import CachedImage from '@/components/cached-image';
import { formatDateEn, formatVoiceTime, parseDiscordEmoji } from '@/lib/utils';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchDefault = async () => {
      try {
        const res = await fetch('/api/search');
        const data = await res.json();
        setResults(data.results || []);
      } catch (err) {
        // Error handling removed
      } finally {
        setLoading(false);
      }
    };
    fetchDefault();
  }, []);

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
          <div key={user.id} className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 relative">
            {/* Banner */}
            {user.banner ? (
              <div className="h-64 w-full relative overflow-hidden">
                <CachedImage src={user.banner} alt="Banner" fill className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent z-20" />
              </div>
            ) : (
              <div className="h-64 w-full relative overflow-hidden" style={{ backgroundColor: user.bannerColor || '#1e1e2e' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent" />
              </div>
            )}

            <div 
              className="p-6 flex flex-col items-start cursor-pointer hover:bg-white/5 transition-colors relative z-30 -mt-24"
              onClick={() => toggleExpand(user.id)}
            >
              <div className="flex items-end gap-4">
                <div className="w-32 h-32 relative rounded-lg overflow-hidden border-4 border-[#111827] bg-[#111827] z-10">
                  {user.avatar ? (
                    <CachedImage src={user.avatar} alt={user.username} fill className="object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-3xl">{user.username.charAt(0)}</div>
                  )}
                </div>
                <div className="mb-2">
                  <h3 className="font-bold text-2xl" style={{ color: user.highestRoleColor || '#ffffff' }}>
                    {user.displayName}
                  </h3>
                  <p className="text-sm text-gray-400">({user.username})</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {user.id}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>تاريخ الإنشاء: {formatDateEn(user.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>تاريخ الانضمام: {formatDateEn(user.joinedAt)}</span>
                </div>
              </div>
              
              {user.roles && user.roles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {user.roles.map((role: any) => (
                    <div 
                      key={role.id} 
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-white/10"
                      style={{ 
                        backgroundColor: role.color !== '#000000' ? `${role.color}15` : 'rgba(255,255,255,0.05)', 
                        color: role.color !== '#000000' ? role.color : '#ffffff' 
                      }}
                    >
                      {role.icon && <CachedImage src={role.icon} alt={role.name} width={16} height={16} />}
                      {role.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expanded Details */}
            {expandedId === user.id && (
              <div className="border-t border-white/10 bg-[#0a0f1a]/80 p-6">
                {/* Roles and Dates */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h4 className="text-gray-400 text-sm mb-2">تاريخ إنشاء الحساب</h4>
                    <p className="text-white font-mono">{formatDateEn(user.createdAt)}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <h4 className="text-gray-400 text-sm mb-2">تاريخ الانضمام للسيرفر</h4>
                    <p className="text-white font-mono">{formatDateEn(user.joinedAt)}</p>
                  </div>
                </div>
                
                {user.roles && user.roles.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-gray-400 text-sm mb-2">الرتب</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((role: any) => (
                        <div 
                          key={role.id} 
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-white/10"
                          style={{ 
                            backgroundColor: role.color !== '#000000' ? `${role.color}20` : 'rgba(255,255,255,0.05)', 
                            color: role.color !== '#000000' ? role.color : '#ffffff' 
                          }}
                        >
                          {role.icon && (
                            <CachedImage src={role.icon} alt={role.name} width={16} height={16} className="rounded-sm" />
                          )}
                          <span>{role.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {loadingDetails ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : expandedData?.error ? (
                  <div className="flex justify-center py-8">
                    <p className="text-red-400 text-sm">حدث خطأ أثناء جلب البيانات: {expandedData.error}</p>
                  </div>
                ) : expandedData?.db ? (
                  <div className="space-y-6">
                    {/* New Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Messages */}
                      <div className="bg-[#111827] border border-blue-500/20 rounded-xl p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-5 h-5 text-blue-400" />
                          <h4 className="font-bold text-blue-400">الرسائل</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-gray-400">الكل:</span> <span className="text-white font-mono">{expandedData.db.messages?.all || 0}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">اليوم:</span> <span className="text-white font-mono">{expandedData.db.messages?.top_day || 0}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">الأسبوع:</span> <span className="text-white font-mono">{expandedData.db.messages?.top_week || 0}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">الشهر:</span> <span className="text-white font-mono">{expandedData.db.messages?.top_month || 0}</span></div>
                        </div>
                      </div>

                      {/* Voice */}
                      <div className="bg-[#111827] border border-purple-500/20 rounded-xl p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-5 h-5 text-purple-400" />
                          <h4 className="font-bold text-purple-400">الفويس</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-gray-400">الكل:</span> <span className="text-white font-mono">{formatVoiceTime(expandedData.db.voice?.all || 0)}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">اليوم:</span> <span className="text-white font-mono">{formatVoiceTime(expandedData.db.voice?.top_day || 0)}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">الأسبوع:</span> <span className="text-white font-mono">{formatVoiceTime(expandedData.db.voice?.top_week || 0)}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">الشهر:</span> <span className="text-white font-mono">{formatVoiceTime(expandedData.db.voice?.top_month || 0)}</span></div>
                        </div>
                      </div>

                      {/* Streaks */}
                      <div className="bg-[#111827] border border-orange-500/20 rounded-xl p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Flame className="w-5 h-5 text-orange-400" />
                          <h4 className="font-bold text-orange-400">الستريك</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">الحالي:</span> 
                            <div className="flex items-center gap-1">
                              <span className="text-white font-mono">{expandedData.db.streaks?.streak || 0}</span>
                              {expandedData.db.streaks?.streak_emoji_url ? (
                                <CachedImage src={expandedData.db.streaks.streak_emoji_url} alt="streak" width={16} height={16} />
                              ) : expandedData.db.streaks?.streak_emoji ? (
                                (() => {
                                  const parsed = parseDiscordEmoji(expandedData.db.streaks.streak_emoji);
                                  return parsed ? (
                                    <CachedImage src={parsed} alt="streak" width={16} height={16} />
                                  ) : (
                                    <span>{expandedData.db.streaks.streak_emoji}</span>
                                  );
                                })()
                              ) : (
                                <Flame className="w-4 h-4 text-orange-500" />
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between"><span className="text-gray-400">السابق:</span> <span className="text-white font-mono">{expandedData.db.streaks?.old_streak || 0}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">الحمايات:</span> <span className="text-white font-mono">{expandedData.db.streaks?.shields || 0}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">رسائل اليوم:</span> <span className="text-white font-mono">{expandedData.db.streaks?.daily_messages || 0}/100</span></div>
                        </div>
                      </div>

                      {/* Coins */}
                      <div className="bg-[#111827] border border-yellow-500/20 rounded-xl p-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-black">$</div>
                          <h4 className="font-bold text-yellow-400">العملات</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-gray-400">الرصيد:</span> <span className="text-white font-mono">{expandedData.db.coins?.coins || 0}</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Warns */}
                    <div className="bg-[#111827] border border-yellow-500/20 rounded-xl overflow-hidden flex flex-col h-80 shadow-lg group hover:border-yellow-500/40 transition-colors duration-300">
                      <div className="bg-yellow-500/10 p-3 border-b border-yellow-500/20 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-yellow-500 group-hover:scale-110 transition-transform" />
                        <h4 className="font-bold text-yellow-400 text-sm">التحذيرات ({expandedData.db.warns?.length || 0})</h4>
                      </div>
                      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {(!expandedData.db.warns || expandedData.db.warns.length === 0) ? (
                          <p className="text-gray-500 text-center text-sm py-4">لا يوجد</p>
                        ) : (
                          expandedData.db.warns.map((w: any, i: number) => (
                            <div key={i} className="bg-white/5 border border-white/5 hover:border-yellow-500/30 rounded-lg p-3 text-sm transition-colors">
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span className="font-mono text-yellow-300 bg-yellow-500/10 px-1.5 py-0.5 rounded">#{w.warn_number}</span>
                                <span>{formatDateEn(w.date_warn)}</span>
                              </div>
                              <p className="text-gray-200 mt-2">{w.reason}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Timeouts */}
                    <div className="bg-[#111827] border border-orange-500/20 rounded-xl overflow-hidden flex flex-col h-80 shadow-lg group hover:border-orange-500/40 transition-colors duration-300">
                      <div className="bg-orange-500/10 p-3 border-b border-orange-500/20 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                        <h4 className="font-bold text-orange-400 text-sm">التايم أوت ({expandedData.db.timeouts?.length || 0})</h4>
                      </div>
                      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {(!expandedData.db.timeouts || expandedData.db.timeouts.length === 0) ? (
                          <p className="text-gray-500 text-center text-sm py-4">لا يوجد</p>
                        ) : (
                          expandedData.db.timeouts.map((t: any, i: number) => (
                            <div key={i} className="bg-white/5 border border-white/5 hover:border-orange-500/30 rounded-lg p-3 text-sm transition-colors">
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span className="font-mono text-orange-300 bg-orange-500/10 px-1.5 py-0.5 rounded">#{t.timeout_number}</span>
                                <span>{formatDateEn(t.date)}</span>
                              </div>
                              <div className="text-xs text-orange-300 mb-1 bg-orange-500/10 inline-block px-2 py-0.5 rounded">المدة: {t.time}</div>
                              <p className="text-gray-200 mt-1">{t.reason}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Bans */}
                    <div className="bg-[#111827] border border-red-500/20 rounded-xl overflow-hidden flex flex-col h-80 shadow-lg group hover:border-red-500/40 transition-colors duration-300">
                      <div className="bg-red-500/10 p-3 border-b border-red-500/20 flex items-center gap-2">
                        <Ban className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                        <h4 className="font-bold text-red-400 text-sm">الباند ({expandedData.db.bans?.length || 0})</h4>
                      </div>
                      <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-2">
                        {(!expandedData.db.bans || expandedData.db.bans.length === 0) ? (
                          <p className="text-gray-500 text-center text-sm py-4">لا يوجد</p>
                        ) : (
                          expandedData.db.bans.map((b: any, i: number) => (
                            <div key={i} className="bg-white/5 border border-white/5 hover:border-red-500/30 rounded-lg p-3 text-sm transition-colors">
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span className="font-mono text-red-300 bg-red-500/10 px-1.5 py-0.5 rounded">#{b.ban_number}</span>
                                <span>{formatDateEn(b.date)}</span>
                              </div>
                              <div className="flex gap-2 mb-1">
                                <span className="text-xs text-red-300 bg-red-500/10 px-2 py-0.5 rounded">المدة: {b.time}</span>
                                {b.unbanned && (
                                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">مفكوك</span>
                                )}
                              </div>
                              <p className="text-gray-200 mt-1">{b.reason}</p>
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
        ))}
      </div>
    </div>
  );
}
