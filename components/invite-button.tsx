'use client';

import { useState, useEffect } from 'react';
import { Loader2, Link as LinkIcon, Copy } from 'lucide-react';
import { fetchWithRetry } from '@/lib/utils';
import { useSettings } from './settings-context';

export function InviteButton({ userId }: { userId: string }) {
  const [status, setStatus] = useState<'create' | 'loading' | 'copy'>('create');
  const [inviteLink, setInviteLink] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { t, settings } = useSettings();
  const isRtl = settings.language === 'ar';

  useEffect(() => {
    // Check if invite exists
    fetchWithRetry(`/api/invites?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          setInviteLink(data.inviteLink);
          setStatus('copy');
        }
      })
      .catch(console.error);
  }, [userId]);

  const handleCreate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus('loading');
    try {
      const res = await fetchWithRetry('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        setInviteLink(data.inviteLink);
        setStatus('copy');
      } else {
        setStatus('create');
      }
    } catch (err) {
      console.error(err);
      setStatus('create');
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(inviteLink);
      // Optional: show a small toast or change icon briefly
    } catch (err) {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={status === 'create' ? handleCreate : handleCopy}
        disabled={status === 'loading'}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${isRtl ? 'flex-row' : 'flex-row'} ${
          status === 'create' 
            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30' 
            : status === 'loading'
            ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed border border-gray-500/30'
            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
        }`}
      >
        {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
        {status === 'create' && <LinkIcon className="w-4 h-4" />}
        {status === 'copy' && <Copy className="w-4 h-4" />}
        {status === 'create' ? t('createInvite') : status === 'loading' ? t('loading') : t('copyInvite')}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => { e.stopPropagation(); setShowModal(false); }}>
          <div className="bg-[#111827] border border-white/10 p-6 rounded-2xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className={`text-xl font-bold text-white mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>{t('copyInviteLink')}</h3>
            <div className={`flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-white/10 ${isRtl ? 'flex-row' : 'flex-row'}`}>
              <input type="text" readOnly value={inviteLink} className={`bg-transparent text-white w-full outline-none ${isRtl ? 'text-right' : 'text-left'}`} />
            </div>
            <button onClick={(e) => { e.stopPropagation(); setShowModal(false); }} className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl transition-colors">
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
