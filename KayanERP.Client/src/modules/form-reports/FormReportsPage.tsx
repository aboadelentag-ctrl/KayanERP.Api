import React, { useState, useEffect } from 'react';
import {
  FileBarChart,
  Printer,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  Scale,
  Calendar,
  X,
  Camera,
  Video,
  Mic,
  Eye,
  Sliders,
  Check
} from 'lucide-react';
import {
  fetchActiveFormsApi,
  fetchDepartmentsLookupApi,
  fetchFormReportDashboardApi,
} from './formReportsApi';
import type {
  DynamicFormDto,
  FormReportDashboardDto,
  FormSubmissionSummaryDto,
} from './formReportsApi';

export const FormReportsPage: React.FC = () => {
  const [formsList, setFormsList] = useState<DynamicFormDto[]>([]);
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<number>(1);
  const [filterFromDate, setFilterFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [filterToDate, setFilterToDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [filterDepartment, setFilterDepartment] = useState<string>('');

  const [reportData, setReportData] = useState<FormReportDashboardDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // مودال المعاينة التفصيلية للمحضر
  const [selectedSubmissionModal, setSelectedSubmissionModal] = useState<FormSubmissionSummaryDto | null>(null);
  const [modalAnswers, setModalAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const initData = async () => {
      try {
        const [forms, depts] = await Promise.all([
          fetchActiveFormsApi(),
          fetchDepartmentsLookupApi(),
        ]);
        setFormsList(forms);
        setDepartmentsList(depts);
        if (forms.length > 0) {
          setSelectedFormId(forms[0].id);
          loadReport(forms[0].id);
        }
      } catch (err) {
        console.error('فشل تحميل القوائم:', err);
      }
    };
    initData();
  }, []);

  const loadReport = async (formIdToLoad = selectedFormId) => {
    if (formIdToLoad <= 0) return;
    setIsLoading(true);
    try {
      const data = await fetchFormReportDashboardApi(
        formIdToLoad,
        filterFromDate,
        filterToDate,
        filterDepartment
      );
      setReportData(data);
    } catch (err) {
      console.error('فشل استعلام التقرير الرقابي:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (newFormId: number) => {
    setSelectedFormId(newFormId);
    loadReport(newFormId);
  };

  const handlePrint = () => {
    window.print();
  };

  const viewSubmissionDetails = (sub: FormSubmissionSummaryDto) => {
    setSelectedSubmissionModal(sub);
    try {
      const parsed = JSON.parse(sub.answersJson);
      setModalAnswers(parsed);
    } catch {
      setModalAnswers({});
    }
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      
      {/* 0. ترويسة الطباعة الرسمية - تظهر فقط عند أمر الطباعة A4 أو تصدير PDF */}
      <div className="hidden print:block text-center mb-6 pb-4 border-b-2 border-slate-900">
        <h1 className="text-xl font-black text-slate-900">حلويات أبو عادل (كيان) - نظام تخطيط وإدارة الموارد (KayanERP)</h1>
        <h2 className="text-sm font-bold text-slate-700 mt-1">تقرير استجابات الرقابة الميدانية ومحاضر التشغيل الصناعي</h2>
        <div className="flex justify-between mt-3 text-xs text-slate-600 font-mono">
          <span>تاريخ وتوقيت الاستخراج: <strong>{new Date().toLocaleString('ar-EG')}</strong></span>
          <span>النموذج: <strong>{reportData?.formName} ({reportData?.formCode})</strong></span>
        </div>
      </div>

      {/* 1. Header الشاشة العادية */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200 print:hidden">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-indigo-600" />
            <span>لوحة المؤشرات والتقارير الرقابية الشاملة (BI & KPIs)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            تحليل معدلات المطابقة، نسب الهوالك بالأقسام، وفحص وثائق ومحاضر التشغيل
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            disabled={!reportData || reportData.submissionsLog.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة التقرير الرسمي / PDF</span>
          </button>

          <button
            onClick={() => loadReport()}
            disabled={selectedFormId <= 0 || isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* 2. شريط الفلاتر والتحكم الحي */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs print:hidden text-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          
          <div className="md:col-span-3">
            <label className="block text-gray-700 font-bold mb-1">
              اختر النموذج المطلوب تحليله <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedFormId}
              onChange={(e) => handleFormChange(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-indigo-600"
            >
              <option value={0}>-- اختر النموذج --</option>
              {formsList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.formName} ({f.formCode})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-bold mb-1">من تاريخ</label>
            <input
              type="date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 font-bold mb-1">إلى تاريخ</label>
            <input
              type="date"
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-gray-700 font-bold mb-1">القسم / الصالة (بيانات حية)</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:outline-none focus:border-indigo-600"
            >
              <option value="">-- كافة الأقسام والصالات --</option>
              {departmentsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={() => loadReport()}
              disabled={selectedFormId <= 0 || isLoading}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{isLoading ? 'جاري التحليل...' : 'تشغيل الاستعلام'}</span>
            </button>
          </div>

        </div>
      </div>

      {reportData && (
        <>
          {/* 3. بطاقات مؤشرات الأداء التنفيذية (Executive KPI Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            
            {/* إجمالي المحاضر */}
            <div className="bg-indigo-600 text-white rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-indigo-100 font-semibold block">إجمالي المحاضر المعتمدة</span>
                <span className="text-3xl font-black font-mono mt-1 block">
                  {reportData.totalSubmissions}
                </span>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl">
                <FileText className="w-7 h-7 text-indigo-200" />
              </div>
            </div>

            {/* معدل المطابقة */}
            <div className={`rounded-2xl p-4 shadow-xs flex items-center justify-between text-white ${
              reportData.complianceRate >= 90 ? 'bg-emerald-600' : reportData.complianceRate >= 75 ? 'bg-amber-600' : 'bg-rose-600'
            }`}>
              <div>
                <span className="text-xs font-semibold block text-white/90">معدل المطابقة العام (Compliance Rate)</span>
                <span className="text-3xl font-black font-mono mt-1 block">
                  {reportData.complianceRate}%
                </span>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl">
                <CheckCircle2 className="w-7 h-7 text-white/90" />
              </div>
            </div>

            {/* عدم المطابقة المرصودة */}
            <div className="bg-rose-600 text-white rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-rose-100 font-semibold block">حالات عدم المطابقة المرصودة</span>
                <span className="text-3xl font-black font-mono mt-1 block">
                  {reportData.totalViolations}
                </span>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl">
                <AlertTriangle className="w-7 h-7 text-rose-200" />
              </div>
            </div>

            {/* إجمالي الهالك المسجل */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xs flex items-center justify-between border border-slate-800">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">إجمالي الكميات / الهالك المسجل</span>
                <span className="text-3xl font-black font-mono text-amber-400 mt-1 block">
                  {reportData.totalQuantity} <small className="text-xs text-slate-400">صينية/كجم</small>
                </span>
              </div>
              <div className="p-3 bg-white/5 rounded-2xl">
                <Scale className="w-7 h-7 text-amber-400" />
              </div>
            </div>

          </div>

          {/* 4. تحليل التوزيع حسب الأقسام وصالات الإنتاج */}
          {reportData.departmentStats && reportData.departmentStats.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 shadow-xs">
              <h2 className="text-xs font-bold text-gray-900 flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>🏢 التوزيع التحليلي حسب صالات وأقسام المصنع</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reportData.departmentStats.map((stat) => (
                  <div key={stat.departmentName} className="p-3.5 bg-slate-50 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between mb-2 text-xs">
                      <strong className="text-indigo-900 font-bold">{stat.departmentName}</strong>
                      <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono font-bold text-[11px]">
                        {stat.count} محضر ({stat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. جدول المحاضر التفصيلي والمزود ببيانات التشغيل والوسائط */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xs font-bold text-gray-900">
                📋 سجل الاستجابات والمحاضر الموثقة ({reportData.submissionsLog.length} سجل)
              </h2>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-md text-[11px] font-bold">
                النموذج: {reportData.formName}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100/60 text-gray-600 font-bold border-b border-gray-200 text-center">
                  <tr>
                    <th className="py-3 px-3" style={{ width: '60px' }}>م</th>
                    <th className="py-3 px-3 text-right">القسم / الصالة</th>
                    <th className="py-3 px-3">الصنف / المحرر</th>
                    <th className="py-3 px-3">الكمية</th>
                    <th className="py-3 px-3">المسبب / الملاحظة</th>
                    <th className="py-3 px-3">المرفقات</th>
                    <th className="py-3 px-3">تاريخ التوثيق</th>
                    <th className="py-3 px-3">الحالة</th>
                    <th className="py-3 px-3 print:hidden">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-center">
                  {reportData.submissionsLog.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-indigo-600">#{sub.id}</td>
                      <td className="py-3 px-3 text-right font-bold text-gray-900">{sub.department || 'عام'}</td>
                      <td className="py-3 px-3 font-semibold text-gray-700">{sub.itemOrName || '-'}</td>
                      <td className="py-3 px-3 font-mono font-bold text-rose-600">{sub.quantity || '-'}</td>
                      <td className="py-3 px-3 text-gray-500 max-w-xs truncate" title={sub.reasonOrAction}>
                        {sub.reasonOrAction || '-'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1.5 text-slate-500">
                          {sub.hasImage && <span title="مرفق صورة">📷</span>}
                          {sub.hasVideo && <span title="مرفق فيديو">🎥</span>}
                          {sub.hasAudio && <span title="مرفق صوت">🎙️</span>}
                          {!sub.hasImage && !sub.hasVideo && !sub.hasAudio && <span className="text-gray-300">-</span>}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-500 text-[11px]">{sub.submittedAt}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          <span>{sub.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 print:hidden">
                        <button
                          onClick={() => viewSubmissionDetails(sub)}
                          className="flex items-center gap-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors mx-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة كاملة</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 6. مودال المعاينة الكاملة للمحضر والمرفقات */}
      {selectedSubmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh] text-xs">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm">
                معاينة تفاصيل المحضر الرقابي رقم #{selectedSubmissionModal.id}
              </h3>
              <button
                onClick={() => setSelectedSubmissionModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 bg-slate-50/50">
              
              {/* بطاقة معلومات المحضر الأساسية */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block">المحرر والفاحص:</span>
                  <strong className="text-gray-900 font-bold">{selectedSubmissionModal.submittedByName}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">تاريخ وساعة التوثيق:</span>
                  <span className="font-mono font-bold text-indigo-700">{selectedSubmissionModal.submittedAt}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">القسم / الصالة:</span>
                  <strong className="text-gray-900 font-bold">{selectedSubmissionModal.department}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">الصنف أو الموظف المفحوص:</span>
                  <strong className="text-gray-900 font-bold">{selectedSubmissionModal.itemOrName}</strong>
                </div>
              </div>

              {/* تفاصيل الحقول المسجلة في النموذج */}
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-indigo-900 border-b border-gray-100 pb-2 mb-3">
                  كافة الحقول والملاحظات المسجلة:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {Object.entries(modalAnswers).map(([key, val]) => {
                    if (key.startsWith('report_attachment_')) return null;
                    return (
                      <div key={key} className="p-2 bg-slate-50 rounded-lg border border-gray-100">
                        <span className="text-gray-500 block text-[11px]">{key}:</span>
                        <strong className="text-gray-900 font-bold block mt-0.5">{val}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* الوسائط التوثيقية المرفقة */}
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-indigo-900 border-b border-gray-100 pb-2 mb-3 flex items-center gap-1.5">
                  <span>📎 المرفقات والوسائط المسجلة من أرض المعمل:</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                  {selectedSubmissionModal.hasImage && (
                    <div className="p-2 border border-gray-200 rounded-xl bg-slate-50">
                      <span className="text-[11px] font-bold text-gray-600 block mb-1">صورة المعاينة</span>
                      <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                        <Camera className="w-8 h-8 text-indigo-500" />
                      </div>
                    </div>
                  )}
                  {selectedSubmissionModal.hasVideo && (
                    <div className="p-2 border border-gray-200 rounded-xl bg-slate-50">
                      <span className="text-[11px] font-bold text-gray-600 block mb-1">فيديو التشغيل</span>
                      <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                        <Video className="w-8 h-8 text-rose-500" />
                      </div>
                    </div>
                  )}
                  {selectedSubmissionModal.hasAudio && (
                    <div className="p-2 border border-gray-200 rounded-xl bg-slate-50">
                      <span className="text-[11px] font-bold text-gray-600 block mb-1">التسجيل الصوتي</span>
                      <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                        <Mic className="w-8 h-8 text-emerald-500" />
                      </div>
                    </div>
                  )}
                  {!selectedSubmissionModal.hasImage && !selectedSubmissionModal.hasVideo && !selectedSubmissionModal.hasAudio && (
                    <div className="col-span-3 text-gray-400 py-3">لا توجد وسائط مرفقة مع هذا المحضر.</div>
                  )}
                </div>
              </div>

            </div>

            <div className="px-5 py-3 bg-white border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedSubmissionModal(null)}
                className="px-5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
