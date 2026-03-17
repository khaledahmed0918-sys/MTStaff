'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { LogIn, Shield, Users, Zap, Loader2 } from 'lucide-react';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#09090b]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-600/20 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 w-full max-w-md p-8"
      >
        <div className="bg-[#18181b]/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-50 pointer-events-none" />
          
          <div className="p-8 flex flex-col items-center relative z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2 
              }}
              className="w-28 h-28 relative mb-6 rounded-2xl overflow-hidden border border-white/20 shadow-[0_0_40px_rgba(59,130,246,0.3)] group"
            >
              <Image
                src="https://i.postimg.cc/jdLhSPtq/HEIF-Image.jpg"
                alt="MT Community"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center w-full"
            >
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
                MT Community
              </h1>
              <p className="text-zinc-400 text-sm mb-8">
                هذا الموقع مخصص لإدارة مجتمع MT Community فقط
              </p>

              <motion.a
                href="/api/auth/login"
                onClick={() => setIsLoading(true)}
                whileHover={{ scale: 1.02, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center justify-center w-full gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-300 group overflow-hidden ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
              >
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black" />
                <span className="absolute inset-0 w-full h-full rounded-lg border border-white/20" />
                
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <LogIn className="w-5 h-5 relative z-10 group-hover:animate-pulse" />
                )}
                
                <span className="relative z-10">
                  {isLoading ? 'جاري التحويل...' : 'تسجيل الدخول'}
                </span>
                
                {/* Button shine animation */}
                {!isLoading && (
                  <motion.div 
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                    animate={{
                      translateX: ['100%', '-200%']
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.a>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
