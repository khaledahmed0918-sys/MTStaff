'use client';

import { useState } from 'react';
import { Camera, X, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';

interface ScreenshotModalProps {
  elementId: string;
  fileName?: string;
  className?: string;
}

export function ScreenshotButton({ elementId, fileName = 'screenshot.png', className = '' }: ScreenshotModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCapture = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const element = document.getElementById(elementId);
    if (!element) return;

    setLoading(true);
    try {
      // Temporarily add watermark elements
      const watermark = document.createElement('div');
      watermark.className = 'absolute bottom-2 right-4 text-white/30 font-bold text-sm z-50 pointer-events-none flex flex-col items-end';
      watermark.innerHTML = '<span>MT Community</span><span class="text-xs">Staff Team</span>';
      element.appendChild(watermark);

      const canvas = await html2canvas(element, {
        backgroundColor: '#111827',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            // Remove height restrictions and overflow for full capture
            const scrollableElements = clonedElement.querySelectorAll('.overflow-y-auto, .overflow-auto, .h-80, .max-h-\\[400px\\]');
            scrollableElements.forEach((el) => {
              (el as HTMLElement).style.overflow = 'visible';
              (el as HTMLElement).style.maxHeight = 'none';
              (el as HTMLElement).style.height = 'auto';
            });
            // Also fix any flex-1 that might restrict height
            const flexElements = clonedElement.querySelectorAll('.flex-1');
            flexElements.forEach((el) => {
              (el as HTMLElement).style.flex = 'none';
            });
          }
        }
      });

      // Add stamp to the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const stampRadius = 50;
        const stampX = canvas.width - stampRadius - 20;
        const stampY = canvas.height - stampRadius - 20;
        
        ctx.save();
        ctx.translate(stampX, stampY);
        ctx.rotate(-0.2); // Rotate slightly
        
        ctx.beginPath();
        ctx.arc(0, 0, stampRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 5;
        ctx.stroke();
        
        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('MT Community', 0, -10);
        ctx.fillText('Staff Team', 0, 15);
        ctx.restore();
      }

      element.removeChild(watermark);

      const dataUrl = canvas.toDataURL('image/png');
      setImage(dataUrl);
      setIsOpen(true);
    } catch (err) {
      console.error('Failed to capture screenshot:', err);
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

  return (
    <>
      <button
        onClick={handleCapture}
        disabled={loading}
        className={`p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors ${className}`}
        title="التقاط صورة"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isOpen && image && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <h3 className="text-lg font-bold text-white">معاينة الصورة</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-auto flex-1 flex items-center justify-center bg-[#0a0f1a] custom-scrollbar">
                <img src={image} alt="Screenshot" className="max-w-full h-auto rounded-xl shadow-lg border border-white/5" />
              </div>

              <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  تحميل الصورة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
