import React, { useState, useMemo } from 'react';
import {
  Boxes,
  RotateCw,
  FileSpreadsheet,
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Handshake,
  Truck,
  Building2,
  Check,
  X
} from 'lucide-react';

interface CratesPageProps {
  onNavigate?: (tab: string) => void;
}

export interface CrateMovementDto {
  id: number;
  movementNumber: string;
  dateTime: string;
  movementType: 'صرف للفرع' | 'استلام من الفرع' | 'صرف لعميل جملة' | 'مرتجع تالف';
  crateType: string;
  shippedQty: number;
  receivedQty: number;
  discrepancyText: string;
  sourceDestination: string;
  parties: string;
  status: 'بانتظار تأكيد المستلم' | 'نزاع: عجز أو تلف' | 'معتمد ومطابق';
}

export const CratesPage: React.FC<CratesPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'factory_branch' | 'clients'>('factory_branch');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // إحصائيات الأوعية الثلاثة الرئيسية بالثيم الليلي الفاحم
  const crateStats = [
    {
      name: 'صاج ألومنيوم 40×60',
      subtitle: 'صاج تسوية وخبز شرقي',
      total: 1200,
      inPacking: 620,
      withDrivers: 540,
      scrapDiscrepancy: 40
    },
    {
      name: 'سبت بلاستيك أزرق مقوى',
      subtitle: 'حاوية نقل وتحميل فروع',
      total: 950,
      inPacking: 410,
      withDrivers: 510,
      scrapDiscrepancy: 30
    },
    {
      name: 'سرفيس ستانلس جاتوه سواريه',
      subtitle: 'سرفيس عرض مطلي',
      total: 400,
      inPacking: 180,
      withDrivers: 215,
      scrapDiscrepancy: 5
    }
  ];

  const [movements, setMovements] = useState<CrateMovementDto[]>([
    {
      id: 1,
      movementNumber: 'CRT-20261024-001',
      dateTime: '2026-10-24 16:30',
      movementType: 'صرف للفرع',
      crateType: 'صاج ألومنيوم 40×60',
      shippedQty: 50,
      receivedQty: 0,
      discrepancyText: '---',
      sourceDestination: 'مخزن التعبئة المركزي ⇐ فرع دكرنس الرئيسي',
      parties: 'م. خالد الدسوقي ⇐ قيد الانتظار',
      status: 'بانتظار تأكيد المستلم'
    },
    {
      id: 2,
      movementNumber: 'CRT-20261023-018',
      dateTime: '2026-10-23 11:20',
      movementType: 'صرف للفرع',
      crateType: 'سبت بلاستيك أزرق مقوى',
      shippedQty: 40,
      receivedQty: 36,
      discrepancyText: 'عجز: 3 | كسر: 1',
      sourceDestination: 'مخزن التعبئة المركزي ⇐ فرع شربين',
      parties: 'م. خالد الدسوقي ⇐ أحمد فوزي (أمين فرع شربين)',
      status: 'نزاع: عجز أو تلف'
    }
  ]);

  const exportToExcel = () => {
    let csv = 'رقم_الحركة,التاريخ,نوع_الحركة,نوع_الفوارغ,المصروف,المستلم,العجز_التالف,من_إلى,المسلم_المستلم,الحالة\n';
    movements.forEach(m => {
      csv += `"${m.movementNumber}","${m.dateTime}","${m.movementType}","${m.crateType}",${m.shippedQty},${m.receivedQty},"${m.discrepancyText}","${m.sourceDestination}","${m.parties}","${m.status}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `سجل_عهدة_الفوارغ_والأسبات_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      
      {/* ترويسة الشاشة بالثيم الليلي الفاحم */}
      <div className="bg-white dark:bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <Boxes className="w-6 h-6 text-amber-500" />
              <span>حوكمة عهدة الصاجات والأسبتة والفوارغ (Two-Party Handshake & Custody)</span>
            </h1>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              رقابة الحاويات الميدانية
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            الرقابة الميدانية المغلقة: صرف الفوارغ ⇐ الاستلام وفصل المهام ⇐ فض نزاعات العجز والكسر ⇐ عهد العملاء والفروع.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setStatusMessage('✅ تم تحديث أرصدة الفوارغ وحركات المصافحة الميدانية بنجاح.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs shadow-md transition-all border border-slate-300 dark:border-zinc-700"
          >
            <RotateCw className="w-4 h-4" />
            <span>تحديث لحظي</span>
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير سجل الحركات (CSV)</span>
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

      {/* التبويبات العليا لدورة الصاجات */}
      <div className="flex bg-white dark:bg-[#0f1117] p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800 gap-2 mb-6 text-xs">
        <button
          onClick={() => setActiveTab('factory_branch')}
          className={`py-2.5 px-6 rounded-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'factory_branch'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-600 dark:text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>1. دورة الصاجات والأسبتة (المصنع والفروع والسائقين)</span>
        </button>

        <button
          onClick={() => {
            setStatusMessage('💡 سجل متابعة عهد عملاء الجملة والتوزيع الخارجي.');
            setTimeout(() => setStatusMessage(null), 3000);
          }}
          className="py-2.5 px-6 rounded-xl font-bold text-slate-600 dark:text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-2"
        >
          <Handshake className="w-4 h-4" />
          <span>2. عهد عملاء الجملة والتوزيع الخارجي (3)</span>
        </button>
      </div>

      {/* بطاقات إحصائيات الأوعية بالثيم الليلي الفاحم */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {crateStats.map((crate, idx) => (
          <div key={idx} className="bg-white dark:bg-[#0f1117] p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-zinc-100 text-sm">{crate.name}</h3>
                <small className="text-zinc-500 block text-[11px]">{crate.subtitle}</small>
              </div>
              <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-lg font-mono font-bold text-[10px]">
                إجمالي المصنع: {crate.total}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-200 dark:border-zinc-800/80">
              <div className="p-2 bg-slate-50 dark:bg-[#141620] rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-600 dark:text-zinc-400 block mb-0.5">بمخزن التعبئة</span>
                <span className="font-mono font-black text-emerald-400 text-base">{crate.inPacking}</span>
              </div>

              <div className="p-2 bg-slate-50 dark:bg-[#141620] rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-600 dark:text-zinc-400 block mb-0.5">مع الفروع/السائقين</span>
                <span className="font-mono font-black text-indigo-400 text-base">{crate.withDrivers}</span>
              </div>

              <div className="p-2 bg-slate-50 dark:bg-[#141620] rounded-xl border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] text-slate-600 dark:text-zinc-400 block mb-0.5">عجز / تالف</span>
                <span className="font-mono font-black text-rose-400 text-base">{crate.scrapDiscrepancy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* شريط الإجراء وسجل الحركة */}
      <div className="bg-white dark:bg-[#0f1117] p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md mb-6 flex flex-wrap justify-between items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setStatusMessage('💡 نموذج إصدار إذن صرف فوارغ (طرف أول) قيد التعبئة.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ إصدار إذن صرف فوارغ (طرف أول)</span>
          </button>
        </div>

        <span className="font-bold text-slate-700 dark:text-zinc-300">سجل حركة الصاجات والأسبتة والمصافحة الميدانية</span>
      </div>

      {/* جدول سجل حركة الفوارغ والمصافحة الميدانية */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">رقم الحركة</th>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3">نوع الحركة</th>
                <th className="py-3 px-3">نوع الفوارغ</th>
                <th className="py-3 px-3">المصروف</th>
                <th className="py-3 px-3">المستلم</th>
                <th className="py-3 px-3">العجز / التالف</th>
                <th className="py-3 px-3 text-right">من ⇐ إلى</th>
                <th className="py-3 px-3 text-right">المسلِّم ⇐ المستلِم</th>
                <th className="py-3 px-3">الحالة الرقابية</th>
                <th className="py-3 px-3 w-32">الإجراء الميداني</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
              {movements.map(m => (
                <tr key={m.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{m.movementNumber}</td>
                  
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">{m.dateTime}</td>

                  <td className="py-3 px-3">
                    <span className="bg-zinc-800 text-zinc-200 border border-slate-300 dark:border-zinc-700 px-2.5 py-0.5 rounded text-[10px] font-bold">
                      {m.movementType}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-bold text-zinc-100">{m.crateType}</td>

                  <td className="py-3 px-3 font-mono font-bold text-indigo-400 text-sm">{m.shippedQty}</td>

                  <td className={`py-3 px-3 font-mono font-bold text-sm ${m.receivedQty === 0 ? 'text-zinc-500' : 'text-emerald-400'}`}>
                    {m.receivedQty > 0 ? m.receivedQty : '---'}
                  </td>

                  <td className="py-3 px-3">
                    {m.discrepancyText !== '---' ? (
                      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                        {m.discrepancyText}
                      </span>
                    ) : (
                      <span className="text-zinc-600 font-mono">---</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right text-slate-600 dark:text-zinc-400">{m.sourceDestination}</td>

                  <td className="py-3 px-3 text-right">
                    <span className="text-zinc-200 font-bold block">{m.parties}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      m.status === 'بانتظار تأكيد المستلم'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : (m.status.includes('نزاع') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30')
                    }`}>
                      {m.status}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    {m.status === 'بانتظار تأكيد المستلم' ? (
                      <button
                        onClick={() => {
                          setStatusMessage(`تم تأكيد استلام عهدة الفوارغ للشحنة [${m.movementNumber}].`);
                          setTimeout(() => setStatusMessage(null), 3000);
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] shadow-sm transition-all"
                      >
                        تأكيد الاستلام
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setStatusMessage(`فتح جلسة لجنة فض النزاع وتحديد المتسبب بالشحنة [${m.movementNumber}].`);
                          setTimeout(() => setStatusMessage(null), 3000);
                        }}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-[11px] shadow-sm transition-all"
                      >
                        فض النزاع
                      </button>
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

export default CratesPage;


