'use client';

import { useState } from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ImagePopup({ src, onClose }: { src: string; onClose: () => void }) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = 'attachment.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">عرض الصورة</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 flex justify-center">
          <img src={src} alt="Attachment" className="max-w-full max-h-[70vh] rounded-lg" />
        </div>
        <div className="p-4 border-t border-white/10 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-300 hover:text-white rounded-lg">إغلاق</button>
          <button onClick={handleDownload} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2">
            <Download className="w-4 h-4" /> تحميل
          </button>
        </div>
      </motion.div>
    </div>
  );
}
