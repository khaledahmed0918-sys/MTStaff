'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X } from 'lucide-react';

export function AntiScreenshotOverlay() {
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key or specific combinations
      if (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S' || e.key === '3' || e.key === '4')) ||
        (e.altKey && e.key === 'PrintScreen')
      ) {
        // We cannot prevent default action of these OS level shortcuts in most cases, 
        // but we can hide the UI.
        setIsAlertVisible(true);
        navigator.clipboard.writeText(''); // Clear clipboard to prevent copy
      }
    };
    
    // Copy event can also trigger anti-screenshot
    const handleCopy = (e: ClipboardEvent) => {
      // Optional: We can block explicit copy too if desired, but user just wanted screenshot block.
    };

    window.addEventListener('keyup', handleKeyDown);
    
    // Optional check: visibility change if they use snipping tool which steals focus
    const handleVisibilityChange = () => {
      if (document.hidden) {
         // Some tools blur the window
      }
    };
    
    return () => {
      window.removeEventListener('keyup', handleKeyDown);
    };
  }, []);

  return (
    <AnimatePresence>
      {isAlertVisible && (
        <div className="fixed inset-0 z-[9999999] bg-[#0a0f1a] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#111827] border border-red-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(220,38,38,0.2)] text-center relative"
          >
            <button
              onClick={() => setIsAlertVisible(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-4">تنبيه أمني</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              يُمنع التقاط الصور في الموقع ببرامج خارجية. 
              <br/>
              <span className="text-blue-400 mt-2 block">
              ( يُفضل التقاطها عن طريق زر الـ Screenshot المخصص المتاح في الموقع )
              </span>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
