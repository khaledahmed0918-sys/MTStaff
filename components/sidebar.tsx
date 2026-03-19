'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Search, LogOut, X, Loader2, Users, ShoppingCart } from 'lucide-react';
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
      className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all duration-300 min-w-[70px] md:min-w-0 ${
        isActive
          ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
          : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
      }`}
    >
      <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-transparent group-hover:bg-white/5'}`}>
        {isLoading ? <Loader2 className="w-5 h-5 md:w-5 md:h-5 animate-spin" /> : <Icon className="w-5 h-5 md:w-5 md:h-5" />}
      </div>
      <span className="text-[10px] md:text-sm font-bold text-center md:text-right">{link.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useNav();
  const links = [
    { href: '/dashboard', label: 'الرئيسية', icon: Home },
    { href: '/dashboard/staff', label: 'الرتب الإدارية', icon: Users },
    { href: '/dashboard/search', label: 'البحث', icon: Search },
    { href: '/dashboard/store', label: 'المتجر', icon: ShoppingCart },
    { href: '/dashboard/me', label: 'الملف الشخصي', icon: User },
  ];

  return (
    <aside className={`
      fixed md:static inset-x-0 bottom-0 md:inset-y-0 md:right-0 z-50
      w-full md:w-64 bg-gradient-to-b md:bg-gradient-to-l from-[#0a0f1a] to-[#050505] backdrop-blur-2xl border-t md:border-t-0 md:border-l border-white/10 
      flex flex-col md:h-full shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-2xl transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full lg:translate-x-0'}
    `}>
      <div className="hidden md:flex p-6 items-center justify-between border-b border-white/10">
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

      <nav className="flex-1 p-2 md:p-4 flex flex-row md:flex-col justify-around md:justify-start items-center md:items-stretch space-x-1 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-visible custom-scrollbar">
        {links.map((link) => (
          <SidebarLink key={link.href} link={link} pathname={pathname} setIsOpen={setIsOpen} />
        ))}
      </nav>

      <div className="hidden md:block p-4 border-t border-white/10">
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
  );
}
