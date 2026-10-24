import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Warehouse, GitFork } from 'lucide-react';
import type { WarehouseDto, BranchLookupDto } from './warehousesApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  warehouse: WarehouseDto | null;
  branches: BranchLookupDto[];
  allWarehouses: WarehouseDto[];
  onSave: (warehouse: WarehouseDto) => Promise<void>;
}

export const WarehouseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  warehouse,
  branches,
  allWarehouses,
  onSave,
}) => {
  const [formData, setFormData] = useState<WarehouseDto>({
    id: 0,
    branchId: branches[0]?.id || 1,
    warehouseCode: '',
    warehouseName: '',
    warehouseType: 'خامات',
    parentWarehouseId: null,
    description: '',
    active: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (warehouse) {
      setFormData(warehouse);
    } else {
      setFormData({
        id: 0,
        branchId: branches[0]?.id || 1,
        warehouseCode: `WH-${Math.floor(100 + Math.random() * 900)}`,
        warehouseName: '',
        warehouseType: 'خامات',
        parentWarehouseId: null,
        description: '',
        active: true,
      });
    }
    setError(null);
  }, [warehouse, branches, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.warehouseCode.trim()) {
      setError('كود المستودع مطلوب.');
      return;
    }
    if (!formData.warehouseName.trim()) {
      setError('اسم المستودع مطلوب.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const selectedBranch = branches.find((b) => b.id === Number(formData.branchId));
      const selectedParent = allWarehouses.find((w) => w.id === Number(formData.parentWarehouseId));

      await onSave({
        ...formData,
        branchId: Number(formData.branchId),
        branchName: selectedBranch ? selectedBranch.branchName : 'الفرع الرئيسي',
        parentWarehouseId: formData.parentWarehouseId ? Number(formData.parentWarehouseId) : null,
        parentWarehouseName: selectedParent ? selectedParent.warehouseName : null,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ المستودع');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold">
              {formData.id > 0 ? 'تعديل بيانات المستودع' : 'تسجيل مستودع جديد'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-indigo-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                الفرع التابع له <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchName} ({b.branchCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                كود المستودع <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: WH-RAW-01"
                value={formData.warehouseCode}
                onChange={(e) => setFormData({ ...formData, warehouseCode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-mono font-bold text-indigo-700 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                اسم المستودع <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: مستودع خامات المعمل الرئيسي"
                value={formData.warehouseName}
                onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">نوع وتصنيف المستودع</label>
              <select
                value={formData.warehouseType}
                onChange={(e) => setFormData({ ...formData, warehouseType: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="خامات">مستودع خامات وتعبئة</option>
                <option value="منتج تام">مستودع منتج تام (حلويات/مخبوزات)</option>
                <option value="معرض">مستودع بيع ومعارض</option>
                <option value="صالة تشغيل">مستودع صالة إنتاج (وسيط)</option>
                <option value="تالف وهوالك">مستودع تالف ومردودات</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">المستودع الأب (الشجرة الهرمية)</label>
              <select
                value={formData.parentWarehouseId || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parentWarehouseId: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="">-- مستودع رئيسي مستقل (بدون أب) --</option>
                {allWarehouses
                  .filter((w) => w.id !== formData.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.warehouseName} ({p.warehouseCode})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="relative flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="font-bold text-gray-800">المستودع نشط ويعمل</span>
              </label>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">الوصف والموقع الجغرافي داخل المنشأة</label>
              <textarea
                rows={2}
                placeholder="الموقع داخل المصنع أو الفرع، وأي تفاصيل تشغيلية..."
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ المستودع'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
