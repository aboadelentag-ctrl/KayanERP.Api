import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  RotateCw,
  Search,
  Calendar,
  Building2,
  Package,
  Layers,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface StockCardPageProps {
  onNavigate?: (tab: string) => void;
}

export interface StockMovementDto {
  id: number;
  dateTime: string;
  movementType: 'توريد مشتريات (خامات)' | 'سحب عينات فحص الجودة' | 'صرف خامات لصالة التشغيل' | 'مرتجع تشغيل';
  departmentWarehouse: string;
  batchNumber: string;
  expiryDate: string;
  inQuantity: number;
  outQuantity: number;
  balanceAfter: number;
  notes: string;
}

export const StockCardPage: React.FC<StockCardPageProps> = ({ onNavigate }) => {
  const [selectedItemId, setSelectedItemId] = useState<number>(101);
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const itemsList = [
    { id: 101, code: 'RAW-FLOUR-72', name: 'دقيق فاخر استخراج 72%', category: 'خامات ومواد أولية', unit: 'كجم', openingBalance: 12000 },
    { id: 102, code: 'RAW-SUGAR-01', name: 'سكر مكرر ناعم فاخر', category: 'خامات ومواد أولية', unit: 'كجم', openingBalance: 8500 },
    { id: 103, code: 'RAW-BUTTER-02', name: 'سمن بلدي بقري طبيعي', category: 'خامات ومواد أولية', unit: 'كجم', openingBalance: 3200 }
  ];

  const currentItem = useMemo(() => {
    return itemsList.find(i => i.id === selectedItemId) || itemsList[0];
  }, [selectedItemId]);

  const [movements, setMovements] = useState<StockMovementDto[]>([
    {
      id: 1,
      dateTime: '2026-10-20 09:15',
      movementType: 'توريد مشتريات (خامات)',
      departmentWarehouse: 'مستودع الخامات المركزي (المصنع)',
      batchNumber: 'LOT-2026-FL-90',
      expiryDate: '2027-04-20',
      inQuantity: 25000,
      outQuantity: 0,
      balanceAfter: 37000,
      notes: 'إذن توريد رقم 14-2026-PO من شركة مطاحن الدلتا معتمد بشهادة فحص COA'
    },
    {
      id: 2,
      dateTime: '2026-10-21 11:30',
      movementType: 'سحب عينات فحص الجودة',
      departmentWarehouse: 'مستودع الخامات المركزي (معمل الجودة)',
      batchNumber: 'LOT-2026-FL-90',
      expiryDate: '2027-04-20',
      inQuantity: 0,
      outQuantity: 50,
      balanceAfter: 36950,
      notes: 'سحب عينات الفحص المعملي للرطوبة ونقاء الجلوتين'
    },
    {
      id: 3,
      dateTime: '2026-10-22 08:00',
      movementType: 'صرف خامات لصالة التشغيل',
      departmentWarehouse: 'صالة تصنيع الحلويات الشرقية (المصنع)',
      batchNumber: 'LOT-2026-FL-90',
      expiryDate: '2027-04-20',
      inQuantity: 0,
      outQuantity: 12400,
      balanceAfter: 24550,
      notes: 'صرف خامات بناءً على أمر تشغيل رقم 88-2026-MO لوردية خبز البسبوسة والكنافة'
    },
    {
      id: 4,
      dateTime: '2026-10-23 14:00',
      movementType: 'صرف خامات لصالة التشغيل',
      departmentWarehouse: 'صالة تصنيع الحلويات الشرقية (المصنع)',
      batchNumber: 'LOT-2026-FL-90',
      expiryDate: '2027-04-20',
      inQuantity: 0,
      outQuantity: 6000,
      balanceAfter: 18550,
      notes: 'صرف استكمال خامات وردية المساء لصواني الرواني والمشبك'
    }
  ]);

  const totalIn = useMemo(() => movements.reduce((sum, m) => sum + m.inQuantity, 0), [movements]);
  const totalOut = useMemo(() => movements.reduce((sum, m) => sum + m.outQuantity, 0), [movements]);
  const currentStock = currentItem.openingBalance + totalIn - totalOut;

  const exportToExcel = () => {
    let csv = 'التاريخ_والوقت,نوع_الحركة,المستودع_الصالة,رقم_اللوط,تاريخ_الصلاحية,وارد,منصرف,الرصيد_بعد_الحركة,البيان_والملاحظات\n';
    movements.forEach(m => {
      csv += `"${m.dateTime}","${m.movementType}","${m.departmentWarehouse}","${m.batchNumber}","${m.expiryDate}",${m.inQuantity},${m.outQuantity},${m.balanceAfter},"${m.notes}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `كارت_الصنف_${currentItem.code}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      
      {/* البطاقات الإحصائية العليا بالوضع الليلي الفاحم */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">رصيد أول المدة</span>
          <h4 className="text-2xl font-black text-slate-700 dark:text-zinc-300 font-mono mt-1">
            {currentItem.openingBalance.toLocaleString()} <span className="text-xs text-zinc-500">{currentItem.unit}</span>
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">إجمالي الوارد (+)</span>
          <h4 className="text-2xl font-black text-emerald-400 font-mono mt-1">
            +{totalIn.toLocaleString()} <span className="text-xs text-zinc-500">{currentItem.unit}</span>
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">إجمالي المنصرف (-)</span>
          <h4 className="text-2xl font-black text-rose-400 font-mono mt-1">
            -{totalOut.toLocaleString()} <span className="text-xs text-zinc-500">{currentItem.unit}</span>
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md">
          <span className="text-[11px] text-slate-600 dark:text-zinc-400 font-bold block">رصيد آخر المدة (الرصيد الفعلي الحالي)</span>
          <h4 className="text-2xl font-black text-indigo-400 font-mono mt-1">
            {currentStock.toLocaleString()} <span className="text-xs text-zinc-500">{currentItem.unit}</span>
          </h4>
        </div>
      </div>

      {/* ترويسة الشاشة */}
      <div className="bg-white dark:bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-indigo-400 flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-400" />
              <span>كارت الصنف وسجل الحركات المخزنية اللحظي (Stock Card)</span>
            </h1>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              التتبع اللوجستي التراكمي
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            كشف حساب تفصيلي لحركة الصنف، الرصيد التراكمي، وتتبع اللوطات والصلاحيات عبر الفروع وصالات التشغيل.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setStatusMessage('✅ تم تحديث كارت الصنف والأرصدة المخزنية بنجاح.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs shadow-md transition-all border border-slate-300 dark:border-zinc-700"
          >
            <RotateCw className="w-4 h-4" />
            <span>إعادة تحميل</span>
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير كشف الحركة (Excel)</span>
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

      {/* شريط اختيار الصنف والفلاتر */}
      <div className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md mb-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          
          <div className="md:col-span-5">
            <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">اختر الصنف *</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#171922] border border-indigo-500/50 rounded-xl font-bold text-zinc-100 outline-none"
            >
              {itemsList.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.code}) - [{item.category}]
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-slate-700 dark:text-zinc-300 font-bold mb-1">المستودع / الفرع</label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl font-bold text-zinc-100 outline-none"
            >
              <option value="ALL">كافة المستودعات والفروع وصالات التشغيل</option>
              <option value="MAIN">المستودع الرئيسي للخامات (WH-MAIN)</option>
              <option value="EAST">صالة تصنيع الحلويات الشرقية</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">من تاريخ</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 dark:text-zinc-400 mb-1">إلى تاريخ</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <button
              onClick={() => {
                setStatusMessage('تم تطبيق شروط البحث على كارت الصنف.');
                setTimeout(() => setStatusMessage(null), 2500);
              }}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all text-center"
            >
              عرض
            </button>
          </div>
        </div>
      </div>

      {/* جدول كشف حركات الصنف */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg overflow-hidden text-xs">
        <div className="p-3.5 bg-slate-100 dark:bg-[#151822] border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-100">حركات الصنف:</span>
            <span className="font-bold text-amber-400">{currentItem.name} ({currentItem.code})</span>
          </div>
          <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-bold">
            التصنيف: {currentItem.category}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">التاريخ والوقت</th>
                <th className="py-3 px-3">نوع الحركة المخزنية</th>
                <th className="py-3 px-3 text-right">المستودع / الصالة</th>
                <th className="py-3 px-3 font-mono">التشغيلة (اللوط)</th>
                <th className="py-3 px-3 font-mono">تاريخ الصلاحية</th>
                <th className="py-3 px-3">وارد (+)</th>
                <th className="py-3 px-3">منصرف (-)</th>
                <th className="py-3 px-3 font-bold">الرصيد بعد الحركة</th>
                <th className="py-3 px-3 text-right">البيان والملاحظات المرجعية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
              {movements.map(m => (
                <tr key={m.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">{m.dateTime}</td>
                  
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      m.movementType.includes('توريد')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : (m.movementType.includes('صرف') ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30')
                    }`}>
                      {m.movementType}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right text-slate-700 dark:text-zinc-300 font-semibold">{m.departmentWarehouse}</td>

                  <td className="py-3 px-3 font-mono text-amber-400 font-bold">{m.batchNumber}</td>

                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">{m.expiryDate}</td>

                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                    {m.inQuantity > 0 ? `+${m.inQuantity.toLocaleString()}` : '---'}
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-rose-400">
                    {m.outQuantity > 0 ? `-${m.outQuantity.toLocaleString()}` : '---'}
                  </td>

                  <td className="py-3 px-3 font-mono font-black text-indigo-400 text-sm">
                    {m.balanceAfter.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-right text-slate-600 dark:text-zinc-400 max-w-sm truncate">{m.notes}</td>
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


