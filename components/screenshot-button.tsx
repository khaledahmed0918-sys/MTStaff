'use client';

import { useState } from 'react';
import { Camera, Download, Share2, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

interface ScreenshotButtonProps {
  targetSelector: string; // The CSS selector of the component to screenshot
  label?: string; // Optional custom label
  className?: string; // Optional Tailwind classes
}

export function ScreenshotButton({ targetSelector, label = 'Screenshot', className = '' }: ScreenshotButtonProps) {
  const [loading, setLoading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  const handleScreenshot = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPath: window.location.pathname + window.location.search,
          selector: targetSelector,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate screenshot');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setScreenshotUrl(url);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء التقاط الصورة. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!screenshotUrl) return;
    const a = document.createElement('a');
    a.href = screenshotUrl;
    a.download = `screenshot-${new Date().getTime()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = async () => {
    if (!screenshotUrl) return;
    try {
      const response = await fetch(screenshotUrl);
      const blob = await response.blob();
      const file = new File([blob], 'screenshot.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'MT Community Screenshot',
          files: [file],
        });
      } else {
        alert('مشاركة الملفات غير مدعومة في متصفحك.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = () => {
    setScreenshotUrl(null);
  };

  return (
    <>
      <button
        onClick={handleScreenshot}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600/80 to-purple-600/80 hover:from-red-600 hover:to-purple-600 border border-white/10 rounded-xl text-white font-bold transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
        {label}
      </button>

      {/* Result Popup */}
      <AnimatePresence>
        {screenshotUrl && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={handleClose}
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-[#0a0f1a] border border-white/10 rounded-3xl p-6 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-black text-white mb-6 text-center">نتيجة الالتقاط</h2>
              
              <div className="flex-1 relative min-h-[300px] mb-6 rounded-2xl overflow-hidden border border-white/5 bg-black/50">
                <Image src={screenshotUrl} alt="Screenshot" fill className="object-contain" unoptimized />
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleDownload}
                  className="flex flex-1 items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                >
                  <Download className="w-5 h-5" />
                  حفظ في الاستديو
                </button>
                <button
                  onClick={handleShare}
                  className="flex flex-1 items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-bold transition-colors shadow-[0_0_15px_rgba(22,163,74,0.3)]"
                >
                  <Share2 className="w-5 h-5" />
                  مشاركة الصورة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
