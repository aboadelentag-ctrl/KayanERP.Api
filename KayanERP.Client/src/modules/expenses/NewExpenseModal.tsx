import React, { useState } from 'react';
import { X, Save, AlertCircle, Wallet2 } from 'lucide-react';
import type { OperatingExpense } from './expensesApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: OperatingExpense) => void;
}

export const NewExpenseModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [category, setCategory] = useState<OperatingExpense['category']>('غاز طبيعي للأفران');
  const [supplierOrEntityName, setSupplierOrEntityName] = useState('');
  const [costCenter, setCostCenter] = useState('صالة تصنيع الحلويات الشرقية (المصنع الرئيسي)');
  const [amount, setAmount] = useState<number>(1000);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [paymentType, setPaymentType] = useState<OperatingExpense['paymentType']>('نقدي فوري');
  const [checkNumber, setCheckNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const remainingAmount = Math.max(0, amount - paidAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierOrEntityName.trim()) {
      setError('يرجى تحديد الجهة أو المورد المستحق له المصروف');
      return;
    }
    if (amount <= 0) {
      setError('يجب أن تكون قيمة المصروف أكبر من الصفر');
      return;
    }

    let status: OperatingExpense['status'] = 'مسدد بالكامل';
    if (remainingAmount > 0 && paidAmount > 0) status = 'مستحق السداد';
    if (paidAmount === 0) status = 'مستحق السداد';

    const newExpense: OperatingExpense = {
      id: Date.now(),
      billNumber: `EXP-${category.includes('غاز') ? 'GAS' : category.includes('كهرباء') ? 'POW' : 'OPR'}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      category,
      date: new Date().toISOString().slice(0, 10),
      dueDate,
      supplierOrEntityName,
      costCenter,
      amount: Number(amount),
      paidAmount: Number(paidAmount),
      remainingAmount,
      paymentType,
      checkNumber: paymentType === 'شيك بنكي مؤجل' ? checkNumber : undefined,
      status,
      notes: notes || `إثبات استحقاق ${category} لـ ${costCenter}`,
    };

    onSave(newExpense);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <Wallet2 className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-gray-800">إثبات مصروف تشغيلي / ورقة دفع للموردين</h2>
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
              <label className="block text-xs font-semibold text-gray-600 mb-1">نوع وبند المصروف *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900"
              >
                <option value="غاز طبيعي للأفران">غاز طبيعي للأفران</option>
                <option value="كهرباء المعمل والمستودعات">كهرباء المعمل والمستودعات</option>
                <option value="مياه ومرافق">مياه ومرافق</option>
                <option value="صيانة وقطع غيار">صيانة وقطع غيار</option>
                <option value="نثريات وإعاشة">نثريات وإعاشة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">مركز التكلفة / الموقع *</label>
              <select
                value={costCenter}
                onChange={(e) => setCostCenter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900"
              >
                <option value="صالة تصنيع الحلويات الشرقية (المصنع الرئيسي)">صالة الشرقية (المصنع الرئيسي)</option>
                <option value="صالة الحلويات الغربية والتورت">صالة الغربية والتورت</option>
                <option value="غرف التبريد والتجميد المركزي (-18°C)">غرف التبريد والتجميد المركزي</option>
                <option value="صالة الأفران والعجن">صالة الأفران والعجن</option>
                <option value="فرع دكرنس">فرع دكرنس</option>
                <option value="فرع شربين">فرع شربين</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">الجهة / الشركة المستحقة *</label>
            <input
              type="text"
              required
              placeholder="مثال: شركة غاز مصر أو شركة الكهرباء أو ورشة الصيانة"
              value={supplierOrEntityName}
              onChange={(e) => setSupplierOrEntityName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">إجمالي قيمة الفاتورة (ج.م) *</label>
              <input
                type="number"
                min="1"
                step="0.5"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-sm font-mono font-bold text-rose-700 text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">المدفوع نقداً فوراً (ج.م)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm font-mono font-bold text-emerald-700 text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">طريقة المعاملة</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800"
              >
                <option value="نقدي فوري">نقدي فوري (من الخزينة)</option>
                <option value="آجل / ورقة دفع">آجل / ورقة دفع مجدولة</option>
                <option value="شيك بنكي مؤجل">شيك بنكي مسحوب</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">تاريخ استحقاق السداد</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-800"
              />
            </div>
          </div>

          {paymentType === 'شيك بنكي مؤجل' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">رقم الشيك البنكي</label>
              <input
                type="text"
                placeholder="رقم الشيك المصرفي وتفاصيل السحب"
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-800"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">ملاحظات وبيان التشغيل</label>
            <input
              type="text"
              placeholder="مثال: صيانة دورية للمحركات أو سداد فاتورة شهر أكتوبر"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 flex justify-between items-center text-xs">
            <span className="text-gray-600">المتبقي كالتزام مستحق (ورقة دفع):</span>
            <span className="font-mono font-bold text-sm text-rose-700">{remainingAmount.toLocaleString()} ج.م</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm">
              <Save className="w-4 h-4" />
              <span>اعتماد المصروف وأوراق الدفع</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
