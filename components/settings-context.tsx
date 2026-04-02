'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';
export type FontSize = 'small' | 'medium' | 'large';
export type CardShape = 'rounded' | 'square';
export type AccentColor = 'blue' | 'purple' | 'emerald' | 'rose' | 'amber';

interface Settings {
  theme: Theme;
  accentColor: AccentColor;
  fontSize: FontSize;
  cardShape: CardShape;
  reducedAnimations: boolean;
  language: 'ar' | 'en';
  timezone: string;
  timeFormat: '12h' | '24h';
  transcriptLoading: 'auto' | 'manual';
}

const defaultSettings: Settings = {
  theme: 'dark',
  accentColor: 'blue',
  fontSize: 'medium',
  cardShape: 'rounded',
  reducedAnimations: false,
  language: 'ar',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Riyadh',
  timeFormat: '12h',
  transcriptLoading: 'auto',
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('mt-settings');
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('mt-settings', JSON.stringify(settings));
      
      // Apply settings to document
      const root = document.documentElement;
      
      // Theme
      if (settings.theme === 'light') {
        root.classList.add('light-theme');
      } else {
        root.classList.remove('light-theme');
      }

      // Font Size
      root.classList.remove('text-sm', 'text-base', 'text-lg');
      if (settings.fontSize === 'small') root.classList.add('text-sm');
      if (settings.fontSize === 'medium') root.classList.add('text-base');
      if (settings.fontSize === 'large') root.classList.add('text-lg');

      // Card Shape
      root.style.setProperty('--card-radius', settings.cardShape === 'rounded' ? '1.5rem' : '0.5rem');
      
      // Accent Color
      const colors = {
        blue: '#3b82f6',
        purple: '#a855f7',
        emerald: '#10b981',
        rose: '#f43f5e',
        amber: '#f59e0b'
      };
      root.style.setProperty('--accent-color', colors[settings.accentColor]);
    }
  }, [settings, mounted]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  if (!mounted) {
    return <div className="hidden">{children}</div>; // Prevent hydration mismatch
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
