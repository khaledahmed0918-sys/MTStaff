import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'MT Community Dashboard',
  description: 'Dashboard for MT Community Discord server',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans text-white min-h-screen bg-[#050505] relative overflow-x-hidden selection:bg-blue-500/30">
        {/* Atmospheric Background */}
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/40 via-blue-900/10 to-transparent blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[800px] h-[600px] opacity-20 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-600/30 via-transparent to-transparent blur-3xl"></div>
          <div className="absolute top-1/2 left-0 w-[600px] h-[600px] -translate-y-1/2 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent blur-3xl"></div>
        </div>
        
        {children}
      </body>
    </html>
  );
}
