'use client';

import { useEffect, useState } from 'react';
import CachedImage from '@/components/cached-image';
import { Calendar, ShieldAlert, Ban, Clock, Flame, MessageSquare, CheckCircle2 } from 'lucide-react';
import { formatVoiceTime, formatDateEn, parseDiscordEmoji } from '@/lib/utils';

const formatDateTime = (dateString: any) => {
  if (!dateString) return 'غير محدد';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'تاريخ غير صالح';
  return date.toLocaleString('ar-SA');
};

export default function MyInfoPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyInfo() {
      try {
        const resMe = await fetch('/api/me', { cache: 'no-store' });
        const me = await resMe.json();
        
        if (me.id) {
          const res = await fetch(`/api/user/${me.id}`, { cache: 'no-store' });
          const userData = await res.json();
          
          if (!userData.discord) {
            userData.discord = {
              id: me.id,
              username: me.username || 'غير معروف',
              discriminator: me.discriminator || '0000',
              avatar: me.avatar ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png` : null,
              createdAt: null,
            };
          }
          if (!userData.db) {
            userData.db = { warns: [], timeouts: [], bans: [], streaks: null };
          }
          
          setData(userData);
        }
      } catch (err) {
        // Error handling removed
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
        <p className="text-gray-400 text-lg">لم يتم العثور على بيانات.</p>
      </div>
    );
  }

  const { discord, db = {} } = data;
  const { warns = [], timeouts = [], bans = [], streaks, tasks = [] } = db;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Card */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Banner */}
        <div className="h-64 w-full relative bg-[#0a0f1a] overflow-hidden">
          {discord.banner ? (
            <CachedImage
              src={discord.banner}
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
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 mb-6">
            <div className="relative w-40 h-40 z-10">
              <div className="w-full h-full relative rounded-lg overflow-hidden border-4 border-[#111827] shadow-[0_0_30px_rgba(59,130,246,0.4)] bg-[#111827]">
                {discord.avatar ? (
                  <CachedImage
                    src={discord.avatar}
                    alt={discord.username}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-4xl">{discord.username.charAt(0)}</div>
                )}
              </div>
            </div>
            <div className="flex-1 mt-24 md:mt-20">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold" style={{ color: discord.highestRoleColor || '#ffffff' }}>
                  {discord.displayName || discord.username}
                </h1>
                <span className="text-lg text-gray-400 font-normal">({discord.username})</span>
              </div>
              
              <div className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                <span>ID: {discord.id}</span>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>تاريخ الإنشاء: {formatDateEn(discord.createdAt)}</span>
                </div>
                {discord.joinedAt && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>تاريخ الانضمام: {formatDateEn(discord.joinedAt)}</span>
                  </div>
                )}
              </div>

              {discord.roles && discord.roles.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {discord.roles.map((role: any) => (
                    <div key={role.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border border-white/10" style={{ backgroundColor: `${role.color}15`, color: role.color !== '#000000' ? role.color : '#ffffff' }}>
                      {role.icon && <CachedImage src={role.icon} alt={role.name} width={16} height={16} />}
                      {role.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Streaks Badge */}
            {streaks && (
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                <div className="text-center">
                  <p className="text-orange-200 text-xs font-bold uppercase tracking-wider mb-1">الستريك الحالي</p>
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
                  <p className="text-orange-200 text-xs font-bold uppercase tracking-wider mb-1">رسائل اليوم</p>
                  <p className="text-xl font-bold text-white flex items-center justify-center gap-2">
                    {streaks.daily_messages}/100
                    <MessageSquare className="w-4 h-4 text-orange-400" />
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
            <h4 className="font-bold text-blue-400 text-lg">الرسائل</h4>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-gray-400">الكل:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{db.messages?.all || 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">اليوم:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{db.messages?.top_day || 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">الأسبوع:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{db.messages?.top_week || 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">الشهر:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{db.messages?.top_month || 0}</span></div>
          </div>
        </div>

        {/* Voice */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 shadow-lg hover:border-purple-500/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="font-bold text-purple-400 text-lg">الصوت</h4>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-gray-400">الكل:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{formatVoiceTime(db.voice?.all || 0)}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">اليوم:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{formatVoiceTime(db.voice?.top_day || 0)}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">الأسبوع:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{formatVoiceTime(db.voice?.top_week || 0)}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">الشهر:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{formatVoiceTime(db.voice?.top_month || 0)}</span></div>
          </div>
        </div>

        {/* Streaks */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-5 shadow-lg hover:border-orange-500/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <h4 className="font-bold text-orange-400 text-lg">الستريك</h4>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-gray-400">الحالي:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded flex items-center gap-1">{db.streaks?.streak || 0} {db.streaks?.streak_emoji_url ? <CachedImage src={db.streaks.streak_emoji_url} alt="streak" width={16} height={16} /> : db.streaks?.streak_emoji || '🔥'}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">السابق:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{db.streaks?.old_streak || 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">الحمايات:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{db.streaks?.shields || 0}</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">رسائل اليوم:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{db.streaks?.daily_messages || 0}/100</span></div>
          </div>
        </div>

        {/* Coins */}
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-5 shadow-lg hover:border-yellow-500/40 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-black">$</div>
            </div>
            <h4 className="font-bold text-yellow-400 text-lg">العملات</h4>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-gray-400">الرصيد:</span> <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">{db.coins?.coins || 0}</span></div>
          </div>
        </div>
      </div>

      {/* Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Warns */}
        <div className="bg-[#111827]/60 backdrop-blur-md border border-yellow-500/20 rounded-2xl overflow-hidden shadow-lg flex flex-col group hover:border-yellow-500/40 transition-colors duration-300">
          <div className="bg-yellow-500/10 p-4 border-b border-yellow-500/20 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" />
            <h2 className="font-bold text-yellow-400 text-lg">سجل التحذيرات ({warns.length})</h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar space-y-3">
            {warns.length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا يوجد تحذيرات</p>
            ) : (
              warns.map((warn: any, i: number) => (
                <div key={i} className="bg-[#0a0f1a] border border-white/5 rounded-xl p-4 hover:border-yellow-500/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-md">#{warn.warn_number}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(warn.date_warn)}</span>
                  </div>
                  <p className="text-sm text-gray-200">{warn.reason}</p>
                  {warn.attachments && warn.attachments.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                      {warn.attachments.map((url: string, j: number) => (
                        <a key={j} href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline bg-blue-500/10 px-2 py-1 rounded">مرفق {j + 1}</a>
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
            <h2 className="font-bold text-orange-400 text-lg">سجل التايم أوت ({timeouts.length})</h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar space-y-3">
            {timeouts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا يوجد تايم أوت</p>
            ) : (
              timeouts.map((to: any, i: number) => (
                <div key={i} className="bg-[#0a0f1a] border border-white/5 rounded-xl p-4 hover:border-orange-500/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono bg-orange-500/20 text-orange-300 px-2 py-1 rounded-md">#{to.timeout_number}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(to.date)}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">المدة: {to.time}</span>
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
            <h2 className="font-bold text-red-400 text-lg">سجل الباند ({bans.length})</h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar space-y-3">
            {bans.length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا يوجد باند</p>
            ) : (
              bans.map((ban: any, i: number) => (
                <div key={i} className="bg-[#0a0f1a] border border-white/5 rounded-xl p-4 hover:border-red-500/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono bg-red-500/20 text-red-300 px-2 py-1 rounded-md">#{ban.ban_number}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(ban.date)}</span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">المدة: {ban.time}</span>
                    {ban.unbanned && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">تم فك الحظر</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-200">{ban.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Tasks Section */}
      <div className="bg-[#111827]/60 backdrop-blur-md border border-blue-500/20 rounded-2xl overflow-hidden shadow-lg flex flex-col group hover:border-blue-500/40 transition-colors duration-300">
        <div className="bg-blue-500/10 p-4 border-b border-blue-500/20 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
          <h2 className="font-bold text-blue-400 text-lg">المهام ({tasks.length})</h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar space-y-3">
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا يوجد مهام</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task: any, i: number) => (
                <div key={i} className={`bg-[#0a0f1a] border rounded-xl p-4 transition-all duration-300 ${task.completed ? 'border-emerald-500/30 hover:border-emerald-500/50' : 'border-blue-500/30 hover:border-blue-500/50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold ${task.completed ? 'text-emerald-400 line-through opacity-70' : 'text-blue-400'}`}>{task.title || 'مهمة بدون عنوان'}</h3>
                    {task.completed ? (
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        مكتملة
                      </span>
                    ) : (
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md">
                        حالية
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{task.description || 'لا يوجد وصف'}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    {task.dueDate && <span>تاريخ الانتهاء: {formatDateEn(task.dueDate)}</span>}
                    {task.createdAt && <span>تاريخ الإنشاء: {formatDateEn(task.createdAt)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
