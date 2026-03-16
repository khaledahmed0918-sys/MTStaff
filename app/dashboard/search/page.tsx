'use client';

import { useState } from 'react';
import { Search as SearchIcon, ChevronDown, ChevronUp, ShieldAlert, Clock, Ban, Flame, MessageSquare } from 'lucide-react';
import Image from 'next/image';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
      console.error(err);
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
      console.error(err);
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
          <div key={user.id} className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl transition-all duration-300">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => toggleExpand(user.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-blue-500/30">
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.username} fill className="object-cover" unoptimized referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-lg">{user.username.charAt(0)}</div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{user.username} <span className="text-sm text-blue-400 font-normal">#{user.tag.split('#')[1] || user.discriminator}</span></h3>
                  <p className="text-sm text-gray-400 font-mono">{user.id}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="hidden md:flex gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                    <ShieldAlert className="w-4 h-4" />
                    <span>{user.stats.warns}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-orange-400 bg-orange-400/10 px-2 py-1 rounded">
                    <Clock className="w-4 h-4" />
                    <span>{user.stats.timeouts}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-red-400 bg-red-400/10 px-2 py-1 rounded">
                    <Ban className="w-4 h-4" />
                    <span>{user.stats.bans}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-orange-500 bg-orange-500/10 px-2 py-1 rounded">
                    <Flame className="w-4 h-4" />
                    <span>{user.stats.streaks}</span>
                  </div>
                </div>
                {expandedId === user.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === user.id && (
              <div className="border-t border-white/10 bg-[#0a0f1a]/80 p-6">
                {loadingDetails ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : expandedData ? (
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
                                <span>{new Date(w.date_warn).toLocaleDateString('ar-SA')}</span>
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
                                <span>{new Date(t.date).toLocaleDateString('ar-SA')}</span>
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
                                <span>{new Date(b.date).toLocaleDateString('ar-SA')}</span>
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
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
