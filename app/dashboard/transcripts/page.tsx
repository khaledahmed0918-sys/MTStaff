'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Search, Filter, Calendar, User as UserIcon, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import CachedImage from '@/components/cached-image';
import { motion, AnimatePresence } from 'motion/react';

interface Transcript {
  fileName: string;
  ticketName: string;
  creatorId: string;
  date: string;
  ticketId: string | null;
  creator: any;
  claimer: any;
  details: any;
}

export default function TranscriptsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [claimerFilter, setClaimerFilter] = useState(searchParams.get('claimer') || '');
  const [creatorFilter, setCreatorFilter] = useState(searchParams.get('creator') || '');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || '');
  
  const [expandedTicket, setExpandedTicket] = useState<string | null>(searchParams.get('ticket') || null);

  useEffect(() => {
    const fetchTranscripts = async () => {
      try {
        const res = await fetch('/api/tickets/transcripts');
        if (!res.ok) throw new Error('Failed to fetch transcripts');
        const data = await res.json();
        setTranscripts(data);
      } catch (err) {
        setError('حدث خطأ أثناء جلب الترانسكريبت');
      } finally {
        setLoading(false);
      }
    };
    fetchTranscripts();
  }, []);

  // Update URL parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (claimerFilter) params.set('claimer', claimerFilter);
    if (creatorFilter) params.set('creator', creatorFilter);
    if (dateFilter) params.set('date', dateFilter);
    if (expandedTicket) params.set('ticket', expandedTicket);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  }, [searchQuery, claimerFilter, creatorFilter, dateFilter, expandedTicket]);

  const filteredTranscripts = useMemo(() => {
    return transcripts.filter(t => {
      const matchesSearch = 
        t.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticketId?.includes(searchQuery) ||
        t.creator?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.claimer?.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesClaimer = claimerFilter ? t.details?.claimedBy === claimerFilter : true;
      const matchesCreator = creatorFilter ? t.creatorId === creatorFilter : true;
      const matchesDate = dateFilter ? t.date.startsWith(dateFilter) : true;
      
      return matchesSearch && matchesClaimer && matchesCreator && matchesDate;
    });
  }, [transcripts, searchQuery, claimerFilter, creatorFilter, dateFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
          <p className="text-red-400 font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-blue-200 tracking-tight drop-shadow-sm">
          ترانسكريبت التذاكر
        </h1>
      </div>

      <div className="bg-[#0a0f1a]/80 border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الايدي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>
          <div className="relative">
            <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ايدي المستلم..."
              value={claimerFilter}
              onChange={(e) => setClaimerFilter(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>
          <div className="relative">
            <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ايدي المنشئ..."
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTranscripts.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-[#0a0f1a]/50 rounded-2xl border border-white/5">
            لا يوجد نتائج مطابقة للبحث
          </div>
        ) : (
          filteredTranscripts.map((t) => (
            <div 
              key={t.fileName}
              className="bg-[#0a0f1a]/80 border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-blue-500/30 transition-all duration-300"
            >
              <div 
                className="p-5 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                onClick={() => setExpandedTicket(expandedTicket === t.fileName ? null : t.fileName)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      {t.ticketName ? `#${t.ticketName}` : (t.details?.division || 'تذكرة غير معروفة')}
                    </h3>
                    <p className="text-sm text-gray-400 font-mono">
                      {t.ticketId ? `#${t.ticketId}` : t.fileName}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="text-sm text-gray-300">
                      {new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(t.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg">
                    {expandedTicket === t.fileName ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedTicket === t.fileName && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden border-t border-white/10 bg-black/20"
                  >
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Creator Info */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">المنشئ</h4>
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                          <div className="relative w-12 h-12 shrink-0">
                            <div className="w-full h-full rounded-full overflow-hidden relative z-10">
                              {t.creator?.avatar ? (
                                <CachedImage src={t.creator.avatar} alt="Creator" fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                  <UserIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            {t.creator?.avatarDecoration && (
                              <div className="absolute -inset-2.5 z-20 pointer-events-none">
                                <CachedImage src={t.creator.avatarDecoration} alt="Decoration" fill className="object-cover" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white">{t.creator?.displayName || t.creatorId}</p>
                            <p className="text-xs text-gray-400 font-mono">{t.creatorId}</p>
                          </div>
                        </div>
                      </div>

                      {/* Claimer Info */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">المستلم</h4>
                        {t.details?.claimed ? (
                          <div className="flex items-center gap-4 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                            <div className="relative w-12 h-12 shrink-0">
                              <div className="w-full h-full rounded-full overflow-hidden relative z-10">
                                {t.claimer?.avatar ? (
                                  <CachedImage src={t.claimer.avatar} alt="Claimer" fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-blue-900 flex items-center justify-center">
                                    <UserIcon className="w-6 h-6 text-blue-400" />
                                  </div>
                                )}
                              </div>
                              {t.claimer?.avatarDecoration && (
                                <div className="absolute -inset-2.5 z-20 pointer-events-none">
                                  <CachedImage src={t.claimer.avatarDecoration} alt="Decoration" fill className="object-cover" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white">{t.claimer?.displayName || t.details.claimedBy}</p>
                              <p className="text-xs text-blue-300 font-mono">{t.details.claimedBy}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 h-[82px]">
                            <p className="text-gray-400 m-auto">لم يتم استلام التذكرة</p>
                          </div>
                        )}
                      </div>

                      {/* Ticket Status Details */}
                      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-400">تاريخ الإنشاء</p>
                            <p className="text-sm font-bold text-white">
                              {t.details?.createdAt ? new Date(t.details.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'غير متوفر'}
                            </p>
                          </div>
                        </div>
                        
                        <div className={`p-4 rounded-xl border flex items-center gap-3 ${t.details?.claimed ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/5 border-white/5'}`}>
                          {t.details?.claimed ? <CheckCircle2 className="w-5 h-5 text-blue-400" /> : <XCircle className="w-5 h-5 text-gray-400" />}
                          <div>
                            <p className="text-xs text-gray-400">حالة الاستلام</p>
                            <p className={`text-sm font-bold ${t.details?.claimed ? 'text-blue-400' : 'text-gray-400'}`}>
                              {t.details?.claimed ? 'تم الاستلام' : 'غير مستلمة'}
                            </p>
                          </div>
                        </div>

                        <div className={`p-4 rounded-xl border flex items-center gap-3 ${t.details?.closed ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                          {t.details?.closed ? <XCircle className="w-5 h-5 text-red-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                          <div>
                            <p className="text-xs text-gray-400">حالة الإغلاق</p>
                            <p className={`text-sm font-bold ${t.details?.closed ? 'text-red-400' : 'text-emerald-400'}`}>
                              {t.details?.closed ? 'مغلقة' : 'مفتوحة'}
                            </p>
                            {t.details?.closedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(t.details.closedAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Download/View Button */}
                      <div className="md:col-span-2 flex justify-end">
                        <a 
                          href={`/api/tickets/transcripts/download?file=${encodeURIComponent(t.fileName)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                        >
                          عرض الترانسكريبت
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
