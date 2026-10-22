import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import type { SalesInvoice, InvoiceItem } from './salesApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: SalesInvoice) => void;
}

export const NewInvoiceModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(1);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1);
  const [paymentType, setPaymentType] = useState<'نقد' | 'آجل'>('آجل');
  const [cratesDispatched, setCratesDispatched] = useState<number>(10);
  const [discount, setDiscount] = useState<number>(0);

  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      const custData = JSON.parse(localStorage.getItem('kayan_customers_data') || '[]');
      const brData = JSON.parse(localStorage.getItem('kayan_branches_data') || '[]');
      const prodData = JSON.parse(localStorage.getItem('kayan_products_data') || '[]');

      setCustomers(custData);
      setBranches(brData);
      setProducts(prodData);

      if (custData.length > 0) setSelectedCustomerId(custData[0].id);
      if (brData.length > 0) setSelectedBranchId(brData[0].id);

      if (prodData.length > 0) {
        setItems([
          {
            productId: prodData[0].id,
            productName: prodData[0].name,
            unit: prodData[0].unit,
            quantity: 5,
            unitPrice: prodData[0].wholesalePrice,
            total: 5 * prodData[0].wholesalePrice,
          },
        ]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCustomer = customers.find((c) => c.id === Number(selectedCustomerId));
  const subTotal = items.reduce((sum, item) => sum + item.total, 0);
  const netTotal = Math.max(0, subTotal - discount);

  const willExceedCredit =
    currentCustomer &&
    paymentType === 'آجل' &&
    currentCustomer.creditLimit > 0 &&
    currentCustomer.currentBalance + netTotal > currentCustomer.creditLimit;

  const handleAddItem = () => {
    if (products.length === 0) return;
    const defaultProd = products[0];
    const price = paymentType === 'آجل' ? defaultProd.wholesalePrice : defaultProd.retailPrice;
    setItems([
      ...items,
      {
        productId: defaultProd.id,
        productName: defaultProd.name,
        unit: defaultProd.unit,
        quantity: 1,
        unitPrice: price,
        total: price,
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
        target.unitPrice = paymentType === 'آجل' ? prod.wholesalePrice : prod.retailPrice;
        target.total = target.quantity * target.unitPrice;
      }
    } else if (field === 'quantity') {
      target.quantity = Number(value);
      target.total = target.quantity * target.unitPrice;
    } else if (field === 'unitPrice') {
      target.unitPrice = Number(value);
      target.total = target.quantity * target.unitPrice;
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
      alert('يجب إضافة صنف واحد على الأقل داخل الفاتورة');
      return;
    }

    const currentBranch = branches.find((b) => b.id === Number(selectedBranchId));

    const newInvoice: SalesInvoice = {
      id: Date.now(),
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      customerId: Number(selectedCustomerId),
      customerName: currentCustomer ? currentCustomer.name : 'عميل غير مسجل',
      branchId: Number(selectedBranchId),
      branchName: currentBranch ? currentBranch.name : 'الفرع الرئيسي',
      paymentType,
      itemsCount: items.length,
      subTotal,
      discount,
      netTotal,
      cratesDispatched: Number(cratesDispatched),
      status: 'معتمدة ومسلمة',
      items,
    };

    onSave(newInvoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col">
        {/* الترويسة */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">تحرير فاتورة مبيعات وإذن صرف بضاعة</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* جسم الفاتورة القابل للتمرير */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* بيانات العميل والفرع ونوع الدفع */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">العميل المستلم *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">جهة الصرف / الفرع *</label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(Number(e.target.value))}
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
              <label className="block text-xs font-semibold text-gray-600 mb-1">طريقة الدفع</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <option value="آجل">آجل (على الحساب الائتماني)</option>
                <option value="نقد">نقد (سداد فوري)</option>
              </select>
            </div>
          </div>

          {/* فحص سقف الائتمان اللحظي */}
          {currentCustomer && paymentType === 'آجل' && (
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              willExceedCredit
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <div className="flex items-center gap-2">
                {willExceedCredit ? <AlertTriangle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                <span>
                  {willExceedCredit
                    ? 'تحذير ائتماني: الفاتورة ستتجاوز سقف التسهيلات المسموح للعميل!'
                    : 'الوضع الائتماني للعميل سليم ويسمح بتحميل الفاتورة.'}
                </span>
              </div>
              <div className="font-mono text-xs">
                الرصيد الحالي: <b>{currentCustomer.currentBalance.toLocaleString()}</b> / الحد: <b>{currentCustomer.creditLimit.toLocaleString()} ج.م</b>
              </div>
            </div>
          )}

          {/* جدول الأصناف التفاعلي */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
              <span className="text-xs font-bold text-gray-700">بنود وأصناف الفاتورة</span>
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
                  <div className="col-span-5">
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
                      className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                      title="حذف البند"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* سطر المجنسات وحسابات الإجمالي */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-amber-900">
                عدد المجنسات والبراني الصادرة مع الشحنة:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={cratesDispatched}
                  onChange={(e) => setCratesDispatched(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-sm font-bold font-mono text-amber-900 text-center"
                />
                <span className="text-xs text-amber-800">قفص يُضاف لرصيد عهدة العميل</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>إجمالي الأصناف:</span>
                <span className="font-mono font-bold">{subTotal.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>خصم خاص:</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24 px-2 py-1 bg-white border border-gray-200 rounded text-left font-mono font-bold"
                />
              </div>
              <div className="flex justify-between text-sm font-bold text-indigo-700 pt-2 border-t border-gray-200">
                <span>صافي قيمة الفاتورة:</span>
                <span className="font-mono text-base">{netTotal.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد الفاتورة وإذن الصرف</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
