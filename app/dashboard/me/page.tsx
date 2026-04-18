'use client';

import { useEffect, useState } from 'react';
import CachedImage from '@/components/cached-image';
import { Calendar, ShieldAlert, Ban, Clock, Flame, MessageSquare, CheckCircle2, Camera, ListTodo, History } from 'lucide-react';
import { formatVoiceTime, parseDiscordEmoji, generateGradientColors, fetchWithRetry } from '@/lib/utils';
import { RolesDisplay } from '@/components/roles-display';
import { InviteButton } from '@/components/invite-button';
import { ScreenshotButton } from '@/components/screenshot-button';
import { motion } from 'motion/react';
import { useSettings } from '@/components/settings-context';

export default function MyInfoPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { formatDate, t } = useSettings();

  useEffect(() => {
    async function fetchMyInfo() {
      try {
        const resMe = await fetchWithRetry('/api/me', { cache: 'no-store' });
        const me = await resMe.json();
        
        if (me.user && me.user.id) {
          const res = await fetchWithRetry(`/api/user/${me.user.id}`, { cache: 'no-store' });
          const userData = await res.json();
          
          // Initialize with safe defaults
          const initializedData = {
            discord: userData.discord || {
              id: me.user.id,
              username: me.user.name || 'غير معروف',
              avatar: me.user.image || null,
              createdAt: null,
            },
            db: {
              warns: userData.db?.warns || [],
              swarns: userData.db?.swarns || [],
              timeouts: userData.db?.timeouts || [],
              bans: userData.db?.bans || [],
              streaks: userData.db?.streaks || null,
              messages: userData.db?.messages || null,
              voice: userData.db?.voice || null,
              coins: userData.db?.coins || null,
              tasks: userData.db?.tasks || [],
            }
          };
          
          setData(initializedData);
        } else {
          throw new Error('User ID not found');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 text-lg">{t('noDataFound')}</p>
      </div>
    );
  }

  const { discord, db = {} } = data;
  const { warns = [], swarns = [], timeouts = [], bans = [], streaks, tasks = [] } = db;

  const remainingTasks = tasks.filter((t: any) => !t.completed);
  const completedTasks = tasks.filter((t: any) => t.completed);

  if (streaks && streaks.daily_messages >= 100) {
    completedTasks.push({ task_name: 'إنجاز مهمة الستريك بنجاح', completed: true });
  }

  return (
    <div className="block">
      <motion.div 
        id="my-profile-card" 
        className="space-y-8 bg-[#0a0f1a] p-4 sm:p-8 rounded-3xl relative"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Card */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative group">
        {/* Banner */}
        <div className="aspect-[5/2] w-full relative bg-[#0a0f1a] overflow-hidden">
          {discord.banner ? (
            <CachedImage
              src={`${discord.banner}?size=512`}
              alt="Banner"
              fill
              className="object-cover w-full h-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent" />
        </div>

        {/* Avatar & Info */}
        <div className="px-4 md:px-8 pb-8 relative">
          {/* Desktop Layout */}
          <div className="hidden md:flex flex-row gap-6 items-end -mt-20 mb-6">
            <div className="relative w-40 h-40 z-10 shrink-0">
              <div className="w-full h-full relative rounded-full overflow-hidden border-4 border-[#111827] shadow-[0_0_30px_rgba(59,130,246,0.4)] bg-[#111827]">
                {discord.avatar ? (
                  <CachedImage
                    src={`${discord.avatar}?size=128`}
                    alt={discord.username}
                    fill
                    className="object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-4xl">{discord.username.charAt(0)}</div>
                )}
              </div>
            </div>
            
            <div className="flex-1 text-right pt-0">
              <div className="flex flex-row items-center gap-4 justify-start">
                <h1 className="text-3xl font-bold" style={{ color: discord.highestRoleColor || '#ffffff' }}>
                  {discord.displayName || discord.username}
                </h1>
                <span className="text-lg text-gray-400 font-normal">({discord.username})</span>
              </div>
              
              <div className="text-sm text-gray-500 mt-2 flex flex-wrap items-center gap-4 justify-start">
                <span className="whitespace-nowrap">ID: {discord.id}</span>
                <InviteButton userId={discord.id} />
                <ScreenshotButton targetSelector="#my-profile-card" label="لقطة شاشة" />
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span className="text-xs sm:text-sm">{t('createdAt')}: {formatDate(discord.createdAt)}</span>
                </div>
                {discord.joinedAt && (
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span className="text-xs sm:text-sm">{t('joinedAt')}: {formatDate(discord.joinedAt)}</span>
                  </div>
                )}
              </div>

              {discord.roles && discord.roles.length > 0 && (
                <RolesDisplay roles={discord.roles} />
              )}
            </div>

            {/* Desktop Streaks Badge */}
            {streaks && (
              <div className="flex w-auto mt-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 px-6 py-4 rounded-2xl items-center justify-center gap-4 shadow-[0_0_20px_rgba(249,115,22,0.15)] shrink-0">
                <div className="text-center">
                  <p className="text-orange-200 text-xs font-bold uppercase tracking-wider mb-1">{t('currentStreak')}</p>
                  <p className="text-3xl font-black text-white flex items-center justify-center gap-2">
                    {streaks.streak}
                    {streaks.streak_emoji_url ? (
                      <CachedImage src={streaks.streak_emoji_url} alt="Streak" width={28} height={28} />
                    ) : streaks.streak_emoji ? (
                      parseDiscordEmoji(streaks.streak_emoji) ? (
                        <CachedImage src={parseDiscordEmoji(streaks.streak_emoji)!} alt="Streak" width={28} height={28} />
                      ) : (
                        <span className="text-2xl drop-shadow-md">{streaks.streak_emoji}</span>
                      )
                    ) : (
                      <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                    )}
                  </p>
                </div>
                <div className="w-px h-12 bg-orange-500/20 mx-2" />
                <div className="text-center">
                  <p className="text-orange-200 text-xs font-bold uppercase tracking-wider mb-1">{t('todayMessages')}</p>
                  <p className="text-xl font-bold text-white flex items-center justify-center gap-2">
                    {streaks.daily_messages}/100
                    <MessageSquare className="w-4 h-4 text-orange-400" />
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Layout */}
          <div className="flex md:hidden flex-col -mt-16 mb-6">
            <div className="flex justify-between items-start">
              <div className="flex flex-col items-start gap-2 pt-16">
                <div className="flex items-center gap-2">
                  <InviteButton userId={discord.id} />
                  <ScreenshotButton targetSelector="#my-profile-card" label="لقطة شاشة" className="px-2 py-1 text-xs" />
                </div>
                <div className="text-[10px] text-gray-500 flex flex-col items-start gap-1 w-full max-w-[140px]">
                  <div className="flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis w-full">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span className="text-[9px] sm:text-[10px]">{t('createdAt')}: {formatDate(discord.createdAt)}</span>
                  </div>
                  {discord.joinedAt && (
                    <div className="flex items-center gap-1 whitespace-nowrap overflow-hidden text-ellipsis w-full">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span className="text-[9px] sm:text-[10px]">{t('joinedAt')}: {formatDate(discord.joinedAt)}</span>
                    </div>
                  )}
                </div>
                {discord.roles && discord.roles.length > 0 && (
                  <div className="w-32">
                    <RolesDisplay roles={discord.roles} />
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end">
                <div className="relative w-28 h-28 z-10 shrink-0 mb-2">
                  <div className="w-full h-full relative rounded-full overflow-hidden border-4 border-[#111827] shadow-[0_0_30px_rgba(59,130,246,0.4)] bg-[#111827]">
                    {discord.avatar ? (
                      <CachedImage
                        src={`${discord.avatar}?size=128`}
                        alt={discord.username}
                        fill
                        className="object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-3xl">{discord.username.charAt(0)}</div>
                    )}
                  </div>
                </div>
                <h1 className="text-xl font-bold text-right" style={{ color: discord.highestRoleColor || '#ffffff' }}>
                  {discord.displayName || discord.username}
                </h1>
                <span className="text-sm text-gray-400 font-normal">@{discord.username}</span>
                <span className="text-[10px] text-gray-500 mt-1">ID: {discord.id}</span>
              </div>
            </div>

            {/* Mobile Streaks Badge (Separate Card) */}
            {streaks && (
              <div className="w-full mt-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 px-4 py-4 rounded-2xl flex items-center justify-between shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                <div className="text-center flex-1">
                  <p className="text-orange-200 text-[10px] font-bold uppercase tracking-wider mb-1">{t('currentStreak')}</p>
                  <p className="text-2xl font-black text-white flex items-center justify-center gap-2">
                    {streaks.streak}
                    {streaks.streak_emoji_url ? (
                      <CachedImage src={streaks.streak_emoji_url} alt="Streak" width={24} height={24} />
                    ) : streaks.streak_emoji ? (
                      parseDiscordEmoji(streaks.streak_emoji) ? (
                        <CachedImage src={parseDiscordEmoji(streaks.streak_emoji)!} alt="Streak" width={24} height={24} />
                      ) : (
                        <span className="text-xl drop-shadow-md">{streaks.streak_emoji}</span>
                      )
                    ) : (
                      <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                    )}
                  </p>
                </div>
                <div className="w-px h-10 bg-orange-500/20 mx-2" />
                <div className="text-center flex-1">
                  <p className="text-orange-200 text-[10px] font-bold uppercase tracking-wider mb-1">{t('todayMessages')}</p>
                  <p className="text-lg font-bold text-white flex items-center justify-center gap-1.5">
                    {streaks.daily_messages}/100
                    <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Messages */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-5 shadow-lg hover:border-blue-500/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="font-bold text-blue-400 text-lg">{t('messagesLabel')}</h4>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-gray-400">{t('total')}:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{db.messages?.all || 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">{t('today')}:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{db.messages?.top_day || 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">{t('week')}:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{db.messages?.top_week || 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">{t('month')}:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{db.messages?.top_month || 0}</span></div>
          </div>
        </div>

        {/* Voice */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 shadow-lg hover:border-purple-500/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="font-bold text-purple-400 text-lg">{t('voiceLabel')}</h4>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-gray-400">{t('total')}:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{formatVoiceTime(db.voice?.all || 0)}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">{t('today')}:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{formatVoiceTime(db.voice?.top_day || 0)}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">{t('week')}:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{formatVoiceTime(db.voice?.top_week || 0)}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">{t('month')}:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{formatVoiceTime(db.voice?.top_month || 0)}</span></div>
          </div>
        </div>

        {/* Streaks */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-5 shadow-lg hover:border-orange-500/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <h4 className="font-bold text-orange-400 text-lg">{t('streaksLabel')}</h4>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-gray-400">{t('current')}:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded flex items-center gap-1">{db.streaks?.streak || 0} {db.streaks?.streak_emoji_url ? <CachedImage src={db.streaks.streak_emoji_url} alt="streak" width={16} height={16} /> : db.streaks?.streak_emoji || '🔥'}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">{t('previous')}:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{db.streaks?.old_streak || 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">{t('shields')}:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{db.streaks?.shields || 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">{t('todayMessages')}:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{db.streaks?.daily_messages || 0}/100</span></div>
          </div>
        </div>

        {/* Coins */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-5 shadow-lg hover:border-yellow-500/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-black">$</div>
            </div>
            <h4 className="font-bold text-yellow-400 text-lg">{t('coinsLabel')}</h4>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-gray-400">{t('balance')}:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{db.coins?.coins || 0}</span></div>
          </div>
        </div>

        {/* Remaining Tasks */}
        <div className="md:col-span-1 lg:col-span-2 bg-[#111827]/80 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full blur-3xl" />
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <ListTodo className="w-6 h-6 text-red-400" />
              </div>
              <h4 className="text-xl font-black text-white tracking-tight">{t('remainingTasks')}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {remainingTasks.length > 0 ? remainingTasks.map((task: any, i: number) => (
                <div key={i} className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {task.task_name} {task.remaining ? `(${task.remaining})` : ''}
                </div>
              )) : (
                <div className="text-gray-500 font-bold italic py-1">{t('noRemainingTasks')}</div>
              )}
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="md:col-span-1 lg:col-span-2 bg-[#111827]/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-br-full blur-3xl" />
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="text-xl font-black text-white tracking-tight">{t('completedTasks')}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {completedTasks.length > 0 ? completedTasks.map((task: any, i: number) => (
                <div key={i} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {task.task_name}
                </div>
              )) : (
                <div className="text-gray-500 font-bold italic py-1">{t('noCompletedTasksYet')}</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="md:col-span-2 lg:col-span-4 bg-[#111827]/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full blur-3xl" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <History className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="text-xl font-black text-white tracking-tight">{t('recentPurchases')}</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {db.coins?.last_5 && db.coins.last_5.length > 0 ? (
              db.coins.last_5.map((purchase: any, i: number) => (
                <div key={i} className="bg-[#0a0f1a] border border-white/5 p-4 rounded-xl hover:border-purple-500/30 transition-colors flex flex-col justify-between">
                  <div className="mb-2">
                    <h5 className="font-bold text-gray-200 text-sm truncate">{purchase.item_name}</h5>
                    <span className="text-yellow-400 font-mono text-xs">{purchase.price.toLocaleString()} {t('currency')}</span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(purchase.date)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-gray-500 font-bold italic py-2">{t('noRecentPurchases')}</div>
            )}
          </div>
        </div>
      </div>

      {/* Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Admin Warns (swarns) */}
        <div className="bg-[#111827]/60 backdrop-blur-md border border-red-500/20 rounded-2xl overflow-hidden shadow-lg flex flex-col group hover:border-red-500/40 transition-colors duration-300">
          <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            <h2 className="font-bold text-red-400 text-lg">{t('adminWarnings')} ({swarns.length})</h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar space-y-3">
            {swarns.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('noAdminWarnings')}</p>
            ) : (
              swarns.map((warn: any, i: number) => (
                <div key={i} className="bg-[#0a0f1a] border border-white/5 rounded-xl p-4 hover:border-red-500/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono bg-red-500/20 text-red-300 px-2 py-1 rounded-md">#{warn.warn_number}</span>
                    <span className="text-xs text-gray-400">{formatDate(warn.date_warn)}</span>
                  </div>
                  <p className="text-sm text-gray-200">{warn.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Warns */}
        <div className="bg-[#111827]/60 backdrop-blur-md border border-yellow-500/20 rounded-2xl overflow-hidden shadow-lg flex flex-col group hover:border-yellow-500/40 transition-colors duration-300">
          <div className="bg-yellow-500/10 p-4 border-b border-yellow-500/20 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
            <h2 className="font-bold text-yellow-400 text-lg">{t('warningsLog')} ({warns.length})</h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar space-y-3">
            {warns.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('noWarnings')}</p>
            ) : (
              warns.map((warn: any, i: number) => (
                <div key={i} className="bg-[#0a0f1a] border border-white/5 rounded-xl p-4 hover:border-yellow-500/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-md">#{warn.warn_number}</span>
                    <span className="text-xs text-gray-400">{formatDate(warn.date_warn)}</span>
                  </div>
                  <p className="text-sm text-gray-200">{warn.reason}</p>
                  {warn.attachments && warn.attachments.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                      {warn.attachments.map((url: string, j: number) => (
                        <a key={j} href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline bg-blue-500/10 px-2 py-1 rounded">{t('attachment')} {j + 1}</a>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Timeouts */}
        <div className="bg-[#111827]/60 backdrop-blur-md border border-orange-500/20 rounded-2xl overflow-hidden shadow-lg flex flex-col group hover:border-orange-500/40 transition-colors duration-300">
          <div className="bg-orange-500/10 p-4 border-b border-orange-500/20 flex items-center gap-3">
            <Clock className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
            <h2 className="font-bold text-orange-400 text-lg">{t('timeoutsLog')} ({timeouts.length})</h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar space-y-3">
            {timeouts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('noTimeouts')}</p>
            ) : (
              timeouts.map((to: any, i: number) => (
                <div key={i} className="bg-[#0a0f1a] border border-white/5 rounded-xl p-4 hover:border-orange-500/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono bg-orange-500/20 text-orange-300 px-2 py-1 rounded-md">#{to.timeout_number}</span>
                    <span className="text-xs text-gray-400">{formatDate(to.date)}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">{t('duration')}: {to.time}</span>
                  </div>
                  <p className="text-sm text-gray-200">{to.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bans */}
        <div className="bg-[#111827]/60 backdrop-blur-md border border-red-500/20 rounded-2xl overflow-hidden shadow-lg flex flex-col group hover:border-red-500/40 transition-colors duration-300">
          <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex items-center gap-3">
            <Ban className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            <h2 className="font-bold text-red-400 text-lg">{t('bansLog')} ({bans.length})</h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar space-y-3">
            {bans.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('noBans')}</p>
            ) : (
              bans.map((ban: any, i: number) => (
                <div key={i} className="bg-[#0a0f1a] border border-white/5 rounded-xl p-4 hover:border-red-500/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono bg-red-500/20 text-red-300 px-2 py-1 rounded-md">#{ban.ban_number}</span>
                    <span className="text-xs text-gray-400">{formatDate(ban.date)}</span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">{t('duration')}: {ban.time}</span>
                    {ban.unbanned && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">{t('unbanned')}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-200">{ban.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </motion.div>
  </div>
);
}
