import React, { useState } from 'react';
import {
  FileSpreadsheet,
  RotateCw,
  Search,
  Calendar,
  Layers,
  ArrowRightLeft,
  Boxes,
  Building2,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Package
} from 'lucide-react';

interface StockCardPageProps {
  onNavigate?: (tab: string) => void;
}

export interface StockMovementDto {
  id: number;
  dateTime: string;
  movementType: string;
  badgeColor: string;
  location: string;
  batchNumber: string;
  expiryDate: string;
  inQty: number | null;
  outQty: number | null;
  balanceAfter: number;
  statement: string;
}

export const StockCardPage: React.FC<StockCardPageProps> = ({ onNavigate }) => {
  const [selectedItem, setSelectedItem] = useState('RAW-FLOUR-72');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [fromDate, setFromDate] = useState('2026-10-01');
  const [toDate, setToDate] = useState('2026-10-26');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const initialBalance = 12000;
  const totalIn = 25000;
  const totalOut = 18450;
  const currentBalance = 18550;

  const [movements] = useState<StockMovementDto[]>([
    {
      id: 1,
      dateTime: '2026-10-20 09:15',
      movementType: 'توريد مشتريات (خامات)',
      badgeColor: 'emerald',
      location: 'مستودع الخامات المركزي (المصنع)',
      batchNumber: 'LOT-2026-FL-90',
      expiryDate: '2027-04-20',
      inQty: 25000,
      outQty: null,
      balanceAfter: 37000,
      statement: 'إذن توريد رقم 14-2026-PO من شركة مطاحن الدلتا معتمد بشهادة فحص COA'
    },
    {
      id: 2,
      dateTime: '2026-10-21 11:30',
      movementType: 'سحب عينات فحص الجودة',
      badgeColor: 'amber',
      location: 'مستودع الخامات المركزي (معمل الجودة)',
      batchNumber: 'LOT-2026-FL-90',
      expiryDate: '2027-04-20',
      inQty: null,
      outQty: 50,
      balanceAfter: 36950,
      statement: 'سحب عينات الفحص المعملي للرطوبة ونقاء الجلوتين'
    },
    {
      id: 3,
      dateTime: '2026-10-22 08:00',
      movementType: 'صرف خامات لصالة التشغيل',
      badgeColor: 'indigo',
      location: 'صالة تصنيع الحلويات الشرقية (المصنع)',
      batchNumber: 'LOT-2026-FL-90',
      expiryDate: '2027-04-20',
      inQty: null,
      outQty: 12400,
      balanceAfter: 24550,
      statement: 'صرف خامات بناءً على أمر تشغيل رقم 88-2026-MO لوردية خبز البسبوسة والكنافة'
    },
    {
      id: 4,
      dateTime: '2026-10-23 14:00',
      movementType: 'صرف خامات لصالة التشغيل',
      badgeColor: 'indigo',
      location: 'صالة تصنيع الحلويات الشرقية (المصنع)',
      batchNumber: 'LOT-2026-FL-90',
      expiryDate: '2027-04-20',
      inQty: null,
      outQty: 6000,
      balanceAfter: 18550,
      statement: 'صرف استكمال خامات وردية المساء لصواني الرواني والمشبك'
    }
  ]);

  const exportToExcel = () => {
    let csv = 'التاريخ_الوقت,نوع_الحركة,المستودع,التشغيلة_اللوط,تاريخ_الصلاحية,وارد,منصرف,الرصيد_بعد_الحركة,البيان\n';
    movements.forEach(m => {
      csv += `"${m.dateTime}","${m.movementType}","${m.location}","${m.batchNumber}","${m.expiryDate}",${m.inQty || 0},${m.outQty || 0},${m.balanceAfter},"${m.statement}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `كارت_الصنف_${selectedItem}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-slate-800 dark:text-zinc-100 transition-colors" dir="rtl">
      
      {/* البطاقات الأربع للمؤشرات والموازين المخزنية المتناسقة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* رصيد أول المدة */}
        <div className="bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm transition-all text-center">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
            رصيد أول المدة
          </span>
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-black font-mono text-slate-600 dark:text-zinc-400">
              {initialBalance.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">كجم</span>
          </div>
        </div>

        {/* إجمالي الوارد */}
        <div className="bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm transition-all text-center">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
            إجمالي الوارد (+)
          </span>
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              +{totalIn.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">كجم</span>
          </div>
        </div>

        {/* إجمالي المنصرف */}
        <div className="bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm transition-all text-center">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 block mb-1">
            إجمالي المنصرف (-)
          </span>
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
              -{totalOut.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">كجم</span>
          </div>
        </div>

        {/* رصيد آخر المدة (الرصيد الفعلي الحالي) */}
        <div className="bg-white dark:bg-[#0f1117] border-2 border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-4 shadow-sm transition-all text-center">
          <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 block mb-1">
            رصيد آخر المدة (الرصيد الفعلي الحالي)
          </span>
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
              {currentBalance.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400">كجم</span>
          </div>
        </div>

      </div>

      {/* شريط الإجراءات وترويسة كارت الصنف */}
      <div className="bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm mb-6 flex flex-wrap justify-between items-center gap-4 transition-all">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900 dark:text-zinc-100">
                كارت الصنف وسجل الحركات المخزنية اللحظي (Stock Card)
              </h1>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30">
                التتبع اللوجستي التراكمي
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
              كشف حساب تفصيلي لحركة الصنف، الرصيد التراكمي، وتتبع اللوطات والصلاحيات عبر الفروع وصالات التشغيل.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setStatusMessage('✅ تم تحديث كشف حركة الصنف والرصيد التراكمي بنجاح.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-xs transition-all border border-slate-200 dark:border-zinc-700 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>إعادة تحميل</span>
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>تصدير كشف الحركة (Excel)</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold flex justify-between items-center shadow-sm">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* شريط الفلاتر والبحث عالي التناسق والتباين */}
      <div className="bg-white dark:bg-[#0f1117] border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-12 gap-3 text-xs items-end transition-all">
        
        {/* اختيار الصنف */}
        <div className="md:col-span-4">
          <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">
            اختر الصنف <span className="text-rose-500">*</span>
          </label>
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 font-bold outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="RAW-FLOUR-72">دقيق فاخر استخراج 72% (RAW-FLOUR-72) - [خامات ومواد أولية]</option>
            <option value="RAW-SUGAR-01">سكر أبيض ناعم مكرر (RAW-SUGAR-01) - [خامات]</option>
            <option value="RAW-GHEE-01">سمن بلدي بقري طبيعي (RAW-GHEE-01) - [خامات]</option>
            <option value="PRD-BAS-01">صواني بسبوسة سادة فاخرة (PRD-BAS-01) - [منتج تام]</option>
          </select>
        </div>

        {/* المستودع / الفرع */}
        <div className="md:col-span-3">
          <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">
            المستودع / الفرع
          </label>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 font-semibold outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="ALL">كافة المستودعات والفروع وصالات التشغيل</option>
            <option value="FACTORY">مستودع الخامات المركزي (المصنع)</option>
            <option value="EAST-HALL">صالة تصنيع الحلويات الشرقية</option>
            <option value="DKR-SHOW">مستودع معرض دكرنس</option>
          </select>
        </div>

        {/* من تاريخ */}
        <div className="md:col-span-2">
          <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">
            من تاريخ
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 font-mono outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* إلى تاريخ */}
        <div className="md:col-span-2">
          <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">
            إلى تاريخ
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 font-mono outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* زر العرض */}
        <div className="md:col-span-1">
          <button
            onClick={() => {
              setStatusMessage('تم تحديث نطاق البحث واسترجاع الحركات.');
              setTimeout(() => setStatusMessage(null), 2500);
            }}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-sm transition-all cursor-pointer text-center"
          >
            عرض
          </button>
        </div>

      </div>

      {/* جدول كشف حركات الصنف المتناسق تماماً */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm dark:shadow-lg overflow-hidden text-xs transition-all">
        
        {/* شريط عنوان الجدول المنسجم (رمادي هادئ بالنهار وفاحم بالليل) */}
        <div className="p-3.5 bg-slate-100 dark:bg-[#151822] border-b border-slate-200 dark:border-zinc-800 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-zinc-100 text-sm">
              حركات الصنف: <strong className="text-indigo-600 dark:text-amber-400">دقيق فاخر استخراج 72% (RAW-FLOUR-72)</strong>
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
            التصنيف: خامات ومواد أولية
          </span>
        </div>

        {/* محتوى الجدول */}
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-[#171a24] text-slate-700 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 font-bold">
              <tr>
                <th className="py-3 px-3">التاريخ والوقت</th>
                <th className="py-3 px-3 text-right">نوع الحركة المخزنية</th>
                <th className="py-3 px-3 text-right">المستودع / الصالة</th>
                <th className="py-3 px-3 font-mono">التشغيلة (اللوط)</th>
                <th className="py-3 px-3 font-mono">تاريخ الصلاحية</th>
                <th className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">وارد (+)</th>
                <th className="py-3 px-3 font-bold text-rose-600 dark:text-rose-400">منصرف (-)</th>
                <th className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">الرصيد بعد الحركة</th>
                <th className="py-3 px-3 text-right">البيان والملاحظات المرجعية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-slate-700 dark:text-zinc-300">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-500 dark:text-zinc-400 text-[11px]">{m.dateTime}</td>

                  <td className="py-3 px-3 text-right">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      m.badgeColor === 'emerald'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                        : (m.badgeColor === 'amber'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30')
                    }`}>
                      {m.movementType}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right text-slate-800 dark:text-zinc-300 font-semibold">{m.location}</td>

                  <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400 text-[11px]">{m.batchNumber}</td>

                  <td className="py-3 px-3 font-mono text-slate-500 dark:text-zinc-400 text-[11px]">{m.expiryDate}</td>

                  <td className="py-3 px-3 font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {m.inQty ? `+${m.inQty.toLocaleString()}` : <span className="text-slate-300 dark:text-zinc-600 font-normal">---</span>}
                  </td>

                  <td className="py-3 px-3 font-mono font-black text-rose-600 dark:text-rose-400">
                    {m.outQty ? `-${m.outQty.toLocaleString()}` : <span className="text-slate-300 dark:text-zinc-600 font-normal">---</span>}
                  </td>

                  <td className="py-3 px-3 font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">
                    {m.balanceAfter.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-right text-slate-600 dark:text-zinc-400 max-w-sm truncate text-[11px]">
                    {m.statement}
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

export default StockCardPage;
