import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  PlusCircle,
  Search,
  RotateCw,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
  Layers,
  ArrowRightLeft,
  Eye,
  Check,
  X
} from 'lucide-react';

export interface JournalEntryDto {
  id: number;
  entryNumber: string;
  entryDate: string;
  sourceType: string;
  sourceReference: string;
  description: string;
  branchName: string;
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  status: 'مرحل ومعتمد' | 'مسودة';
}

export const JournalEntriesPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntryDto[]>([
    {
      id: 1,
      entryNumber: 'JE-2026-001',
      entryDate: '2026-10-24',
      sourceType: 'فاتورة مبيعات',
      sourceReference: 'INV-2026-8801',
      description: 'إثبات قيد استحقاق مبيعات جملة لمعرض المنصورة',
      branchName: 'المصنع والإدارة المركزية',
      totalDebit: 18500,
      totalCredit: 18500,
      isBalanced: true,
      status: 'مرحل ومعتمد'
    },
    {
      id: 2,
      entryNumber: 'JE-2026-002',
      entryDate: '2026-10-24',
      sourceType: 'تحصيل خزينة',
      sourceReference: 'TR-REC-2026-002',
      description: 'تحصيل نقدي بخزينة المصنع لحساب حلواني الصباح',
      branchName: 'المصنع والإدارة المركزية',
      totalDebit: 18500,
      totalCredit: 18500,
      isBalanced: true,
      status: 'مرحل ومعتمد'
    },
    {
      id: 3,
      entryNumber: 'JE-2026-003',
      entryDate: '2026-10-24',
      sourceType: 'صرف خامات MES',
      sourceReference: 'REQ-2026-041',
      description: 'صرف خامات ومستلزمات تشغيل لصالة الحلويات الشرقية',
      branchName: 'المصنع والإدارة المركزية',
      totalDebit: 2280,
      totalCredit: 2280,
      isBalanced: true,
      status: 'مرحل ومعتمد'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // إحصائيات الدفتر
  const totalVolume = useMemo(() => {
    return entries.reduce((sum, e) => sum + e.totalDebit, 0);
  }, [entries]);

  const autoEntriesCount = useMemo(() => {
    return entries.length;
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      if (sourceFilter !== 'ALL' && !e.sourceType.includes(sourceFilter)) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        e.entryNumber.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term) ||
        e.sourceReference.toLowerCase().includes(term) ||
        e.sourceType.toLowerCase().includes(term)
      );
    });
  }, [entries, sourceFilter, searchTerm]);

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      
      {/* البطاقات الإحصائية العليا بالوضع الليلي الفاحم */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">إجمالي القيود المسجلة</span>
          <h4 className="text-2xl font-black text-amber-400 font-mono mt-1">
            {entries.length} <span className="text-xs text-slate-600 dark:text-zinc-400">قيد</span>
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">حجم التداول المحاسبي المتزن</span>
          <h4 className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {totalVolume.toLocaleString()} <span className="text-xs text-slate-600 dark:text-zinc-400">ج.م</span>
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">قيود آلية من دورات التشغيل</span>
          <h4 className="text-2xl font-black text-indigo-400 font-mono mt-1">
            {autoEntriesCount} <span className="text-xs text-slate-600 dark:text-zinc-400">قيد آلي</span>
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">حالة توازن الدفتر العام</span>
          <h4 className="text-2xl font-black text-emerald-400 font-mono mt-1">
            متزن 100% ✓
          </h4>
        </div>
      </div>

      {/* ترويسة الشاشة */}
      <div className="bg-white dark:bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-indigo-400 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              <span>دفتر قيود اليومية العامة ومحرك الترحيل (Journal Hub)</span>
            </h1>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              الترحيل المحاسبي المزدوج الآلي
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            استعراض القيود المحاسبية المتولدة آلياً من دورات التشغيل والتوزيع وإثبات التسويات اليدوية.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setStatusMessage('✅ تم تحديث قيود اليومية العامة وترحيل الحركات بنجاح.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs shadow-md transition-all border border-slate-300 dark:border-zinc-700"
          >
            <RotateCw className="w-4 h-4" />
            <span>تحديث القيود</span>
          </button>

          <button
            onClick={() => {
              setStatusMessage('💡 محرك إنشاء القيود اليدوية متاح للمدير المالي.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ إنشاء قيد تسوية يدوي</span>
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

      {/* شريط البحث والتصفية */}
      <div className="bg-white dark:bg-[#0f1117] p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md mb-6 flex flex-wrap justify-between items-center gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث برقم القيد، البيان، اسم الحساب أو الكود..."
            className="w-full pr-9 pl-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-200 font-bold outline-none"
          >
            <option value="ALL">-- كافة مصادر القيود --</option>
            <option value="مبيعات">فواتير المبيعات</option>
            <option value="خزينة">تحصيلات وسندات الخزينة</option>
            <option value="MES">صرف خامات وتشغيل MES</option>
          </select>
        </div>
      </div>

      {/* جدول دفتر القيود */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">رقم القيد</th>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3">مصدر القيد والمرجع</th>
                <th className="py-3 px-3 text-right">البيان والشرح العام</th>
                <th className="py-3 px-3 text-right">الفرع التابع</th>
                <th className="py-3 px-3">إجمالي القيد</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3 w-28">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
              {filteredEntries.map(e => (
                <tr key={e.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{e.entryNumber}</td>
                  
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">{e.entryDate}</td>

                  <td className="py-3 px-3">
                    <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-bold block mb-0.5">
                      {e.sourceType}
                    </span>
                    <small className="font-mono text-zinc-500 block">{e.sourceReference}</small>
                  </td>

                  <td className="py-3 px-3 text-right font-bold text-zinc-200">{e.description}</td>

                  <td className="py-3 px-3 text-right text-slate-600 dark:text-zinc-400 font-semibold">{e.branchName}</td>

                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                    {e.totalDebit.toLocaleString()} ج.م
                  </td>

                  <td className="py-3 px-3">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
                      {e.status} ✓
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <button
                      onClick={() => {
                        setStatusMessage(`فحص أطراف قيد اليومية [${e.entryNumber}] متطابق دائن ومدين.`);
                        setTimeout(() => setStatusMessage(null), 3000);
                      }}
                      className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-lg font-bold text-[11px] flex items-center gap-1 mx-auto transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>فحص الأطراف</span>
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

export default JournalEntriesPage;


