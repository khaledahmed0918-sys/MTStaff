import { query } from '@/lib/db';
import { getUserInfo } from '@/lib/bot';
import { ShieldAlert, Calendar, MessageSquare, Clock, Flame, Ticket, ListTodo, CheckCircle2 } from 'lucide-react';
import CachedImage from '@/components/cached-image';
import { formatVoiceTime } from '@/lib/utils';
import { RolesDisplay } from '@/components/roles-display';

export const dynamic = 'force-dynamic';

export default async function InvitePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  
  // Check if invite exists
  let inviteExists = false;
  try {
    const result = await query('SELECT * FROM invites WHERE user_id = $1', [userId]);
    if (result.rows.length > 0) {
      inviteExists = true;
    }
  } catch (e) {
    // Table might not exist
  }

  if (!inviteExists) {
    return (
      <div className="min-h-screen bg-[#050b14] flex items-center justify-center p-4 relative overflow-hidden" dir="rtl">
        {/* Background effects */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.15)_0%,transparent_60%)]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.15)_0%,transparent_60%)]"></div>
          <div className="absolute inset-0 bg-[#0a192f]/80 backdrop-blur-[80px]"></div>
        </div>
        
        <div className="bg-[#111827]/80 backdrop-blur-xl border border-red-500/30 p-8 md:p-12 rounded-[2rem] shadow-[0_0_50px_rgba(225,29,72,0.1)] text-center max-w-lg w-full relative z-10">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <ShieldAlert className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-4">رابط غير صالح</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            يُرجى الطلب من إحدى الإداريين إنشاء رابط الانڤايت مرة اخرى .
          </p>
        </div>
      </div>
    );
  }

  // Fetch user details
  const guildId = process.env.DISCORD_GUILD_ID || '852218081837449246';
  const userInfo = await getUserInfo(guildId, userId);
  
  let stats: any = {};
  try {
    const [streaksRes, messagesRes, voiceRes] = await Promise.allSettled([
      query(`SELECT * FROM streaks WHERE user_id = $1`, [userId]),
      query(`SELECT * FROM messages WHERE user_id = $1`, [userId]),
      query(`SELECT * FROM voice WHERE user_id = $1`, [userId])
    ]);

    stats.streaks = streaksRes.status === 'fulfilled' ? streaksRes.value.rows[0] : null;
    stats.messages = messagesRes.status === 'fulfilled' ? messagesRes.value.rows[0] : null;
    stats.voice = voiceRes.status === 'fulfilled' ? voiceRes.value.rows[0] : null;

    // Coins
    try {
      const fs = require('fs/promises');
      const path = require('path');
      const content = await fs.readFile(path.join(process.cwd(), '..', '..', 'mtcoins', 'data', 'users', `${userId}.json`), 'utf-8');
      stats.coins = JSON.parse(content).data;
    } catch (e) {}

    // Tasks
    try {
      const fs = require('fs/promises');
      const path = require('path');
      const content = await fs.readFile(path.join(process.cwd(), '..', '..', 'mtcoins', 'data', 'tasks', `${userId}.json`), 'utf-8');
      stats.tasks = JSON.parse(content).tasks;
    } catch (e) {}

    // Tickets
    try {
      const fs = require('fs/promises');
      const path = require('path');
      const pointsRaw = await fs.readFile(path.join(process.cwd(), '..', '..', 'MTC-System', 'data', 'Tickets', 'points.json'), 'utf-8');
      const pointsData = JSON.parse(pointsRaw);
      stats.tickets = pointsData[userId] ? Number(pointsData[userId]) : 0;
    } catch (e) {}

    // Logs
    const [swarnsRes, warnsRes, timeoutsRes, bansRes] = await Promise.allSettled([
      query(`SELECT * FROM "swarns_${userId}" ORDER BY date DESC`),
      query(`SELECT * FROM "warns_${userId}" ORDER BY date_warn DESC`),
      query(`SELECT * FROM "timeouts_${userId}" ORDER BY date DESC`),
      query(`SELECT * FROM "bans_${userId}" ORDER BY date DESC`)
    ]);

    stats.swarns = swarnsRes.status === 'fulfilled' ? swarnsRes.value.rows : [];
    stats.warns = warnsRes.status === 'fulfilled' ? warnsRes.value.rows : [];
    stats.timeouts = timeoutsRes.status === 'fulfilled' ? timeoutsRes.value.rows : [];
    stats.bans = bansRes.status === 'fulfilled' ? bansRes.value.rows : [];

  } catch (e) {
    console.error('Error fetching stats:', e);
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-[#050b14] flex items-center justify-center p-4" dir="rtl">
        <div className="text-white text-xl font-bold">لم يتم العثور على المستخدم</div>
      </div>
    );
  }

  // Render the full card
  return (
    <div className="min-h-screen bg-[#050b14] py-12 px-4 relative overflow-x-hidden" dir="rtl">
      {/* Background effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2)_0%,transparent_60%)]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.2)_0%,transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[#0a192f]/80 backdrop-blur-[80px]"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* User Card */}
        <div className="bg-[#111827]/60 border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
          {userInfo.banner && (
            <div className="aspect-[5/2] w-full relative overflow-hidden">
              <CachedImage src={userInfo.banner} alt="Banner" fill className="object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent z-20" />
            </div>
          )}

          <div className={`p-8 flex flex-col items-center md:items-start relative z-30 ${userInfo.banner ? '-mt-16 md:-mt-24' : ''}`}>
            <div className={`flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 w-full`}>
              <div className="w-32 h-32 md:w-44 md:h-44 relative rounded-full overflow-hidden border-4 border-[#111827] bg-[#111827] z-10 shadow-2xl shrink-0">
                {userInfo.avatar ? (
                  <CachedImage src={userInfo.avatar} alt={userInfo.username} fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-5xl">{userInfo.username.charAt(0)}</div>
                )}
              </div>
              <div className={`mb-4 flex-1 text-center md:text-right`}>
                <h3 className="font-black text-4xl md:text-5xl mb-2 tracking-tight" style={{ color: userInfo.highestRoleColor || '#ffffff' }}>
                  {userInfo.displayName}
                </h3>
                <p className="text-xl text-gray-400 font-medium">@{userInfo.username}</p>
                <p className="text-sm text-gray-500 mt-3 font-mono bg-black/40 px-4 py-1.5 rounded-xl inline-block border border-white/10">الايدي: {userInfo.id}</p>
              </div>
            </div>
            
            <div className={`flex flex-col md:flex-row items-center gap-4 md:gap-8 mt-8 text-sm text-gray-400 w-full md:w-auto`}>
              <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-2xl border border-white/10 w-full md:w-auto justify-center shadow-inner">
                <Calendar className="w-5 h-5 text-blue-400 shrink-0" />
                <span className="font-medium">تاريخ الإنشاء: {new Date(userInfo.createdAt).toLocaleDateString('ar-SA')}</span>
              </div>
              {userInfo.joinedAt && (
                <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-2xl border border-white/10 w-full md:w-auto justify-center shadow-inner">
                  <Calendar className="w-5 h-5 text-purple-400 shrink-0" />
                  <span className="font-medium">تاريخ الانضمام: {new Date(userInfo.joinedAt).toLocaleDateString('ar-SA')}</span>
                </div>
              )}
            </div>
            
            {userInfo.roles && userInfo.roles.length > 0 && (
              <RolesDisplay roles={userInfo.roles} />
            )}
          </div>

          <div className="border-t border-white/10 bg-black/20 p-6 md:p-10 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                icon={<MessageSquare className="w-8 h-8 text-blue-400" />}
                label="الرسائل"
                value={stats.messages?.all?.toLocaleString() || 0}
                subStats={[
                  { label: 'يوم', value: stats.messages?.top_day || 0 },
                  { label: 'أسبوع', value: stats.messages?.top_week || 0 },
                  { label: 'شهر', value: stats.messages?.top_month || 0 }
                ]}
              />
              <StatCard 
                icon={<Clock className="w-8 h-8 text-purple-400" />}
                label="الفويس"
                value={formatVoiceTime(stats.voice?.all || 0)}
                subStats={[
                  { label: 'يوم', value: formatVoiceTime(stats.voice?.top_day || 0) },
                  { label: 'أسبوع', value: formatVoiceTime(stats.voice?.top_week || 0) },
                  { label: 'شهر', value: formatVoiceTime(stats.voice?.top_month || 0) }
                ]}
              />
              <StatCard 
                icon={<Flame className="w-8 h-8 text-orange-400" />}
                label="الستريك"
                value={stats.streaks?.streak || 0}
                subValue={stats.streaks?.completed_today ? 'مكتمل اليوم' : 'غير مكتمل'}
                subValueColor={stats.streaks?.completed_today ? 'text-emerald-400' : 'text-rose-400'}
              />
              <StatCard 
                icon={<Ticket className="w-8 h-8 text-emerald-400" />}
                label="التذاكر"
                value={stats.tickets || 0}
              />
            </div>

            {/* Coins & Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
                <div className={`flex items-center gap-3`}>
                  <ListTodo className="w-6 h-6 text-blue-400" />
                  <h4 className="text-2xl font-black text-white">المهام</h4>
                </div>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-400">المهام المتبقية</p>
                    <div className={`flex flex-wrap gap-2`}>
                      {(stats.tasks || []).filter((t: any) => !t.completed).map((task: any, i: number) => (
                        <span key={i} className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-xl text-xs font-bold">
                          {task.task_name}
                        </span>
                      ))}
                      {(stats.tasks || []).filter((t: any) => !t.completed).length === 0 && (
                        <span className="text-gray-500 text-sm">لا توجد مهام متبقية 🎉</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-gray-400">المهام المكتملة</p>
                    <div className={`flex flex-wrap gap-2`}>
                      {(stats.tasks || []).filter((t: any) => t.completed).map((task: any, i: number) => (
                        <span key={i} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold">
                          {task.task_name}
                        </span>
                      ))}
                      {(stats.tasks || []).filter((t: any) => t.completed).length === 0 && (
                        <span className="text-gray-500 text-sm">لم يتم إكمال أي مهام بعد</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/5 border border-yellow-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center text-2xl font-black text-black mb-4 shadow-lg shadow-yellow-500/20">$</div>
                <h4 className="text-yellow-500 font-bold mb-1">الرصيد الحالي</h4>
                <p className="text-4xl font-black text-white">{stats.coins?.coins?.toLocaleString() || 0}</p>
              </div>
            </div>

            {/* Logs Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <LogSection title="تحذيرات إدارية" items={stats.swarns} color="red" />
              <LogSection title="التحذيرات" items={stats.warns} color="yellow" />
              <LogSection title="التايم اوت" items={stats.timeouts} color="orange" />
              <LogSection title="الباند" items={stats.bans} color="rose" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subStats, subValue, subValueColor }: any) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4 hover:bg-white/10 transition-colors text-right`}>
      <div className={`flex items-center gap-3`}>
        <div className="p-2 bg-white/5 rounded-xl">{icon}</div>
        <h4 className="font-bold text-gray-400 text-sm">{label}</h4>
      </div>
      <div>
        <p className="text-3xl font-black text-white">{value}</p>
        {subValue && <p className={`text-xs font-bold mt-1 ${subValueColor}`}>{subValue}</p>}
      </div>
      {subStats && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
          {subStats.map((stat: any, i: number) => (
            <div key={i} className="text-center">
              <p className="text-[10px] text-gray-500 uppercase font-bold">{stat.label}</p>
              <p className="text-xs font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LogSection({ title, items, color }: any) {
  const colorClasses: any = {
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-64">
      <div className={`p-4 border-b border-white/10 font-bold text-sm ${colorClasses[color].split(' ')[0]} text-right`}>
        {title} ({items?.length || 0})
      </div>
      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
        {(!items || items.length === 0) ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
            <CheckCircle2 className="w-8 h-8 mb-2" />
            <p className="text-xs">سجل نظيف</p>
          </div>
        ) : (
          items.map((item: any, i: number) => (
            <div key={i} className={`bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-right`}>
              <div className={`flex justify-between items-center mb-1`}>
                <span className="text-gray-500">{new Date(item.date || item.date_warn).toLocaleDateString('ar-SA')}</span>
              </div>
              <p className="text-gray-300 line-clamp-2">{item.reason}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
