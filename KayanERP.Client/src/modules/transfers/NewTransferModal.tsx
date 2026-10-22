import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, Truck, Boxes } from 'lucide-react';
import type { StockTransfer, TransferItem } from './transfersApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transfer: StockTransfer) => void;
}

export const NewTransferModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [branches, setBranches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [fromBranchId, setFromBranchId] = useState<number>(1);
  const [toBranchId, setToBranchId] = useState<number>(2);
  const [driverName, setDriverName] = useState<string>('السائق حسام');
  const [cratesLoaded, setCratesLoaded] = useState<number>(25);

  const [items, setItems] = useState<TransferItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      const brData = JSON.parse(localStorage.getItem('kayan_branches_data') || '[]');
      const prodData = JSON.parse(localStorage.getItem('kayan_products_data') || '[]');

      setBranches(brData);
      setProducts(prodData);

      if (brData.length > 1) {
        setFromBranchId(brData[0].id);
        setToBranchId(brData[1].id);
      }

      if (prodData.length > 0) {
        setItems([
          {
            productId: prodData[0].id,
            productName: prodData[0].name,
            unit: prodData[0].unit,
            quantity: 10,
          },
        ]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (products.length === 0) return;
    const defaultProd = products[0];
    setItems([
      ...items,
      {
        productId: defaultProd.id,
        productName: defaultProd.name,
        unit: defaultProd.unit,
        quantity: 5,
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    const target = { ...updated[index] };

    if (field === 'productId') {
      const prod = products.find((p) => p.id === Number(value));
      if (prod) {
        target.productId = prod.id;
        target.productName = prod.name;
        target.unit = prod.unit;
      }
    } else if (field === 'quantity') {
      target.quantity = Number(value);
    }

    updated[index] = target;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromBranchId === toBranchId) {
      alert('لا يمكن التحويل لنفس الفرع/الموقع!');
      return;
    }
    if (items.length === 0) {
      alert('يجب إضافة صنف واحد على الأقل داخل إذن الشحن');
      return;
    }

    const fromBranch = branches.find((b) => b.id === Number(fromBranchId));
    const toBranch = branches.find((b) => b.id === Number(toBranchId));

    const newTransfer: StockTransfer = {
      id: Date.now(),
      transferNumber: `TRF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      fromBranchId: Number(fromBranchId),
      fromBranchName: fromBranch ? fromBranch.name : 'المصنع',
      toBranchId: Number(toBranchId),
      toBranchName: toBranch ? toBranch.name : 'فرع مستلم',
      cratesLoaded: Number(cratesLoaded),
      driverName,
      itemsCount: items.length,
      status: 'قيد النقل والتوزيع',
      items,
    };

    onSave(newTransfer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col">
        {/* الترويسة */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">إصدار إذن تحويل وشحن بضاعة</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* جسم النموذج */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الموقع المصدر (مكان الشحن) *</label>
              <select
                value={fromBranchId}
                onChange={(e) => setFromBranchId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الموقع المستلم (الوجهة) *</label>
              <select
                value={toBranchId}
                onChange={(e) => setToBranchId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">اسم السائق / مسؤول النقل</label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">عدد المجنسات والبراني المحمّلة</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={cratesLoaded}
                  onChange={(e) => setCratesLoaded(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg text-sm font-bold font-mono text-amber-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-xs text-gray-400 shrink-0">قفص</span>
              </div>
            </div>
          </div>

          {/* جدول الأصناف المحمّلة */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mt-2">
            <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
              <span className="text-xs font-bold text-gray-700">الأصناف والكميات المشحونة</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة صنف</span>
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-8">
                    <select
                      value={item.productId}
                      onChange={(e) => handleUpdateItem(idx, 'productId', e.target.value)}
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
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

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* أزرار الإجراء */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد إذن الشحن</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
