import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import type { MaterialRequisition, RequisitionItem } from './materialsApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (requisition: MaterialRequisition) => void;
}

export const NewRequisitionModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [department, setDepartment] = useState<string>('صالة تصنيع الحلويات الشرقية');
  const [prodOrderNum, setProdOrderNum] = useState<string>('PRD-ORD-2026-083');
  const [requestedBy, setRequestedBy] = useState<string>('شيف صالة التشغيل');
  const [error, setError] = useState<string>('');

  const [items, setItems] = useState<RequisitionItem[]>([
    { id: 1, materialName: 'دقيق فاخر استخراج 72%', requestedQty: 50, approvedQty: 50, unit: 'كيلو', unitCost: 25, totalCost: 1250 },
    { id: 2, materialName: 'سكر أبيض نقي', requestedQty: 25, approvedQty: 25, unit: 'كيلو', unitCost: 32, totalCost: 800 },
  ]);

  if (!isOpen) return null;

  const totalCost = items.reduce((sum, i) => sum + i.totalCost, 0);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        materialName: '',
        requestedQty: 10,
        approvedQty: 10,
        unit: 'كيلو',
        unitCost: 50,
        totalCost: 500,
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof RequisitionItem, value: any) => {
    const updated = [...items];
    const target = { ...updated[index], [field]: value };
    if (field === 'requestedQty' || field === 'unitCost') {
      const q = field === 'requestedQty' ? Number(value) : target.requestedQty;
      const c = field === 'unitCost' ? Number(value) : target.unitCost;
      target.totalCost = q * c;
      target.approvedQty = q;
    }
    updated[index] = target;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('يجب إضافة بند خامة واحد على الأقل');
      return;
    }

    const newReq: MaterialRequisition = {
      id: Date.now(),
      requisitionNumber: `REQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      productionOrderNumber: prodOrderNum,
      department,
      requestedBy,
      approvedBy: 'قيد الاعتماد',
      itemsCount: items.length,
      totalCost,
      status: 'معلق للموافقة',
      items,
    };

    onSave(newReq);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">إصدار إذن طلب وصرف خامات لصالة الإنتاج</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الجهة الطالبة / صالة التشغيل *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
              >
                <option value="صالة تصنيع الحلويات الشرقية">صالة تصنيع الحلويات الشرقية</option>
                <option value="صالة تصنيع الحلويات الغربية والتورت">صالة تصنيع الحلويات الغربية والتورت</option>
                <option value="صالة المخبوزات والنواشف">صالة المخبوزات والنواشف</option>
                <option value="صالة التجهيز والتعبئة">صالة التجهيز والتعبئة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">رقم أمر التشغيل المرتبط</label>
              <input
                type="text"
                required
                value={prodOrderNum}
                onChange={(e) => setProdOrderNum(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الشيف / مقدم الطلب</label>
            <input
              type="text"
              required
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
            />
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden mt-3">
            <div className="bg-slate-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
              <span className="text-xs font-bold text-gray-700">الخامات والمقادير المطلوبة</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة خامة</span>
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <div key={idx} className="p-2.5 grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-5">
                    <input
                      type="text"
                      required
                      placeholder="اسم الخامة (دقيق، زبدة...)"
                      value={item.materialName}
                      onChange={(e) => handleUpdateItem(idx, 'materialName', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="col-span-3">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={item.requestedQty}
                        onChange={(e) => handleUpdateItem(idx, 'requestedQty', e.target.value)}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-center font-bold font-mono"
                      />
                      <span className="text-gray-400">{item.unit}</span>
                    </div>
                  </div>

                  <div className="col-span-3 text-left font-bold font-mono text-gray-900">
                    {item.totalCost.toLocaleString()} ج.م
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs font-bold text-indigo-900">
            <span>إجمالي تكلفة الخامات المطلوبة:</span>
            <span className="font-mono text-base">{totalCost.toLocaleString()} ج.م</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>إرسال إذن الصرف للاعتماد</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
