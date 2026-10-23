import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, HandCoins, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { TreasuryVoucher } from './treasuryApi';
import type { AccountItem } from '../accounts/accountsApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (voucher: TreasuryVoucher) => void;
}

export const NewVoucherModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [type, setType] = useState<TreasuryVoucher['type']>('سند قبض نقدية');
  const [treasuryAccountId, setTreasuryAccountId] = useState<number>(3);
  const [targetAccountId, setTargetAccountId] = useState<number>(6);
  const [amount, setAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<TreasuryVoucher['paymentMethod']>('نقدي');
  const [checkNumber, setCheckNumber] = useState<string>('');
  const [receivedFromOrPaidTo, setReceivedFromOrPaidTo] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [treasuryAccounts, setTreasuryAccounts] = useState<AccountItem[]>([]);
  const [allPostingAccounts, setAllPostingAccounts] = useState<AccountItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      const stored = JSON.parse(localStorage.getItem('kayan_chart_of_accounts') || '[]');
      const posting = stored.filter((a: AccountItem) => a.isPosting);
      setAllPostingAccounts(posting);

      // حسابات الخزائن والبنوك (كود 1101 إلى 1103)
      const treasuries = posting.filter((a: AccountItem) =>
        a.accountCode.startsWith('1101') ||
        a.accountCode.startsWith('1102') ||
        a.accountCode.startsWith('1103')
      );
      setTreasuryAccounts(treasuries);

      if (treasuries.length > 0) {
        setTreasuryAccountId(treasuries[0].id);
      }
      if (posting.length > 0) {
        setTargetAccountId(posting[0].id);
      }
      setAmount(1000);
      setCheckNumber('');
      setReceivedFromOrPaidTo('');
      setDescription('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivedFromOrPaidTo.trim()) {
      setError(type === 'سند قبض نقدية' ? 'يرجى كتابة اسم الجهة أو العميل المستلم منه' : 'يرجى كتابة اسم المستفيد المنصرف إليه');
      return;
    }
    if (amount <= 0) {
      setError('يجب أن تكون قيمة السند أكبر من الصفر');
      return;
    }

    const tAcc = treasuryAccounts.find((a) => a.id === Number(treasuryAccountId));
    const targetAcc = allPostingAccounts.find((a) => a.id === Number(targetAccountId));

    const newVoucher: TreasuryVoucher = {
      id: Date.now(),
      voucherNumber: type === 'سند قبض نقدية'
        ? `VCH-REC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
        : `VCH-PAY-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      type,
      date: new Date().toISOString().slice(0, 10),
      treasuryAccountId: Number(treasuryAccountId),
      treasuryName: tAcc ? tAcc.accountName : 'الخزينة الرئيسية',
      targetAccountId: Number(targetAccountId),
      targetAccountName: targetAcc ? targetAcc.accountName : 'حساب عام',
      amount: Number(amount),
      paymentMethod,
      checkNumber: paymentMethod === 'شيك بنكي' ? checkNumber : undefined,
      receivedFromOrPaidTo,
      description: description || (type === 'سند قبض نقدية' ? 'تحصيل وقبض نقدية بالخزينة' : 'صرف نقدية من الخزينة'),
      status: 'معتمد ومرحل',
      createdBy: 'أمين الخزينة المناوب',
    };

    onSave(newVoucher);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">
              تحرير {type === 'سند قبض نقدية' ? 'سند قبض وتحصيل نقدية' : 'سند صرف ودفع نقدية'}
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

          {/* نوع السند */}
          <div className="grid grid-cols-2 gap-3 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setType('سند قبض نقدية')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'سند قبض نقدية' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>سند قبض (توريد للخزينة)</span>
            </button>

            <button
              type="button"
              onClick={() => setType('سند صرف نقدية')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                type === 'سند صرف نقدية' ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>سند صرف (خروج من الخزينة)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الخزينة أو الحساب البنكي *</label>
              <select
                value={treasuryAccountId}
                onChange={(e) => setTreasuryAccountId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-900"
              >
                {treasuryAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountCode} - {acc.accountName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {type === 'سند قبض نقدية' ? 'الحساب الدائن (مصدر الإيراد / عميل)' : 'الحساب المدين (مصروف / مورد)'} *
              </label>
              <select
                value={targetAccountId}
                onChange={(e) => setTargetAccountId(Number(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800"
              >
                {allPostingAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.accountCode} - {acc.accountName} ({acc.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {type === 'سند قبض نقدية' ? 'استلمنا من السيد / السادة *' : 'يصرف إلى السيد / السادة *'}
              </label>
              <input
                type="text"
                required
                placeholder="اسم العميل أو المستفيد"
                value={receivedFromOrPaidTo}
                onChange={(e) => setReceivedFromOrPaidTo(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">المبلغ المالي (ج.م) *</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm font-mono font-bold text-indigo-700 text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">طريقة المعاملة</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800"
              >
                <option value="نقدي">نقدي (كاش في الخزينة)</option>
                <option value="شيك بنكي">شيك بنكي مؤجل / حال</option>
                <option value="تحويل فوري">تحويل فوري (InstaPay / بنكي)</option>
              </select>
            </div>

            {paymentMethod === 'شيك بنكي' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">رقم الشيك والبنك</label>
                <input
                  type="text"
                  placeholder="رقم الشيك المسحوب"
                  value={checkNumber}
                  onChange={(e) => setCheckNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-800"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">البيان والشرح التفصيلي</label>
            <input
              type="text"
              placeholder="مثال: سداد دفعة نقدية تحت حساب توريد خامات"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white rounded-xl shadow-sm ${
                type === 'سند قبض نقدية' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>اعتماد السند والترحيل المالي</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
