import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { LogIn } from 'lucide-react';

export default async function Home() {
  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 flex flex-col items-center max-w-md w-full p-8 bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="w-32 h-32 relative mb-6 rounded-full overflow-hidden border-4 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          <Image
            src="https://i.postimg.cc/jdLhSPtq/HEIF-Image.jpg"
            alt="MT Community"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
            unoptimized
          />
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
          MT Community
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Welcome to the official dashboard. Please login with Discord to continue.
        </p>

        <a
          href="/api/auth/login"
          className="flex items-center justify-center w-full gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(88,101,242,0.4)] hover:-translate-y-1"
        >
          <LogIn className="w-5 h-5" />
          Login with Discord
        </a>
      </div>
    </div>
  );
}
