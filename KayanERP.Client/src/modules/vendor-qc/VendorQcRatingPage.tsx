import React, { useState, useMemo } from 'react';
import {
  Award,
  Search,
  FileSpreadsheet,
  RotateCw,
  Truck,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Calendar,
  X
} from 'lucide-react';

export interface VendorQcScoreDto {
  supplierId: number;
  supplierName: string;
  totalShipments: number;
  totalReceivedQty: number;
  totalAcceptedQty: number;
  totalRejectedQty: number;
  acceptanceRate: number;
  qualityGrade: 'A' | 'B' | 'C';
}

export interface QcInspectionHistoryDto {
  movementId: number;
  inspectionDate: string;
  supplierName: string;
  itemCode: string;
  itemName: string;
  movementType: 'PURCHASE_RECEIPT' | 'REJECTED';
  quantity: number;
  notes: string;
}

export const VendorQcRatingPage: React.FC = () => {
  const [ratings] = useState<VendorQcScoreDto[]>([
    { supplierId: 1, supplierName: 'شركة مطاحن الدلتا والصعيد', totalShipments: 12, totalReceivedQty: 30000, totalAcceptedQty: 29500, totalRejectedQty: 500, acceptanceRate: 98.3, qualityGrade: 'A' },
    { supplierId: 2, supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي', totalShipments: 8, totalReceivedQty: 7200, totalAcceptedQty: 7000, totalRejectedQty: 200, acceptanceRate: 97.2, qualityGrade: 'A' },
    { supplierId: 3, supplierName: 'الشركة المصرية لتجارة وتكرير السكر', totalShipments: 6, totalReceivedQty: 15000, totalAcceptedQty: 13500, totalRejectedQty: 1500, acceptanceRate: 90.0, qualityGrade: 'B' },
    { supplierId: 4, supplierName: 'الأهرام للكرتون ومواد التعبئة والتغليف', totalShipments: 5, totalReceivedQty: 10000, totalAcceptedQty: 8000, totalRejectedQty: 2000, acceptanceRate: 80.0, qualityGrade: 'C' }
  ]);

  const [history] = useState<QcInspectionHistoryDto[]>([
    { movementId: 101, inspectionDate: '2026-10-24 10:30', supplierName: 'شركة مطاحن الدلتا والصعيد', itemCode: 'RAW-FLR-04', itemName: 'دقيق فاخر استخراج 72%', movementType: 'PURCHASE_RECEIPT', quantity: 5000, notes: 'مطابق للمواصفة القياسية ورطوبة 13.5%' },
    { movementId: 102, inspectionDate: '2026-10-24 14:15', supplierName: 'مزارع الوادي لمنتجات الألبان والسمن البلدي', itemCode: 'RAW-BTR-02', itemName: 'سمن بلدي بقري طبيعي', movementType: 'PURCHASE_RECEIPT', quantity: 1200, notes: 'مطابق للتحليل الكيميائي وخالي من الزيوت النباتية' },
    { movementId: 103, inspectionDate: '2026-10-23 11:00', supplierName: 'الشركة المصرية لتجارة وتكرير السكر', itemCode: 'RAW-SUG-01', itemName: 'سكر مكرر ناعم فاخر', movementType: 'REJECTED', quantity: 1500, notes: 'تكتل في الشكائر بسبب سوء التخزين أثناء النقل' },
    { movementId: 104, inspectionDate: '2026-10-22 09:45', supplierName: 'الأهرام للكرتون ومواد التعبئة والتغليف', itemCode: 'PCK-BOX-09', itemName: 'كرتون صواني البسبوسة 50*50', movementType: 'REJECTED', quantity: 2000, notes: 'عيوب طباعة وتمزق في سماكة الكرتون الدوبلكس' }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');
  const [selectedDecisionFilter, setSelectedDecisionFilter] = useState('all');
  const [fromDate, setFromDate] = useState('2026-09-25');
  const [toDate, setToDate] = useState('2026-10-25');

  const filteredRatings = useMemo(() => {
    return ratings.filter(r => {
      if (selectedGradeFilter !== 'all' && r.qualityGrade !== selectedGradeFilter) return false;
      if (!searchTerm.trim()) return true;
      return r.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [ratings, selectedGradeFilter, searchTerm]);

  const filteredHistory = useMemo(() => {
    return history.filter(h => {
      if (selectedDecisionFilter !== 'all' && h.movementType !== selectedDecisionFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        h.supplierName.toLowerCase().includes(term) ||
        h.itemName.toLowerCase().includes(term) ||
        h.itemCode.toLowerCase().includes(term) ||
        h.notes.toLowerCase().includes(term)
      );
    });
  }, [history, selectedDecisionFilter, searchTerm]);

  const exportRatingsToExcel = () => {
    let csv = 'اسم_المورد,عدد_الشحنات,إجمالي_الوارد,الكمية_المقبولة,الكمية_المرفوضة,معدل_القبول_النسبة,تصنيف_الجودة\n';
    filteredRatings.forEach(r => {
      const gradeTitle = r.qualityGrade === 'A' ? 'A - ممتاز' : r.qualityGrade === 'B' ? 'B - تحت الملاحظة' : 'C - غير مطابق';
      csv += `"${r.supplierName}",${r.totalShipments},${r.totalReceivedQty},${r.totalAcceptedQty},${r.totalRejectedQty},${r.acceptanceRate.toFixed(1)}%,"${gradeTitle}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_تقييم_جودة_الموردين_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 pt-2 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* رأس الصفحة */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              <span>مؤشرات جودة الموردين وسجل الفحص الفني (Vendor QC Rating)</span>
            </h1>
            <span className="bg-amber-400/20 text-amber-700 dark:text-amber-400 border border-amber-400/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              معايير ISO 22000 / HACCP
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            متابعة نسب القبول والرفض وتصنيف الموردين وفق معايير فحص استلام الخامات.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportRatingsToExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير تقرير تقييم الموردين</span>
          </button>
        </div>
      </div>

      {/* كروت ملخص الأداء العام للجودة (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-emerald-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">إجمالي الموردين المفحوصين</span>
          <h4 className="text-2xl font-black text-emerald-600 font-mono mt-1">{filteredRatings.length}</h4>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-indigo-600 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">موردين بتصنيف ممتاز (Grade A)</span>
          <h4 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
            {filteredRatings.filter(r => r.qualityGrade === 'A').length}
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-amber-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">موردين تحت الملاحظة (Grade B)</span>
          <h4 className="text-2xl font-black text-amber-500 font-mono mt-1">
            {filteredRatings.filter(r => r.qualityGrade === 'B').length}
          </h4>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-rose-600 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">موردين ذوو خطورة جودة (Grade C)</span>
          <h4 className="text-2xl font-black text-rose-600 font-mono mt-1">
            {filteredRatings.filter(r => r.qualityGrade === 'C').length}
          </h4>
        </div>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          <input
            type="text"
            placeholder="ابحث باسم المورد أو الخامة أو رقم التشغيلة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl pr-9 pl-3 py-2 outline-none font-bold text-gray-800 dark:text-zinc-200"
          />
        </div>

        <select
          value={selectedGradeFilter}
          onChange={(e) => setSelectedGradeFilter(e.target.value)}
          className="bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-gray-700 dark:text-zinc-300"
        >
          <option value="all">-- كل التصنيفات --</option>
          <option value="A">Grade A (ممتاز ≥ 95%)</option>
          <option value="B">Grade B (تحت الملاحظة 85%-94%)</option>
          <option value="C">Grade C (مرفوض / خطر &lt; 85%)</option>
        </select>

        <select
          value={selectedDecisionFilter}
          onChange={(e) => setSelectedDecisionFilter(e.target.value)}
          className="bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-gray-700 dark:text-zinc-300"
        >
          <option value="all">-- كل القرارات --</option>
          <option value="PURCHASE_RECEIPT">✅ إفراج ومقبول فقط</option>
          <option value="REJECTED">❌ مرفوض فني فقط</option>
        </select>

        <div className="flex items-center gap-2">
          <span className="text-gray-400">من:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-900 border rounded-xl font-mono text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400">إلى:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-900 border rounded-xl font-mono text-xs"
          />
        </div>
      </div>

      {/* جدول تقييم أداء الموردين */}
      <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden text-xs mb-6">
        <div className="p-3.5 bg-slate-900 text-white flex justify-between items-center">
          <span className="font-bold">🏆 تقييم أداء الموردين ومعدل مطابقة الجودة (% Acceptance Rate)</span>
          <span className="bg-indigo-600 px-2.5 py-0.5 rounded font-mono text-[10px]">المعروض: {filteredRatings.length} مورد</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-zinc-900/70 text-gray-600 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3 text-right">اسم المورد</th>
                <th className="py-3 px-3">عدد الشحنات</th>
                <th className="py-3 px-3">إجمالي الوارد</th>
                <th className="py-3 px-3">الكمية المقبولة</th>
                <th className="py-3 px-3">الكمية المرفوضة</th>
                <th className="py-3 px-3 w-40">معدل القبول %</th>
                <th className="py-3 px-3">تصنيف الجودة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              {filteredRatings.map(r => (
                <tr key={r.supplierId} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-zinc-100">{r.supplierName}</td>
                  <td className="py-3 px-3 font-mono">{r.totalShipments} شحنة</td>
                  <td className="py-3 px-3 font-mono font-bold">{r.totalReceivedQty.toLocaleString()}</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-600">{r.totalAcceptedQty.toLocaleString()}</td>
                  <td className="py-3 px-3 font-mono font-bold text-rose-500">{r.totalRejectedQty.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <div className="w-full bg-gray-200 dark:bg-zinc-800 h-4 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full ${r.acceptanceRate >= 95 ? 'bg-emerald-500' : r.acceptanceRate >= 85 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${r.acceptanceRate}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center font-mono font-bold text-[10px] text-slate-900 dark:text-white">
                        {r.acceptanceRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      r.qualityGrade === 'A' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' :
                      r.qualityGrade === 'B' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30' : 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                    }`}>
                      {r.qualityGrade === 'A' ? 'A - ممتاز' : r.qualityGrade === 'B' ? 'B - تحت الملاحظة' : 'C - غير مطابق'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* سجل الفحوصات التفصيلية وأسباب الرفض */}
      <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
        <div className="p-3.5 bg-slate-900 text-white flex justify-between items-center">
          <span className="font-bold">📜 سجل الفحوصات الفنية للخامات وأسباب الرفض</span>
          <span className="bg-zinc-800 px-2.5 py-0.5 rounded text-[10px]">المعروض: {filteredHistory.length} حركة فحص</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-zinc-900/70 text-gray-600 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-3">تاريخ الفحص</th>
                <th className="py-3 px-3 text-right">المورد</th>
                <th className="py-3 px-3 text-right">الصنف / الخامة</th>
                <th className="py-3 px-3">الكمية</th>
                <th className="py-3 px-3">القرار الفني</th>
                <th className="py-3 px-3 text-right">ملاحظات ومفتش الجودة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
              {filteredHistory.map(h => (
                <tr key={h.movementId} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-3 font-mono text-gray-400">{h.inspectionDate}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-zinc-100">{h.supplierName}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block">{h.itemName}</span>
                    <small className="text-gray-400 font-mono">{h.itemCode}</small>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-gray-900 dark:text-zinc-100">{h.quantity.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      h.movementType === 'PURCHASE_RECEIPT'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                    }`}>
                      {h.movementType === 'PURCHASE_RECEIPT' ? '✅ إفراج ومقبول' : '❌ مرفوض فني'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-gray-500">{h.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
