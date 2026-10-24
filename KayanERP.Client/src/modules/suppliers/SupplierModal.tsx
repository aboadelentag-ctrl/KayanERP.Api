import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Truck, Building2 } from 'lucide-react';
import type { SupplierCreateUpdateDto, SupplierViewDto } from './suppliersApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingSupplier: SupplierViewDto | null;
  onSave: (supplier: SupplierCreateUpdateDto, id: number) => Promise<void>;
}

export const SupplierModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editingSupplier,
  onSave,
}) => {
  const [formData, setFormData] = useState<SupplierCreateUpdateDto>({
    supplierName: '',
    supplierCode: '',
    phone: '',
    email: '',
    address: '',
    taxNumber: '',
    paymentTerms: 'نقدي',
    active: true,
    notes: '',
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingSupplier) {
      setFormData({
        supplierName: editingSupplier.supplierName,
        supplierCode: editingSupplier.supplierCode,
        phone: editingSupplier.phone || '',
        email: editingSupplier.email || '',
        address: editingSupplier.address || '',
        taxNumber: editingSupplier.taxNumber || '',
        paymentTerms: editingSupplier.paymentTerms || 'نقدي',
        active: editingSupplier.active,
        notes: editingSupplier.notes || '',
      });
    } else {
      setFormData({
        supplierName: '',
        supplierCode: '',
        phone: '',
        email: '',
        address: '',
        taxNumber: '',
        paymentTerms: 'نقدي',
        active: true,
        notes: '',
      });
    }
    setModalError(null);
  }, [editingSupplier, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierName.trim()) {
      setModalError('اسم المورد مطلوب.');
      return;
    }

    setIsSaving(true);
    setModalError(null);
    try {
      await onSave(formData, editingSupplier ? editingSupplier.id : 0);
      onClose();
    } catch (err: any) {
      setModalError(err.message || 'حدث خطأ أثناء حفظ المورد.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh] text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-indigo-600 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-300" />
            <h2 className="text-sm font-bold">
              {editingSupplier ? 'تعديل بيانات مورد' : 'تسجيل مورد جديد في سلاسل الإمداد'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-indigo-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {modalError && (
            <div className="p-3 text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                اسم المورد / الشركة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="مثال: مطاحن ومضارب الغربية"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                كود المورد (اتركه فارغاً للتوليد التلقائي)
              </label>
              <input
                type="text"
                placeholder="مثال: SUP-0012"
                value={formData.supplierCode || ''}
                onChange={(e) => setFormData({ ...formData, supplierCode: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono font-bold text-indigo-700 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">رقم الهاتف / المحمول</label>
              <input
                type="text"
                dir="ltr"
                placeholder="01xxxxxxxxx"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-left font-mono focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                dir="ltr"
                placeholder="supplier@domain.com"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-left font-mono focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">الرقم الضريبي</label>
              <input
                type="text"
                placeholder="رقم التسجيل الضريبي"
                value={formData.taxNumber || ''}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">شروط السداد المعتمدة</label>
              <select
                value={formData.paymentTerms || 'نقدي'}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-indigo-600"
              >
                <option value="نقدي">نقدي عند الاستلام</option>
                <option value="آجل 15 يوم">آجل 15 يوم</option>
                <option value="آجل 30 يوم">آجل 30 يوم</option>
                <option value="آجل 60 يوم">آجل 60 يوم</option>
                <option value="دفعة مقدمة">دفعة مقدمة مع التوريد</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">العنوان ومقر التوريد</label>
              <input
                type="text"
                placeholder="المحافظة - المركز - العنوان بالتفصيل"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">ملاحظات ومواصفات التوريد</label>
              <textarea
                rows={2}
                placeholder="أي شروط جودة خاصة، أصناف التوريد، أو بنود الاتفاق..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="col-span-1 md:col-span-2 pt-2">
              <label className="relative flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="font-bold text-gray-800">المورد نشط ومتاح لأوامر الشراء والتوريد</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-gray-600 hover:bg-gray-200 rounded-xl font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'جاري الحفظ...' : 'حفظ المورد'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
