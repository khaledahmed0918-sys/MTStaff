'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Menu, LogOut } from 'lucide-react';
import { useNav } from './nav-context';
import { signOut } from 'next-auth/react';
import { ScreenshotButton } from './screenshot-button';
import CachedImage from './cached-image';

export function Topbar({ user }: { user: any }) {
  const { toggle } = useNav();
  const profile = user?.profile || {};
  const avatarUrl = user?.image || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
  const [timestamp] = useState(() => Date.now());

  if (!user) return null;

  return (
    <header className="h-16 bg-[#0a0f1a]/70 backdrop-blur-[27px] border-b border-white/5 flex items-center justify-between px-4 md:px-6 z-20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggle}
          className="md:hidden p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 bg-[#111827]/50 border border-white/5"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 relative rounded-full overflow-hidden border border-white/10 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <Image
              src="https://i.postimg.cc/jdLhSPtq/HEIF-Image.jpg"
              alt="Logo"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
              unoptimized
            />
          </div>
          <h2 className="font-bold text-sm text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">MT</h2>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ScreenshotButton 
          elementId="dashboard-content" 
          variant="global" 
          fileName={`mt-dashboard-${timestamp}.png`} 
        />
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="md:hidden p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-300 border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-white tracking-wide">{profile.global_name || profile.username || user.name}</p>
        </div>
        <div className="w-10 h-10 relative rounded-full overflow-hidden border-2 border-[#111827] shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          <CachedImage
            src={avatarUrl}
            alt={profile.username || user.name || 'User'}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
}
