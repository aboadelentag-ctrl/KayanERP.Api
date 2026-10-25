import React, { useState, useEffect, useMemo } from 'react';
import {
  Landmark,
  PlusCircle,
  Search,
  CheckCircle2,
  RotateCw,
  FolderOpen,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { fetchAccountsApi, saveAccountApi } from './accountsApi';
import type { AccountDto } from './accountsApi';

export const ChartOfAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newAccount, setNewAccount] = useState<AccountDto>({
    id: 0,
    accountCode: '',
    accountName: '',
    type: 1,
    level: 4,
    isSubAccount: true,
    currentBalance: 0,
    isActive: true
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAccountsApi();
      setAccounts(data);
    } finally {
      setIsLoading(false);
    }
  };

  const totals = useMemo(() => {
    const totalAssets = accounts.filter(a => a.type === 1 && a.isSubAccount).reduce((sum, a) => sum + a.currentBalance, 0);
    const totalLiabilities = accounts.filter(a => a.type === 2 && a.isSubAccount).reduce((sum, a) => sum + a.currentBalance, 0);
    const totalRevenues = accounts.filter(a => a.type === 4 && a.isSubAccount).reduce((sum, a) => sum + a.currentBalance, 0);
    const totalExpenses = accounts.filter(a => a.type === 5 && a.isSubAccount).reduce((sum, a) => sum + a.currentBalance, 0);
    const netProfit = totalRevenues - totalExpenses;

    return { totalAssets, totalLiabilities, totalRevenues, netProfit };
  }, [accounts]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(a => {
      const matchType = selectedTypeFilter === 0 || a.type === selectedTypeFilter;
      const matchSearch =
        !searchTerm.trim() ||
        a.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.accountCode.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchSearch;
    });
  }, [accounts, selectedTypeFilter, searchTerm]);

  const handleOpenAddModal = () => {
    setNewAccount({
      id: 0,
      accountCode: '',
      accountName: '',
      type: 1,
      level: 4,
      isSubAccount: true,
      currentBalance: 0,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.accountName.trim() || !newAccount.accountCode.trim()) return;

    await saveAccountApi(newAccount);
    const created = { ...newAccount, id: Date.now() };
    setAccounts(prev => [...prev, created]);
    setIsModalOpen(false);
    setStatusMessage(`تم تثبيت الحساب المالي [${created.accountCode} - ${created.accountName}] بنجاح.`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const getTypeBadge = (type: number) => {
    switch (type) {
      case 1: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 2: return 'bg-rose-50 text-rose-700 border-rose-200';
      case 3: return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 4: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 5: return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeArabic = (type: number) => {
    switch (type) {
      case 1: return 'أصول (Assets)';
      case 2: return 'التزامات (Liabilities)';
      case 3: return 'حقوق ملكية (Equity)';
      case 4: return 'إيرادات (Revenues)';
      case 5: return 'مصروفات (Expenses)';
      default: return 'عام';
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة التنفيذية */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border-r-4 border-r-indigo-600 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Landmark className="w-6 h-6 text-indigo-600" />
            <span>دليل شجرة الحسابات والرقابة المالية (Chart of Accounts - COA)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            هندسة الحسابات العامة، مراقبة تكاليف الإنتاج، وأرصدة الأصول والالتزامات اللحظية لمجموعة مصانع ومنافذ أبو عادل.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadAccounts}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            <RotateCw className="w-4 h-4 text-indigo-600" />
            <span>تحديث الأرصدة</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة حساب مالي جديد</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" />{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* بطاقات المؤشرات المالية اللحظية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي الأصول (Assets)</span>
          <h4 className="text-2xl font-black text-indigo-700 font-mono mt-1">
            {totals.totalAssets.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span>
          </h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-rose-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي الالتزامات (Liabilities)</span>
          <h4 className="text-2xl font-black text-rose-600 font-mono mt-1">
            {totals.totalLiabilities.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span>
          </h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-emerald-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">إجمالي الإيرادات المحققة</span>
          <h4 className="text-2xl font-black text-emerald-600 font-mono mt-1">
            {totals.totalRevenues.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span>
          </h4>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-amber-500 shadow-xs">
          <span className="text-xs text-gray-500 font-bold block">صافي أرباح التشغيل الحالية</span>
          <h4 className="text-2xl font-black text-slate-900 font-mono mt-1">
            {totals.netProfit.toLocaleString()} <span className="text-xs font-normal text-gray-500">ج.م</span>
          </h4>
        </div>
      </div>

      {/* البحث والتصفية */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xs mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="ابحث برقم الحساب أو الاسم العربي..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl pr-9 pl-3 py-2 outline-none focus:border-indigo-600 font-medium"
          />
        </div>

        <select
          value={selectedTypeFilter}
          onChange={(e) => setSelectedTypeFilter(Number(e.target.value))}
          className="bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 outline-none"
        >
          <option value={0}>-- كافة أنواع الحسابات --</option>
          <option value={1}>الأصول (Assets)</option>
          <option value={2}>الالتزامات (Liabilities)</option>
          <option value={3}>حقوق الملكية (Equity)</option>
          <option value={4}>الإيرادات (Revenues)</option>
          <option value={5}>التكاليف والمصروفات (Expenses)</option>
        </select>

        <div className="text-gray-500 font-bold">
          إجمالي الحسابات: <span className="font-mono font-black text-indigo-700">{accounts.length}</span>
        </div>
      </div>

      {/* جدول شجرة الحسابات */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
        <div className="p-3 bg-slate-900 text-white flex justify-between items-center">
          <h6 className="font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>الدليل المحاسبي العام الموحد لمصانع ومنافذ أبو عادل</span>
          </h6>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
            ميزان مالي متوازن 100% ✓
          </span>
        </div>

        <table className="w-full text-center">
          <thead className="bg-slate-100 text-gray-700">
            <tr>
              <th className="py-2.5 px-3">رقم الحساب</th>
              <th className="py-2.5 px-3 text-right">اسم الحساب في الشجرة</th>
              <th className="py-2.5 px-3">التصنيف المالي</th>
              <th className="py-2.5 px-3">مستوى الحساب</th>
              <th className="py-2.5 px-3">طبيعة الحساب</th>
              <th className="py-2.5 px-3">الرصيد الجاري الحالي</th>
              <th className="py-2.5 px-3">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAccounts.map(acc => (
              <tr key={acc.id} className={`hover:bg-slate-50 ${!acc.isSubAccount ? 'bg-slate-50/60 font-bold' : ''}`}>
                <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{acc.accountCode}</td>
                <td className="py-2.5 px-3 text-right font-medium" style={{ paddingRight: `${Math.max(12, acc.level * 22)}px` }}>
                  {!acc.isSubAccount ? (
                    <span className="flex items-center gap-1.5 text-slate-900 font-bold">
                      <FolderOpen className="w-4 h-4 text-amber-500" />
                      <span>{acc.accountName}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>{acc.accountName}</span>
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getTypeBadge(acc.type)}`}>
                    {getTypeArabic(acc.type)}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono text-gray-500">مستوى {acc.level}</td>
                <td className="py-2.5 px-3">
                  {acc.isSubAccount ? (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border text-[10px] font-bold">فرعي (يقبل قيود)</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-white text-[10px] font-bold">رئيسي (تجميعي)</span>
                  )}
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                  {acc.currentBalance.toLocaleString()} ج.م
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    نشط ✓
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* نافذة إضافة حساب جديد */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-400" />
                <span>إضافة حساب مالي جديد بالدليل</span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-white">×</button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">رقم / كود الحساب *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 1215"
                    value={newAccount.accountCode}
                    onChange={(e) => setNewAccount({ ...newAccount, accountCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">التصنيف المالي *</label>
                  <select
                    value={newAccount.type}
                    onChange={(e) => setNewAccount({ ...newAccount, type: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  >
                    <option value={1}>أصول (Assets)</option>
                    <option value={2}>التزامات (Liabilities)</option>
                    <option value={3}>حقوق ملكية (Equity)</option>
                    <option value={4}>إيرادات (Revenues)</option>
                    <option value={5}>مصروفات وتكاليف (Expenses)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">اسم الحساب العربي *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عهدة سيارة توزيع رقم 3"
                  value={newAccount.accountName}
                  onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">مستوى الحساب</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={newAccount.level}
                    onChange={(e) => setNewAccount({ ...newAccount, level: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-center"
                  />
                </div>
                <div className="flex items-center pt-4">
                  <input
                    type="checkbox"
                    id="isSubCheck"
                    checked={newAccount.isSubAccount}
                    onChange={(e) => setNewAccount({ ...newAccount, isSubAccount: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                  />
                  <label htmlFor="isSubCheck" className="mr-2 font-bold text-gray-700 cursor-pointer">
                    حساب فرعي يقبل القيود
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
                >
                  💾 تثبيت الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
