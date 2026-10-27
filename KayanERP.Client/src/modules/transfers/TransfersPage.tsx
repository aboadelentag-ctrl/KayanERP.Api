import React, { useState, useMemo } from 'react';
import {
  Truck,
  RotateCw,
  Search,
  PackageCheck,
  AlertTriangle,
  Scale,
  Printer,
  Eye,
  Calendar,
  Building2,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';

interface TransfersPageProps {
  onNavigate?: (tab: string) => void;
}

export interface BranchTransferDto {
  id: number;
  transferNumber: string;
  transferDate: string;
  sourceWarehouse: string;
  destinationBranch: string;
  driverName: string;
  vehiclePlate: string;
  itemsCount: number;
  shippedQty: number;
  receivedQty: number;
  cratesContainers: string;
  status: 'في الطريق' | 'نزاع عجز' | 'مستلم ومطابق';
}

export const TransfersPage: React.FC<TransfersPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'shipments' | 'manifest' | 'dispute'>('shipments');
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [transfers, setTransfers] = useState<BranchTransferDto[]>([
    {
      id: 1,
      transferNumber: 'TRF-20261024-001',
      transferDate: '2026-10-24',
      sourceWarehouse: 'مستودع الكنترول المركزي (المصنع)',
      destinationBranch: 'فرع دكرنس الرئيسي',
      driverName: 'السيد عبد العال',
      vehiclePlate: 'ط ر س 4821',
      itemsCount: 2,
      shippedQty: 65.0,
      receivedQty: 0.0,
      cratesContainers: '8 وعاء / 5 سبت',
      status: 'في الطريق'
    },
    {
      id: 2,
      transferNumber: 'TRF-20261023-098',
      transferDate: '2026-10-23',
      sourceWarehouse: 'مستودع الكنترول المركزي (المصنع)',
      destinationBranch: 'فرع شربين',
      driverName: 'محمد جابر مرسي',
      vehiclePlate: 'د ن هـ 1923',
      itemsCount: 1,
      shippedQty: 30.0,
      receivedQty: 27.0,
      cratesContainers: '2 وعاء / 2 سبت',
      status: 'نزاع عجز'
    }
  ]);

  const disputeCount = useMemo(() => transfers.filter(t => t.status === 'نزاع عجز').length, [transfers]);

  const filteredTransfers = useMemo(() => {
    return transfers.filter(t => {
      if (branchFilter !== 'ALL' && !t.destinationBranch.includes(branchFilter)) return false;
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        t.transferNumber.toLowerCase().includes(term) ||
        t.destinationBranch.toLowerCase().includes(term) ||
        t.driverName.toLowerCase().includes(term) ||
        t.vehiclePlate.toLowerCase().includes(term)
      );
    });
  }, [transfers, branchFilter, statusFilter, searchTerm]);

  return (
    <div className="p-6 pt-10 min-h-screen font-sans bg-slate-100 dark:bg-[#08090b] text-zinc-100 transition-colors" dir="rtl">
      
      {/* ترويسة الشاشة بالثيم الليلي الفاحم */}
      <div className="bg-white dark:bg-[#0f1117] p-5 rounded-2xl shadow-lg border border-slate-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-indigo-400 flex items-center gap-2">
              <Truck className="w-6 h-6 text-indigo-400" />
              <span>حوكمة تحويل وإمداد الفروع واستلام المنافذ (Branch Transfers & Logistics)</span>
            </h1>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              إدارة حركة المانيفست وسلاسل التوريد
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            شحن متعدد الأصناف ⇐ مانيفست التوزيع ⇐ متابعة السرافيس والأسبات ⇐ لجنة فض منازعات عجز النقل.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setStatusMessage('✅ تم تحديث بيانات الشحنات والمانيفست اللحظي بنجاح.');
              setTimeout(() => setStatusMessage(null), 3000);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold rounded-xl text-xs shadow-md transition-all border border-slate-300 dark:border-zinc-700"
          >
            <RotateCw className="w-4 h-4" />
            <span>تحديث لحظي</span>
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

      {/* التبويبات الثلاثة الرئيسية لحوكمة الإمداد */}
      <div className="flex bg-white dark:bg-[#0f1117] p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800 gap-2 mb-6 text-xs flex-wrap">
        <button
          onClick={() => setActiveTab('shipments')}
          className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'shipments'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-600 dark:text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>سجل الشحنات والمانيفست ({transfers.length})</span>
        </button>

        <button
          onClick={() => {
            setStatusMessage('💡 شاشة تجهيز وتوجيه مانيفست التوزيع متعدد الأصناف.');
            setTimeout(() => setStatusMessage(null), 3000);
          }}
          className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-all flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          <span>1. شحن وتوجيه مانيفست متعدد الأصناف</span>
        </button>

        <button
          onClick={() => {
            setStatusMessage('💡 شاشة استلام ومطابقة عهدة الفرع وحصر النواقص.');
            setTimeout(() => setStatusMessage(null), 3000);
          }}
          className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-all flex items-center justify-center gap-2"
        >
          <PackageCheck className="w-4 h-4 text-amber-400" />
          <span>2. استلام ومطابقة عهدة الفرع</span>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded text-[9px] font-bold">2 صنف</span>
        </button>

        <button
          onClick={() => {
            setStatusMessage('💡 جلسة لجنة فض منازعات عجز النقل بين الفرع والسائق.');
            setTimeout(() => setStatusMessage(null), 3000);
          }}
          className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-all flex items-center justify-center gap-2"
        >
          <Scale className="w-4 h-4 text-rose-400" />
          <span>3. لجنة فض منازعات عجز النقل</span>
          {disputeCount > 0 && (
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded text-[9px] font-bold">
              {disputeCount} نزاع
            </span>
          )}
        </button>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="bg-white dark:bg-[#0f1117] p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-md mb-6 flex flex-wrap justify-between items-center gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث برقم الشحنة، السائق، الصنف..."
            className="w-full pr-9 pl-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-100 outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-200 font-bold outline-none"
          >
            <option value="ALL">-- كل الفروع المستلمة --</option>
            <option value="دكرنس">فرع دكرنس الرئيسي</option>
            <option value="شربين">فرع شربين</option>
            <option value="بلقاس">فرع بلقاس</option>
            <option value="منية النصر">فرع منية النصر</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-[#171922] border border-slate-300 dark:border-zinc-700 rounded-xl text-zinc-200 font-bold outline-none"
          >
            <option value="ALL">-- كل الحالات --</option>
            <option value="في الطريق">في الطريق</option>
            <option value="نزاع عجز">نزاع عجز</option>
            <option value="مستلم ومطابق">مستلم ومطابق</option>
          </select>
        </div>
      </div>

      {/* جدول سجل الشحنات والمانيفست */}
      <div className="bg-white dark:bg-[#0f1117] rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-lg overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-100 dark:bg-[#171a24] text-slate-600 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">رقم الشحنة</th>
                <th className="py-3 px-3">التاريخ</th>
                <th className="py-3 px-3 text-right">المستودع المصدر</th>
                <th className="py-3 px-3 text-right">الفرع المستلم</th>
                <th className="py-3 px-3 text-right">السائق والسيارة</th>
                <th className="py-3 px-3">الأصناف</th>
                <th className="py-3 px-3">المشحون</th>
                <th className="py-3 px-3">المستلم</th>
                <th className="py-3 px-3">الأوعية</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3 w-32">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
              {filteredTransfers.map(t => (
                <tr key={t.id} className="hover:bg-zinc-900/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{t.transferNumber}</td>
                  
                  <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">{t.transferDate}</td>

                  <td className="py-3 px-3 text-right text-slate-600 dark:text-zinc-400">{t.sourceWarehouse}</td>

                  <td className="py-3 px-3 text-right font-bold text-amber-400">{t.destinationBranch}</td>

                  <td className="py-3 px-3 text-right">
                    <span className="font-bold text-zinc-200 block">{t.driverName}</span>
                    <small className="font-mono text-zinc-500 block">{t.vehiclePlate}</small>
                  </td>

                  <td className="py-3 px-3 font-bold text-slate-700 dark:text-zinc-300">{t.itemsCount} صنف</td>

                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{t.shippedQty.toFixed(1)}</td>

                  <td className={`py-3 px-3 font-mono font-bold ${t.receivedQty < t.shippedQty && t.status !== 'في الطريق' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {t.receivedQty.toFixed(1)}
                  </td>

                  <td className="py-3 px-3">
                    <span className="bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 px-2 py-0.5 rounded text-[10px] font-mono">
                      {t.cratesContainers}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      t.status === 'في الطريق'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : (t.status === 'نزاع عجز' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30')
                    }`}>
                      {t.status}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex justify-center items-center gap-1.5">
                      <button
                        onClick={() => {
                          setStatusMessage(`عرض تفاصيل الشحنة [${t.transferNumber}].`);
                          setTimeout(() => setStatusMessage(null), 3000);
                        }}
                        className="px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>تفاصيل</span>
                      </button>

                      <button
                        onClick={() => window.print()}
                        className="p-1 bg-zinc-800 hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 border border-slate-300 dark:border-zinc-700 rounded-lg transition-all"
                        title="طباعة بوليصة الشحن"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

export default TransfersPage;


