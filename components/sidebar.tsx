'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Search, LogOut } from 'lucide-react';
import Image from 'next/image';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'الرئيسية', icon: Home },
    { href: '/dashboard/me', label: 'معلوماتي', icon: User },
    { href: '/dashboard/search', label: 'بحث', icon: Search },
  ];

  return (
    <aside className="w-64 bg-[#050505]/80 backdrop-blur-xl border-l border-white/10 flex flex-col h-full z-20 shadow-2xl">
      <div className="p-6 flex items-center gap-4 border-b border-white/10">
        <div className="w-10 h-10 relative rounded-xl overflow-hidden border border-white/10">
          <Image
            src="https://i.postimg.cc/jdLhSPtq/HEIF-Image.jpg"
            alt="Logo"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="font-bold text-lg text-white tracking-tight">MT Dashboard</h2>
      </div>

      <nav className="flex-1 p-4 space-y-1 mt-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link
          href="/api/auth/logout"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">تسجيل الخروج</span>
        </Link>
      </div>
    </aside>
  );
}
