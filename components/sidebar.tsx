'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Search, LogOut, X, Loader2, Users, FileText, Ticket, Settings } from 'lucide-react';
import Image from 'next/image';
import { useNav } from './nav-context';
import { signOut } from 'next-auth/react';
import { useSettings } from './settings-context';

function SidebarLink({ link, pathname, setIsOpen, isRtl }: { link: any, pathname: string, setIsOpen: (isOpen: boolean) => void, isRtl: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const isActive = pathname === link.href;
  const Icon = link.icon;

  if (isActive && isLoading) {
    setIsLoading(false);
  }

  return (
    <Link
      href={link.href}
      onClick={() => {
        if (!isActive) {
          setIsLoading(true);
        }
        setIsOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isRtl ? 'flex-row' : 'flex-row-reverse justify-end'} ${
        isActive
          ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
          : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
      }`}
    >
      <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-transparent group-hover:bg-white/5'}`}>
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
      </div>
      <span className={`text-sm font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{link.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useNav();
  const { t, settings } = useSettings();
  const isRtl = settings.language === 'ar';

  const links = [
    { href: '/dashboard', label: t('dashboard'), icon: Home },
    { href: '/dashboard/admin', label: t('admin'), icon: Users },
    { href: '/dashboard/search', label: t('search'), icon: Search },
    { href: '/dashboard/transcripts', label: t('transcripts'), icon: FileText },
    { href: '/dashboard/ticket-points', label: t('ticketPoints'), icon: Ticket },
    { href: '/dashboard/settings', label: t('settings'), icon: Settings },
    { href: '/dashboard/me', label: t('profile'), icon: User },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`
        fixed md:static inset-y-0 ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} z-[100] w-64 bg-[#0a0f1a]/70 backdrop-blur-[27px] border-white/10 
        flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full md:translate-x-0' : '-translate-x-full md:translate-x-0')}
      `}>
        <div className={`flex p-6 items-center justify-between border-b border-white/10 ${isRtl ? '' : 'flex-row-reverse'}`}>
          <div className={`flex items-center gap-4 ${isRtl ? '' : 'flex-row-reverse'}`}>
            <div className="w-10 h-10 relative rounded-full overflow-hidden border border-white/10 shadow-[0_0_15_rgba(59,130,246,0.3)]">
              <Image
                src="https://i.postimg.cc/jdLhSPtq/HEIF-Image.jpg"
                alt="Logo"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
                unoptimized
              />
            </div>
            <h2 className="font-bold text-lg text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">MT Dashboard</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col justify-start items-stretch space-y-2 overflow-y-auto custom-scrollbar">
          {links.map((link) => (
            <SidebarLink key={link.href} link={link} pathname={pathname} setIsOpen={setIsOpen} isRtl={isRtl} />
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group ${isRtl ? '' : 'flex-row-reverse'}`}
          >
            <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
              <LogOut className="w-5 h-5" />
            </div>
            <span className={`font-bold ${isRtl ? 'text-right' : 'text-left'}`}>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
