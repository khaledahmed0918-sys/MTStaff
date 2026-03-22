'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { Search, Filter, MessageSquare, Mic, Flame, Coins, Shield, ArrowDownUp, Loader2 } from 'lucide-react';
import { formatVoiceTime } from '@/lib/utils';

export function LeaderboardClient() {
  const [initialUsers, setInitialUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/leaderboard');
        if (!res.ok) throw new Error('Failed to fetch leaderboard data');
        const data = await res.json();
        setInitialUsers(data);
      } catch (err) {
        console.error(err);
        setError('حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'messages' | 'voice' | 'streak' | 'mtcoins' | 'rolesCount'>('messages');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [roleCountFilter, setRoleCountFilter] = useState<string>('all');

  // Extract unique roles for the filter
  const uniqueRoles = useMemo(() => {
    const roles = new Set<string>();
    initialUsers.forEach(u => {
      if (u.highestRoleName) roles.add(u.highestRoleName);
    });
    return Array.from(roles).sort();
  }, [initialUsers]);

  // Extract unique role counts for the filter
  const uniqueRoleCounts = useMemo(() => {
    const counts = new Set<number>();
    initialUsers.forEach(u => {
      if (u.rolesCount !== undefined) counts.add(u.rolesCount);
    });
    return Array.from(counts).sort((a, b) => a - b);
  }, [initialUsers]);

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...initialUsers];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.username.toLowerCase().includes(q) || 
        u.displayName.toLowerCase().includes(q) || 
        u.id.includes(q)
      );
    }

    // Role Filter
    if (roleFilter !== 'all') {
      result = result.filter(u => u.highestRoleName === roleFilter);
    }

    // Role Count Filter
    if (roleCountFilter !== 'all') {
      const count = parseInt(roleCountFilter, 10);
      result = result.filter(u => u.rolesCount === count);
    }

    // Sort
    result.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      switch (sortBy) {
        case 'messages':
          valA = a.stats.messages || 0;
          valB = b.stats.messages || 0;
          break;
        case 'voice':
          valA = a.stats.voice || 0;
          valB = b.stats.voice || 0;
          break;
        case 'streak':
          valA = a.stats.streak || 0;
          valB = b.stats.streak || 0;
          break;
        case 'mtcoins':
          valA = a.stats.mtcoins || 0;
          valB = b.stats.mtcoins || 0;
          break;
        case 'rolesCount':
          valA = a.rolesCount || 0;
          valB = b.rolesCount || 0;
          break;
      }

      if (sortOrder === 'desc') {
        return valB - valA;
      } else {
        return valA - valB;
      }
    });

    return result;
  }, [initialUsers, searchQuery, sortBy, sortOrder, roleFilter, roleCountFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="text-gray-400 font-medium">جاري جلب بيانات المتصدرين...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">التوبات</h1>
          <p className="text-gray-400 text-sm mt-1">قائمة بأفضل الأعضاء وتفاعلهم في الخادم</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-[#111827]/50 backdrop-blur-xl border border-white/5 p-4 rounded-2xl flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو الايدي..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-xl py-2.5 pr-9 pl-4 text-white appearance-none focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
            >
              <option value="all">جميع الرتب</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={roleCountFilter}
              onChange={(e) => setRoleCountFilter(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-xl py-2.5 pr-9 pl-4 text-white appearance-none focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
            >
              <option value="all">عدد الرتب (الكل)</option>
              {uniqueRoleCounts.map(count => (
                <option key={count} value={count.toString()}>{count} رتبة</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <ArrowDownUp className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/20 border border-white/10 rounded-xl py-2.5 pr-9 pl-4 text-white appearance-none focus:outline-none focus:border-blue-500/50 transition-colors text-sm"
            >
              <option value="messages">الرسائل</option>
              <option value="voice">الفويس</option>
              <option value="streak">الستريك</option>
              <option value="mtcoins">الكوينز</option>
              <option value="rolesCount">عدد الرتب</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="px-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            {sortOrder === 'desc' ? 'الأعلى إلى الأقل' : 'الأقل إلى الأعلى'}
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedUsers.slice(0, 100).map((user, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              key={user.id}
              className="bg-[#111827]/60 backdrop-blur-md border border-white/5 rounded-xl p-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-white/10 transition-all group relative overflow-hidden"
            >
              {/* Nameplate / Banner Effect */}
              {user.highestRoleColor && user.highestRoleColor !== '#000000' && (
                <div 
                  className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none"
                  style={{ backgroundColor: user.highestRoleColor }}
                />
              )}
              {/* Left Accent Line */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1 opacity-50 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: user.highestRoleColor || '#3b82f6' }}
              />

              {/* User Info */}
              <div className="flex items-center gap-3 w-full md:w-auto relative z-10 pl-2">
                <div className="text-lg font-black text-white/20 w-8 text-center">
                  #{index + 1}
                </div>
                <div className="relative w-10 h-10 shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden border-2" style={{ borderColor: user.highestRoleColor || '#3b82f6' }}>
                    <Image
                      src={user.avatar}
                      alt={user.username}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {user.avatarDecoration && (
                    <Image
                      src={user.avatarDecoration}
                      alt="Decoration"
                      fill
                      className="absolute inset-0 scale-[1.2] pointer-events-none"
                      unoptimized
                    />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white text-sm flex items-center gap-1.5">
                    {user.displayName}
                  </span>
                  <span className="text-[10px] text-gray-400">{user.username}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto mt-1 md:mt-0 relative z-10">
                {user.highestRoleName && (
                  <div 
                    className="px-2 py-0.5 rounded-md text-[10px] font-bold border border-white/10 flex items-center gap-1 w-fit"
                    style={{ backgroundColor: `${user.highestRoleColor}20`, color: user.highestRoleColor }}
                  >
                    <Shield className="w-3 h-3" />
                    <span className="truncate max-w-[100px]">{user.highestRoleName}</span>
                  </div>
                )}
                
                <div className="grid grid-cols-4 md:flex items-center gap-1.5 md:gap-3 text-xs text-gray-300 w-full md:w-auto">
                  <div className="flex items-center justify-center md:justify-start gap-1.5 bg-black/30 md:bg-transparent py-1.5 px-2 md:p-0 rounded-md border border-white/5 md:border-none" title="الرسائل">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="font-mono font-medium">{user.stats.messages.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 bg-black/30 md:bg-transparent py-1.5 px-2 md:p-0 rounded-md border border-white/5 md:border-none" title="الفويس">
                    <Mic className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="font-mono font-medium">{formatVoiceTime(user.stats.voice)}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 bg-black/30 md:bg-transparent py-1.5 px-2 md:p-0 rounded-md border border-white/5 md:border-none" title="الستريك">
                    <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="font-mono font-medium">{user.stats.streak.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-1.5 bg-black/30 md:bg-transparent py-1.5 px-2 md:p-0 rounded-md border border-white/5 md:border-none" title="الكوينز">
                    <Coins className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                    <span className="font-mono font-medium">{user.stats.mtcoins.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredAndSortedUsers.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              لا يوجد نتائج مطابقة للبحث
            </div>
          )}
        </AnimatePresence>
      </div>
      
      {filteredAndSortedUsers.length > 100 && (
        <div className="text-center text-sm text-gray-500 mt-4">
          يتم عرض أول 100 نتيجة فقط. استخدم البحث للوصول إلى المزيد.
        </div>
      )}
    </div>
  );
}
