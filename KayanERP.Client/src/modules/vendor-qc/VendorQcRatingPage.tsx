import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Truck,
  AlertCircle,
  ShieldAlert,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Filter,
  Check
} from 'lucide-react';
import {
  fetchVendorQcRatingsApi,
  fetchVendorQcHistoryApi,
} from './vendorQcApi';
import type { VendorQcScoreDto, QcInspectionHistoryDto } from './vendorQcApi';

export const VendorQcRatingPage: React.FC = () => {
  const [ratings, setRatings] = useState<VendorQcScoreDto[]>([]);
  const [history, setHistory] = useState<QcInspectionHistoryDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // الفلاتر
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [selectedDecisionFilter, setSelectedDecisionFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const [rList, hList] = await Promise.all([
        fetchVendorQcRatingsApi(fromDate, toDate),
        fetchVendorQcHistoryApi(fromDate, toDate),
      ]);
      setRatings(rList);
      setHistory(hList);
    } catch (err: any) {
      setIsSuccess(false);
      setStatusMessage(`خطأ في جلب بيانات الفحص والجودة: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [fromDate, toDate]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedGradeFilter('all');
    setSelectedDecisionFilter('all');
    const d = new Date();
    d.setDate(d.getDate() - 30);
    setFromDate(d.toISOString().slice(0, 10));
    setToDate(new Date().toISOString().slice(0, 10));
  };

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      searchTerm.trim() ||
      selectedGradeFilter !== 'all' ||
      selectedDecisionFilter !== 'all'
    );
  }, [searchTerm, selectedGradeFilter, selectedDecisionFilter]);

  // تصفية جدول تقييم الموردين
  const filteredRatings = useMemo(() => {
    return ratings.filter((r) => {
      const matchSearch =
        !searchTerm.trim() ||
        r.supplierName.toLowerCase().includes(searchTerm.trim().toLowerCase());
      const matchGrade =
        selectedGradeFilter === 'all' ||
        r.qualityGrade.toUpperCase() === selectedGradeFilter.toUpperCase();
      return matchSearch && matchGrade;
    });
  }, [ratings, searchTerm, selectedGradeFilter]);

  // تصفية جدول سجل الفحوصات
  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      const term = searchTerm.trim().toLowerCase();
      const matchSearch =
        !term ||
        h.supplierName.toLowerCase().includes(term) ||
        h.itemName.toLowerCase().includes(term) ||
        h.itemCode.toLowerCase().includes(term) ||
        (h.notes && h.notes.toLowerCase().includes(term));

      const matchDecision =
        selectedDecisionFilter === 'all' ||
        h.movementType.toUpperCase() === selectedDecisionFilter.toUpperCase();

      return matchSearch && matchDecision;
    });
  }, [history, searchTerm, selectedDecisionFilter]);

  // تصدير جدول تقييم الموردين إلى Excel (CSV بـ UTF-8 BOM)
  const exportRatingsToExcel = () => {
    if (filteredRatings.length === 0) {
      setIsSuccess(false);
      setStatusMessage('لا توجد تقييمات مطابقة لتصديرها.');
      return;
    }

    const headers = ['اسم_المورد', 'عدد_الشحنات', 'إجمالي_الوارد', 'الكمية_المقبولة', 'الكمية_المرفوضة', 'معدل_القبول_النسبة', 'تصنيف_الجودة'];
    const rows = filteredRatings.map((r) => {
      const gradeTitle = r.qualityGrade === 'A' ? 'A - ممتاز' : r.qualityGrade === 'B' ? 'B - تحت الملاحظة' : 'C - غير مطابق';
      return [
        `"${r.supplierName}"`,
        r.totalShipments,
        r.totalReceivedQty.toFixed(2),
        r.totalAcceptedQty.toFixed(2),
        r.totalRejectedQty.toFixed(2),
        `"${r.acceptanceRate.toFixed(1)}%"`,
        `"${gradeTitle}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `تقرير_تقييم_جودة_الموردين_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsSuccess(true);
    setStatusMessage(`تم تصدير تقييم (${filteredRatings.length}) مورد إلى إكسيل بنجاح.`);
  };

  // تصدير سجل الفحوصات التفصيلي
  const exportHistoryToExcel = () => {
    if (filteredHistory.length === 0) {
      setIsSuccess(false);
      setStatusMessage('لا يوجد سجل فحوصات مطابق لتصديره.');
      return;
    }

    const headers = ['تاريخ_الفحص', 'اسم_المورد', 'كود_الخامة', 'اسم_الخامة', 'الكمية', 'القرار_الفني', 'ملاحظات_مفتش_الجودة_والتشغيل'];
    const rows = filteredHistory.map((h) => {
      const decision = h.movementType === 'PURCHASE_RECEIPT' ? 'إفراج ومقبول' : 'مرفوض فني';
      const safeNotes = (h.notes || '').replace(/"/g, '""');
      return [
        `"${h.inspectionDate}"`,
        `"${h.supplierName}"`,
        `"${h.itemCode}"`,
        `"${h.itemName}"`,
        h.quantity.toFixed(2),
        `"${decision}"`,
        `"${safeNotes}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `سجل_الفحوصات_الفنية_للخامات_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsSuccess(true);
    setStatusMessage(`تم تصدير (${filteredHistory.length}) حركة فحص واستلام إلى إكسيل بنجاح.`);
  };

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen font-sans" dir="rtl">
      {/* رأس الصفحة وأزرار التصدير والتحديث */}
      <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 p-4 mb-6 shadow-xs flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📊 مؤشرات جودة الموردين وسجل الفحص الفني</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            متابعة نسب القبول والرفض وتصنيف الموردين وفق معايير فحص استلام الخامات (ISO 22000 / HACCP)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportRatingsToExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 text-xs font-bold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير تقرير تقييم الموردين</span>
          </button>

          <button
            onClick={exportHistoryToExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-xl border border-cyan-200 text-xs font-bold transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>تصدير سجل الفحوصات التفصيلي</span>
          </button>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث المؤشرات</span>
          </button>
        </div>
      </div>

      {/* تنبيهات النظام */}
      {statusMessage && (
        <div className={`mb-4 p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
          isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-gray-500 hover:text-gray-800 font-bold">×</button>
        </div>
      )}

      {/* كروت ملخص الأداء العام للجودة (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 border-r-4 border-r-emerald-500 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block font-bold">إجمالي الموردين المفحوصين</span>
            <span className="text-2xl font-bold font-mono text-emerald-600 mt-1 block">
              {filteredRatings.length}
            </span>
          </div>
          <div className="p-2.5 rounded-full bg-slate-100 border border-slate-200 text-emerald-600">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 border-r-4 border-r-indigo-500 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block font-bold">موردين ممتازين (Grade A)</span>
            <span className="text-2xl font-bold font-mono text-indigo-600 mt-1 block">
              {filteredRatings.filter((r) => r.qualityGrade === 'A').length}
            </span>
          </div>
          <div className="p-2.5 rounded-full bg-slate-100 border border-slate-200 text-indigo-600">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 border-r-4 border-r-amber-500 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block font-bold">موردين تحت الملاحظة (Grade B)</span>
            <span className="text-2xl font-bold font-mono text-amber-600 mt-1 block">
              {filteredRatings.filter((r) => r.qualityGrade === 'B').length}
            </span>
          </div>
          <div className="p-2.5 rounded-full bg-slate-100 border border-slate-200 text-amber-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 border-r-4 border-r-rose-500 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block font-bold">موردين ذوو خطورة (Grade C)</span>
            <span className="text-2xl font-bold font-mono text-rose-600 mt-1 block">
              {filteredRatings.filter((r) => r.qualityGrade === 'C').length}
            </span>
          </div>
          <div className="p-2.5 rounded-full bg-slate-100 border border-slate-200 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* شريط البحث والفلترة المتعددة */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs border-t-4 border-t-indigo-600 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-3">
            <label className="block text-gray-600 font-bold mb-1">🔍 بحث (مورد، خامة، LOT، أو ملاحظات)</label>
            <input
              type="text"
              placeholder="ابحث باسم المورد أو الخامة أو رقم التشغيلة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-600 font-bold mb-1">🏆 تصنيف الجودة</label>
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-indigo-600"
            >
              <option value="all">-- كل التصنيفات --</option>
              <option value="A">Grade A (ممتاز ≥ 95%)</option>
              <option value="B">Grade B (تحت الملاحظة 85%-94%)</option>
              <option value="C">Grade C (مرفوض / خطر &lt; 85%)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-600 font-bold mb-1">⚖️ القرار الفني للفحص</label>
            <select
              value={selectedDecisionFilter}
              onChange={(e) => setSelectedDecisionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-bold focus:outline-none focus:border-indigo-600"
            >
              <option value="all">-- كل القرارات --</option>
              <option value="PURCHASE_RECEIPT">✅ إفراج ومقبول فقط</option>
              <option value="REJECTED">❌ مرفوض فني فقط</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-600 font-bold mb-1">📅 من تاريخ</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-600 font-bold mb-1">📅 إلى تاريخ</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="md:col-span-1 flex items-end">
            <button
              onClick={resetFilters}
              title="تفريغ الفلاتر"
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <span className="text-indigo-700 font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>نتائج التصفية: ({filteredRatings.length} مورد مطابق | {filteredHistory.length} حركة فحص فني)</span>
            </span>
            <button
              onClick={resetFilters}
              className="text-rose-600 hover:text-rose-800 font-bold"
            >
              ✕ إلغاء الفلاتر وعرض الكل
            </button>
          </div>
        )}
      </div>

      {/* جدول تقييم أداء الموردين ومعدل مطابقة الجودة */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden mb-6">
        <div className="bg-slate-900 text-white px-5 py-3 flex justify-between items-center">
          <h2 className="text-xs font-bold">🏆 تقييم أداء الموردين ومعدل مطابقة الجودة (% Acceptance Rate)</h2>
          <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[11px] font-mono">
            المعروض: {filteredRatings.length} مورد
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200 text-center">
              <tr>
                <th className="py-3 px-4 text-start">اسم المورد</th>
                <th className="py-3 px-4">عدد الشحنات</th>
                <th className="py-3 px-4">إجمالي الوارد</th>
                <th className="py-3 px-4">الكمية المقبولة</th>
                <th className="py-3 px-4">الكمية المرفوضة</th>
                <th className="py-3 px-4" style={{ width: '180px' }}>معدل القبول %</th>
                <th className="py-3 px-4">تصنيف الجودة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-center">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-1" />
                    <span>جاري حساب التقييمات للفترة المحددة...</span>
                  </td>
                </tr>
              ) : filteredRatings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-gray-400">
                    لا توجد حركات استلام وفحص جودة مسجلة مطابقة للفلاتر الحالية.
                  </td>
                </tr>
              ) : (
                filteredRatings.map((r) => (
                  <tr key={r.supplierId} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 text-start font-bold text-indigo-700">{r.supplierName}</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 font-mono font-bold px-2.5 py-0.5 rounded-md">
                        {r.totalShipments} شحنة
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{r.totalReceivedQty.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">{r.totalAcceptedQty.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-600">{r.totalRejectedQty.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden relative">
                        <div
                          className={`h-full flex items-center justify-center font-mono font-bold text-[10px] text-white transition-all ${
                            r.acceptanceRate >= 95
                              ? 'bg-emerald-500'
                              : r.acceptanceRate >= 85
                              ? 'bg-amber-500 text-slate-900'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(r.acceptanceRate, 100)}%` }}
                        >
                          {r.acceptanceRate.toFixed(1)}%
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {r.qualityGrade === 'A' ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-3 py-1 rounded-full text-xs inline-block">
                          A - ممتاز
                        </span>
                      ) : r.qualityGrade === 'B' ? (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 font-bold px-3 py-1 rounded-full text-xs inline-block">
                          B - تحت الملاحظة
                        </span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 font-bold px-3 py-1 rounded-full text-xs inline-block">
                          C - غير مطابق
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* سجل الفحوصات التفصيلية وأسباب الرفض */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="bg-slate-800 text-white px-5 py-3 flex justify-between items-center">
          <h2 className="text-xs font-bold">📜 سجل الفحوصات الفنية للخامات وأسباب الرفض</h2>
          <span className="bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded-full text-[11px] font-mono">
            المعروض: {filteredHistory.length} حركة استلام وفحص
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-center">تاريخ الفحص</th>
                <th className="py-3 px-4">المورد</th>
                <th className="py-3 px-4">الصنف / الخامة</th>
                <th className="py-3 px-4 text-center">الكمية</th>
                <th className="py-3 px-4 text-center">القرار الفني</th>
                <th className="py-3 px-4">ملاحظات ومفتش الجودة والشهادات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-1" />
                    <span>جاري تحميل السجل...</span>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    لا يوجد سجل فحوصات خلال هذه الفترة مطابق للفلاتر المحددة.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((h) => (
                  <tr key={h.movementId} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-gray-500">{h.inspectionDate}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{h.supplierName}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-indigo-700">{h.itemName}</div>
                      <span className="font-mono text-[11px] text-gray-400">{h.itemCode}</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-gray-900">
                      {h.quantity.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {h.movementType === 'PURCHASE_RECEIPT' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-3 py-1 rounded-full text-xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>إفراج ومقبول</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 font-bold px-3 py-1 rounded-full text-xs">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>مرفوض فني</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 max-w-sm">
                      {h.notes || '---'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
