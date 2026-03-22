import { StaffSection } from '@/components/staff-section';

export default function StaffPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg mb-2">
          الرتب الإدارية
        </h1>
        <p className="text-blue-300 font-medium text-sm md:text-base">
          قائمة بأعضاء الطاقم الإداري وإحصائياتهم
        </p>
      </div>
      <StaffSection initialCategories={[]} />
    </div>
  );
}
