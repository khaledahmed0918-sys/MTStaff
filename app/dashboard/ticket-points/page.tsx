'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Search, Ticket, ChevronDown, ChevronUp, User as UserIcon } from 'lucide-react';
import CachedImage from '@/components/cached-image';
import { fetchWithRetry } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface PointUser {
  userId: string;
  points: number;
  user: any;
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

export default function TicketPointsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [points, setPoints] = useState<PointUser[]>([]);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [expandedUser, setExpandedUser] = useState<string | null>(searchParams.get('user') || null);

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
        setError('فشل في جلب بيانات نقاط التذاكر بعد عدة محاولات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-white to-blue-200 tracking-tight drop-shadow-sm">
          نقاط التذاكر
        </h1>
      </div>

      <div className="bg-[#0a0f1a]/80 border border-white/10 p-6 rounded-2xl shadow-xl">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الايدي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredPoints.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-[#0a0f1a]/50 rounded-2xl border border-white/5">
            لا يوجد نتائج مطابقة للبحث
          </div>
        ) : (
          filteredPoints.map((p, index) => {
            const userTickets = getUserTickets(p.userId);
            const isExpanded = expandedUser === p.userId;
            
            return (
              <div 
                key={p.userId}
                className="bg-[#0a0f1a]/80 border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-gray-400 shrink-0">
                      #{index + 1}
                    </div>
                    <div className="relative w-14 h-14 shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden relative z-10 border-2 border-white/10">
                        {p.user?.avatar ? (
                          <CachedImage src={p.user.avatar} alt="User" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      {p.user?.avatarDecoration && (
                        <div className="absolute -inset-2.5 z-20 pointer-events-none">
                          <CachedImage src={p.user.avatarDecoration} alt="Decoration" fill className="object-cover" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white" style={{ color: p.user?.highestRoleColor || '#fff' }}>
                        {p.user?.displayName || p.userId}
                      </h3>
                      <p className="text-sm text-gray-400 font-mono">{p.userId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">النقاط</p>
                      <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        {p.points}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setExpandedUser(isExpanded ? null : p.userId)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-blue-400 font-bold text-sm"
                    >
                      Tickets
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-white/10 bg-black/20"
                    >
                      <div className="p-6">
                        <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                          <Ticket className="w-4 h-4" />
                          التذاكر المستلمة ({p.points})
                        </h4>
                        
                        {userTickets.length === 0 ? (
                          <p className="text-gray-500 text-sm">لم يستلم أي تذاكر بعد</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {userTickets.map(ticket => (
                              <button
                                key={ticket.ticketId}
                                onClick={() => router.push(`/dashboard/transcripts?q=${ticket.ticketId}&ticket=${ticket.ticketId}`)}
                                className="text-right p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                    {ticket.division}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-md ${ticket.closed ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {ticket.closed ? 'مغلقة' : 'مفتوحة'}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 font-mono mb-2">#{ticket.ticketId}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(ticket.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
