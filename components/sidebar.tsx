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
    <aside className="w-64 bg-[#111827]/80 backdrop-blur-xl border-l border-white/5 flex flex-col h-full z-20 shadow-2xl">
      <div className="p-6 flex items-center gap-4 border-b border-white/5">
        <div className="w-10 h-10 relative rounded-full overflow-hidden border-2 border-blue-500/50">
          <Image
            src="https://i.postimg.cc/jdLhSPtq/HEIF-Image.jpg"
            alt="Logo"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="font-bold text-lg text-blue-100 tracking-wide">MT Community</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <Link
          href="/api/auth/logout"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">تسجيل الخروج</span>
        </Link>
      </div>
    </aside>
  );
}
