'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Search, Ticket, ChevronDown, ChevronUp, User as UserIcon, ShieldAlert } from 'lucide-react';
import CachedImage from '@/components/cached-image';
import { fetchWithRetry } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '@/components/settings-context';

interface PointUser {
  userId: string;
  points: number;
  user: any;
  hidePoints?: boolean;
}

interface TicketData {
  ticketId: string;
  division: string;
  claimed: boolean;
  claimedBy: string;
  createdAt: string;
  closed: boolean;
  closedAt?: string;
}

function TicketPointsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, formatDate, settings } = useSettings();
  
  const [points, setPoints] = useState<PointUser[]>([]);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [expandedUser, setExpandedUser] = useState<string | null>(searchParams.get('user') || null);

  const isRtl = settings.language === 'ar';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pointsRes, ticketsRes] = await Promise.all([
          fetchWithRetry('/api/tickets/points'),
          fetchWithRetry('/api/tickets')
        ]);
        
        const pointsData = await pointsRes.json();
        const ticketsData = await ticketsRes.json();
        
        setPoints(pointsData);
        setTickets(ticketsData);
      } catch (err) {
        console.error(err);
        setError(t('failedToFetchData'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  // Update URL parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (expandedUser) params.set('user', expandedUser);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  }, [searchQuery, expandedUser]);

  const filteredPoints = useMemo(() => {
    return points.filter(p => {
      return (
        p.userId.includes(searchQuery) ||
        p.user?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [points, searchQuery]);

  const getUserTickets = (userId: string) => {
    return tickets.filter(t => t.claimedBy === userId);
  };

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
      <div className={`flex flex-col md:flex-row gap-4 items-center justify-between ${isRtl ? '' : 'md:flex-row-reverse'}`}>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-blue-200 tracking-tight drop-shadow-sm">
          {t('ticketPoints')}
        </h1>
      </div>

      <div className="bg-[#111827]/60 border border-white/10 p-6 rounded-2xl shadow-xl">
        <div className="relative max-w-md">
          <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={t('searchByNameOrId')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-black/40 border border-white/10 rounded-xl py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredPoints.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-[#111827]/40 rounded-2xl border border-white/5">
            {t('noResultsFound')}
          </div>
        ) : (
          filteredPoints.map((p, index) => {
            const userTickets = getUserTickets(p.userId);
            const isExpanded = expandedUser === p.userId;
            const hidePoints = p.hidePoints;
            
            return (
              <div 
                key={p.userId}
                className="bg-[#111827]/60 border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-blue-500/30 transition-all duration-300"
              >
                <div className={`p-5 flex flex-col sm:flex-row items-center justify-between gap-4 ${isRtl ? '' : 'sm:flex-row-reverse'}`}>
                  <div className={`flex items-center gap-4 w-full sm:w-auto ${isRtl ? '' : 'flex-row-reverse'}`}>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-gray-400 shrink-0">
                      #{index + 1}
                    </div>
                    <div className="relative w-14 h-14 shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden relative z-10 border-2 border-white/10">
                        {p.user?.avatar ? (
                          <CachedImage src={p.user.avatar} alt="User" fill className="object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      {p.user?.avatarDecoration && (
                        <div className="absolute -inset-2.5 z-20 pointer-events-none">
                          <CachedImage src={p.user.avatarDecoration} alt="Decoration" fill className="object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <h3 className="font-bold text-lg text-white" style={{ color: p.user?.highestRoleColor || '#fff' }}>
                        {p.user?.displayName || p.userId}
                      </h3>
                      <p className="text-sm text-gray-400 font-mono">{p.userId}</p>
                    </div>
                  </div>
                  
                  <div className={`flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end ${isRtl ? '' : 'flex-row-reverse'}`}>
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{t('points')}</p>
                      <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        {hidePoints ? '???' : p.points}
                      </p>
                    </div>
                    
                    {!hidePoints ? (
                      <button
                        onClick={() => setExpandedUser(isExpanded ? null : p.userId)}
                        className={`flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-blue-400 font-bold text-sm ${isRtl ? '' : 'flex-row-reverse'}`}
                      >
                        {t('ticketsLabel')}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    ) : (
                      <div className={`flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold ${isRtl ? '' : 'flex-row-reverse'}`}>
                        <ShieldAlert className="w-4 h-4" />
                        {t('hidden')}
                      </div>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && !hidePoints && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-white/10 bg-black/20"
                    >
                      <div className="p-6">
                        <h4 className={`text-sm font-bold text-gray-400 mb-4 flex items-center gap-2 ${isRtl ? '' : 'flex-row-reverse'}`}>
                          <Ticket className="w-4 h-4" />
                          {t('receivedTickets')} ({p.points})
                        </h4>
                        
                        {userTickets.length === 0 ? (
                          <p className={`text-gray-500 text-sm ${isRtl ? 'text-right' : 'text-left'}`}>{t('noTicketsReceived')}</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {userTickets.map(ticket => (
                              <button
                                key={ticket.ticketId}
                                onClick={() => router.push(`/dashboard/transcripts?q=${ticket.ticketId}&ticket=${ticket.ticketId}`)}
                                className={`p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group ${isRtl ? 'text-right' : 'text-left'}`}
                              >
                                <div className={`flex justify-between items-start mb-2 ${isRtl ? '' : 'flex-row-reverse'}`}>
                                  <span className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                    {ticket.division}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-md ${ticket.closed ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {ticket.closed ? t('closed') : t('open')}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 font-mono mb-2">#{ticket.ticketId}</p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(ticket.createdAt)}
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function TicketPointsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <TicketPointsContent />
    </Suspense>
  );
}
