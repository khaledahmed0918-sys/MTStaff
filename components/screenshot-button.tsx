'use client';

import { useState, useEffect } from 'react';
import { Camera, X, Download, Loader2, Share2, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

interface ScreenshotModalProps {
  elementId?: string;
  fileName?: string;
  className?: string;
  variant?: 'global' | 'card';
}

export function ScreenshotButton({
  elementId,
  fileName = 'mt-capture.png',
  className = '',
  variant = 'global',
  children
}: ScreenshotModalProps & { children?: React.ReactNode }) {

  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // منع السكرول وقت المودال
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 🔴 إنشاء ختم احترافي
  const createStamp = () => {
    const stamp = document.createElement('div');
    stamp.className = 'mt-stamp';

    Object.assign(stamp.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) rotate(-12deg)',
      width: '260px',
      height: '260px',
      border: '6px double rgba(255,0,0,0.6)',
      borderRadius: '50%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'rgba(255,0,0,0.6)',
      fontWeight: '900',
      textAlign: 'center',
      pointerEvents: 'none',
      zIndex: '99999',
      backdropFilter: 'blur(1px)',
    });

    stamp.innerHTML = `
      <div style="font-size:22px; letter-spacing:2px;">MT COMMUNITY</div>
      <div style="margin:8px 0; width:70%; height:2px; background:red;"></div>
      <div style="font-size:16px;">ADMINS</div>
    `;

    document.body.appendChild(stamp);
    return stamp;
  };

  // 📸 الالتقاط
  const handleCapture = async () => {
    try {
      setLoading(true);
      setError(null);

      await document.fonts.ready;

      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 200);

      const stamp = createStamp();

      let canvas: HTMLCanvasElement;

      // 🌍 تصوير الشاشة الحالية
      if (variant === 'global') {
        canvas = await html2canvas(document.body, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          width: window.innerWidth,
          height: window.innerHeight,
          x: window.scrollX,
          y: window.scrollY,
          scrollX: 0,
          scrollY: 0,
          foreignObjectRendering: true,
          logging: false,
        });
      } else {
        // 📦 تصوير عنصر محدد
        const element = document.getElementById(elementId!);
        if (!element) throw new Error('Element not found');

        canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          scrollY: 0,
          foreignObjectRendering: true,
        });
      }

      stamp.remove();

      const dataUrl = canvas.toDataURL('image/png');
      setImage(dataUrl);
      setIsOpen(true);

    } catch (err) {
      console.error('Capture failed:', err);
      setError('فشل التقاط الصورة');
    } finally {
      setLoading(false);
    }
  };

  // تحميل
  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = fileName;
    link.click();
  };

  // مشاركة
  const handleShare = async () => {
    if (!image) return;
    setIsSharing(true);

    try {
      const res = await fetch(image);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'MT Capture',
        });
      } else {
        handleDownload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      {/* Flash */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="fixed inset-0 bg-white z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* زر */}
      <div onClick={handleCapture} className={className}>
        {children || (
          <button className="p-3 bg-blue-600 text-white rounded-xl flex items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <Camera />}
            تصوير
          </button>
        )}
      </div>

      {/* خطأ */}
      {error && (
        <div className="fixed bottom-5 right-5 bg-red-500 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* مودال */}
      <AnimatePresence>
        {isOpen && image && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            
            <div 
              className="absolute inset-0 bg-black/60"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className="relative bg-white p-5 rounded-2xl max-w-3xl w-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <div className="flex justify-between mb-3">
                <h2 className="font-bold">المعاينة</h2>
                <button onClick={() => setIsOpen(false)}>
                  <X />
                </button>
              </div>

              <div className="relative w-full h-[400px]">
                <Image
                  src={image}
                  alt="preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={handleDownload} className="bg-blue-600 text-white px-4 py-2 rounded flex gap-2 items-center">
                  <Download /> تحميل
                </button>

                <button onClick={handleShare} className="bg-gray-300 px-4 py-2 rounded flex gap-2 items-center">
                  <Share2 /> مشاركة
                </button>
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>
    </>
  );
}
