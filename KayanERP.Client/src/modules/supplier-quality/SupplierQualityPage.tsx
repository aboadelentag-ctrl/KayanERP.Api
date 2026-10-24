import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Award,
  RotateCw,
  Plus,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  ClipboardCheck,
  FileText,
  UserCheck,
  Percent,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import {
  fetchQualityEvaluationsApi,
  saveQualityEvaluationApi,
} from './supplierQualityApi';
import type { SupplierQualityViewModel } from './supplierQualityApi';
import { fetchSuppliersApi } from '../suppliers/suppliersApi';
import type { SupplierViewDto } from '../suppliers/suppliersApi';

interface Props {
  onNavigate?: (tab: string) => void;
}

export const SupplierQualityPage: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [evaluationsList, setEvaluationsList] = useState<SupplierQualityViewModel[]>([]);
  const [suppliersList, setSuppliersList] = useState<SupplierViewDto[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [complianceScore, setComplianceScore] = useState<number>(95);
  const [result, setResult] = useState('مطابق للمواصفات - ممتاز');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [evals, sups] = await Promise.all([
        fetchQualityEvaluationsApi(),
        fetchSuppliersApi('true'),
      ]);
      setEvaluationsList(evals);
      setSuppliersList(sups);
    } catch (err: any) {
      setIsSuccess(false);
      setFeedbackMessage(`خطأ في جلب بيانات الفحص: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // الإحصائيات اللحظية
  const approvedCount = useMemo(
    () => evaluationsList.filter((e) => e.result.includes('مطابق') || e.result === 'APPROVED').length,
    [evaluationsList]
  );
  const conditionalCount = useMemo(
    () => evaluationsList.filter((e) => e.result.includes('مشروط') || e.result === 'CONDITIONAL').length,
    [evaluationsList]
  );
  const rejectedCount = useMemo(
    () => evaluationsList.filter((e) => e.result.includes('مرفوض') || e.result === 'REJECTED').length,
    [evaluationsList]
  );

  const filteredEvaluations = useMemo(() => {
    if (!searchTerm.trim()) return evaluationsList;
    const term = searchTerm.trim().toLowerCase();
    return evaluationsList.filter(
      (e) =>
        e.itemName.toLowerCase().includes(term) ||
        e.reportNumber.toLowerCase().includes(term) ||
        e.inspectedByName.toLowerCase().includes(term) ||
        (e.notes && e.notes.toLowerCase().includes(term))
    );
  }, [evaluationsList, searchTerm]);

  const openNewEvaluationModal = () => {
    setSelectedSupplierId(0);
    setItemName('');
    setBatchNumber(`COA-2026-${Math.floor(100 + Math.random() * 900)}`);
    setComplianceScore(95);
    setResult('مطابق للمواصفات - ممتاز');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setIsSuccess(false);
      setFeedbackMessage('⚠️ يرجى إدخال اسم الخامة المفحوصة!');
      return;
    }

    setIsSaving(true);
    try {
      const selectedSup = suppliersList.find((s) => s.id === selectedSupplierId);
      await saveQualityEvaluationApi({
        itemName,
        batchNumber,
        complianceScore,
        result,
        inspectedByName: user?.fullName || 'د. مينا مجدي (مسؤول المعمل)',
        notes,
        supplierName: selectedSup?.supplierName,
      });

      setIsSuccess(true);
      setFeedbackMessage('✅ تم توثيق وحفظ الفحص المعملي وشهادة التحليل بنجاح!');
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setIsSuccess(false);
      setFeedbackMessage(`فشل الحفظ: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCsv = () => {
    if (filteredEvaluations.length === 0) return;

    const headers = ['رقم_التقرير', 'تاريخ_الفحص', 'الخامة_المفحوصة', 'درجة_المطابقة', 'القرار_الفني', 'المفتش', 'الملاحظات'];
    const rows = filteredEvaluations.map((item) => [
      `"${item.reportNumber}"`,
      `"${item.inspectionDate}"`,
      `"${item.itemName}"`,
      `"${item.complianceScore}%"`,
      `"${item.result}"`,
      `"${item.inspectedByName}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `سجل_الفحص_المعملي_للخامات_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedbackMessage('تم تصدير سجل الفحوصات المعملية إلى إكسيل بنجاح.');
  };

  const getResultBadgeClass = (resText: string) => {
    if (resText.includes('مطابق') || resText === 'APPROVED') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (resText.includes('مشروط') || resText === 'CONDITIONAL') {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    if (resText.includes('مرفوض') || resText === 'REJECTED') {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      
      {/* 1. رأس الشاشة التنفيذي */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h1 className="text-xl font-black text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <span>سجل الفحص المعملي للخامات وشهادات التحليل (COA/QA)</span>
              </h1>
              <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                إدارة توكيد الجودة (HACCP)
              </span>
            </div>
            <p className="text-xs text-slate-300">
              توثيق شهادات التحليل المخبرية، فحص الرطوبة والجلوتين والدهون، ومطابقة شحنات الموردين لمواصفات المصنع.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigate && onNavigate('vendor-qc')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-600 hover:text-white rounded-xl text-xs font-bold transition-all"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>📊 رادار تصنيف الموردين (Grades)</span>
            </button>

            <button
              onClick={openNewEvaluationModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>فحص واعتماد شحنة جديدة</span>
            </button>

            <button
              onClick={handleExportCsv}
              disabled={filteredEvaluations.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>تصدير إكسيل</span>
            </button>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
              title="تحديث"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. رسائل النظام */}
      {feedbackMessage && (
        <div className={`mb-4 p-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
          isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-gray-500 hover:text-gray-800 font-bold">×</button>
        </div>
      )}

      {/* 3. بطاقات المؤشرات اللحظية */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-emerald-500 p-4 shadow-xs text-center">
          <span className="text-xs text-gray-500 font-bold block">مطابقة ومعتمدة للاستخدام</span>
          <span className="text-2xl font-black font-mono text-emerald-600 mt-1 block">
            {approvedCount} <small className="text-xs font-normal">فحص</small>
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-amber-500 p-4 shadow-xs text-center">
          <span className="text-xs text-gray-500 font-bold block">قبول مشروط بتشغيل عاجل</span>
          <span className="text-2xl font-black font-mono text-amber-600 mt-1 block">
            {conditionalCount} <small className="text-xs font-normal">فحص</small>
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-rose-500 p-4 shadow-xs text-center">
          <span className="text-xs text-gray-500 font-bold block">شحنات مرفوضة ومردودة</span>
          <span className="text-2xl font-black font-mono text-rose-600 mt-1 block">
            {rejectedCount} <small className="text-xs font-normal">فحص</small>
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-t-4 border-t-slate-800 p-4 shadow-xs text-center">
          <span className="text-xs text-gray-500 font-bold block">إجمالي الفحوصات المسجلة</span>
          <span className="text-2xl font-black font-mono text-slate-800 mt-1 block">
            {evaluationsList.length} <small className="text-xs font-normal">تقرير</small>
          </span>
        </div>
      </div>

      {/* 4. شريط البحث والجدول */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex items-center w-full max-w-sm text-xs">
            <Search className="absolute right-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="بحث بالخامة، رقم التقرير، أو المفتش..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-600"
            />
          </div>

          <span className="bg-slate-900 text-white text-[11px] font-mono px-3 py-1 rounded-full">
            سجل الفحص المعملي الحي ({filteredEvaluations.length} تقرير)
          </span>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <RotateCw className="w-7 h-7 animate-spin mx-auto text-emerald-600 mb-2" />
              <p>جاري تحميل سجلات الجودة...</p>
            </div>
          ) : filteredEvaluations.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-bold">
              لا توجد سجلات فحص مسجلة مطابقة للبحث.
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200 text-center">
                <tr>
                  <th className="py-3 px-3">رقم التقرير / الفحص</th>
                  <th className="py-3 px-3">تاريخ الفحص</th>
                  <th className="py-3 px-3 text-right">الخامة / الصنف</th>
                  <th className="py-3 px-3">درجة المطابقة (Score)</th>
                  <th className="py-3 px-3">القرار والاعتماد</th>
                  <th className="py-3 px-3">المسؤول عن الفحص</th>
                  <th className="py-3 px-3 text-right">ملاحظات الفحص والشهادة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-center">
                {filteredEvaluations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-700">{item.reportNumber}</td>
                    <td className="py-3 px-3 font-mono text-gray-500 text-[11px]">{item.inspectionDate}</td>
                    <td className="py-3 px-3 text-right font-bold text-gray-900">{item.itemName}</td>
                    <td className="py-3 px-3">
                      <span className={`font-mono font-black text-sm ${
                        item.complianceScore >= 85
                          ? 'text-emerald-600'
                          : item.complianceScore >= 70
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}>
                        {item.complianceScore}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getResultBadgeClass(item.result)}`}>
                        {item.result}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-gray-700">{item.inspectedByName}</td>
                    <td className="py-3 px-3 text-right text-gray-500 max-w-sm truncate" title={item.notes || 'مطابق'}>
                      {item.notes || 'مطابق'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 5. Modal فحص واعتماد شحنة جديدة */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh] text-xs">
            
            <div className="px-5 py-3.5 bg-emerald-600 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
                <span>تسجيل محضر فحص معملي لخامة مورد (COA)</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="p-6 overflow-y-auto space-y-4 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    الخامة المفحوصة <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: دقيق فاخر 72%، سمن بلدي، فستق..."
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">المورد المعني (اختياري)</label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value={0}>-- اختر المورد --</option>
                    {suppliersList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.supplierName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    رقم شهادة التحليل (COA Number)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: COA-2026-99"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    نسبة المطابقة والمواصفة (%) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={complianceScore}
                    onChange={(e) => setComplianceScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl font-mono font-black text-center text-indigo-700 text-base focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    قرار واعتماد الجودة <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="مطابق للمواصفات - ممتاز">مطابق ومعتمد للاستخدام ✓</option>
                    <option value="مقبول بشروط">قبول مشروط بتشغيل عاجل ⚠️</option>
                    <option value="مرفوض - غير صالح">مرفوض تماماً (مرتجع للمورد) ⛔</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    ملاحظات الفحص المعملي ونتائج الاختبارات
                  </label>
                  <textarea
                    rows={3}
                    placeholder="اكتب نتائج فحص الرطوبة، الشوائب، الطعم، والتحاليل المخبرية..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 text-gray-600 hover:bg-gray-200 rounded-xl font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>{isSaving ? 'جاري الحفظ...' : '💾 حفظ واعتماد الفحص'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
