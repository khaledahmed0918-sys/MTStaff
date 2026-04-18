import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AntiScreenshotOverlay } from '@/components/anti-screenshot';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'MT Community Dashboard',
  description: 'Dashboard for MT Community Discord server',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ar" dir="rtl" className={inter.variable} suppressHydrationWarning>
      <body suppressHydrationWarning className="font-sans text-white min-h-screen bg-[#050b14] relative overflow-x-hidden selection:bg-blue-500/30">
        {/* Atmospheric Background */}
        <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#020813]">
          {/* Neon Spots */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.4)_0%,transparent_60%)]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.4)_0%,transparent_60%)]"></div>
          <div className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.3)_0%,transparent_60%)]"></div>
          
          {/* Faint blue overlay with heavy blur to create the glass effect */}
          <div className="absolute inset-0 bg-[#0a192f]/60 backdrop-blur-[80px]"></div>
        </div>
        
        <AntiScreenshotOverlay />
        {children}
      </body>
    </html>
  );
}
