import React, { useState, useMemo } from 'react';
import {
  Wallet,
  PlusCircle,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Building2,
  FileText,
  RotateCw,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  TrendingUp,
  X
} from 'lucide-react';

export interface TreasuryVoucherDto {
  id: number;
  voucherNumber: string;
  type: 'صرف' | 'قبض';
  date: string;
  treasuryName: string;
  beneficiaryName: string;
  beneficiaryType: 'مورد' | 'عميل' | 'مصروفات تشغيل' | 'عهدة';
  description: string;
  paymentMethod: string;
  amount: number;
  status: 'معتمد ومرحل' | 'مسودة';
}

export const TreasuryVouchersPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<TreasuryVoucherDto[]>([
    {
      id: 1,
      voucherNumber: 'TR-PAY-2026-001',
      type: 'صرف',
      date: '2026-10-24',
      treasuryName: 'الخزينة الرئيسية - المصنع',
      beneficiaryName: 'شركة السكر والصناعات التكاملية',
      beneficiaryType: 'مورد',
      description: 'سداد دفعة نقدية تحت حساب فاتورة توريد سكر رقم SUP-9941',
      paymentMethod: 'نقدي',
      amount: 45000,
      status: 'معتمد ومرحل'
    },
    {
      id: 2,
      voucherNumber: 'TR-REC-2026-002',
      type: 'قبض',
      date: '2026-10-24',
      treasuryName: 'الخزينة الرئيسية - المصنع',
      beneficiaryName: 'حلواني الصباح (سوق الجملة)',
      beneficiaryType: 'عميل',
      description: 'تحصيل توريد مشكل شرقي لحساب اليوم',
      paymentMethod: 'نقدي',
      amount: 18500,
      status: 'معتمد ومرحل'
    },
    {
      id: 3,
      voucherNumber: 'TR-PAY-2026-003',
      type: 'صرف',
      date: '2026-10-23',
      treasuryName: 'عهدة الصيانة والمصروفات النثرية',
      beneficiaryName: 'شراء قطع غيار عاجلة لصمامات الفرن',
      beneficiaryType: 'مصروفات تشغيل',
      description: 'مصروف طارئ صيانة أفران الصالة الشرقية',
      paymentMethod: 'نقدي',
      amount: 3200,
      status: 'معتمد ومرحل'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'صرف' | 'قبض'>('ALL');
  const [treasuryFilter, setTreasuryFilter] = useState('ALL');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // إحصائيات السيولة
  const totalReceipts = useMemo(() => {
    return vouchers.filter(v => v.type === 'قبض').reduce((sum, v) => sum + v.amount, 0);
  }, [vouchers]);

  const totalPayments = useMemo(() => {
    return vouchers.filter(v => v.type === 'صرف').reduce((sum, v) => sum + v.amount, 0);
  }, [vouchers]);

  const netCashFlow = totalReceipts - totalPayments;

  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      if (typeFilter !== 'ALL' && v.type !== typeFilter) return false;
      if (treasuryFilter !== 'ALL' && !v.treasuryName.includes(treasuryFilter)) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        v.voucherNumber.toLowerCase().includes(term) ||
        v.beneficiaryName.toLowerCase().includes(term) ||
        v.description.toLowerCase().includes(term) ||
        v.treasuryName.toLowerCase().includes(term)
      );
    });
  }, [vouchers, typeFilter, treasuryFilter, searchTerm]);

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      
      {/* البطاقات الإحصائية العليا */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        
        {/* إجمالي المقبوضات */}
        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold">إجمالي المقبوضات والتحصيلات</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <h4 className="text-2xl font-black text-emerald-400 font-mono mt-1">
            +{totalReceipts.toLocaleString()} <span className="text-xs text-slate-600 dark:text-zinc-400">ج.م</span>
          </h4>
        </div>

        {/* إجمالي المدفوعات */}
        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold">إجمالي المدفوعات وسداد الموردين</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <h4 className="text-2xl font-black text-rose-400 font-mono mt-1">
            -{totalPayments.toLocaleString()} <span className="text-xs text-slate-600 dark:text-zinc-400">ج.م</span>
          </h4>
        </div>

        {/* صافي حركة السيولة اللحظية */}
        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold">صافي حركة السيولة اللحظية</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <h4 className={`text-2xl font-black font-mono mt-1 ${netCashFlow >= 0 ? 'text-emerald-400' : 'text-indigo-400'}`}>
            {netCashFlow.toLocaleString()} <span className="text-xs text-slate-600 dark:text-zinc-400">ج.م</span>
          </h4>
        </div>
      </div>

      {/* ترويسة الشاشة */}
      <div className="bg-white dark:bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Wallet className="w-6 h-6 text-amber-500" />
              <span>حركة الخزينة وسندات القبض والصرف (Treasury & Cash Flow)</span>
            </h1>
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              الرقابة النقدية وسداد الموردين
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            إثبات سندات الصرف وسداد دفعات الموردين، تحصيل النقدية، وتسوية العهد اليومية مع القيود المحاسبية.
          </p>
        </div>

        <button
          onClick={() => {
            setStatusMessage('💡 نموذج تحرير سند خزينة جديد قيد الربط مع القيود المزدوجة.');
            setTimeout(() => setStatusMessage(null), 3500);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ تحرير سند خزينة جديد</span>
        </button>
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
            placeholder="بحث برقم السند، اسم المستفيد، البيان..."
            className="w-full pr-9 pl-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-200 font-bold outline-none"
          >
            <option value="ALL">-- كل أنواع السندات --</option>
            <option value="صرف">سندات صرف</option>
            <option value="قبض">سندات قبض</option>
          </select>

          <select
            value={treasuryFilter}
            onChange={(e) => setTreasuryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-200 font-bold outline-none"
          >
            <option value="ALL">-- كافة الخزائن والعهد --</option>
            <option value="الرئيسية">الخزينة الرئيسية</option>
            <option value="عهدة">عهد المصروفات والصيانة</option>
          </select>
        </div>
      </div>

      {/* جدول سندات الخزينة */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">رقم السند</th>
                <th className="py-3 px-3">النوع</th>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3 text-right">الخزينة</th>
                <th className="py-3 px-3 text-right">المستفيد / الجهة</th>
                <th className="py-3 px-3 text-right">البيان والشرح</th>
                <th className="py-3 px-3">طريقة الدفع</th>
                <th className="py-3 px-3 text-left pl-6">المبلغ</th>
                <th className="py-3 px-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
              {filteredVouchers.map(v => (
                <tr key={v.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{v.voucherNumber}</td>
                  
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      v.type === 'صرف'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {v.type === 'صرف' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                      <span>{v.type}</span>
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">{v.date}</td>
                  
                  <td className="py-3 px-3 text-right text-slate-700 dark:text-zinc-300 font-semibold">{v.treasuryName}</td>

                  <td className="py-3 px-3 text-right">
                    <span className="font-bold text-zinc-100 block">{v.beneficiaryName}</span>
                    <small className="text-zinc-500">{v.beneficiaryType}</small>
                  </td>

                  <td className="py-3 px-3 text-right text-slate-600 dark:text-zinc-400 max-w-xs truncate">{v.description}</td>

                  <td className="py-3 px-3 text-slate-700 dark:text-zinc-300">{v.paymentMethod}</td>

                  <td className={`py-3 px-3 text-left pl-6 font-mono font-bold text-sm ${
                    v.type === 'صرف' ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    {v.type === 'صرف' ? '-' : '+'}{v.amount.toLocaleString()} ج.م
                  </td>

                  <td className="py-3 px-3">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
                      {v.status} ✓
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

export default TreasuryVouchersPage;


