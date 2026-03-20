'use client';

import { useState } from 'react';
import { Camera, X, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';
import CachedImage from '@/components/cached-image';

interface ScreenshotModalProps {
  elementId: string;
  fileName?: string;
  className?: string;
  memberData?: any;
}

export function ScreenshotButton({ elementId, fileName = 'screenshot.png', className = '', memberData, children }: ScreenshotModalProps & { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const addStampToCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stampRadius = Math.min(canvas.width, canvas.height) * 0.18; // Even larger stamp
    const stampX = canvas.width - stampRadius - 60;
    const stampY = canvas.height - stampRadius - 60;
    
    ctx.save();
    ctx.translate(stampX, stampY);
    ctx.rotate(-0.2); // Slightly more tilt for "stamped" look
    
    // Outer thick circle
    ctx.beginPath();
    ctx.arc(0, 0, stampRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'; // Blue with some transparency
    ctx.lineWidth = stampRadius * 0.1;
    ctx.stroke();

    // Inner thin circle
    ctx.beginPath();
    ctx.arc(0, 0, stampRadius * 0.82, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.lineWidth = stampRadius * 0.03;
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Server Name - Curved text would be better but let's stick to centered for now
    ctx.font = `black ${stampRadius * 0.25}px Arial`;
    ctx.fillText('MT Community', 0, -stampRadius * 0.2);
    
    // Staff Team
    ctx.font = `bold ${stampRadius * 0.2}px Arial`;
    ctx.fillText('Staff Team', 0, stampRadius * 0.2);
    
    // Decorative lines
    ctx.beginPath();
    ctx.moveTo(-stampRadius * 0.7, 0);
    ctx.lineTo(stampRadius * 0.7, 0);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add some "distress" effect (optional but looks more like a stamp)
    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * stampRadius * 2;
      const y = (Math.random() - 0.5) * stampRadius * 2;
      const r = Math.random() * 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawFallbackCanvas = async (member: any): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Set canvas size (standard card size)
    canvas.width = 1000;
    canvas.height = 1200;

    // Background
    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = member.highestRoleColor || '#3b82f6';
    ctx.lineWidth = 15;
    ctx.strokeRect(7.5, 7.5, canvas.width - 15, canvas.height - 15);

    // Header Gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 400);
    gradient.addColorStop(0, `${member.highestRoleColor || '#3b82f6'}44`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 400);

    // Helper to load image
    const loadImage = (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    };

    try {
      // Set RTL for Arabic text
      ctx.direction = 'rtl';
      ctx.textAlign = 'right';

      // Draw Avatar
      if (member.avatar) {
        try {
          const avatarImg = await loadImage(member.avatar);
          ctx.save();
          ctx.beginPath();
          ctx.arc(canvas.width - 150, 180, 100, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatarImg, canvas.width - 250, 80, 200, 200);
          ctx.restore();
          
          // Avatar Border
          ctx.strokeStyle = member.highestRoleColor || '#3b82f6';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(canvas.width - 150, 180, 100, 0, Math.PI * 2);
          ctx.stroke();
        } catch (e) {
          ctx.fillStyle = '#1f2937';
          ctx.beginPath();
          ctx.arc(canvas.width - 150, 180, 100, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // User Info
      ctx.fillStyle = '#ffffff';
      ctx.font = 'black 60px Arial';
      ctx.fillText(member.displayName || member.username, canvas.width - 280, 160);
      
      ctx.fillStyle = '#9ca3af';
      ctx.font = '32px Arial';
      ctx.fillText(`@${member.username}`, canvas.width - 280, 210);

      // Stats Section
      if (member.stats) {
        // Messages Box
        ctx.fillStyle = '#111827';
        ctx.roundRect?.(canvas.width - 450, 350, 400, 200, 30);
        ctx.fill();
        ctx.strokeStyle = '#ffffff22';
        ctx.stroke();

        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 36px Arial';
        ctx.fillText('الرسائل', canvas.width - 100, 410);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'black 64px Arial';
        ctx.fillText(member.stats.messages.total.toLocaleString(), canvas.width - 100, 490);

        // Streak Box
        ctx.fillStyle = '#111827';
        ctx.roundRect?.(50, 350, 400, 200, 30);
        ctx.fill();
        ctx.strokeStyle = '#ffffff22';
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#f97316';
        ctx.font = 'bold 36px Arial';
        ctx.fillText('الستريك', 100, 410);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'black 64px Arial';
        ctx.fillText(member.stats.streak.toString(), 100, 490);

        // Detailed Stats
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'black 40px Arial';
        ctx.fillText('إحصائيات إضافية', canvas.width - 50, 650);

        const statsY = 730;
        ctx.fillStyle = '#9ca3af';
        ctx.font = '30px Arial';
        ctx.fillText(`يومي: ${member.stats.messages.daily}`, canvas.width - 50, statsY);
        ctx.fillText(`أسبوعي: ${member.stats.messages.weekly}`, canvas.width - 50, statsY + 50);
        ctx.fillText(`شهري: ${member.stats.messages.monthly}`, canvas.width - 50, statsY + 100);
        
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`التحذيرات: ${member.stats.warns.length}`, 50, statsY);
        ctx.fillStyle = '#f97316';
        ctx.fillText(`التايم أوت: ${member.stats.timeouts.length}`, 50, statsY + 50);
      }

      // Watermark Stamp
      addStampToCanvas(canvas);

      // Footer
      ctx.fillStyle = '#ffffff44';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Generated on ${new Date().toLocaleString()}`, canvas.width / 2, canvas.height - 40);

      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error('Canvas fallback failed:', err);
      return '';
    }
  };

  const handleCapture = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    const element = document.getElementById(elementId);
    if (!element) return;

    setLoading(true);
    try {
      // Try html2canvas first with optimized settings
      const canvas = await html2canvas(element, {
        backgroundColor: '#111827',
        scale: 1.5, // Reduced from 2 for speed
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 5000, // Reduced from 15000 for faster failure/fallback
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            // Only fix essential styles
            const scrollableElements = clonedElement.querySelectorAll('.overflow-y-auto, .overflow-auto');
            scrollableElements.forEach((el) => {
              (el as HTMLElement).style.overflow = 'visible';
              (el as HTMLElement).style.maxHeight = 'none';
              (el as HTMLElement).style.height = 'auto';
            });
          }
        }
      });

      // Add stamp to the generated canvas
      addStampToCanvas(canvas);

      const dataUrl = canvas.toDataURL('image/png', 0.8); // Slightly lower quality for faster generation
      setImage(dataUrl);
      setIsOpen(true);
    } catch (err) {
      console.error('html2canvas failed, trying canvas fallback:', err);
      if (memberData) {
        const fallbackUrl = await drawFallbackCanvas(memberData);
        if (fallbackUrl) {
          setImage(fallbackUrl);
          setIsOpen(true);
        } else {
          alert('عذراً، فشل التقاط الصورة. يرجى المحاولة مرة أخرى.');
        }
      } else {
        alert('عذراً، فشل التقاط الصورة.');
      }
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
      <div 
        onDoubleClick={handleCapture} 
        className={`cursor-pointer ${className} relative group/screenshot`}
        title="انقر مرتين لالتقاط صورة للبطاقة"
      >
        {children}
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-inherit">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}
      </div>

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
              
              <div className="p-6 overflow-auto flex-1 flex items-center justify-center bg-[#0a0f1a] custom-scrollbar relative w-full h-[70vh]">
                <CachedImage src={image} alt="Screenshot" fill className="object-contain rounded-xl shadow-lg border border-white/5" />
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
