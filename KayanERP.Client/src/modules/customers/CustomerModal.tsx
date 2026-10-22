import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { Customer } from './customersApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  initialData?: Customer | null;
}

export const CustomerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    code: '',
    name: '',
    phone: '',
    creditLimit: 0,
    currentBalance: 0,
    status: 'active',
  });

  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        code: `CUST-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        phone: '',
        creditLimit: 10000,
        currentBalance: 0,
        status: 'active',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('يرجى إدخال اسم العميل أو اسم المنشأة');
      return;
    }
    onSave(formData as Customer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
        {/* الترويسة */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* نموذج الإدخال */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                كود العميل
              </label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                حالة الحساب
              </label>
              <select
                value={formData.status || 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">نشط</option>
                <option value="suspended">موقوف مؤقتاً</option>
                <option value="blocked">محظور</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              اسم العميل / المنشأة *
            </label>
            <input
              type="text"
              required
              placeholder="مثال: هايبر النور للتجارة"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              رقم الهاتف / مسؤول التواصل
            </label>
            <input
              type="text"
              placeholder="01xxxxxxxxx"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                حد الائتمان المسموح (ج.م)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.creditLimit ?? 0}
                onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">0 تعني عميل نقدي فقط</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                المديونية الحالية (ج.م)
              </label>
              <input
                type="number"
                min="0"
                value={formData.currentBalance ?? 0}
                onChange={(e) => setFormData({ ...formData, currentBalance: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* أزرار الإجراء */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>حفظ البيانات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
