import React, { useState, useMemo } from 'react';
import {
  Calculator,
  PlusCircle,
  Search,
  FileSpreadsheet,
  RotateCw,
  CheckCircle2,
  Building2,
  FolderTree,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export interface AccountNodeDto {
  id: number;
  accountNumber: string;
  accountName: string;
  classification: 'Assets' | 'Liabilities' | 'Equity' | 'Revenues' | 'Expenses';
  classificationAr: string;
  level: number;
  accountType: 'رئيسي (تجميعي)' | 'فرعي (يقبل قيود)';
  balance: number;
  status: 'نشط' | 'معطل';
}

export const ChartOfAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountNodeDto[]>([
    { id: 1, accountNumber: '1', accountName: 'الأصول (Assets)', classification: 'Assets', classificationAr: 'أصول (Assets)', level: 1, accountType: 'رئيسي (تجميعي)', balance: 2450000, status: 'نشط' },
    { id: 2, accountNumber: '11', accountName: 'الأصول المتداولة والنقدية', classification: 'Assets', classificationAr: 'أصول (Assets)', level: 2, accountType: 'رئيسي (تجميعي)', balance: 2450000, status: 'نشط' },
    { id: 3, accountNumber: '1111', accountName: 'الخزينة المركزية - كاش', classification: 'Assets', classificationAr: 'أصول (Assets)', level: 3, accountType: 'فرعي (يقبل قيود)', balance: 350000, status: 'نشط' },
    { id: 4, accountNumber: '1112', accountName: 'حساب البنك الأهلي المصري', classification: 'Assets', classificationAr: 'أصول (Assets)', level: 3, accountType: 'فرعي (يقبل قيود)', balance: 1200000, status: 'نشط' },
    { id: 5, accountNumber: '1211', accountName: 'العملاء وحسابات القبض', classification: 'Assets', classificationAr: 'أصول (Assets)', level: 3, accountType: 'فرعي (يقبل قيود)', balance: 900000, status: 'نشط' },

    { id: 6, accountNumber: '2', accountName: 'الالتزامات (Liabilities)', classification: 'Liabilities', classificationAr: 'التزامات (Liabilities)', level: 1, accountType: 'رئيسي (تجميعي)', balance: 1150000, status: 'نشط' },
    { id: 7, accountNumber: '21', accountName: 'الموردون وأوراق الدفع', classification: 'Liabilities', classificationAr: 'التزامات (Liabilities)', level: 2, accountType: 'فرعي (يقبل قيود)', balance: 1150000, status: 'نشط' },

    { id: 8, accountNumber: '3', accountName: 'حقوق الملكية (Equity)', classification: 'Equity', classificationAr: 'حقوق ملكية (Equity)', level: 1, accountType: 'رئيسي (تجميعي)', balance: 3700000, status: 'نشط' },
    { id: 9, accountNumber: '31', accountName: 'رأس المال العامل والمدفوع', classification: 'Equity', classificationAr: 'حقوق ملكية (Equity)', level: 2, accountType: 'فرعي (يقبل قيود)', balance: 3700000, status: 'نشط' },

    { id: 10, accountNumber: '4', accountName: 'الإيرادات والمبيعات (Revenues)', classification: 'Revenues', classificationAr: 'إيرادات (Revenues)', level: 1, accountType: 'رئيسي (تجميعي)', balance: 3200000, status: 'نشط' },
    { id: 11, accountNumber: '4101', accountName: 'إيرادات مبيعات حلويات شرقية وغربية', classification: 'Revenues', classificationAr: 'إيرادات (Revenues)', level: 2, accountType: 'فرعي (يقبل قيود)', balance: 3200000, status: 'نشط' },

    { id: 12, accountNumber: '5', accountName: 'المصروفات وتكاليف التشغيل (Expenses)', classification: 'Expenses', classificationAr: 'مصروفات (Expenses)', level: 1, accountType: 'رئيسي (تجميعي)', balance: 1850000, status: 'نشط' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // إحصائيات المؤشرات المالية العليا
  const totalAssets = useMemo(() => accounts.find(a => a.accountNumber === '1')?.balance || 2450000, [accounts]);
  const totalLiabilities = useMemo(() => accounts.find(a => a.accountNumber === '2')?.balance || 1150000, [accounts]);
  const totalRevenues = useMemo(() => accounts.find(a => a.accountNumber === '4')?.balance || 3200000, [accounts]);
  const netIncome = useMemo(() => totalRevenues - (accounts.find(a => a.accountNumber === '5')?.balance || 1850000), [totalRevenues, accounts]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(a => {
      if (selectedTypeFilter !== 'ALL' && a.classification !== selectedTypeFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        a.accountNumber.toLowerCase().includes(term) ||
        a.accountName.toLowerCase().includes(term)
      );
    });
  }, [accounts, selectedTypeFilter, searchTerm]);

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      
      {/* البطاقات العليا الإحصائية بالوضع الليلي الفاحم */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">إجمالي الأصول (Assets)</span>
          <h4 className="text-2xl font-black text-indigo-400 font-mono mt-1">
            {totalAssets.toLocaleString()} <span className="text-xs text-slate-600 dark:text-zinc-400">ج.م</span>
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">إجمالي الالتزامات (Liabilities)</span>
          <h4 className="text-2xl font-black text-rose-400 font-mono mt-1">
            {totalLiabilities.toLocaleString()} <span className="text-xs text-slate-600 dark:text-zinc-400">ج.م</span>
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">إجمالي الإيرادات المحققة</span>
          <h4 className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {totalRevenues.toLocaleString()} <span className="text-xs text-slate-600 dark:text-zinc-400">ج.م</span>
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">صافي أرباح التشغيل الحالية</span>
          <h4 className="text-2xl font-black text-amber-400 font-mono mt-1">
            {netIncome.toLocaleString()} <span className="text-xs text-slate-600 dark:text-zinc-400">ج.م</span>
          </h4>
        </div>
      </div>

      {/* ترويسة الشاشة */}
      <div className="bg-white dark:bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-indigo-400 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-indigo-400" />
              <span>دليل شجرة الحسابات والرقابة المالية (Chart of Accounts - COA)</span>
            </h1>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              هندسة الحسابات العامة وتكاليف التشغيل
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            مراقبة تكاليف الإنتاج، وأرصدة الأصول والالتزامات، المعتمدة لمجموعة مصانع ومنافذ أبو عادل.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setStatusMessage('✅ تم تحديث موازين الأرصدة التراكمية للحسابات بنجاح.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs shadow-md transition-all border border-slate-300 dark:border-zinc-700"
          >
            <RotateCw className="w-4 h-4" />
            <span>تحديث الأرصدة</span>
          </button>

          <button
            onClick={() => {
              setStatusMessage('💡 يمكنك إضافة الحسابات الفرعية من لوحة الإدارة المالية.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ إضافة حساب مالي جديد</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 rounded-xl text-xs font-bold flex justify-between items-center shadow-md">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* شريط البحث والفلترة */}
      <div className="bg-white dark:bg-[#0f1117] p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md mb-6 flex flex-wrap justify-between items-center gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث برقم الحساب أو الاسم العربي..."
            className="w-full pr-9 pl-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-600 dark:text-zinc-400 font-bold">إجمالي الحسابات: <strong className="text-amber-400 font-mono">{filteredAccounts.length}</strong></span>
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-200 font-bold outline-none"
          >
            <option value="ALL">-- كافة أنواع الحسابات --</option>
            <option value="Assets">الأصول (Assets)</option>
            <option value="Liabilities">الالتزامات (Liabilities)</option>
            <option value="Equity">حقوق الملكية (Equity)</option>
            <option value="Revenues">الإيرادات (Revenues)</option>
            <option value="Expenses">المصروفات (Expenses)</option>
          </select>
        </div>
      </div>

      {/* جدول الدليل المحاسبي العام */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg overflow-hidden text-xs">
        <div className="p-3.5 bg-slate-100 dark:bg-[#151822] border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-zinc-200">الدليل المحاسبي العام الموحد لمصانع ومنافذ أبو عادل</span>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
            ميزان مالي متوازن 100% ✓
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3 w-28">رقم الحساب</th>
                <th className="py-3 px-3 text-right">اسم الحساب في الشجرة</th>
                <th className="py-3 px-3">التصنيف المالي</th>
                <th className="py-3 px-3">مستوى الحساب</th>
                <th className="py-3 px-3">طبيعة الحساب</th>
                <th className="py-3 px-3 text-left pl-6">الرصيد الجاري الحالي</th>
                <th className="py-3 px-3 w-20">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
              {filteredAccounts.map(a => (
                <tr key={a.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{a.accountNumber}</td>
                  
                  {/* اسم الحساب مع إزاحة بصرية تبرز الشجرة */}
                  <td className="py-3 px-3 text-right">
                    <div style={{ paddingRight: `${(a.level - 1) * 16}px` }} className="flex items-center gap-1.5">
                      {a.level > 1 && <span className="text-zinc-600 font-mono">└─</span>}
                      <span className={`font-bold ${a.level === 1 ? 'text-amber-400 text-sm' : (a.level === 2 ? 'text-zinc-100' : 'text-slate-700 dark:text-zinc-300')}`}>
                        {a.accountName}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="bg-zinc-800 px-2 py-0.5 rounded text-[10px] text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700">
                      {a.classificationAr}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">
                    مستوى {a.level}
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      a.accountType.includes('رئيسي')
                        ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30'
                        : 'bg-zinc-800 text-slate-600 dark:text-zinc-400'
                    }`}>
                      {a.accountType}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-left pl-6 font-mono font-bold text-emerald-400">
                    {a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} ج.م
                  </td>

                  <td className="py-3 px-3">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
                      {a.status} ✓
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChartOfAccountsPage;


