'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Search, LogOut, X, Loader2, Users, Trophy, FileText, Ticket } from 'lucide-react';
import Image from 'next/image';
import { useNav } from './nav-context';
import { signOut } from 'next-auth/react';

function SidebarLink({ link, pathname, setIsOpen }: { link: any, pathname: string, setIsOpen: (isOpen: boolean) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const isActive = pathname === link.href;
  const Icon = link.icon;

  // Reset loading if we are now on the page we were loading
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
      className={`flex flex-row items-center justify-start gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
          : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
      }`}
    >
      <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-transparent group-hover:bg-white/5'}`}>
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Icon className="w-5 h-5" />}
      </div>
      <span className="text-sm font-bold text-right">{link.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useNav();
  const links = [
    { href: '/dashboard', label: 'الرئيسية', icon: Home },
    { href: '/dashboard/admin', label: 'الرتب الإدارية', icon: Users },
    { href: '/dashboard/leaderboard', label: 'التوبات', icon: Trophy },
    { href: '/dashboard/search', label: 'البحث', icon: Search },
    { href: '/dashboard/transcripts', label: 'ترانسكريبت التذاكر', icon: FileText },
    { href: '/dashboard/ticket-points', label: 'نقاط التذاكر', icon: Ticket },
    { href: '/dashboard/me', label: 'الملف الشخصي', icon: User },
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
        fixed md:static inset-y-0 right-0 z-[100] w-64 bg-[#0a0f1a]/70 backdrop-blur-[27px] border-l border-white/10 
        flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="flex p-6 items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 relative rounded-full overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
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
            <SidebarLink key={link.href} link={link} pathname={pathname} setIsOpen={setIsOpen} />
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
          >
            <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-bold">تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
