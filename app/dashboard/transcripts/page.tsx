'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Search, Filter, Calendar, User as UserIcon, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, FileText, Download } from 'lucide-react';
import CachedImage from '@/components/cached-image';
import { fetchWithRetry } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '@/components/settings-context';

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
  const { settings, formatDate, t } = useSettings();
  
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [claimerFilter, setClaimerFilter] = useState(searchParams.get('claimer') || '');
  const [creatorFilter, setCreatorFilter] = useState(searchParams.get('creator') || '');
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || '');
  
  const [expandedTicket, setExpandedTicket] = useState<string | null>(searchParams.get('ticket') || null);
  const [loadedIframes, setLoadedIframes] = useState<Record<string, boolean>>({});

  const isRtl = settings.language === 'ar';

  const handleExpand = (fileName: string) => {
    if (expandedTicket === fileName) {
      setExpandedTicket(null);
    } else {
      setExpandedTicket(fileName);
      if (settings.transcriptLoading === 'auto') {
        setLoadedIframes(prev => ({ ...prev, [fileName]: true }));
      }
    }
  };

  const handleLoadIframe = (fileName: string) => {
    setLoadedIframes(prev => ({ ...prev, [fileName]: true }));
  };

  useEffect(() => {
    const fetchTranscripts = async () => {
      try {
        const res = await fetchWithRetry('/api/tickets/transcripts');
        const data = await res.json();
        // Filter out transcripts missing ticketId or creatorId
        const validTranscripts = data.filter((t: any) => t.ticketId && t.creatorId);
        setTranscripts(validTranscripts);
      } catch (err) {
        console.error(err);
        setError(t('failedToFetchTranscripts'));
      } finally {
        setLoading(false);
      }
    };
    fetchTranscripts();
  }, [t]);

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
        <Loader2 className="w-12 h-12 animate-spin text-[var(--color-primary)]" />
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
      <div className={`flex flex-col md:flex-row gap-4 items-center justify-between ${isRtl ? '' : 'md:flex-row-reverse'}`}>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-blue-200 tracking-tight drop-shadow-sm">
          {t('ticketTranscripts')}
        </h1>
      </div>

      <div className="bg-[#0a0f1a]/80 border border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-black/40 border border-white/10 rounded-xl py-2.5 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all ${isRtl ? 'text-right' : 'text-left'}`}
            />
          </div>
          <div className="relative">
            <UserIcon className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              type="text"
              placeholder={t('claimerIdPlaceholder')}
              value={claimerFilter}
              onChange={(e) => setClaimerFilter(e.target.value)}
              className={`w-full bg-black/40 border border-white/10 rounded-xl py-2.5 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all ${isRtl ? 'text-right' : 'text-left'}`}
            />
          </div>
          <div className="relative">
            <UserIcon className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              type="text"
              placeholder={t('creatorIdPlaceholder')}
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
              className={`w-full bg-black/40 border border-white/10 rounded-xl py-2.5 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all ${isRtl ? 'text-right' : 'text-left'}`}
            />
          </div>
          <div className={`relative flex gap-2 ${isRtl ? '' : 'flex-row-reverse'}`}>
            <div className="relative flex-1">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={`w-full bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)]/50 focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all ${isRtl ? 'text-right' : 'text-left'}`}
                style={{ colorScheme: settings.theme === 'dark' ? 'dark' : 'light' }}
              />
            </div>
            {dateFilter && (
              <button 
                onClick={() => setDateFilter('')}
                className="px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all font-bold text-sm whitespace-nowrap flex items-center gap-1"
              >
                <XCircle className="w-4 h-4" />
                {t('cancel')}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTranscripts.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-[#0a0f1a]/50 rounded-2xl border border-white/5">
            {t('noResultsFound')}
          </div>
        ) : (
          filteredTranscripts.map((t_item) => (
            <div 
              key={t_item.fileName}
              className="bg-[#0a0f1a]/80 border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-[var(--color-primary)]/30 transition-all duration-300"
            >
              <div 
                className={`p-5 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isRtl ? '' : 'sm:flex-row-reverse'}`}
                onClick={() => handleExpand(t_item.fileName)}
              >
                <div className={`flex items-center gap-4 ${isRtl ? '' : 'flex-row-reverse'}`}>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <h3 className="font-bold text-lg text-white">
                      {t_item.ticketName ? `#${t_item.ticketName}` : (t_item.details?.division || t('unknownTicket'))}
                    </h3>
                    <p className="text-sm text-gray-400 font-mono">
                      {t_item.ticketId ? `#${t_item.ticketId}` : t_item.fileName}
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end ${isRtl ? '' : 'flex-row-reverse'}`}>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <p className="text-sm text-gray-300">
                      {formatDate(t_item.date, { hour: undefined, minute: undefined })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(t_item.date, { year: undefined, month: undefined, day: undefined })}
                    </p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg">
                    {expandedTicket === t_item.fileName ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedTicket === t_item.fileName && (
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
                        <h4 className={`text-sm font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>{t('creator')}</h4>
                        <div className={`flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 ${isRtl ? '' : 'flex-row-reverse'}`}>
                          <div className="relative w-12 h-12 shrink-0">
                            <div className="w-full h-full rounded-full overflow-hidden relative z-10">
                              {t_item.creator?.avatar ? (
                                <CachedImage src={t_item.creator.avatar} alt="Creator" fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                  <UserIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            {t_item.creator?.avatarDecoration && (
                              <div className="absolute -inset-2.5 z-20 pointer-events-none">
                                <CachedImage src={t_item.creator.avatarDecoration} alt="Decoration" fill className="object-cover" />
                              </div>
                            )}
                          </div>
                          <div className={isRtl ? 'text-right' : 'text-left'}>
                            <p className="font-bold text-white">{t_item.creator?.displayName || t_item.creatorId}</p>
                            <p className="text-xs text-gray-400 font-mono">{t_item.creatorId}</p>
                          </div>
                        </div>
                      </div>

                      {/* Claimer Info */}
                      <div className="space-y-4">
                        <h4 className={`text-sm font-bold text-gray-400 uppercase tracking-wider ${isRtl ? 'text-right' : 'text-left'}`}>{t('claimer')}</h4>
                        {t_item.details?.claimed ? (
                          <div className={`flex items-center gap-4 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 ${isRtl ? '' : 'flex-row-reverse'}`}>
                            <div className="relative w-12 h-12 shrink-0">
                              <div className="w-full h-full rounded-full overflow-hidden relative z-10">
                                {t_item.claimer?.avatar ? (
                                  <CachedImage src={t_item.claimer.avatar} alt="Claimer" fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full bg-blue-900 flex items-center justify-center">
                                    <UserIcon className="w-6 h-6 text-blue-400" />
                                  </div>
                                )}
                              </div>
                              {t_item.claimer?.avatarDecoration && (
                                <div className="absolute -inset-2.5 z-20 pointer-events-none">
                                  <CachedImage src={t_item.claimer.avatarDecoration} alt="Decoration" fill className="object-cover" />
                                </div>
                              )}
                            </div>
                            <div className={isRtl ? 'text-right' : 'text-left'}>
                              <p className="font-bold text-white">{t_item.claimer?.displayName || t_item.details.claimedBy}</p>
                              <p className="text-xs text-blue-300 font-mono">{t_item.details.claimedBy}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 h-[82px]">
                            <p className="text-gray-400 m-auto">{t('ticketNotClaimed')}</p>
                          </div>
                        )}
                      </div>

                      {/* Ticket Status Details */}
                      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className={`bg-white/5 p-4 rounded-xl border border-white/5 flex items-center gap-3 ${isRtl ? '' : 'flex-row-reverse'}`}>
                          <Clock className="w-5 h-5 text-gray-400" />
                          <div className={isRtl ? 'text-right' : 'text-left'}>
                            <p className="text-xs text-gray-400">{t('createdAt')}</p>
                            <p className="text-sm font-bold text-white">
                              {t_item.details?.createdAt ? formatDate(t_item.details.createdAt) : t('notAvailable')}
                            </p>
                          </div>
                        </div>
                        
                        <div className={`p-4 rounded-xl border flex items-center gap-3 ${t_item.details?.claimed ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/5 border-white/5'} ${isRtl ? '' : 'flex-row-reverse'}`}>
                          {t_item.details?.claimed ? <CheckCircle2 className="w-5 h-5 text-blue-400" /> : <XCircle className="w-5 h-5 text-gray-400" />}
                          <div className={isRtl ? 'text-right' : 'text-left'}>
                            <p className="text-xs text-gray-400">{t('claimStatus')}</p>
                            <p className={`text-sm font-bold ${t_item.details?.claimed ? 'text-blue-400' : 'text-gray-400'}`}>
                              {t_item.details?.claimed ? t('claimed') : t('notClaimed')}
                            </p>
                          </div>
                        </div>

                        <div className={`p-4 rounded-xl border flex items-center gap-3 ${t_item.details?.closed ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'} ${isRtl ? '' : 'flex-row-reverse'}`}>
                          {t_item.details?.closed ? <XCircle className="w-5 h-5 text-red-400" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                          <div className={isRtl ? 'text-right' : 'text-left'}>
                            <p className="text-xs text-gray-400">{t('closeStatus')}</p>
                            <p className={`text-sm font-bold ${t_item.details?.closed ? 'text-red-400' : 'text-emerald-400'}`}>
                              {t_item.details?.closed ? t('closed') : t('open')}
                            </p>
                            {t_item.details?.closedAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(t_item.details.closedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Transcript Viewer */}
                      <div className="md:col-span-2 mt-4 border border-white/10 rounded-2xl overflow-hidden bg-[#36393f] relative h-[700px] flex items-center justify-center shadow-inner">
                        {loadedIframes[t_item.fileName] ? (
                          <iframe 
                            src={`/api/tickets/transcripts/download?file=${encodeURIComponent(t_item.fileName)}`}
                            className="w-full h-full border-none absolute inset-0"
                            title="Transcript Viewer"
                            allow="fullscreen"
                          />
                        ) : (
                          <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                              <FileText className="w-8 h-8 text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-bold text-lg">{t('transcriptReady')}</h3>
                              <p className="text-gray-400 text-sm">{t('transcriptReadyDesc')}</p>
                            </div>
                            <button
                              onClick={() => handleLoadIframe(t_item.fileName)}
                              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors flex items-center gap-2 mx-auto"
                            >
                              <Download className="w-4 h-4" />
                              {t('loadAndView')}
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Download/View Button */}
                      <div className={`md:col-span-2 flex ${isRtl ? 'justify-end' : 'justify-start'}`}>
                        <a 
                          href={`/api/tickets/transcripts/download?file=${encodeURIComponent(t_item.fileName)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                        >
                          {t('openInNewWindow')}
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
