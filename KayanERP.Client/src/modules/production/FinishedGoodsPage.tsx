import React, { useState, useEffect } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  RotateCw,
  Search,
  Check,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Factory
} from 'lucide-react';

interface Props {
  onNavigate?: (tab: string) => void;
}

export interface FgRecord {
  id: number;
  transferNo: string;
  transferDate: string;
  itemDescription: string;
  lotNumber: string;
  productionQty: number;
  hallName: string;
  costingQty: number;
  costingAmount: number;
  controlQty: number;
  qualityStatus: string;
  status: string;
}

export const FinishedGoodsPage: React.FC<Props> = ({ onNavigate }) => {
  const [records, setRecords] = useState<FgRecord[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<number>(0);

  const initialMockRecords: FgRecord[] = [
    {
      id: 1,
      transferNo: 'TRF-FG-20261025-001',
      transferDate: '2026-10-25',
      itemDescription: 'بسبوسة بالسمن البلدي والمكسرات',
      lotNumber: 'LOT-PRD-20261025-PRD-BAS-01-1',
      productionQty: 180,
      hallName: 'صالة تصنيع الحلويات الشرقية',
      costingQty: 179.20,
      costingAmount: 11750,
      controlQty: 177,
      qualityStatus: 'مقبول (مرتجع: 1.50)',
      status: 'تم الاستلام والترصيد'
    },
    {
      id: 2,
      transferNo: 'TRF-FG-20261025-002',
      transferDate: '2026-10-25',
      itemDescription: 'تورتة بلاك فورست وسط فاخرة',
      lotNumber: 'LOT-PRD-20261025-PRD-TRT-02-1',
      productionQty: 45,
      hallName: 'صالة الجاتوه والتورت',
      costingQty: 45,
      costingAmount: 4950,
      controlQty: 0,
      qualityStatus: '45.00',
      status: 'بانتظار استلام الكنترول'
    },
    {
      id: 3,
      transferNo: 'TRF-FG-20261025-003',
      transferDate: '2026-10-25',
      itemDescription: 'كنافة أساور فستق حلبي',
      lotNumber: 'LOT-PRD-20261025-PRD-KNF-03-1',
      productionQty: 120,
      hallName: 'صالة الكنافة والقطايف',
      costingQty: 0,
      costingAmount: 0,
      controlQty: 0,
      qualityStatus: 'قيد الفحص',
      status: 'بانتظار ميزان التكاليف'
    }
  ];

  const loadData = () => {
    try {
      const stored = localStorage.getItem('kayan_fg_transfers');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecords([...parsed, ...initialMockRecords]);
      } else {
        setRecords(initialMockRecords);
      }
    } catch (e) {
      setRecords(initialMockRecords);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // اعتماد الاستلام بالميزان وترحيل القيد آلياً
  const handleApproveControl = (rec: FgRecord) => {
    const updated = records.map(r => {
      if (r.id === rec.id) {
        return {
          ...r,
          controlQty: r.productionQty,
          status: 'تم الاستلام والترصيد'
        };
      }
      return r;
    });

    setRecords(updated);
    try {
      localStorage.setItem('kayan_fg_transfers', JSON.stringify(updated.filter(x => x.id > 10)));
    } catch (e) {}

    setStatusMessage(`✅ تم استلام الشحنة [${rec.transferNo}] بالميزان وترحيلها لمخزن التام وتوليد قيد يومية آلي!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-slate-900 dark:text-zinc-100 transition-colors" dir="rtl">
      
      {/* الترويسة العليا */}
      <div className="bg-white dark:bg-[#0f1117] border border-slate-300 dark:border-zinc-800 shadow-sm dark:shadow-lg p-5 rounded-2xl mb-6 flex flex-wrap justify-between items-center gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <Scale className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              <span>حوكمة تحويل المنتج التام واستلام الكنترول (FG Custody Hub)</span>
            </h1>
            <span className="bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 px-2.5 py-0.5 rounded-lg text-xs font-black">
              دورة تسليم مغلقة بنظام الحلقات الرقابية
            </span>
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-zinc-400">
            الدورة الصناعية المتكاملة: تسليم الصالة ⇐ ميزان التكاليف ⇐ فحص الجودة ⇐ استلام الكنترول ⇐ تدوير المرتجعات للتعديل.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            <span>تحديث البيانات اللحظية</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-3 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 rounded-xl text-xs font-black flex justify-between items-center shadow-md">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {statusMessage}
          </span>
          <button onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {/* المراحل الخمس لتحويل الكنترول */}
      <div className="flex bg-white dark:bg-[#0f1117] p-2 rounded-2xl border border-slate-300 dark:border-zinc-800 gap-2 mb-6 text-xs flex-wrap shadow-sm">
        <button
          onClick={() => setActiveStage(0)}
          className={`flex-1 py-2 px-3 rounded-xl font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
            activeStage === 0
              ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md'
              : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>سجل الإذونات والمتابعة ({records.length})</span>
        </button>

        <button
          onClick={() => setActiveStage(1)}
          className={`flex-1 py-2 px-3 rounded-xl font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
            activeStage === 1
              ? 'bg-indigo-600 text-white border-indigo-700 shadow-md'
              : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
          }`}
        >
          <span>1. تسليم إنتاج الصالة</span>
        </button>

        <button
          onClick={() => setActiveStage(2)}
          className={`flex-1 py-2 px-3 rounded-xl font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
            activeStage === 2
              ? 'bg-cyan-600 text-white border-cyan-700 shadow-md'
              : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
          }`}
        >
          <span>2. ميزان وتدقيق التكاليف</span>
        </button>

        <button
          onClick={() => setActiveStage(3)}
          className={`flex-1 py-2 px-3 rounded-xl font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
            activeStage === 3
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
              : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300'
          }`}
        >
          <span>4. استلام الكنترول والميزان</span>
        </button>
      </div>

      {/* جدول أذونات التحويل والميزان */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-300 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-200 dark:bg-[#171a24] text-slate-900 dark:text-zinc-100 border-b border-slate-300 dark:border-zinc-800 font-black">
              <tr>
                <th className="py-3 px-3">رقم الإذن</th>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3 text-right">الصنف / التشغيلة</th>
                <th className="py-3 px-3">تسليم الصالة</th>
                <th className="py-3 px-3">ميزان التكاليف</th>
                <th className="py-3 px-3">مقبول الجودة</th>
                <th className="py-3 px-3">مستلم الكنترول</th>
                <th className="py-3 px-3">الحالة الرقابية</th>
                <th className="py-3 px-3 w-28">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 font-bold text-slate-900 dark:text-zinc-200">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-black text-indigo-700 dark:text-indigo-400">{r.transferNo}</td>
                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-zinc-400">{r.transferDate}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-black text-slate-950 dark:text-white block">{r.itemDescription}</span>
                    <small className="text-slate-500 font-mono text-[10px]">{r.lotNumber}</small>
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-slate-900 dark:text-white text-sm">
                    {r.productionQty} صاج
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-amber-700 dark:text-amber-400">
                    {r.costingQty ? `${r.costingQty} صاج` : '---'}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-700 dark:text-emerald-400">
                    {r.qualityStatus}
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-indigo-600 dark:text-indigo-400">
                    {r.controlQty ? `${r.controlQty} صاج` : <span className="text-slate-400 font-normal">لم يستلم بعد</span>}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      r.status.includes('تم')
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {r.status !== 'تم الاستلام والترصيد' ? (
                      <button
                        onClick={() => handleApproveControl(r)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg text-[11px] shadow-xs cursor-pointer flex items-center justify-center gap-1 mx-auto"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>وزن واعتماد</span>
                      </button>
                    ) : (
                      <span className="text-emerald-600 text-[11px] font-bold">✓ مُرصد</span>
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

export default FinishedGoodsPage;
