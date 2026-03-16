'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Calendar, ShieldAlert, Ban, Clock, Flame, MessageSquare } from 'lucide-react';

export default function MyInfoPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyInfo() {
      try {
        // We need the user's ID. We can get it from a new endpoint or just decode the token.
        // Actually, we can create an endpoint /api/me that returns the session ID and then fetches.
        // Let's fetch /api/me first.
        const resMe = await fetch('/api/me');
        const me = await resMe.json();
        
        if (me.id) {
          const res = await fetch(`/api/user/${me.id}`);
          const userData = await res.json();
          setData(userData);
        }
      } catch (err) {
        console.error(err);
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

  if (!data || !data.discord) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 text-lg">لم يتم العثور على بيانات.</p>
      </div>
    );
  }

  const { discord, db } = data;
  const { warns = [], timeouts = [], bans = [], streaks } = db;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Card */}
      <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Banner */}
        <div className="h-48 w-full relative bg-gradient-to-r from-blue-900 to-indigo-900">
          {discord.banner && (
            <Image
              src={discord.banner}
              alt="Banner"
              fill
              className="object-cover opacity-80"
              referrerPolicy="no-referrer"
              unoptimized
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent" />
        </div>

        {/* Avatar & Info */}
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 mb-6">
            <div className="w-32 h-32 relative rounded-2xl overflow-hidden border-4 border-[#111827] shadow-[0_0_30px_rgba(59,130,246,0.4)] z-10 bg-[#111827]">
              {discord.avatar && (
                <Image
                  src={discord.avatar}
                  alt={discord.username}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  unoptimized
                />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                {discord.username}
                <span className="text-lg text-blue-400 font-normal">#{discord.discriminator}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <span className="font-mono text-blue-300">{discord.id}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>تاريخ الإنشاء: {new Date(discord.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            </div>

            {/* Streaks Badge */}
            {streaks && (
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                <div className="text-center">
                  <p className="text-orange-200 text-xs font-bold uppercase tracking-wider mb-1">الستريك الحالي</p>
                  <p className="text-3xl font-black text-white flex items-center justify-center gap-2">
                    {streaks.streak}
                    {streaks.streak_emoji && (
                      <span className="text-2xl drop-shadow-md">{streaks.streak_emoji}</span>
                    )}
                    {!streaks.streak_emoji && <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />}
                  </p>
                </div>
                <div className="w-px h-12 bg-orange-500/20 mx-2" />
                <div className="text-center">
                  <p className="text-orange-200 text-xs font-bold uppercase tracking-wider mb-1">رسائل اليوم</p>
                  <p className="text-xl font-bold text-white flex items-center justify-center gap-2">
                    {streaks.daily_messages}
                    <MessageSquare className="w-4 h-4 text-orange-400" />
                  </p>
                </div>
              </div>
            )}
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
                    <span className="text-xs text-gray-400">{new Date(warn.date_warn).toLocaleString('ar-SA')}</span>
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
                    <span className="text-xs text-gray-400">{new Date(to.date).toLocaleString('ar-SA')}</span>
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
                    <span className="text-xs text-gray-400">{new Date(ban.date).toLocaleString('ar-SA')}</span>
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
    </div>
  );
}
