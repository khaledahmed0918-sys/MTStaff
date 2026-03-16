'use client';
import { useState } from 'react';
import Image from 'next/image';

export function Topbar({ user }: { user: any }) {
  if (!user) return null;
  const [imgSrc, setImgSrc] = useState(user.avatar || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=');

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
            src={imgSrc}
            alt={user.username}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImgSrc('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=')}
          />
        </div>
      </div>
    </header>
  );
}
