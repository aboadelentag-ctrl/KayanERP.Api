import React, { useState } from 'react';
import { X, Save, AlertCircle, ShoppingCart } from 'lucide-react';
import type { PurchaseOrder } from './procurementApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: PurchaseOrder) => void;
}

export const NewPurchaseOrderModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [poNumber] = useState(`PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [supplierName, setSupplierName] = useState('شركة مطاحن الدلتا والصعيد');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [totalAmount, setTotalAmount] = useState<number>(15000);
  const [itemsCount, setItemsCount] = useState<number>(2);
  const [deliveryLocation, setDeliveryLocation] = useState('مستودع الخامات المركزي (المصنع)');
  const [paymentTerms, setPaymentTerms] = useState('سداد نقدي عند الاستلام بعد فحص الجودة');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      setError('يرجى تحديد المورد المعني بأمر الشراء');
      return;
    }
    if (totalAmount <= 0) {
      setError('يجب أن تكون قيمة أمر الشراء أكبر من الصفر');
      return;
    }

    const newOrder: PurchaseOrder = {
      id: Date.now(),
      poNumber,
      date: new Date().toISOString().slice(0, 10),
      supplierName,
      expectedDeliveryDate,
      totalAmount: Number(totalAmount),
      status: 'معتمد قيد التوريد',
      itemsCount: Number(itemsCount),
      deliveryLocation,
      paymentTerms,
      notes: notes || 'أمر شراء معتمد وموجه للمورد',
    };

    onSave(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">إصدار أمر شراء خامات جديد (Purchase Order)</h2>
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
              <label className="block text-xs font-semibold text-gray-600 mb-1">رقم أمر الشراء *</label>
              <input
                type="text"
                disabled
                value={poNumber}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-mono font-bold text-indigo-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">المورد المعتمد *</label>
              <select
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900"
              >
                <option value="شركة مطاحن الدلتا والصعيد">شركة مطاحن الدلتا والصعيد</option>
                <option value="مزارع الوادي لمنتجات الألبان والسمن البلدي">مزارع الوادي لمنتجات الألبان</option>
                <option value="الشركة السورية لاستيراد المكسرات">الشركة السورية لاستيراد المكسرات</option>
                <option value="شركة سكر الحوامدية ومصانع الدلتا">شركة سكر الحوامدية ومصانع الدلتا</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">تاريخ التوريد المتوقع *</label>
              <input
                type="date"
                required
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">موقع ومستودع الاستلام *</label>
              <select
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
              >
                <option value="مستودع الخامات المركزي (المصنع)">مستودع الخامات المركزي (المصنع)</option>
                <option value="ثلاجات حفظ الخامات الحساسة">ثلاجات حفظ الخامات الحساسة</option>
                <option value="مستودع المكسرات والخامات الجافة">مستودع المكسرات والخامات الجافة</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">إجمالي قيمة أمر الشراء (ج.م) *</label>
              <input
                type="number"
                min="100"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-mono font-bold text-indigo-700 text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">عدد بنود الخامات</label>
              <input
                type="number"
                min="1"
                value={itemsCount}
                onChange={(e) => setItemsCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono text-center font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">شروط الدفع والائتمان</label>
            <input
              type="text"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات ومواصفات خاصة</label>
            <input
              type="text"
              placeholder="مثال: فحص شهادة التحليل COA إلزامي عند بوابة المصنع"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm">
              <Save className="w-4 h-4" />
              <span>إصدار واعتماد أمر الشراء</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
