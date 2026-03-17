'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { useNav } from './nav-context';

export function Topbar({ user }: { user: any }) {
  const { toggle } = useNav();
  const [imgSrc, setImgSrc] = useState(user?.avatar || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=');

  if (!user) return null;

  return (
    <header className="h-20 bg-[#111827]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-20 shadow-lg">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggle}
          className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold text-white">{user.displayName || user.username}</p>
          {user.discriminator !== '0' && <p className="text-xs text-blue-400">#{user.discriminator}</p>}
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 relative rounded-full overflow-hidden border-2 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <Image
            src={imgSrc}
            alt={user.username}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
            unoptimized
            onError={() => setImgSrc('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=')}
          />
        </div>
      </div>
    </header>
  );
}
