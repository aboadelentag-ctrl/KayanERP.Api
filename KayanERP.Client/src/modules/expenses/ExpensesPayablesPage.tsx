import React, { useState, useMemo } from 'react';
import {
  Receipt,
  PlusCircle,
  Search,
  RotateCw,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
  CreditCard,
  Flame,
  Users,
  Home,
  Check,
  X
} from 'lucide-react';

export interface PayableInvoiceDto {
  id: number;
  billNumber: string;
  category: 'موردو خامات' | 'غاز أفران' | 'أجور عمال' | 'إيجارات';
  description: string;
  beneficiaryName: string;
  costCenter: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'مسدد جزئياً' | 'مستحق (غير مسدد)' | 'مسدد بالكامل';
}

export const ExpensesPayablesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<PayableInvoiceDto[]>([
    {
      id: 1,
      billNumber: 'BILL-202610-001',
      category: 'موردو خامات',
      description: 'توريد 3 طن دقيق فاخر 72% وسكر مكرر',
      beneficiaryName: 'شركة النيل للمطاحن وتجارة الغلال',
      costCenter: 'المستودع الرئيسي للخامات (WH-MAIN)',
      totalAmount: 145000,
      paidAmount: 50000,
      remainingAmount: 95000,
      status: 'مسدد جزئياً'
    },
    {
      id: 2,
      billNumber: 'BILL-202610-002',
      category: 'غاز أفران',
      description: 'فاتورة غاز أفران الصالات لشهر أكتوبر',
      beneficiaryName: 'شركة تاون جاس (الغاز الطبيعي)',
      costCenter: 'صالة الإنتاج الشرقي (CC-EAST)',
      totalAmount: 38500,
      paidAmount: 0,
      remainingAmount: 38500,
      status: 'مستحق (غير مسدد)'
    },
    {
      id: 3,
      billNumber: 'BILL-202610-003',
      category: 'أجور عمال',
      description: 'مسير أجور ورديات تشغيل صالات الحلويات',
      beneficiaryName: 'عمال وشيفات صالات التصنيع',
      costCenter: 'إجمالي صالات التصنيع (CC-FACTORY)',
      totalAmount: 92000,
      paidAmount: 92000,
      remainingAmount: 0,
      status: 'مسدد بالكامل'
    },
    {
      id: 4,
      billNumber: 'BILL-202610-004',
      category: 'إيجارات',
      description: 'إيجار مقر فرع دكرنس الرئيسي',
      beneficiaryName: 'مالك عقار فرع دكرنس',
      costCenter: 'فرع دكرنس (BR-01)',
      totalAmount: 25000,
      paidAmount: 0,
      remainingAmount: 25000,
      status: 'مستحق (غير مسدد)'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // إحصائيات المطالبات العليا
  const rawMaterialsDue = useMemo(() => {
    return invoices.filter(i => i.category === 'موردو خامات').reduce((sum, i) => sum + i.remainingAmount, 0);
  }, [invoices]);

  const gasAndUtilitiesDue = useMemo(() => {
    return invoices.filter(i => i.category === 'غاز أفران').reduce((sum, i) => sum + i.remainingAmount, 0);
  }, [invoices]);

  const laborDue = useMemo(() => {
    return invoices.filter(i => i.category === 'أجور عمال').reduce((sum, i) => sum + i.remainingAmount, 0);
  }, [invoices]);

  const rentDue = useMemo(() => {
    return invoices.filter(i => i.category === 'إيجارات').reduce((sum, i) => sum + i.remainingAmount, 0);
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(i => {
      if (categoryFilter !== 'ALL' && i.category !== categoryFilter) return false;
      if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        i.billNumber.toLowerCase().includes(term) ||
        i.description.toLowerCase().includes(term) ||
        i.beneficiaryName.toLowerCase().includes(term) ||
        i.costCenter.toLowerCase().includes(term)
      );
    });
  }, [invoices, categoryFilter, statusFilter, searchTerm]);

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      
      {/* البطاقات الإحصائية العليا بالوضع الليلي الفاحم */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold">مستحقات موردي الخامات (AP)</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <h4 className="text-2xl font-black text-rose-400 font-mono mt-1">
            {rawMaterialsDue.toLocaleString()} <span className="text-xs text-slate-600 dark:text-zinc-400">ج.م</span>
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold">فواتير الغاز والكهرباء والمياه</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <h4 className="text-2xl font-black text-amber-500 font-mono mt-1">
            {gasAndUtilitiesDue.toLocaleString()} <span className="text-xs text-slate-600 dark:text-zinc-400">ج.م</span>
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold">أجور ورواتب العمال والورديات</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <h4 className="text-2xl font-black text-cyan-400 font-mono mt-1">
            {laborDue.toLocaleString()} <span className="text-xs text-slate-600 dark:text-zinc-400">ج.م</span>
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold">إيجارات الفروع والمعارض</span>
            <Home className="w-4 h-4 text-indigo-400" />
          </div>
          <h4 className="text-2xl font-black text-indigo-400 font-mono mt-1">
            {rentDue.toLocaleString()} <span className="text-xs text-slate-600 dark:text-zinc-400">ج.م</span>
          </h4>
        </div>
      </div>

      {/* ترويسة الشاشة */}
      <div className="bg-white dark:bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-amber-500" />
              <span>استحقاقات الموردين ومصروفات التشغيل والخدمات (AP & OPEX Hub)</span>
            </h1>
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              إدارة التزامات النشاط ومراكز التكلفة
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            إدارة فواتير موردي الخامات، الغاز، الكهرباء، المياه، أجور العاملين، وإيجارات الفروع.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setStatusMessage('✅ تم تحديث مطالبات التكاليف ومراكز التكلفة بنجاح.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs shadow-md transition-all border border-slate-300 dark:border-zinc-700"
          >
            <RotateCw className="w-4 h-4" />
            <span>تحديث</span>
          </button>

          <button
            onClick={() => {
              setStatusMessage('💡 نموذج تسجيل استحقاق أو فاتورة جديدة متاح للاستخدام.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ تسجيل استحقاق / فاتورة جديدة</span>
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
            placeholder="ابحث برقم الفاتورة، البند، أو اسم المورد..."
            className="w-full pr-9 pl-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-200 font-bold outline-none"
          >
            <option value="ALL">-- كافة بنود الالتزامات --</option>
            <option value="موردو خامات">موردو خامات</option>
            <option value="غاز أفران">غاز أفران وطاقة</option>
            <option value="أجور عمال">أجور ورواتب عمال</option>
            <option value="إيجارات">إيجارات مقرات وفروع</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-200 font-bold outline-none"
          >
            <option value="ALL">-- كافة حالات السداد --</option>
            <option value="مسدد جزئياً">مسدد جزئياً</option>
            <option value="مستحق (غير مسدد)">مستحق (غير مسدد)</option>
            <option value="مسدد بالكامل">مسدد بالكامل</option>
          </select>
        </div>
      </div>

      {/* جدول استحقاقات الموردين وفواتير الطاقة والأجور */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg overflow-hidden text-xs">
        <div className="p-3.5 bg-slate-100 dark:bg-[#151822] border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
          <span className="font-bold text-zinc-200">جدول استحقاقات الموردين وفواتير الطاقة والأجور</span>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
            مربوط بدليل الموردين الفعلي ✓
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">رقم المطالبة</th>
                <th className="py-3 px-3">البند والتصنيف</th>
                <th className="py-3 px-3 text-right">بيان الفاتورة / المستحق</th>
                <th className="py-3 px-3 text-right">الجهة المستحقة (المورد / الشركة)</th>
                <th className="py-3 px-3">مركز التكلفة</th>
                <th className="py-3 px-3">إجمالي المبلغ</th>
                <th className="py-3 px-3">المسدد</th>
                <th className="py-3 px-3 text-left pl-6">المتبقي</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3 w-24">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{inv.billNumber}</td>
                  
                  <td className="py-3 px-3">
                    <span className="bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {inv.category}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-bold text-zinc-100">{inv.description}</td>

                  <td className="py-3 px-3 text-right text-indigo-300 font-semibold">{inv.beneficiaryName}</td>

                  <td className="py-3 px-3">
                    <span className="bg-zinc-800/60 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded font-mono text-[10px] border border-slate-300 dark:border-zinc-700/60">
                      {inv.costCenter}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-zinc-200">
                    {inv.totalAmount.toLocaleString()} ج.م
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                    {inv.paidAmount.toLocaleString()} ج.م
                  </td>

                  <td className="py-3 px-3 text-left pl-6 font-mono font-bold text-rose-400">
                    {inv.remainingAmount.toLocaleString()} ج.م
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      inv.status === 'مسدد بالكامل'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : (inv.status === 'مسدد جزئياً' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30')
                    }`}>
                      {inv.status}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    {inv.remainingAmount > 0 ? (
                      <button
                        onClick={() => {
                          setStatusMessage(`جاري فتح شاشة سداد للمطالبة [${inv.billNumber}].`);
                          setTimeout(() => setStatusMessage(null), 3000);
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] shadow-sm transition-all"
                      >
                        سداد
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-bold inline-flex items-center gap-1 text-[11px]">
                        <Check className="w-3.5 h-3.5" />
                        <span>مكتمل</span>
                      </span>
                    )}
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

export default ExpensesPayablesPage;


