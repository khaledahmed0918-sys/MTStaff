'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, History, Package, Clock, Loader2, AlertCircle, User } from 'lucide-react';
import { motion } from 'motion/react';

export default function StorePage() {
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStoreData() {
      try {
        const res = await fetch('/api/store');
        if (!res.ok) throw new Error('Failed to fetch store data');
        const data = await res.json();
        setStoreItems(data.store || []);
        setPurchases(data.purchases || []);
      } catch (err: any) {
        setError(err.message || 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStoreData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-gray-400 animate-pulse">جاري تحميل المتجر...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-red-400">
        <AlertCircle className="w-12 h-12" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-500/20 rounded-xl">
          <ShoppingCart className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">المتجر</h1>
          <p className="text-gray-400 mt-1">منتجات المتجر وآخر المشتريات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Store Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-6 h-6 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">المنتجات</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storeItems.length === 0 ? (
              <p className="text-gray-500 col-span-full text-center py-8">لا توجد منتجات في المتجر حالياً</p>
            ) : (
              storeItems.map((item, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={index} 
                  className="bg-[#111827]/60 backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-lg hover:border-blue-500/30 transition-all duration-300 group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{item.emoji_id || '📦'}</span>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{item.item_name}</h3>
                    </div>
                  </div>
                  <div className="mt-auto space-y-3">
                    <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                      <span className="text-gray-400 text-sm">السعر</span>
                      <span className="text-yellow-400 font-bold font-mono text-lg">{item.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                      <span className="text-gray-400 text-sm">الحدود</span>
                      <span className="text-gray-200 font-medium">{item.limits === 'none' ? 'بدون حدود' : item.limits}</span>
                    </div>
                    <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                      <span className="text-gray-400 text-sm">المبيعات</span>
                      <span className="text-blue-400 font-bold">{item.sold?.length || 0}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">آخر المشتريات</h2>
          </div>
          
          <div className="bg-[#111827]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
              {purchases.length === 0 ? (
                <p className="text-gray-500 text-center py-8">لا توجد مشتريات حديثة</p>
              ) : (
                purchases.map((purchase, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={index} 
                    className="bg-[#0a0f1a] border border-white/5 p-4 rounded-xl hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-200">{purchase.item_name}</h4>
                      <span className="text-yellow-400 font-mono text-sm">{purchase.price.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col gap-1 mt-3">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <User className="w-3 h-3" />
                        <span className="font-mono">{purchase.user_id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{purchase.date}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
