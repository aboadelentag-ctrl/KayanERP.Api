import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, BookOpen } from 'lucide-react';
import type { AccountItem } from './accountsApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: AccountItem) => void;
  existingAccounts: AccountItem[];
  initialData?: AccountItem | null;
}

export const AccountModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  existingAccounts,
  initialData,
}) => {
  const [formData, setFormData] = useState<Partial<AccountItem>>({
    accountCode: '',
    accountName: '',
    category: 'أصول',
    nature: 'مدين',
    level: 3,
    parentCode: '11',
    isPosting: true,
    currentBalance: 0,
    status: 'active',
  });

  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        accountCode: '',
        accountName: '',
        category: 'أصول',
        nature: 'مدين',
        level: 3,
        parentCode: '11',
        isPosting: true,
        currentBalance: 0,
        status: 'active',
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountCode?.trim()) {
      setError('يرجى تحديد كود الحساب المالي');
      return;
    }
    if (!formData.accountName?.trim()) {
      setError('يرجى تحديد اسم الحساب');
      return;
    }

    const payload: AccountItem = {
      id: formData.id || Date.now(),
      accountCode: formData.accountCode,
      accountName: formData.accountName,
      category: formData.category || 'أصول',
      nature: formData.nature || 'مدين',
      level: Number(formData.level) || 3,
      parentCode: formData.parentCode,
      currentBalance: Number(formData.currentBalance) || 0,
      isPosting: formData.isPosting ?? true,
      status: formData.status || 'active',
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/75 shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-gray-800">
              {initialData ? 'تعديل بيانات الحساب المالي' : 'إضافة حساب جديد إلى شجرة الحسابات'}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">كود الحساب المحاسبي *</label>
              <input
                type="text"
                required
                placeholder="مثال: 1107"
                value={formData.accountCode || ''}
                onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">التبويب المحاسبي الرئيسي</label>
              <select
                value={formData.category || 'أصول'}
                onChange={(e) => {
                  const cat = e.target.value as any;
                  const nat = (cat === 'أصول' || cat === 'مصروفات وتكاليف') ? 'مدين' : 'دائن';
                  setFormData({ ...formData, category: cat, nature: nat });
                }}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
              >
                <option value="أصول">1 - أصول</option>
                <option value="خصوم والتزامات">2 - خصوم والتزامات</option>
                <option value="حقوق ملكية">3 - حقوق ملكية</option>
                <option value="إيرادات">4 - إيرادات</option>
                <option value="مصروفات وتكاليف">5 - مصروفات وتكاليف</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">اسم الحساب بالكامل *</label>
            <input
              type="text"
              required
              placeholder="مثال: خزينة سيارة توزيع رقم 2"
              value={formData.accountName || ''}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الحساب الأب (المستوى الأعلى)</label>
              <select
                value={formData.parentCode || ''}
                onChange={(e) => setFormData({ ...formData, parentCode: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-mono"
              >
                <option value="">-- حساب جذري مستقل --</option>
                {existingAccounts
                  .filter((a) => !a.isPosting)
                  .map((a) => (
                    <option key={a.id} value={a.accountCode}>
                      {a.accountCode} - {a.accountName}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">طبيعة الحساب</label>
              <select
                value={formData.nature || 'مدين'}
                onChange={(e) => setFormData({ ...formData, nature: e.target.value as any })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-semibold"
              >
                <option value="مدين">مدين بطبيعته (Debit)</option>
                <option value="دائن">دائن بطبيعته (Credit)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">الرصيد الافتتاحي (ج.م)</label>
              <input
                type="number"
                step="0.01"
                value={formData.currentBalance ?? 0}
                onChange={(e) => setFormData({ ...formData, currentBalance: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">نوع الاستخدام</label>
              <select
                value={formData.isPosting ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, isPosting: e.target.value === 'true' })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800"
              >
                <option value="true">حساب تحليلي (يقبل قيود يومية)</option>
                <option value="false">حساب مجمّع رئيسي (للعرض فقط)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">
              إلغاء
            </button>
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm">
              <Save className="w-4 h-4" />
              <span>حفظ الحساب</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
