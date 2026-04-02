'use client';

import { useState, useEffect } from 'react';
import { Camera, X, Download, Loader2, Share2 } from 'lucide-react';
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

  // 🔴 إنشاء ختم احترافي وإضافته للعنصر الصحيح
  const createStamp = (targetElement: HTMLElement) => {
    const stamp = document.createElement('div');
    stamp.className = 'mt-stamp';
    
    // التحقق مما إذا كان الهدف هو الشاشة بالكامل أم عنصر محدد
    const isGlobal = targetElement === document.body;

    // إذا كان عنصراً محدداً وموقعه static، نغيره إلى relative ليحتوي الختم
    if (!isGlobal && window.getComputedStyle(targetElement).position === 'static') {
      targetElement.style.position = 'relative';
    }

    Object.assign(stamp.style, {
      position: isGlobal ? 'fixed' : 'absolute',
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
      pointerEvents: 'none', // مهم جداً حتى لا يعيق التفاعل
      zIndex: '99999',
      backdropFilter: 'blur(1px)',
    });

    stamp.innerHTML = `
      <div style="font-size:22px; letter-spacing:2px;">MT COMMUNITY</div>
      <div style="margin:8px 0; width:70%; height:2px; background:red;"></div>
      <div style="font-size:16px;">ADMINS</div>
    `;

    targetElement.appendChild(stamp);
    return stamp;
  };

  // 📸 الالتقاط
  const handleCapture = async () => {
    let stamp: HTMLDivElement | null = null;
    
    try {
      setLoading(true);
      setError(null);

      await document.fonts.ready;

      // تحديد العنصر المستهدف بناءً على variant
      const targetElement = variant === 'global' ? document.body : document.getElementById(elementId!);
      if (!targetElement) throw new Error('Element not found');

      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 200);

      // إضافة الختم للعنصر المستهدف
      stamp = createStamp(targetElement);

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
        canvas = await html2canvas(targetElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          scrollY: 0,
          foreignObjectRendering: true,
        });
      }

      const dataUrl = canvas.toDataURL('image/png');
      setImage(dataUrl);
      setIsOpen(true);

    } catch (err) {
      console.error('Capture failed:', err);
      setError('فشل التقاط الصورة. تأكد من صحة مُعرّف العنصر (ID).');
    } finally {
      // ✅ ضمان إزالة الختم دائماً حتى لو فشلت عملية التصوير
      if (stamp) stamp.remove();
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
        // Fallback in case Web Share API is not supported
        handleDownload();
      }
    } catch (e) {
      console.error('Sharing failed:', e);
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
            className="fixed inset-0 bg-white z-[99999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* زر التقاط الشاشة */}
      <div onClick={!loading ? handleCapture : undefined} className={`${className} ${loading ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}>
        {children || (
          <button disabled={loading} className="p-3 bg-blue-600 text-white rounded-xl flex items-center gap-2 w-full justify-center">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Camera className="w-5 h-5" />}
            تصوير
          </button>
        )}
      </div>

      {/* تنبيه الخطأ */}
      {error && (
        <div className="fixed bottom-5 right-5 z-[9999] bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          {error}
          <button onClick={() => setError(null)} className="ml-4 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* مودال المعاينة */}
      <AnimatePresence>
        {isOpen && image && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className="relative bg-white p-5 rounded-2xl max-w-3xl w-full shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h2 className="font-bold text-lg text-gray-800">المعاينة</h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                >
                  <X />
                </button>
              </div>

              <div className="relative w-full h-[50vh] md:h-[60vh] bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                <Image
                  src={image}
                  alt="Screenshot preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              <div className="flex flex-wrap gap-3 mt-5">
                <button 
                  onClick={handleDownload} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-3 rounded-xl flex gap-2 items-center justify-center font-medium"
                >
                  <Download className="w-5 h-5" /> تحميل الصورة
                </button>

                <button 
                  onClick={handleShare} 
                  disabled={isSharing}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors px-4 py-3 rounded-xl flex gap-2 items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSharing ? <Loader2 className="animate-spin w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                  مشاركة
                </button>
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>
    </>
  );
}
