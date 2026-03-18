'use client';

import { useState } from 'react';
import { Camera, X, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';

interface ScreenshotModalProps {
  elementId: string;
  fileName?: string;
  className?: string;
  memberData?: any;
}

export function ScreenshotButton({ elementId, fileName = 'screenshot.png', className = '', memberData }: ScreenshotModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const drawFallbackCanvas = async (member: any): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Set canvas size (standard card size)
    canvas.width = 800;
    canvas.height = 1000;

    // Background
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = member.highestRoleColor || '#3b82f6';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

    // Header Gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 200);
    gradient.addColorStop(0, `${member.highestRoleColor || '#3b82f6'}33`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 300);

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
          ctx.arc(canvas.width - 120, 150, 70, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatarImg, canvas.width - 190, 80, 140, 140);
          ctx.restore();
          
          // Avatar Border
          ctx.strokeStyle = member.highestRoleColor || '#3b82f6';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(canvas.width - 120, 150, 70, 0, Math.PI * 2);
          ctx.stroke();
        } catch (e) {
          // Fallback circle if avatar fails
          ctx.fillStyle = '#1f2937';
          ctx.beginPath();
          ctx.arc(canvas.width - 120, 150, 70, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // User Info
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px Arial';
      ctx.fillText(member.displayName || member.username, canvas.width - 220, 140);
      
      ctx.fillStyle = '#9ca3af';
      ctx.font = '24px Arial';
      ctx.fillText(`@${member.username}`, canvas.width - 220, 180);

      // Stats Section
      if (member.stats) {
        // Messages Box
        ctx.fillStyle = '#0a0f1a';
        ctx.roundRect?.(canvas.width - 380, 300, 330, 150, 20);
        ctx.fill();
        ctx.strokeStyle = '#ffffff1a';
        ctx.stroke();

        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('الرسائل', canvas.width - 80, 340);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.fillText(member.stats.messages.total.toLocaleString(), canvas.width - 80, 390);

        // Streak Box
        ctx.fillStyle = '#0a0f1a';
        ctx.roundRect?.(50, 300, 330, 150, 20);
        ctx.fill();
        ctx.strokeStyle = '#ffffff1a';
        ctx.stroke();

        ctx.textAlign = 'left';
        ctx.fillStyle = '#f97316';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('الستريك', 80, 340);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Arial';
        ctx.fillText(member.stats.streak.toString(), 80, 390);

        // Detailed Stats
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px Arial';
        ctx.fillText('إحصائيات إضافية', canvas.width - 50, 520);

        const statsY = 580;
        ctx.fillStyle = '#9ca3af';
        ctx.font = '24px Arial';
        ctx.fillText(`يومي: ${member.stats.messages.daily}`, canvas.width - 50, statsY);
        ctx.fillText(`أسبوعي: ${member.stats.messages.weekly}`, canvas.width - 50, statsY + 40);
        ctx.fillText(`شهري: ${member.stats.messages.monthly}`, canvas.width - 50, statsY + 80);
        
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ef4444';
        ctx.fillText(`التحذيرات: ${member.stats.warns.length}`, 50, statsY);
        ctx.fillStyle = '#f97316';
        ctx.fillText(`التايم أوت: ${member.stats.timeouts.length}`, 50, statsY + 40);
      }

      // Watermark Stamp
      ctx.textAlign = 'center';
      const stampRadius = 80;
      const stampX = canvas.width - stampRadius - 50;
      const stampY = canvas.height - stampRadius - 50;
      
      ctx.save();
      ctx.translate(stampX, stampY);
      ctx.rotate(-0.2);
      
      ctx.beginPath();
      ctx.arc(0, 0, stampRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 6;
      ctx.stroke();
      
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('MT Community', 0, -15);
      ctx.fillText('Staff Team', 0, 20);
      ctx.restore();

      // Footer
      ctx.fillStyle = '#ffffff33';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Generated on ${new Date().toLocaleString()}`, canvas.width / 2, canvas.height - 30);

      return canvas.toDataURL('image/png');
    } catch (err) {
      console.error('Canvas fallback failed:', err);
      return '';
    }
  };

  const handleCapture = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const element = document.getElementById(elementId);
    if (!element) return;

    setLoading(true);
    try {
      // Try html2canvas first
      const canvas = await html2canvas(element, {
        backgroundColor: '#111827',
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            const scrollableElements = clonedElement.querySelectorAll('.overflow-y-auto, .overflow-auto, .h-80, .max-h-\\[400px\\]');
            scrollableElements.forEach((el) => {
              (el as HTMLElement).style.overflow = 'visible';
              (el as HTMLElement).style.maxHeight = 'none';
              (el as HTMLElement).style.height = 'auto';
            });
            const flexElements = clonedElement.querySelectorAll('.flex-1');
            flexElements.forEach((el) => {
              (el as HTMLElement).style.flex = 'none';
            });
          }
        }
      });

      const dataUrl = canvas.toDataURL('image/png');
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
