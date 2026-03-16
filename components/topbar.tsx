import Image from 'next/image';

export function Topbar({ user }: { user: any }) {
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  return (
    <header className="h-20 bg-[#111827]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-20 shadow-lg">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold text-white">{user.username}</p>
          <p className="text-xs text-blue-400">#{user.discriminator}</p>
        </div>
        <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <Image
            src={avatarUrl}
            alt={user.username}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}
