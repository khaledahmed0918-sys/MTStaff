'use client';

import { AdminSection } from '@/components/admin-section';
import { useSettings } from '@/components/settings-context';

export default function AdminPage() {
  const { t, settings } = useSettings();
  const isRtl = settings.language === 'ar';

  return (
    <div className="space-y-8 pb-12">
      <div className={`mb-8 ${isRtl ? 'text-right' : 'text-left'}`}>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg mb-2">
          {t('adminRoles')}
        </h1>
        <p className="text-blue-300 font-medium text-sm md:text-base">
          {t('adminRolesDesc')}
        </p>
      </div>
      <AdminSection initialCategories={[]} />
    </div>
  );
}
