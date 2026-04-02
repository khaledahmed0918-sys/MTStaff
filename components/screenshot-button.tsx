'use client';

import { ReactNode } from 'react';

interface ScreenshotButtonProps {
  children: ReactNode;
  elementId: string;
  fileName: string;
  className?: string;
}

export function ScreenshotButton({ children, className }: ScreenshotButtonProps) {
  // Simple wrapper that doesn't do anything for now
  // In a real app, this would use html2canvas or similar
  return (
    <div className={className}>
      {children}
    </div>
  );
}
