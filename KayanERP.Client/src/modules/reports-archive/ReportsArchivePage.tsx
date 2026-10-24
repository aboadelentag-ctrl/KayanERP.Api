import React, { useState, useEffect, useMemo } from 'react';
import {
  FileBarChart,
  RotateCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Percent,
  Layers,
  Building2,
  Calendar,
  FileSpreadsheet,
  Award,
  AlertCircle
} from 'lucide-react';
import {
  fetchDepartmentsLookupApi,
  fetchEfficiencyReportApi,
} from './reportsArchiveApi';
import type {
  DepartmentLookupDto,
  ReportResultDto,
  DepartmentEfficiencyDto,
} from './reportsArchiveApi';

export const ReportsArchivePage: React.FC = () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState<string>(firstDayOfMonth);
  const [endDate, setEndDate] = useState<string>(today);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number>(0);

  const [departmentsList, setDepartmentsList] = useState<DepartmentLookupDto[]>([]);
  const [reportData, setReportData] = useState<ReportResultDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDepartments = async () => {
    try {
      const depts = await fetchDepartmentsLookupApi();
      setDepartmentsList(depts);
    } catch (err: any) {
      console.error('فشل تحميل قائمة الأقسام:', err);
    }
  };

  const loadReportData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchEfficiencyReportApi(startDate, endDate, selectedDepartmentId);
      setReportData(data);
    } catch (err: any) {
      setErrorMessage('حدث خطأ أثناء الاتصال وتجميع التقارير من قاعدة البيانات.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
    loadReportData();
  }, []);

  const handleExportCsv = () => {
    if (!reportData || !reportData.departmentEfficiencies.length) return;

    try {
      const headers = ['القسم_المنفذ', 'إجمالي_المخطط_كجم', 'إجمالي_المنفذ_كجم', 'نسبة_الكفاءة', 'كمية_الهالك_كجم', 'تقييم_الأداء'];
      const rows = reportData.departmentEfficiencies.map((d) => [
        `"${d.departmentName}"`,
        d.totalPlanned,
        d.totalProduced,
        `"${d.efficiencyPercentage}%"`,
        d.totalWaste,
        `"${getPerformanceLabel(d.efficiencyPercentage)}"`,
      ]);

      const csvContent =
        '\uFEFF' +
        `تقرير أرصدة وكفاءة الأقسام الإنتاجية - من [${startDate}] إلى [${endDate}]\n` +
        `إجمالي الأوامر المنجزة: ${reportData.summary.totalCompletedOrders},متوسط الكفاءة: ${reportData.summary.averageEfficiency}%,إجمالي الهالك: ${reportData.summary.totalWaste} كجم,ساعات العمل: ${reportData.summary.totalWorkingHours}\n` +
        [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `كفاءة_الأقسام_${startDate}_إلى_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(`فشل التصدير: ${err.message}`);
    }
  };

  const getPerformanceBadge = (pct: number) => {
    if (pct >= 90) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          ممتاز
        </span>
      );
    }
    if (pct >= 75) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          مقبول
        </span>
      );
    }
    if (pct === 0) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
          لا يوجد إنتاج
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
        يحتاج مراجعة
      </span>
    );
  };

  const getPerformanceLabel = (pct: number) => {
    if (pct >= 90) return 'ممتاز';
    if (pct >= 75) return 'مقبول';
    if (pct === 0) return 'لا يوجد إنتاج';
    return 'يحتاج مراجعة';
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-indigo-600" />
            <span>أرشيف التقارير وكفاءة الأقسام</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            متابعة الأداء، تحليل الانحرافات بين المخطط والفعلي، ونسب الهالك عبر خطوط الإنتاج
          </p>
        </div>

        <div className="flex items-center gap-2">
          {reportData && reportData.departmentEfficiencies.length > 0 && (
            <button
              onClick={handleExportCsv}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 text-xs font-bold transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير إكسيل</span>
            </button>
          )}

          <button
            onClick={loadReportData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث التقارير</span>
          </button>
        </div>
      </div>

      {/* 2. رسائل الأخطاء */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-700 hover:text-rose-900 font-bold">×</button>
        </div>
      )}

      {/* 3. فلاتر البحث */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-3">
            <label className="block text-gray-700 font-bold mb-1">من تاريخ</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-mono focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-gray-700 font-bold mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-mono focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-gray-700 font-bold mb-1">القسم / الإدارة</label>
            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
            >
              <option value={0}>-- جميع الأقسام وصالات التشغيل --</option>
              {departmentsList.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={loadReportData}
              disabled={isLoading}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>عرض التقرير</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400 text-xs bg-white rounded-2xl border border-gray-200 shadow-xs">
          <RotateCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
          <p className="font-bold text-gray-600">جاري تجميع وتحليل مؤشرات الأداء من قاعدة البيانات...</p>
        </div>
      ) : reportData ? (
        <>
          {/* 4. مؤشرات الأداء الرئيسية (KPIs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 p-4 shadow-xs">
              <span className="text-xs text-gray-500 font-bold block">أوامر التشغيل المنجزة</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-indigo-700">
                  {reportData.summary.totalCompletedOrders}
                </span>
                <span className="text-xs text-gray-500 font-bold">أمر</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-emerald-500 p-4 shadow-xs">
              <span className="text-xs text-gray-500 font-bold block">متوسط كفاءة الإنتاج</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-emerald-600">
                  {reportData.summary.averageEfficiency}%
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-rose-500 p-4 shadow-xs">
              <span className="text-xs text-gray-500 font-bold block">إجمالي الهالك (انحراف)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-rose-600">
                  {reportData.summary.totalWaste.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 font-bold">كجم</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-amber-500 p-4 shadow-xs">
              <span className="text-xs text-gray-500 font-bold block">إجمالي ساعات العمل</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-amber-600">
                  {reportData.summary.totalWorkingHours.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 font-bold">ساعة</span>
              </div>
            </div>
          </div>

          {/* 5. جدول تحليل كفاءة الأقسام */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-xs font-bold">
                📈 تحليل الأداء وكفاءة الإنتاج حسب القسم
              </h2>
              <span className="bg-indigo-600 text-white text-[11px] font-mono px-2.5 py-0.5 rounded-full">
                {reportData.departmentEfficiencies.length} أقسام مفحوصة
              </span>
            </div>

            <div className="overflow-x-auto">
              {reportData.departmentEfficiencies.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs font-bold">
                  لا توجد بيانات إنتاج في هذه الفترة بناءً على الفلتر الحالي.
                </div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200 text-center">
                    <tr>
                      <th className="py-3 px-3 text-right">القسم المنفذ</th>
                      <th className="py-3 px-3">إجمالي المخطط</th>
                      <th className="py-3 px-3">إجمالي المنفذ</th>
                      <th className="py-3 px-3" style={{ width: '25%' }}>نسبة الكفاءة</th>
                      <th className="py-3 px-3">كمية الهالك</th>
                      <th className="py-3 px-3">تقييم الأداء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-center">
                    {reportData.departmentEfficiencies.map((dept, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3 px-3 text-right font-bold text-indigo-900">
                          {dept.departmentName}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          {dept.totalPlanned.toLocaleString()} <span className="text-gray-400 text-[10px]">كجم</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                          {dept.totalProduced.toLocaleString()} <span className="text-gray-400 text-[10px]">كجم</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden border border-gray-200">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  dept.efficiencyPercentage >= 90
                                    ? 'bg-emerald-500'
                                    : dept.efficiencyPercentage >= 75
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(dept.efficiencyPercentage, 100)}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-gray-700 min-w-[45px] text-left">
                              {dept.efficiencyPercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-rose-600">
                          {dept.totalWaste > 0 ? `${dept.totalWaste.toLocaleString()} كجم` : '0 كجم'}
                        </td>
                        <td className="py-3 px-3">
                          {getPerformanceBadge(dept.efficiencyPercentage)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      ) : null}

    </div>
  );
};
