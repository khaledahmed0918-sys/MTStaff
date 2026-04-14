'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { LogIn, Loader2, AlertCircle, Sparkles, Star, Heart, Zap, Music, Cloud } from 'lucide-react';
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
    { Icon: Star, color: 'text-yellow-300', delay: 0, x: -25, y: -25, size: 'w-6 h-6' },
    { Icon: Heart, color: 'text-rose-400', delay: 1, x: 25, y: -35, size: 'w-5 h-5' },
    { Icon: Zap, color: 'text-blue-400', delay: 2, x: 35, y: 25, size: 'w-7 h-7' },
    { Icon: Music, color: 'text-purple-400', delay: 1.5, x: -35, y: 35, size: 'w-5 h-5' },
    { Icon: Cloud, color: 'text-sky-300', delay: 0.5, x: -45, y: 0, size: 'w-8 h-8' },
    { Icon: Sparkles, color: 'text-amber-300', delay: 2.5, x: 45, y: 0, size: 'w-6 h-6' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f172a] font-sans selection:bg-blue-500/30">
      {/* Animated Vibrant Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.2)_0%,transparent_60%)] blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.2)_0%,transparent_60%)] blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute top-[20%] left-[60%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(167,139,250,0.2)_0%,transparent_60%)] blur-[80px]"
        />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white rounded-full"
            initial={{
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1000,
              y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1000,
              opacity: Math.random() * 0.5 + 0.1,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, Math.random() * -200 - 100],
              opacity: [null, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
        
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 w-full max-w-md p-4 sm:p-6 md:p-8"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.3)] overflow-hidden relative group">
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="absolute -inset-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
          
          <div className="p-8 md:p-12 flex flex-col items-center relative z-10">
            
            <div className="relative mb-8">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.1 
                }}
                className="w-40 h-40 relative rounded-full overflow-hidden border-[6px] border-white/10 shadow-[0_0_50px_rgba(56,189,248,0.4)] group-hover:shadow-[0_0_80px_rgba(56,189,248,0.6)] group-hover:border-white/20 transition-all duration-500 z-10 bg-[#0a0f1a]"
              >
                <Image
                  src="https://i.postimg.cc/jdLhSPtq/HEIF-Image.jpg"
                  alt="MT Community"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                  <Sparkles className="w-6 h-6 text-blue-200" />
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
                    y: [0, -15, 0],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    opacity: { delay: 0.5 + item.delay * 0.2, duration: 0.5 },
                    scale: { delay: 0.5 + item.delay * 0.2, duration: 0.5, type: "spring" },
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: item.delay },
                    rotate: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: item.delay }
                  }}
                  className={`absolute top-1/2 left-1/2 p-3 bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-0`}
                  style={{ 
                    marginLeft: `${item.x * 4}px`, 
                    marginTop: `${item.y * 4}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <item.Icon className={`${item.size} ${item.color} drop-shadow-lg`} />
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center w-full"
            >
              <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tight text-white drop-shadow-lg">
                MT Community
              </h1>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="mb-8 p-4 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center justify-center gap-3 text-red-200 text-sm font-bold shadow-[0_0_20px_rgba(239,68,68,0.3)] backdrop-blur-md"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.</p>
                </motion.div>
              )}

              <motion.button
                onClick={handleLogin}
                whileHover={{ scale: 1.03, translateY: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center justify-center w-full gap-4 bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#4752C4] hover:to-[#5865F2] text-white font-bold py-4 md:py-5 px-6 rounded-2xl transition-all duration-300 overflow-hidden shadow-[0_10px_40px_rgba(88,101,242,0.5)] hover:shadow-[0_15px_50px_rgba(88,101,242,0.7)] border border-white/10 ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <LogIn className="w-6 h-6 relative z-10" />
                )}
                
                <span className="relative z-10 text-lg tracking-wide">
                  {isLoading ? 'جاري التحويل...' : 'تسجيل الدخول'}
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
          className="text-center text-white/40 text-sm mt-8 font-medium tracking-wide"
        >
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} MT Community
        </motion.p>
      </motion.div>
    </div>
  );
}
