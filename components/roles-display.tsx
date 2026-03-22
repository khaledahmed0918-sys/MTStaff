'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import CachedImage from '@/components/cached-image';
import { generateGradientColors } from '@/lib/utils';

interface Role {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
}

export function RolesDisplay({ roles }: { roles: Role[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!roles || roles.length === 0) return null;

  return (
    <div className="mt-4 w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 w-full sm:w-auto justify-center sm:justify-start"
      >
        <span>إظهار الرتب ({roles.length})</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden mt-3"
          >
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2 p-2 bg-black/20 rounded-xl border border-white/5">
              {roles.map((role) => {
                const roleColor = role.color !== '#000000' ? role.color : '#ffffff';
                const { primaryColor, secondaryColor, tertiaryColor } = generateGradientColors(roleColor);
                return (
                  <div 
                    key={role.id} 
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold border border-white/10 shadow-sm" 
                    style={{ 
                      backgroundImage: `linear-gradient(to right, ${primaryColor}20, ${secondaryColor}20, ${tertiaryColor}20)`, 
                      color: primaryColor 
                    }}
                  >
                    {role.icon && <CachedImage src={role.icon} alt={role.name} width={16} height={16} className="drop-shadow-md" />}
                    <span className="drop-shadow-sm">{role.name}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
