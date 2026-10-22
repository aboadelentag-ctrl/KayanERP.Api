import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Wrench } from 'lucide-react';
import type { FixedAsset } from './assetsApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: FixedAsset) => void;
  initialData?: FixedAsset | null;
}

export const AssetModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<FixedAsset>>({
    code: '',
    name: '',
    category: 'أفران وخطوط خبز',
    branchId: 1,
    branchName: 'المصنع والإدارة المركزية',
    purchaseDate: new Date().toISOString().slice(0, 10),
    purchaseCost: 100000,
    depreciationRate: 10,
    status: 'يعمل بكفاءة',
    lastMaintenanceDate: new Date().toISOString().slice(0, 10),
    nextMaintenanceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        code: `AST-${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        category: 'أفران وخطوط خبز',
        branchId: 1,
        branchName: 'المصنع والإدارة المركزية',
        purchaseDate: new Date().toISOString().slice(0, 10),
        purchaseCost: 100000,
        depreciationRate: 10,
        status: 'يعمل بكفاءة',
        lastMaintenanceDate: new Date().toISOString().slice(0, 10),
        nextMaintenanceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('يرجى كتابة اسم وموديل الأصل الرأسمالي');
      return;
    }

    const cost = Number(formData.purchaseCost) || 0;
    const rate = Number(formData.depreciationRate) || 0;
    const accum = Math.round(cost * (rate / 100) * 1.5); // احتساب تقديري للمجمع
    const bookValue = Math.max(0, cost - accum);

    const payload: FixedAsset = {
      id: formData.id || Date.now(),
      code: formData.code || `AST-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name,
      category: formData.category || 'أفران وخطوط خبز',
      branchId: formData.branchId || 1,
      branchName: formData.branchName || 'المصنع والإدارة المركزية',
      purchaseDate: formData.purchaseDate || new Date().toISOString().slice(0, 10),
      purchaseCost: cost,
      depreciationRate: rate,
      accumulatedDepreciation: accum,
      currentBookValue: bookValue,
      status: formData.status || 'يعمل بكفاءة',
      lastMaintenanceDate: formData.lastMaintenanceDate || new Date().toISOString().slice(0, 10),
      nextMaintenanceDate: formData.nextMaintenanceDate || new Date().toISOString().slice(0, 10),
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">
              {initialData ? 'تعديل بيانات الأصل التشغيلي' : 'تسجيل أصل ومعدة معمل جديدة'}
            </h2>
          </div>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">كود الأصل الفني *</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">نوع وتصنيف الأصل</label>
              <select
                value={formData.category || 'أفران وخطوط خبز'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
              >
                <option value="أفران وخطوط خبز">أفران وخطوط خبز</option>
                <option value="عجانات ومعدات تحضير">عجانات ومعدات تحضير</option>
                <option value="ثلاجات وتبريد مركزي">ثلاجات وتبريد مركزي</option>
                <option value="أسطول سيارات وشاحنات التوزيع">أسطول سيارات وشاحنات التوزيع</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الأصل والموديل بالكامل *</label>
            <input
              type="text"
              required
              placeholder="مثال: فرن كونفكشن 10 صواني إيطالي"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">تكلفة الشراء والاستحواذ (ج.م)</label>
              <input
                type="number"
                min="0"
                required
                value={formData.purchaseCost || ''}
                onChange={(e) => setFormData({ ...formData, purchaseCost: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-bold text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">معدل الإهلاك السنوي (%)</label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={formData.depreciationRate || 10}
                onChange={(e) => setFormData({ ...formData, depreciationRate: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-center font-bold text-indigo-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">تاريخ الشراء والبدء</label>
              <input
                type="date"
                required
                value={formData.purchaseDate || ''}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الحالة التشغيلية</label>
              <select
                value={formData.status || 'يعمل بكفاءة'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-semibold"
              >
                <option value="يعمل بكفاءة">يعمل بكفاءة تامة</option>
                <option value="تحت الصيانة الوقائية">تحت الصيانة الوقائية</option>
                <option value="معطل / إصلاح طارئ">معطل / إصلاح طارئ</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm">
              <Save className="w-4 h-4" />
              <span>حفظ الأصل الرأسمالي</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
