'use client';

import { useState, useEffect } from 'react';
import { useSettings, AccentColor, FontSize } from '@/components/settings-context';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Palette, Globe, Shield, Zap, Moon, Sun, Type, Square, Circle, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, t } = useSettings();
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    hideStats: false,
    pointsVisibility: 'everyone'
  });

  useEffect(() => {
    // Fetch privacy settings from server
    async function fetchPrivacy() {
      try {
        const res = await fetch('/api/settings/privacy');
        if (res.ok) {
          const data = await res.json();
          setPrivacySettings(data);
        }
      } catch (e) {
        console.error('Failed to fetch privacy settings', e);
      }
    }
    fetchPrivacy();
  }, []);

  const handlePrivacyChange = async (key: string, value: any) => {
    const newSettings = { ...privacySettings, [key]: value };
    setPrivacySettings(newSettings);
    
    setSavingPrivacy(true);
    try {
      await fetch('/api/settings/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch (e) {
      console.error('Failed to save privacy settings', e);
    } finally {
      setSavingPrivacy(false);
    }
  };

  const isRtl = settings.language === 'ar';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className={`flex items-center gap-4 mb-8 ${isRtl ? 'flex-row' : 'flex-row-reverse justify-end'}`}>
        <div className="p-3 bg-blue-500/20 rounded-2xl">
          <SettingsIcon className="w-8 h-8 text-blue-400" />
        </div>
        <div className={isRtl ? 'text-right' : 'text-left'}>
          <h1 className="text-3xl font-black text-white tracking-tight">{t('settings')}</h1>
          <p className="text-gray-400 mt-1">{t('serverDescription')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* General Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111827]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6"
        >
          <div className={`flex items-center gap-3 border-b border-white/10 pb-4 ${isRtl ? '' : 'flex-row-reverse'}`}>
            <Globe className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">{t('generalSettings')}</h2>
          </div>

          <div className="space-y-4">
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('language')}</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateSettings({ language: 'ar' })}
                  className={`flex-1 py-2 rounded-xl border transition-all ${settings.language === 'ar' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  عربي
                </button>
                <button 
                  onClick={() => updateSettings({ language: 'en' })}
                  className={`flex-1 py-2 rounded-xl border transition-all ${settings.language === 'en' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  English
                </button>
              </div>
            </div>

            <div className={isRtl ? 'text-right' : 'text-left'}>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('timezone')}</label>
              <select 
                value={settings.timezone}
                onChange={(e) => updateSettings({ timezone: e.target.value })}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="Asia/Riyadh">Asia/Riyadh</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>

            <div className={isRtl ? 'text-right' : 'text-left'}>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('timeFormat')}</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateSettings({ timeFormat: '12h' })}
                  className={`flex-1 py-2 rounded-xl border transition-all ${settings.timeFormat === '12h' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  12h (AM/PM)
                </button>
                <button 
                  onClick={() => updateSettings({ timeFormat: '24h' })}
                  className={`flex-1 py-2 rounded-xl border transition-all ${settings.timeFormat === '24h' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  24h
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* UI Customization */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111827]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6"
        >
          <div className={`flex items-center gap-3 border-b border-white/10 pb-4 ${isRtl ? '' : 'flex-row-reverse'}`}>
            <Palette className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">{t('uiCustomization')}</h2>
          </div>

          <div className="space-y-4">
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('theme')}</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`flex-1 py-2 rounded-xl border transition-all flex items-center justify-center gap-2 ${settings.theme === 'dark' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  <Moon className="w-4 h-4" /> {t('dark')}
                </button>
                <button 
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`flex-1 py-2 rounded-xl border transition-all flex items-center justify-center gap-2 ${settings.theme === 'light' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  <Sun className="w-4 h-4" /> {t('light')}
                </button>
              </div>
            </div>

            <div className={isRtl ? 'text-right' : 'text-left'}>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('accentColor')}</label>
              <div className={`flex gap-3 ${isRtl ? '' : 'flex-row-reverse justify-end'}`}>
                {(['blue', 'purple', 'emerald', 'rose', 'amber'] as AccentColor[]).map(color => (
                  <button
                    key={color}
                    onClick={() => updateSettings({ accentColor: color })}
                    className={`w-8 h-8 rounded-full transition-transform ${settings.accentColor === color ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'}`}
                    style={{ 
                      backgroundColor: 
                        color === 'blue' ? '#3b82f6' : 
                        color === 'purple' ? '#a855f7' : 
                        color === 'emerald' ? '#10b981' : 
                        color === 'rose' ? '#f43f5e' : '#f59e0b' 
                    }}
                  />
                ))}
              </div>
            </div>

            <div className={isRtl ? 'text-right' : 'text-left'}>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('fontSize')}</label>
              <div className="flex gap-2">
                {(['small', 'medium', 'large'] as FontSize[]).map(size => (
                  <button 
                    key={size}
                    onClick={() => updateSettings({ fontSize: size })}
                    className={`flex-1 py-2 rounded-xl border transition-all flex items-center justify-center gap-2 ${settings.fontSize === size ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                  >
                    <Type className={`w-4 h-4 ${size === 'small' ? 'scale-75' : size === 'large' ? 'scale-125' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className={isRtl ? 'text-right' : 'text-left'}>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('cardShape')}</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateSettings({ cardShape: 'rounded' })}
                  className={`flex-1 py-2 rounded-xl border transition-all flex items-center justify-center gap-2 ${settings.cardShape === 'rounded' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  <Circle className="w-4 h-4" /> {t('rounded')}
                </button>
                <button 
                  onClick={() => updateSettings({ cardShape: 'square' })}
                  className={`flex-1 py-2 rounded-xl border transition-all flex items-center justify-center gap-2 ${settings.cardShape === 'square' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  <Square className="w-4 h-4" /> {t('square')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Privacy */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111827]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6"
        >
          <div className={`flex items-center justify-between border-b border-white/10 pb-4 ${isRtl ? '' : 'flex-row-reverse'}`}>
            <div className={`flex items-center gap-3 ${isRtl ? '' : 'flex-row-reverse'}`}>
              <Shield className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">{t('privacy')}</h2>
            </div>
            {savingPrivacy && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />}
          </div>

          <div className="space-y-4">
            <div className={`flex items-center justify-between ${isRtl ? '' : 'flex-row-reverse'}`}>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="block text-sm font-medium text-white">{t('profileVisibility')}</label>
                <p className="text-xs text-gray-400">{t('profileVisibilityDesc')}</p>
              </div>
              <button 
                onClick={() => handlePrivacyChange('showProfile', !privacySettings.showProfile)}
                className={`w-12 h-6 rounded-full transition-colors relative ${privacySettings.showProfile ? 'bg-[var(--color-primary)]' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${privacySettings.showProfile ? (isRtl ? 'left-1' : 'right-1') : (isRtl ? 'right-1' : 'left-1')}`} />
              </button>
            </div>

            <div className={`flex items-center justify-between ${isRtl ? '' : 'flex-row-reverse'}`}>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="block text-sm font-medium text-white">{t('hideStats')}</label>
                <p className="text-xs text-gray-400">{t('hideStatsDesc')}</p>
              </div>
              <button 
                onClick={() => handlePrivacyChange('hideStats', !privacySettings.hideStats)}
                className={`w-12 h-6 rounded-full transition-colors relative ${privacySettings.hideStats ? 'bg-[var(--color-primary)]' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${privacySettings.hideStats ? (isRtl ? 'left-1' : 'right-1') : (isRtl ? 'right-1' : 'left-1')}`} />
              </button>
            </div>

            <div className={isRtl ? 'text-right' : 'text-left'}>
              <label className="block text-sm font-medium text-gray-400 mb-2">{t('pointsVisibility')}</label>
              <select 
                value={privacySettings.pointsVisibility}
                onChange={(e) => handlePrivacyChange('pointsVisibility', e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-[var(--color-primary)]"
              >
                <option value="everyone">{t('everyoneVisibility')}</option>
                <option value="friends">{t('friendsOnly')}</option>
                <option value="nobody">{t('nobodyVisibility')}</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Performance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#111827]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-6"
        >
          <div className={`flex items-center gap-3 border-b border-white/10 pb-4 ${isRtl ? '' : 'flex-row-reverse'}`}>
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">{t('performance')}</h2>
          </div>

          <div className="space-y-4">
            <div className={`flex items-center justify-between ${isRtl ? '' : 'flex-row-reverse'}`}>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="block text-sm font-medium text-white">{t('reducedAnimations')}</label>
                <p className="text-xs text-gray-400">{t('reducedAnimationsDesc')}</p>
              </div>
              <button 
                onClick={() => updateSettings({ reducedAnimations: !settings.reducedAnimations })}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.reducedAnimations ? 'bg-[var(--color-primary)]' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.reducedAnimations ? (isRtl ? 'left-1' : 'right-1') : (isRtl ? 'right-1' : 'left-1')}`} />
              </button>
            </div>

            <div className={`flex items-center justify-between ${isRtl ? '' : 'flex-row-reverse'}`}>
              <div className={isRtl ? 'text-right' : 'text-left'}>
                <label className="block text-sm font-medium text-white">{t('transcriptLoading')}</label>
                <p className="text-xs text-gray-400">{t('transcriptLoadingDesc')}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => updateSettings({ transcriptLoading: 'auto' })}
                  className={`px-4 py-2 rounded-xl border transition-all flex items-center justify-center gap-2 ${settings.transcriptLoading === 'auto' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  {t('auto')}
                </button>
                <button 
                  onClick={() => updateSettings({ transcriptLoading: 'manual' })}
                  className={`px-4 py-2 rounded-xl border transition-all flex items-center justify-center gap-2 ${settings.transcriptLoading === 'manual' ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                >
                  {t('manual')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
