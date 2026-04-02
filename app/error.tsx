'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, RefreshCcw } from 'lucide-react';
import { useSettings } from '@/components/settings-context';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const { t } = useSettings();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#030712]">
      <div className="max-w-md w-full bg-[#111827] border border-red-500/20 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">{t('errorOccurred')}</h2>
        
        <p className="text-gray-400 text-sm mb-8">
          {error.message || 'حدث خطأ غير متوقع أثناء معالجة طلبك.'}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            {t('retry')}
          </button>
          
          <button
            onClick={() => router.back()}
            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRight className="w-5 h-5" />
            {t('goBack')}
          </button>
        </div>
      </div>
    </div>
  );
}
