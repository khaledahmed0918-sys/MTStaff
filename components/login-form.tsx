'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { LogIn, Loader2, AlertCircle, Sparkles, ShieldCheck, Users, Zap, MessageSquare, Trophy } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const handleLogin = async () => {
    setIsLoading(true);
    await signIn('discord', { callbackUrl: '/dashboard' });
  };

  const floatingIcons = [
    { Icon: MessageSquare, color: 'text-blue-400', delay: 0, x: -20, y: -20 },
    { Icon: Zap, color: 'text-yellow-400', delay: 1, x: 20, y: -30 },
    { Icon: Trophy, color: 'text-purple-400', delay: 2, x: 30, y: 20 },
    { Icon: ShieldCheck, color: 'text-emerald-400', delay: 1.5, x: -30, y: 30 },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#030712] font-sans selection:bg-blue-500/30">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, 90, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_60%)] blur-[80px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.3, 0.2],
            rotate: [0, -90, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15)_0%,transparent_60%)] blur-[80px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute top-[20%] left-[60%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_60%)] blur-[60px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 w-full max-w-xl p-4 sm:p-6 md:p-8"
      >
        <div className="bg-[#0a0f1a]/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative group">
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
          
          <div className="p-8 md:p-12 flex flex-col items-center relative z-10">
            
            <div className="relative mb-10">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1 
                }}
                className="w-36 h-36 relative rounded-full overflow-hidden border-4 border-[#0a0f1a] shadow-[0_0_40px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_60px_rgba(59,130,246,0.7)] transition-all duration-500 z-10 bg-[#0a0f1a]"
              >
                <Image
                  src="https://i.postimg.cc/jdLhSPtq/HEIF-Image.jpg"
                  alt="MT Community"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                  <Sparkles className="w-6 h-6 text-blue-300" />
                </div>
              </motion.div>

              {/* Floating Icons Around Avatar */}
              {floatingIcons.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    opacity: { delay: 0.5 + item.delay * 0.2, duration: 0.5 },
                    scale: { delay: 0.5 + item.delay * 0.2, duration: 0.5, type: "spring" },
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: item.delay }
                  }}
                  className={`absolute top-1/2 left-1/2 p-2.5 bg-[#111827]/80 backdrop-blur-md border border-white/10 rounded-xl shadow-lg z-0`}
                  style={{ 
                    marginLeft: `${item.x * 3}px`, 
                    marginTop: `${item.y * 3}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <item.Icon className={`w-5 h-5 ${item.color}`} />
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center w-full"
            >
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent drop-shadow-lg">
                MT Community
              </h1>
              <p className="text-blue-200/60 text-base md:text-lg mb-10 max-w-sm mx-auto leading-relaxed font-medium">
                بوابتك لإدارة مجتمع MT بكل احترافية وسهولة
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-3 gap-3 mb-10">
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group/feat">
                  <ShieldCheck className="w-7 h-7 text-emerald-400 mb-3 group-hover/feat:scale-110 transition-transform" />
                  <span className="text-xs text-zinc-300 font-bold">إدارة آمنة</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group/feat">
                  <Users className="w-7 h-7 text-blue-400 mb-3 group-hover/feat:scale-110 transition-transform" />
                  <span className="text-xs text-zinc-300 font-bold">مجتمع متكامل</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all group/feat">
                  <Trophy className="w-7 h-7 text-purple-400 mb-3 group-hover/feat:scale-110 transition-transform" />
                  <span className="text-xs text-zinc-300 font-bold">تنافس وتفاعل</span>
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center gap-3 text-red-400 text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.</p>
                </motion.div>
              )}

              <motion.button
                onClick={handleLogin}
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center justify-center w-full gap-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-4 md:py-5 px-6 rounded-2xl transition-all duration-300 overflow-hidden shadow-[0_10px_40px_rgba(88,101,242,0.4)] hover:shadow-[0_15px_50px_rgba(88,101,242,0.6)] ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <LogIn className="w-6 h-6 relative z-10" />
                )}
                
                <span className="relative z-10 text-lg tracking-wide">
                  {isLoading ? 'جاري التحويل...' : 'تسجيل الدخول عبر ديسكورد'}
                </span>
                
                {/* Button shine animation */}
                {!isLoading && (
                  <motion.div 
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                    animate={{
                      translateX: ['100%', '-200%']
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-blue-200/40 text-sm mt-8 font-medium"
        >
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} MT Community
        </motion.p>
      </motion.div>
    </div>
  );
}
