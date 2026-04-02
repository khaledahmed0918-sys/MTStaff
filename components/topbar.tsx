'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Menu, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useNav } from './nav-context';
import { signOut } from 'next-auth/react';
import CachedImage from './cached-image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from './settings-context';

export function Topbar({ user }: { user: any }) {
  const { toggle } = useNav();
  const router = useRouter();
  const { t, settings } = useSettings();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userData, setUserData] = useState<any>(null);

  const isRtl = settings.language === 'ar';
  const profile = user?.profile || {};
  const avatarUrl = user?.image || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';

  useEffect(() => {
    // Fetch user data to get nameplate and nickname
    async function fetchUserData() {
      try {
        const res = await fetch(`/api/user/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
      } catch (e) {
        console.error('Failed to fetch user data for topbar', e);
      }
    }
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const displayName = userData?.discord?.nickname || profile.global_name || profile.username || user.name;
  const nameplate = userData?.discord?.nameplate;

  return (
    <header className={`h-16 relative flex items-center justify-between px-4 md:px-6 z-20 shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-white/5 ${isRtl ? '' : 'flex-row-reverse'}`}>
      {/* Background / Nameplate */}
      <div className="absolute inset-0 overflow-hidden z-0 bg-[#0a0f1a]/90 backdrop-blur-[27px]">
        {nameplate && (
          <div className="absolute inset-0 opacity-30">
            <CachedImage src={nameplate} alt="Nameplate" fill className="object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1a] via-transparent to-[#0a0f1a]" />
          </div>
        )}
      </div>

      <div className={`flex items-center gap-4 relative z-10 ${isRtl ? '' : 'flex-row-reverse'}`}>
        <button 
          onClick={toggle}
          className="md:hidden p-2.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300 bg-[#111827]/50 border border-white/5"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className={`md:hidden flex items-center gap-2 ${isRtl ? '' : 'flex-row-reverse'}`}>
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

      <div className={`flex items-center gap-3 relative z-10 ${isRtl ? '' : 'flex-row-reverse'}`} ref={dropdownRef}>
        <div 
          className={`flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1.5 rounded-full transition-colors border border-transparent hover:border-white/10 ${isRtl ? 'pr-4' : 'pl-4 flex-row-reverse'}`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className={`hidden md:block ${isRtl ? 'text-right' : 'text-left'}`}>
            <p className={`text-sm font-bold text-white tracking-wide flex items-center gap-2 ${isRtl ? '' : 'flex-row-reverse'}`}>
              {displayName}
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </p>
          </div>
          <div className="w-10 h-10 relative rounded-full overflow-hidden border-2 border-[#111827] shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <CachedImage
              src={avatarUrl}
              alt={displayName}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`absolute top-full ${isRtl ? 'right-0' : 'left-0'} mt-2 w-48 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-50`}
            >
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push('/dashboard/settings');
                }}
                className={`w-full px-4 py-2.5 flex items-center gap-3 text-gray-300 hover:text-white hover:bg-white/5 transition-colors ${isRtl ? 'text-right' : 'text-left flex-row-reverse'}`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">{t('settings')}</span>
              </button>
              <div className="h-px bg-white/10 my-1 mx-2" />
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className={`w-full px-4 py-2.5 flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors ${isRtl ? 'text-right' : 'text-left flex-row-reverse'}`}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">{t('logout')}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
