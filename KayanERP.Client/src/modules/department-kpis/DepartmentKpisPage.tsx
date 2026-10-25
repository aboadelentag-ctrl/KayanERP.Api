import React, { useState, useEffect } from 'react';
import {
  Gauge,
  RotateCw,
  FileSpreadsheet,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Trash2,
  Calendar
} from 'lucide-react';
import {
  fetchDepartmentsLookupApi,
  fetchKpiReportApi
} from './departmentKpisApi';
import type {
  DepartmentLookupDto,
  KpiSummaryDto,
  DepartmentEfficiencyDto
} from './departmentKpisApi';

interface DepartmentKpisPageProps {
  onNavigate?: (tab: string) => void;
}

export const DepartmentKpisPage: React.FC<DepartmentKpisPageProps> = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number>(0);

  const [departmentsList, setDepartmentsList] = useState<DepartmentLookupDto[]>([]);
  const [departmentEfficiencies, setDepartmentEfficiencies] = useState<DepartmentEfficiencyDto[]>([]);
  const [summaryKpi, setSummaryKpi] = useState<KpiSummaryDto>({
    totalCompletedOrders: 0,
    averageEfficiency: 0,
    totalWaste: 0,
    totalWorkingHours: 0
  });

  useEffect(() => {
    loadLookups();
    loadKpiData();
  }, []);

  const loadLookups = async () => {
    try {
      const depts = await fetchDepartmentsLookupApi();
      setDepartmentsList(depts);
    } catch {}
  };

  const loadKpiData = async () => {
    if (startDate > endDate) {
      setErrorMessage('تاريخ البداية لا يمكن أن يكون بعد تاريخ النهاية.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetchKpiReportApi(startDate, endDate, selectedDepartmentId);
      setSummaryKpi(res.summary);
      setDepartmentEfficiencies(res.departmentEfficiencies);
    } catch (ex: any) {
      setErrorMessage(`خطأ في جلب مؤشرات الأداء: ${ex.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const exportKpiToCsv = () => {
    if (!departmentEfficiencies.length) return;
    const headers = 'القسم,المخطط,المنفذ,الهالك,نسبة_الكفاءة\n';
    const rows = departmentEfficiencies
      .map(
        d =>
          `"${d.departmentName}",${d.totalPlanned.toFixed(2)},${d.totalProduced.toFixed(2)},${d.totalWaste.toFixed(2)},${d.efficiencyPercentage.toFixed(2)}%`
      )
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_كفاءة_الأقسام_${startDate}_إلى_${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة التنفيذية */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border-r-4 border-r-indigo-600 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Gauge className="w-6 h-6 text-indigo-600" />
            <span>لوحة مؤشرات الأداء (KPIs) للأقسام وصالات الإنتاج</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            مراقبة حية لكفاءة الإنتاج، نسب الهالك، وساعات التشغيل لكل صالة وقسم بمصانع أبو عادل.
          </p>
        </div>

        <div className="flex gap-2">
          {departmentEfficiencies.length > 0 && (
            <button
              onClick={exportKpiToCsv}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير التقرير (Excel)</span>
            </button>
          )}
          <button
            onClick={loadKpiData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
          >
            <RotateCw className="w-4 h-4 text-indigo-600" />
            <span>تحديث المؤشرات</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            {errorMessage}
          </span>
          <button onClick={() => setErrorMessage(null)}>×</button>
        </div>
      )}

      {/* فلاتر سريعة للمؤشرات */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-gray-700 font-bold mb-1">تحليل الأداء للفترة من</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-1">تحديد الصالة / القسم</label>
            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold"
            >
              <option value={0}>-- كافة الصالات والأقسام --</option>
              {departmentsList.map(d => (
                <option key={d.id} value={d.id}>{d.departmentName} ({d.departmentCode})</option>
              ))}
            </select>
          </div>
          <div>
            <button
              onClick={loadKpiData}
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors"
            >
              📊 تطبيق الفلتر وحساب الكفاءة
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white p-12 text-center rounded-2xl border text-indigo-600 font-bold text-xs">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span>جاري حساب الكفاءة والمؤشرات من سجلات التشغيل...</span>
        </div>
      ) : (
        <>
          {/* مؤشر الكفاءة العام للمصنع */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md mb-6 text-center">
            <h5 className="font-bold text-sm text-indigo-200 mb-1">متوسط الكفاءة العامة لمصانع ومخابز أبو عادل</h5>
            <div className="text-5xl font-black font-mono text-amber-400 my-2">
              {summaryKpi.averageEfficiency}%
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
              <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10">
                <span className="block text-indigo-200 text-[11px]">الأوامر المنجزة</span>
                <span className="font-mono font-black text-white text-base">{summaryKpi.totalCompletedOrders} أمر</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10">
                <span className="block text-indigo-200 text-[11px]">إجمالي الهالك</span>
                <span className="font-mono font-black text-rose-300 text-base">{summaryKpi.totalWaste} كجم</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-xl border border-white/10">
                <span className="block text-indigo-200 text-[11px]">ساعات التشغيل الفعلي</span>
                <span className="font-mono font-black text-white text-base">{summaryKpi.totalWorkingHours} ساعة</span>
              </div>
            </div>
          </div>

          <h5 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>كفاءة الأقسام التشغيلية (تفصيلي)</span>
          </h5>

          {departmentEfficiencies.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border text-amber-800 font-bold text-xs">
              ⚠️ لا توجد أوامر تشغيل مكتملة في هذه الفترة لحساب كفاءة الأقسام.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {departmentEfficiencies.map((dept, idx) => {
                const eff = dept.efficiencyPercentage;
                const isExcellent = eff >= 90;
                const isGood = eff >= 75;

                return (
                  <div
                    key={idx}
                    className={`bg-white rounded-2xl border border-gray-200 shadow-xs p-4 flex flex-col justify-between border-t-4 ${
                      isExcellent ? 'border-t-emerald-500' : isGood ? 'border-t-amber-500' : 'border-t-rose-500'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h6 className="font-bold text-slate-900 text-xs line-clamp-1">{dept.departmentName}</h6>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isExcellent
                              ? 'bg-emerald-50 text-emerald-700'
                              : isGood
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isExcellent ? 'ممتاز ✓' : isGood ? 'مقبول ⚠️' : 'حرج ⛔'}
                        </span>
                      </div>

                      <div className="text-center my-4">
                        <div
                          className={`text-3xl font-black font-mono ${
                            isExcellent ? 'text-emerald-600' : isGood ? 'text-amber-600' : 'text-rose-600'
                          }`}
                        >
                          {eff}%
                        </div>
                        <span className="text-gray-400 text-[10px] font-bold block mt-0.5">نسبة الكفاءة الفعلية</span>
                      </div>

                      {/* شريط التقدم */}
                      <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isExcellent ? 'bg-emerald-500' : isGood ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, eff))}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 text-center pt-3 border-t border-gray-100 text-[11px]">
                      <div className="border-l border-gray-100">
                        <span className="text-gray-400 block text-[10px]">المخطط</span>
                        <span className="font-mono font-bold text-slate-800">{dept.totalPlanned}</span>
                      </div>
                      <div className="border-l border-gray-100">
                        <span className="text-gray-400 block text-[10px]">المنفذ</span>
                        <span className="font-mono font-bold text-emerald-700">{dept.totalProduced}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">الهالك</span>
                        <span className="font-mono font-bold text-rose-600">{dept.totalWaste}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
