'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { useNav } from './nav-context';

export function Topbar({ user }: { user: any }) {
  const { toggle } = useNav();
  const profile = user?.profile || {};
  const [imgSrc, setImgSrc] = useState(user?.image || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=');

  if (!user) return null;

  return (
    <header className="h-16 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-6 z-20 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggle}
          className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden md:block">
          <p className="text-sm font-medium text-white">{profile.global_name || profile.username || user.name}</p>
        </div>
        <div className="w-9 h-9 relative rounded-full overflow-hidden border border-white/10">
          <Image
            src={imgSrc}
            alt={profile.username || user.name || 'User'}
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
