'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, Download, Loader2, Share2, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

interface ScreenshotModalProps {
  elementId: string;
  fileName?: string;
  className?: string;
  memberData?: any;
  variant?: 'global' | 'card';
}

export function ScreenshotButton({ elementId, fileName = 'mt-capture.png', className = '', memberData, variant = 'card', children }: ScreenshotModalProps & { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Disable scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCapture = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    const element = document.getElementById(elementId);
    if (!element) return;

    setLoading(true);
    setError(null);
    
    // iPhone-like flash effect
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 300);

    try {
      // Wait for fonts to be ready
      if (typeof document !== 'undefined' && 'fonts' in document) {
        await (document as any).fonts.ready;
      }

      // Create a temporary container for the stamp to be rendered by html2canvas
      const stampContainer = document.createElement('div');
      stampContainer.className = 'screenshot-stamp-container';
      stampContainer.style.position = 'absolute';
      stampContainer.style.inset = '0';
      stampContainer.style.display = 'flex';
      stampContainer.style.alignItems = 'center';
      stampContainer.style.justifyContent = 'center';
      stampContainer.style.pointerEvents = 'none';
      stampContainer.style.zIndex = '9999';
      
      // The Red Professional Stamp SVG - More beautiful and detailed
      stampContainer.innerHTML = `
        <div style="transform: rotate(-15deg); opacity: 0.3; border: 8px double red; border-radius: 50%; width: 320px; height: 320px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: red; font-family: 'Inter', sans-serif; text-align: center; background: rgba(255,0,0,0.02);">
          <div style="font-size: 28px; font-weight: 900; letter-spacing: 2px; margin-bottom: 5px;">MT COMMUNITY</div>
          <div style="width: 80%; height: 2px; background: red; margin: 10px 0;"></div>
          <div style="font-size: 20px; font-weight: 700;">OFFICIAL RECORD</div>
          <div style="font-size: 14px; font-weight: 500; margin-top: 10px;">${new Date().toLocaleDateString('en-GB')}</div>
          <div style="font-size: 12px; font-weight: 400; margin-top: 5px;">VERIFIED SYSTEM</div>
        </div>
      `;

      // Append stamp temporarily to the element
      const originalPosition = element.style.position;
      
      if (!originalPosition || originalPosition === 'static') {
        element.style.position = 'relative';
      }
      element.appendChild(stampContainer);

      // Wrap html2canvas in a promise with timeout
      const capturePromise = html2canvas(element, {
        scale: 3, // Increased scale for better quality
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: true,
        scrollY: -window.scrollY,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            // Ensure everything is visible in the clone
            const scrollableElements = clonedElement.querySelectorAll('.overflow-y-auto, .overflow-auto');
            scrollableElements.forEach((el) => {
              (el as HTMLElement).style.overflow = 'visible';
              (el as HTMLElement).style.maxHeight = 'none';
              (el as HTMLElement).style.height = 'auto';
            });
            
            // Force some styles for better capture
            clonedElement.style.borderRadius = '24px';
            clonedElement.style.boxShadow = 'none';
          }
        }
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Capture timed out')), 20000)
      );
      
      const canvas = await Promise.race([capturePromise, timeoutPromise]) as HTMLCanvasElement;

      // Cleanup stamp
      if (element.contains(stampContainer)) {
        element.removeChild(stampContainer);
      }
      if (!originalPosition || originalPosition === 'static') {
        element.style.position = originalPosition;
      }

      const dataUrl = canvas.toDataURL('image/png');
      setImage(dataUrl);
      setIsOpen(true);
    } catch (err) {
      console.error('Capture failed:', err);
      setError('فشل التقاط الصورة. يرجى المحاولة مرة أخرى.');
      // Ensure cleanup if it fails
      const stamps = element.querySelectorAll('.screenshot-stamp-container');
      stamps.forEach(s => element.removeChild(s));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!image) return;
    setIsSharing(true);
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: 'image/png' });
      
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'MT Community Capture',
          text: 'Check out this capture from MT Community Dashboard!',
        });
      } else {
        // Fallback: copy to clipboard or just download
        handleDownload();
        alert('تم تحميل الصورة (متصفحك لا يدعم المشاركة المباشرة)');
      }
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      {/* Flash Effect */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div 
        onDoubleClick={handleCapture} 
        className={`${className} relative group/screenshot`}
      >
        {children || (
          <button 
            onClick={handleCapture}
            disabled={loading}
            className={variant === 'global' 
              ? "p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300 group relative overflow-hidden flex items-center gap-2"
              : `p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-all duration-300 group ${className}`
            }
            title="التقاط صورة"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
            )}
            {variant === 'global' && (
              <>
                <span className="text-sm font-bold text-gray-300 group-hover:text-white hidden sm:inline">التقاط الشاشة</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </>
            )}
          </button>
        )}
        
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full mt-2 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg z-[60] whitespace-nowrap border border-red-400/50"
            >
              {error}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setError(null);
                }}
                className="ml-2 hover:text-red-200"
              >
                <X className="w-3 h-3 inline" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && image && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-[30px]"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-[#111827]/80 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Camera className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">معاينة الالتقاط</h3>
                    <p className="text-xs text-gray-400 font-medium">تمت إضافة الختم الرسمي بنجاح</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Image Preview */}
              <div className="p-8 overflow-auto flex-1 flex items-center justify-center bg-black/20 custom-scrollbar relative">
                <div className="relative group/preview max-w-full w-full aspect-video sm:aspect-[16/9]">
                  <Image 
                    src={image} 
                    alt="Screenshot" 
                    fill
                    className="object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 transition-transform duration-500 group-hover/preview:scale-[1.02]" 
                    unoptimized
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-white/10 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold">جاهز للتحميل والمشاركة</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="flex-1 sm:flex-none px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all font-bold flex items-center justify-center gap-2 border border-white/10"
                  >
                    {isSharing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
                    مشاركة
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all font-bold flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(37,99,235,0.3)]"
                  >
                    <Download className="w-5 h-5" />
                    تحميل بجودة عالية
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
