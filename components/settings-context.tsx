'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { translations, Language, TranslationKey } from '@/lib/translations';

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
  timezone: 'Asia/Riyadh',
  timeFormat: '12h',
  transcriptLoading: 'manual',
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  t: (key: TranslationKey) => string;
  formatDate: (dateString: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Use lazy initializer to avoid setState in useEffect
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mt-settings');
      if (saved) {
        try {
          return { ...defaultSettings, ...JSON.parse(saved) };
        } catch (e) {
          console.error('Failed to parse settings', e);
        }
      }
    }
    return defaultSettings;
  });

  // Apply settings to document
  useEffect(() => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('mt-settings', JSON.stringify(settings));
    
    const root = document.documentElement;
    root.setAttribute('dir', settings.language === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', settings.language);

    if (settings.theme === 'light') {
      root.classList.add('light-theme');
    } else {
      root.classList.remove('light-theme');
    }

    root.classList.remove('text-sm', 'text-base', 'text-lg');
    if (settings.fontSize === 'small') root.classList.add('text-sm');
    if (settings.fontSize === 'medium') root.classList.add('text-base');
    if (settings.fontSize === 'large') root.classList.add('text-lg');

    root.style.setProperty('--card-radius', settings.cardShape === 'rounded' ? '1.5rem' : '0.5rem');
    
    const colors = {
      blue: '#3b82f6',
      purple: '#a855f7',
      emerald: '#10b981',
      rose: '#f43f5e',
      amber: '#f59e0b'
    };
    root.style.setProperty('--accent-color', colors[settings.accentColor]);
    root.style.setProperty('--color-primary', colors[settings.accentColor]);
    
    if (settings.reducedAnimations) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const t = useCallback((key: TranslationKey) => {
    return translations[settings.language][key] || translations.en[key] || key;
  }, [settings.language]);

  const formatDate = useCallback((dateString: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions) => {
    if (!dateString) return t('noData');
    try {
      const date = new Date(dateString);
      // Force 'en-US' locale and 'Asia/Riyadh' to comply with requirements, ignoring user's app language config for Dates
      return date.toLocaleString('en-US', {
        timeZone: 'Asia/Riyadh',
        hour12: settings.timeFormat === '12h',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options
      });
    } catch (e) {
      return String(dateString);
    }
  }, [settings.timeFormat, t]);

  const contextValue = useMemo(() => ({
    settings,
    updateSettings,
    t,
    formatDate
  }), [settings, updateSettings, t, formatDate]);

  return (
    <SettingsContext.Provider value={contextValue}>
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
