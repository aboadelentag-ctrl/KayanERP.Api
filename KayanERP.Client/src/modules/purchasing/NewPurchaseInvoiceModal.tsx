import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react';
import type { PurchaseInvoice, PurchaseInvoiceItem, Supplier } from './purchasingApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: PurchaseInvoice) => void;
  suppliers: Supplier[];
}

export const NewPurchaseInvoiceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  suppliers,
}) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(1);
  const [paymentType, setPaymentType] = useState<'آجل' | 'نقدي'>('آجل');
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const [items, setItems] = useState<PurchaseInvoiceItem[]>([
    { id: 1, materialName: 'سكر أبيض مكرر', quantity: 500, unit: 'كيلو', unitPrice: 30, total: 15000 },
    { id: 2, materialName: 'سمن بلدي طبيعي', quantity: 50, unit: 'كيلو', unitPrice: 240, total: 12000 },
  ]);

  useEffect(() => {
    if (isOpen && suppliers.length > 0) {
      setSelectedSupplierId(suppliers[0].id);
      setDiscount(0);
      setPaidAmount(0);
      setError('');
    }
  }, [isOpen, suppliers]);

  if (!isOpen) return null;

  const subTotal = items.reduce((sum, item) => sum + item.total, 0);
  const netTotal = Math.max(0, subTotal - discount);
  const remainingAmount = Math.max(0, netTotal - paidAmount);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        materialName: '',
        quantity: 10,
        unit: 'كيلو',
        unitPrice: 50,
        total: 500,
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof PurchaseInvoiceItem, value: any) => {
    const updated = [...items];
    const target = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) : target.quantity;
      const p = field === 'unitPrice' ? Number(value) : target.unitPrice;
      target.total = q * p;
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
      setError('يجب إضافة بند خامة واحد على الأقل داخل الفاتورة');
      return;
    }

    const currentSupplier = suppliers.find((s) => s.id === Number(selectedSupplierId));

    const newInv: PurchaseInvoice = {
      id: Date.now(),
      invoiceNumber: `PUR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      supplierId: Number(selectedSupplierId),
      supplierName: currentSupplier ? currentSupplier.name : 'مورد غير مسجل',
      paymentType,
      itemsCount: items.length,
      subTotal,
      discount: Number(discount),
      netTotal,
      paidAmount: Number(paidAmount),
      remainingAmount,
      status: 'معتمدة ومستلمة',
      items,
    };

    onSave(newInv);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">تحرير فاتورة شراء خامات واستلام مستودع</h2>
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
              <label className="block text-xs font-semibold text-gray-600 mb-1">المورد المعتمد *</label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-semibold"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">طريقة السداد</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
              >
                <option value="آجل">آجل (على حساب الذمم الدائنة)</option>
                <option value="نقدي">نقدي (سداد فوري من الخزينة)</option>
              </select>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden mt-2">
            <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
              <span className="text-xs font-bold text-gray-700">بنود وأصناف الخامات الموردة</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة خامة</span>
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-5">
                    <input
                      type="text"
                      required
                      placeholder="اسم الخامة (دقيق، سميد...)"
                      value={item.materialName}
                      onChange={(e) => handleUpdateItem(idx, 'materialName', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-center font-bold font-mono"
                      />
                      <span className="text-gray-400">{item.unit}</span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.5"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(idx, 'unitPrice', e.target.value)}
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-center font-mono"
                    />
                  </div>

                  <div className="col-span-2 text-left font-bold font-mono text-gray-900">
                    {item.total.toLocaleString()} ج.م
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

          <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>إجمالي قيمة الخامات:</span>
              <span className="font-mono font-bold">{subTotal.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>خصم خاص / مسموحات:</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-white border border-gray-200 rounded text-left font-mono font-bold"
              />
            </div>
            <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>صافي الفاتورة المستحق للمورد:</span>
              <span className="font-mono text-base text-indigo-700">{netTotal.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between items-center text-gray-600 pt-1">
              <span>المدفوع نقداً من الخزينة:</span>
              <input
                type="number"
                min="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-28 px-2 py-1 bg-white border border-gray-200 rounded text-left font-mono font-bold text-emerald-700"
              />
            </div>
            <div className="flex justify-between text-xs font-bold text-rose-700 pt-1">
              <span>المتبقي لحساب المورد (آجل):</span>
              <span className="font-mono text-sm">{remainingAmount.toLocaleString()} ج.م</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد الفاتورة وتوريد المخزن</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
