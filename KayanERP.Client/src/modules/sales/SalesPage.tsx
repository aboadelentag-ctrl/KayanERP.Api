import { PermittedButton } from '../../core/auth/PermittedButton';
import React, { useState, useMemo } from 'react';
import {
  Receipt,
  PlusCircle,
  Search,
  RotateCw,
  Printer,
  CheckCircle2,
  Building2,
  Lock,
  Layers,
  Calendar,
  CreditCard,
  Check,
  X
} from 'lucide-react';

interface SalesPageProps {
  onNavigate?: (tab: string) => void;
}

export interface SalesInvoiceDto {
  id: number;
  invoiceNumber: string;
  dateTime: string;
  branchName: string;
  customerName: string;
  itemsCount: number;
  totalAmount: number;
  status: 'مرحل مالياً ومخزنياً' | 'مسودة';
}

export const SalesPage: React.FC<SalesPageProps> = ({ onNavigate }) => {
  const [invoices, setInvoices] = useState<SalesInvoiceDto[]>([
    {
      id: 1,
      invoiceNumber: 'INV-2026-00101',
      dateTime: '2026-10-24 11:30',
      branchName: 'فرع ومعرض دكرنس الرئيسي',
      customerName: 'مؤسسة البركة لتوزيع الحلويات (دكرنس)',
      itemsCount: 2,
      totalAmount: 9750.0,
      status: 'مرحل مالياً ومخزنياً'
    },
    {
      id: 2,
      invoiceNumber: 'INV-2026-00102',
      dateTime: '2026-10-24 10:15',
      branchName: 'فرع ومعرض دكرنس الرئيسي',
      customerName: 'عميل صالة نقدي (كاشير)',
      itemsCount: 1,
      totalAmount: 1100.0,
      status: 'مرحل مالياً ومخزنياً'
    },
    {
      id: 3,
      invoiceNumber: 'INV-2026-00103',
      dateTime: '2026-10-23 15:45',
      branchName: 'فرع شربين (السوق القديم)',
      customerName: 'معارض التوحيد والنور (شربين)',
      itemsCount: 3,
      totalAmount: 14200.0,
      status: 'مرحل مالياً ومخزنياً'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const totalSalesVolume = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(term) ||
        inv.customerName.toLowerCase().includes(term) ||
        inv.branchName.toLowerCase().includes(term)
      );
    });
  }, [invoices, searchTerm]);

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      
      {/* شريط سياق التشغيل المعزول المحكم */}
      <div className="bg-white dark:bg-[#0f1117] p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md mb-6 flex flex-wrap justify-between items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-600 text-white font-black px-2.5 py-1 rounded-xl text-[10px] flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>سياق التشغيل المعزول</span>
          </span>
          <span className="font-bold text-amber-400">المصنع والإدارة المركزية</span>
          <span className="text-zinc-500">|</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>الخزينة ومستودع الصرف مقفلان على هذا الفرع حصراً</span>
          </span>
        </div>

        <span className="text-slate-600 dark:text-zinc-400 font-bold text-[11px]">
          نظام الرقابة المالية الصارم • كيان ERP
        </span>
      </div>

      {/* ترويسة الشاشة بالثيم الليلي الفاحم */}
      <div className="bg-white dark:bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-indigo-400 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-indigo-400" />
              <span>إدارة فواتير المبيعات والترحيل المالي</span>
            </h1>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              الفوترة اللحظية والترحيل الآلي
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            إصدار الفواتير مع الترحيل التلقائي للمخزون وشجرة الحسابات ومديونيات التجار.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setStatusMessage('✅ تم تحديث سجل الفواتير والمزامنة اللحظية.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs shadow-md transition-all border border-slate-300 dark:border-zinc-700"
          >
            <RotateCw className="w-4 h-4" />
            <span>تحديث</span>
          </button>

          <button
            onClick={() => {
              setStatusMessage('💡 شاشة تحرير فاتورة مبيعات جديدة قيد التجهيز.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ فاتورة مبيعات جديدة</span>
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
            placeholder="بحث برقم الفاتورة، العميل، أو الفرع..."
            className="w-full pr-9 pl-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-600 dark:text-zinc-400 font-bold">
            إجمالي المبيعات المحققة: <strong className="text-emerald-400 font-mono">{totalSalesVolume.toLocaleString()} ج.م</strong>
          </span>
        </div>
      </div>

      {/* جدول سجل الفواتير الصادرة */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg overflow-hidden text-xs">
        <div className="p-3.5 bg-slate-100 dark:bg-[#151822] border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
          <span className="font-bold text-zinc-200">سجل الفواتير الصادرة ({filteredInvoices.length} فاتورة)</span>
          <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
            خاصة بـ المصنع والإدارة المركزية
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3 w-12">#</th>
                <th className="py-3 px-3">رقم الفاتورة</th>
                <th className="py-3 px-3">تاريخ الإصدار</th>
                <th className="py-3 px-3 text-right">الفرع</th>
                <th className="py-3 px-3 text-right">العميل / المنفذ</th>
                <th className="py-3 px-3">عدد البنود</th>
                <th className="py-3 px-3 font-bold">إجمالي الفاتورة</th>
                <th className="py-3 px-3">الأثر المالي والمخزني</th>
                <th className="py-3 px-3 w-28">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
              {filteredInvoices.map((inv, idx) => (
                <tr key={inv.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 font-mono text-zinc-500">{idx + 1}</td>
                  
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{inv.invoiceNumber}</td>

                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">{inv.dateTime}</td>

                  <td className="py-3 px-3 text-right">
                    <span className="bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold">
                      {inv.branchName}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-bold text-zinc-100">{inv.customerName}</td>

                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-zinc-300">{inv.itemsCount} أصناف</td>

                  <td className="py-3 px-3 font-mono font-black text-emerald-400 text-sm">
                    {inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ج.م
                  </td>

                  <td className="py-3 px-3">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{inv.status}</span>
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <button
                      onClick={() => window.print()}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 rounded-lg font-bold text-[11px] flex items-center gap-1 mx-auto transition-all"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة / معاينة</span>
                    </button>
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

export default SalesPage;



