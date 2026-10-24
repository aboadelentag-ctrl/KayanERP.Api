import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Target,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  PlusCircle,
  FileSpreadsheet,
  Award,
  Users,
  Search,
  Filter,
  Flame,
  Clock,
  Layers,
  X
} from 'lucide-react';
import {
  fetchProductivityDataApi,
  saveWorkerProductivityApi,
} from './productivityApi';
import type { WorkerProductivityDto } from './productivityApi';

export const ProductivityPage: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('الشرقي');
  const [workers, setWorkers] = useState<WorkerProductivityDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // نافذة تسجيل إنتاجية ساعة جديدة
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newWorkerName, setNewWorkerName] = useState<string>('');
  const [newItemName, setNewItemName] = useState<string>('');
  const [newTarget, setNewTarget] = useState<number>(50);
  const [newActual, setNewActual] = useState<number>(48);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const loadData = async (dept = selectedDepartment) => {
    setIsLoading(true);
    try {
      const data = await fetchProductivityDataApi(dept);
      setWorkers(data);
    } catch (err: any) {
      console.error('فشل جلب إنتاجية العمال:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDepartment);
  }, [selectedDepartment]);

  // الحسابات التلخيصية اللحظية (KPIs)
  const totalTarget = useMemo(() => {
    return workers.reduce((acc, curr) => acc + (curr.targetPerHour || 0), 0);
  }, [workers]);

  const totalActual = useMemo(() => {
    return workers.reduce((acc, curr) => acc + (curr.actualPerHour || 0), 0);
  }, [workers]);

  const averageEfficiency = useMemo(() => {
    if (!workers.length) return 0;
    const sumEff = workers.reduce((acc, curr) => {
      const eff = curr.targetPerHour > 0 ? (curr.actualPerHour / curr.targetPerHour) * 100 : 0;
      return acc + eff;
    }, 0);
    return Math.round((sumEff / workers.length) * 10) / 10;
  }, [workers]);

  const filteredWorkers = useMemo(() => {
    if (!searchTerm.trim()) return workers;
    const term = searchTerm.trim().toLowerCase();
    return workers.filter(
      (w) =>
        w.workerName.toLowerCase().includes(term) ||
        w.itemName.toLowerCase().includes(term)
    );
  }, [workers, searchTerm]);

  const calculateEfficiency = (target: number, actual: number) => {
    if (target <= 0) return 0;
    return Math.round((actual / target) * 1000) / 10;
  };

  const getBadgeClass = (efficiency: number) => {
    if (efficiency >= 100) return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
    if (efficiency >= 90) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    return 'bg-rose-50 text-rose-700 border border-rose-200';
  };

  const getEvaluationLabel = (efficiency: number) => {
    if (efficiency >= 100) return 'فوق المتوقع 🏆';
    if (efficiency >= 90) return 'ممتاز ✓';
    return 'يحتاج مراجعة ⚠️';
  };

  const handleSaveWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim() || !newItemName.trim()) return;

    setIsSaving(true);
    try {
      await saveWorkerProductivityApi({
        department: selectedDepartment,
        workerName: newWorkerName,
        itemName: newItemName,
        targetPerHour: Number(newTarget),
        actualPerHour: Number(newActual),
      });

      setFeedbackMessage(`تم تسجيل إنتاجية الشيف [${newWorkerName}] بنجاح!`);
      setShowAddModal(false);
      setNewWorkerName('');
      setNewItemName('');
      await loadData();
    } catch (err: any) {
      alert(`خطأ: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCsv = () => {
    if (!filteredWorkers.length) return;

    const headers = ['اسم_العامل_الشيف', 'الصنف_المنفذ', 'القسم', 'المستهدف_ساعة', 'الفعلي_ساعة', 'الكفاءة_%', 'تقييم_الأداء'];
    const rows = filteredWorkers.map((w) => {
      const eff = calculateEfficiency(w.targetPerHour, w.actualPerHour);
      return [
        `"${w.workerName}"`,
        `"${w.itemName}"`,
        `"${w.department}"`,
        w.targetPerHour,
        w.actualPerHour,
        `${eff}%`,
        `"${getEvaluationLabel(eff)}"`,
      ].join(',');
    });

    const csvContent =
      '\uFEFF' +
      `تقرير إنتاجية عمال وشيفات قسم (${selectedDepartment}) - تاريخ ${new Date().toISOString().slice(0, 10)}\n` +
      `إجمالي المستهدف: ${totalTarget} وحدة,الإنتاج الفعلي: ${totalActual} وحدة,متوسط الكفاءة: ${averageEfficiency}%\n` +
      [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `إنتاجية_قسم_${selectedDepartment}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>لوحة إنتاجية العمال والأقسام (بالساعة)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            متابعة إنجاز الشيفات والورديات، مقارنة المستهدف بالفعلي، واحتساب كفاءة صالات التشغيل
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* اختيار القسم والتصفية */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl p-1 shadow-xs">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-transparent border-0 font-bold text-xs text-gray-800 pr-2 pl-6 py-1 outline-none"
            >
              <option value="الشرقي">قسم الشرقي</option>
              <option value="المخبوزات">قسم المخبوزات</option>
              <option value="الجاتوه">قسم الجاتوه والتورت</option>
              <option value="الإسفنجي">الإسفنجي والنواشف</option>
            </select>

            <button
              onClick={() => loadData(selectedDepartment)}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>تصفية</span>
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={!filteredWorkers.length}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير إكسيل</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>تسجيل إنتاجية ساعة</span>
          </button>

          <button
            onClick={() => loadData(selectedDepartment)}
            disabled={isLoading}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors disabled:opacity-50"
            title="تحديث البيانات"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. رسائل النظام */}
      {feedbackMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {/* 3. البطاقات التلخيصية (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold block">إجمالي المستهدف (اليوم)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black font-mono text-gray-900">{totalTarget}</span>
              <span className="text-xs font-bold text-gray-500">وحدة</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 border-r-4 border-r-emerald-500 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-bold block">الإنتاج الفعلي (حتى الآن)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black font-mono text-emerald-600">{totalActual}</span>
              <span className="text-xs font-bold text-gray-500">وحدة</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold block">متوسط كفاءة القسم</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-3xl font-black font-mono ${averageEfficiency >= 90 ? 'text-amber-400' : 'text-rose-400'}`}>
                {averageEfficiency}%
              </span>
            </div>
          </div>
          <div className="p-3 bg-slate-800 text-amber-400 rounded-2xl border border-slate-700">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 4. جدول تفاصيل إنتاجية العمال */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold">
              تفاصيل الأداء بالساعة (قسم <span className="text-amber-400 font-black">{selectedDepartment}</span>)
            </h2>
            <span className="bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full text-[10px] text-slate-300 font-mono">
              {filteredWorkers.length} شيفات مسجلين
            </span>
          </div>

          <div className="relative flex items-center w-full max-w-xs text-xs">
            <Search className="absolute right-3 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث باسم الشيف أو الصنف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pr-8 pl-3 py-1.5 focus:outline-none focus:border-indigo-500 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <RotateCw className="w-7 h-7 animate-spin mx-auto text-indigo-600 mb-2" />
              <p>جاري تحميل سجلات الإنتاجية...</p>
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-bold">
              لا توجد بيانات مسجلة لهذا القسم حالياً.
            </div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-gray-600 font-bold border-b border-gray-200 text-center">
                <tr>
                  <th className="py-3 px-3 text-right">اسم العامل / الشيف</th>
                  <th className="py-3 px-3 text-right">الصنف المنفذ</th>
                  <th className="py-3 px-3">المستهدف / ساعة</th>
                  <th className="py-3 px-3">الفعلي / ساعة</th>
                  <th className="py-3 px-3" style={{ width: '22%' }}>الكفاءة</th>
                  <th className="py-3 px-3">تقييم الأداء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-center">
                {filteredWorkers.map((worker, idx) => {
                  const eff = calculateEfficiency(worker.targetPerHour, worker.actualPerHour);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-3 text-right font-bold text-gray-900">
                        {worker.workerName}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-indigo-700">
                        {worker.itemName}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-gray-600">
                        {worker.targetPerHour}
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-gray-900">
                        {worker.actualPerHour}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden border border-gray-200">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                eff >= 100
                                  ? 'bg-indigo-600'
                                  : eff >= 90
                                  ? 'bg-emerald-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(eff, 100)}%` }}
                            />
                          </div>
                          <span className="font-mono font-bold text-gray-700 min-w-[45px] text-left">
                            {eff}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${getBadgeClass(eff)}`}>
                          {getEvaluationLabel(eff)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 5. Modal: تسجيل إنتاجية ساعة جديدة */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 text-xs">
            <div className="px-5 py-3.5 bg-indigo-600 text-white flex items-center justify-between">
              <h4 className="font-bold flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                <span>تسجيل إنتاجية ساعة جديدة (قسم {selectedDepartment})</span>
              </h4>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="p-5 space-y-3.5">
              <div>
                <label className="block text-gray-700 font-bold mb-1">اسم العامل / الشيف *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شيف أحمد محمود"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-bold outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">الصنف المنفذ *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: بسبوسة مكسرات / باتيه"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-xl font-bold outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">المستهدف / ساعة *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-xl font-mono text-center font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1">الفعلي / ساعة *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newActual}
                    onChange={(e) => setNewActual(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-indigo-300 rounded-xl font-mono text-center font-black text-indigo-700"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between text-indigo-900 font-bold">
                <span>الكفاءة المحسوبة:</span>
                <span className="font-mono text-base">{calculateEfficiency(newTarget, newActual)}%</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'جاري الحفظ...' : '💾 حفظ وتثبيت الإنتاجية'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
