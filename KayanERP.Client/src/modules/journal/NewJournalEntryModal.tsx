import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertCircle, Scale } from 'lucide-react';
import type { JournalEntry, JournalEntryLine } from './journalApi';
import type { AccountItem } from '../accounts/accountsApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: JournalEntry) => void;
}

export const NewJournalEntryModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [description, setDescription] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [referenceType, setReferenceType] = useState<JournalEntry['referenceType']>('قيد تسوية يدوي');
  const [error, setError] = useState<string>('');

  const [lines, setLines] = useState<JournalEntryLine[]>([
    { id: 1, accountId: 3, accountCode: '1101', accountName: 'خزينة المركز الرئيسي والمصنع', debit: 1000, credit: 0, description: 'إيداع نقدي' },
    { id: 2, accountId: 6, accountCode: '1104', accountName: 'أرصدة العملاء والمدينون', debit: 0, credit: 1000, description: 'تحصيل من عميل' },
  ]);

  useEffect(() => {
    if (isOpen) {
      const accData = JSON.parse(localStorage.getItem('kayan_chart_of_accounts') || '[]');
      setAccounts(accData.filter((a: AccountItem) => a.isPosting));
      setReferenceNumber(`REF-${Math.floor(100 + Math.random() * 900)}`);
      setDescription('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const diff = Math.abs(totalDebit - totalCredit);
  const isBalanced = diff < 0.01 && totalDebit > 0;

  const handleAddLine = () => {
    if (accounts.length === 0) return;
    const defaultAcc = accounts[0];
    setLines([
      ...lines,
      {
        id: Date.now(),
        accountId: defaultAcc.id,
        accountCode: defaultAcc.accountCode,
        accountName: defaultAcc.accountName,
        debit: 0,
        credit: 0,
        description: description || 'تسوية حساب',
      },
    ]);
  };

  const handleUpdateLine = (index: number, field: keyof JournalEntryLine, value: any) => {
    const updated = [...lines];
    const target = { ...updated[index] };

    if (field === 'accountId') {
      const selected = accounts.find((a) => a.id === Number(value));
      if (selected) {
        target.accountId = selected.id;
        target.accountCode = selected.accountCode;
        target.accountName = selected.accountName;
      }
    } else if (field === 'debit') {
      target.debit = Number(value);
      if (target.debit > 0) target.credit = 0;
    } else if (field === 'credit') {
      target.credit = Number(value);
      if (target.credit > 0) target.debit = 0;
    } else if (field === 'description') {
      target.description = value;
    }

    updated[index] = target;
    setLines(updated);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) {
      setError('يجب أن يحتوي القيد على سطرين على الأقل (طرف مدين وطرف دائن)');
      return;
    }
    setLines(lines.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('يرجى كتابة شرح وافي للقيد المحاسبي');
      return;
    }
    if (!isBalanced) {
      setError(`القيد غير متوازن! يوجد فارق قدره ${diff.toLocaleString()} ج.م بين المدين والدائن`);
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now(),
      entryNumber: `JRN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      referenceType,
      referenceNumber,
      description,
      totalDebit,
      totalCredit,
      status: 'مرحل للأستاذ العام',
      createdBy: 'خالد ممدوح (رئيس الحسابات)',
      lines,
    };

    onSave(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">إنشاء قيد يومية محاسبي مزدوج</h2>
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
              <label className="block text-xs font-semibold text-gray-600 mb-1">نوع المستند المرجعي</label>
              <select
                value={referenceType}
                onChange={(e) => setReferenceType(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
              >
                <option value="قيد تسوية يدوي">قيد تسوية يدوي</option>
                <option value="سند صرف مصروفات">سند صرف مصروفات نقدية</option>
                <option value="فاتورة مبيعات">فاتورة مبيعات</option>
                <option value="صرف خامات معمل">إذن صرف خامات</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">رقم المستند المرجعي</label>
              <input
                type="text"
                required
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">البيان العام للقيد *</label>
            <input
              type="text"
              required
              placeholder="مثال: إثبات سداد مصاريف نقل خامات من مطاحن الدلتا"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
            />
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden mt-3">
            <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-200">
              <span className="text-xs font-bold text-gray-700">أطراف وسطور القيد المحاسبي</span>
              <button
                type="button"
                onClick={handleAddLine}
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة طرف</span>
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {lines.map((line, idx) => (
                <div key={idx} className="p-2.5 grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-4">
                    <select
                      value={line.accountId}
                      onChange={(e) => handleUpdateLine(idx, 'accountId', e.target.value)}
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.accountCode} - {acc.accountName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="بيان السطر"
                      value={line.description}
                      onChange={(e) => handleUpdateLine(idx, 'description', e.target.value)}
                      className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="مدين"
                      value={line.debit || ''}
                      onChange={(e) => handleUpdateLine(idx, 'debit', e.target.value)}
                      className="w-full px-2 py-1.5 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs text-center font-bold font-mono text-emerald-800"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="دائن"
                      value={line.credit || ''}
                      onChange={(e) => handleUpdateLine(idx, 'credit', e.target.value)}
                      className="w-full px-2 py-1.5 bg-amber-50/50 border border-amber-200 rounded-lg text-xs text-center font-bold font-mono text-amber-800"
                    />
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="p-1 text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 text-xs ${
            isBalanced ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-rose-50/70 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold block">
                  {isBalanced ? 'القيد متوازن محاسبياً (المدين = الدائن)' : 'تحذير: القيد غير متوازن!'}
                </span>
                {!isBalanced && (
                  <span className="text-[11px] block mt-0.5">
                    الفارق غير المطابق: <b>{diff.toLocaleString()} ج.م</b>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 font-mono font-bold text-sm">
              <div>
                <span className="text-[11px] text-gray-500 block">إجمالي المدين:</span>
                <span className="text-emerald-700">{totalDebit.toLocaleString()} ج.م</span>
              </div>
              <div>
                <span className="text-[11px] text-gray-500 block">إجمالي الدائن:</span>
                <span className="text-amber-700">{totalCredit.toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!isBalanced}
              className={`flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white rounded-xl shadow-sm transition-colors ${
                isBalanced ? 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer' : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ترحيل القيد للأستاذ العام</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
