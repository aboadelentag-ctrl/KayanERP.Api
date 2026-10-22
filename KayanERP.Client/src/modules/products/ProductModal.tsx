import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, TrendingUp } from 'lucide-react';
import type { Product } from './productsApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialData?: Product | null;
}

export const ProductModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    code: '',
    name: '',
    category: 'حلويات شرقية',
    unit: 'كيلو',
    costPrice: 0,
    wholesalePrice: 0,
    retailPrice: 0,
    currentStock: 0,
    minStockLevel: 5,
    status: 'active',
  });

  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        code: `PRD-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        category: 'حلويات شرقية',
        unit: 'كيلو',
        costPrice: 0,
        wholesalePrice: 0,
        retailPrice: 0,
        currentStock: 0,
        minStockLevel: 5,
        status: 'active',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const profitMargin =
    formData.retailPrice && formData.costPrice
      ? Math.round(((formData.retailPrice - formData.costPrice) / formData.retailPrice) * 100)
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('يرجى إدخال اسم الصنف');
      return;
    }
    onSave(formData as Product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/50">
          <h2 className="text-base font-bold text-gray-800">
            {initialData ? 'تعديل بيانات الصنف والتسعير' : 'إضافة صنف جديد'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">كود الصنف</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">التصنيف</label>
              <select
                value={formData.category || 'حلويات شرقية'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="حلويات شرقية">حلويات شرقية</option>
                <option value="حلويات غربية">حلويات غربية</option>
                <option value="نواشف ومخبوزات">نواشف ومخبوزات</option>
                <option value="خامات ومستلزمات">خامات ومستلزمات</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">وحدة البيع</label>
              <select
                value={formData.unit || 'كيلو'}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="كيلو">كيلو</option>
                <option value="قطعة">قطعة</option>
                <option value="طبق">طبق</option>
                <option value="علبة">علبة</option>
                <option value="دستة">دستة</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">اسم الصنف بالكامل *</label>
            <input
              type="text"
              required
              placeholder="مثال: بقلاوة مشكل بالفستق"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">سعر التكلفة (ج.م)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.costPrice ?? 0}
                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">سعر الجملة (ج.م)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.wholesalePrice ?? 0}
                onChange={(e) => setFormData({ ...formData, wholesalePrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">سعر القطاعي (ج.م)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.retailPrice ?? 0}
                onChange={(e) => setFormData({ ...formData, retailPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="p-3 bg-indigo-50/60 rounded-xl flex items-center justify-between text-xs text-indigo-900">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>هامش ربح القطاعي المتوقع:</span>
            </span>
            <span className="font-bold font-mono text-sm">{profitMargin}%</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">الرصيد الافتتاحي بالمخزن</label>
              <input
                type="number"
                min="0"
                value={formData.currentStock ?? 0}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">حد الطلب (تنبيه النواقص)</label>
              <input
                type="number"
                min="0"
                value={formData.minStockLevel ?? 5}
                onChange={(e) => setFormData({ ...formData, minStockLevel: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm">
              <Save className="w-4 h-4" />
              <span>حفظ الصنف</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
