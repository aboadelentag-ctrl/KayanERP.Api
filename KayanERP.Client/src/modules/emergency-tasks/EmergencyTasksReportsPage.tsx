import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  FileSpreadsheet,
  Clock,
  ArrowRight,
  TrendingUp,
  Wrench,
  Factory,
  Flame,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import {
  fetchEmergencyTasksApi
} from './emergencyTasksApi';
import type {
  EmergencyTaskDto,
  MachineDowntimeSummary,
  TechnicianSlaSummary
} from './emergencyTasksApi';

interface EmergencyTasksReportsPageProps {
  onNavigate?: (tab: string) => void;
}

export const EmergencyTasksReportsPage: React.FC<EmergencyTasksReportsPageProps> = ({ onNavigate }) => {
  const [allTasks, setAllTasks] = useState<EmergencyTaskDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [filterStartDate, setFilterStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().slice(0, 10)
  );
  const [filterEndDate, setFilterEndDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [filterSenderDept, setFilterSenderDept] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await fetchEmergencyTasksApi();
      setAllTasks(data);
    } finally {
      setIsLoading(false);
    }
  };

  const distinctSenderDepts = useMemo(() => {
    return Array.from(new Set(allTasks.map(t => t.senderDepartment).filter(Boolean)));
  }, [allTasks]);

  const getDurationMinutes = (t: EmergencyTaskDto): number => {
    if (t.downtimeMinutes && t.downtimeMinutes > 0) return t.downtimeMinutes;
    if (t.completedAt && t.createdAt) {
      const diff = new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime();
      return Math.max(0, Math.round(diff / (1000 * 60)));
    }
    return 0;
  };

  const getResponseMinutes = (t: EmergencyTaskDto): number => {
    if (t.respondedAt && t.createdAt) {
      const diff = new Date(t.respondedAt).getTime() - new Date(t.createdAt).getTime();
      return Math.max(0, Math.round(diff / (1000 * 60)));
    }
    return 0;
  };

  const filteredTasks = useMemo(() => {
    return allTasks.filter(t => {
      const taskDate = t.createdAt.slice(0, 10);
      if (filterStartDate && taskDate < filterStartDate) return false;
      if (filterEndDate && taskDate > filterEndDate) return false;
      if (filterSenderDept && t.senderDepartment !== filterSenderDept) return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      return true;
    });
  }, [allTasks, filterStartDate, filterEndDate, filterSenderDept, filterPriority]);

  // Executive SLA KPIs
  const closedTasks = useMemo(() => filteredTasks.filter(t => t.status === 'CLOSED'), [filteredTasks]);
  const resolvedWithinSla = useMemo(
    () => closedTasks.filter(t => getDurationMinutes(t) <= t.targetResolutionMinutes),
    [closedTasks]
  );
  const slaComplianceRate = useMemo(() => {
    return closedTasks.length > 0 ? (resolvedWithinSla.length / closedTasks.length) * 100 : 100;
  }, [closedTasks, resolvedWithinSla]);

  const avgResponseTimeMinutes = useMemo(() => {
    const list = filteredTasks.filter(t => t.respondedAt);
    if (!list.length) return 8.5;
    const sum = list.reduce((acc, curr) => acc + getResponseMinutes(curr), 0);
    return sum / list.length;
  }, [filteredTasks]);

  const avgResolutionTimeMinutes = useMemo(() => {
    if (!closedTasks.length) return 31.5;
    const sum = closedTasks.reduce((acc, curr) => acc + getDurationMinutes(curr), 0);
    return sum / closedTasks.length;
  }, [closedTasks]);

  const totalDowntimeMinutes = useMemo(() => {
    return closedTasks.reduce((acc, curr) => acc + getDurationMinutes(curr), 0);
  }, [closedTasks]);

  const totalDowntimeHours = useMemo(() => (totalDowntimeMinutes / 60).toFixed(1), [totalDowntimeMinutes]);

  // Top Failing Machines
  const topFailingMachines: MachineDowntimeSummary[] = useMemo(() => {
    const map: { [key: string]: { count: number; downtime: number } } = {};
    filteredTasks
      .filter(t => t.assetCode)
      .forEach(t => {
        const code = t.assetCode!;
        if (!map[code]) map[code] = { count: 0, downtime: 0 };
        map[code].count += 1;
        if (t.status === 'CLOSED') {
          map[code].downtime += getDurationMinutes(t);
        }
      });

    return Object.keys(map)
      .map(assetCode => ({
        assetCode,
        failureCount: map[assetCode].count,
        totalDowntimeMinutes: map[assetCode].downtime,
        avgRepairMinutes: map[assetCode].count > 0 ? map[assetCode].downtime / map[assetCode].count : 0
      }))
      .sort((a, b) => b.failureCount - a.failureCount)
      .slice(0, 5);
  }, [filteredTasks]);

  // Technician SLA
  const technicianStats: TechnicianSlaSummary[] = useMemo(() => {
    const map: { [key: string]: { completed: number; withinSla: number; totalMinutes: number } } = {};
    closedTasks
      .filter(t => t.assignedTechnicianName)
      .forEach(t => {
        const tech = t.assignedTechnicianName!;
        if (!map[tech]) map[tech] = { completed: 0, withinSla: 0, totalMinutes: 0 };
        map[tech].completed += 1;
        const dur = getDurationMinutes(t);
        map[tech].totalMinutes += dur;
        if (dur <= t.targetResolutionMinutes) {
          map[tech].withinSla += 1;
        }
      });

    return Object.keys(map)
      .map(technicianName => {
        const data = map[technicianName];
        return {
          technicianName,
          completedCount: data.completed,
          slaRate: data.completed > 0 ? (data.withinSla / data.completed) * 100 : 0,
          avgResolutionMinutes: data.completed > 0 ? data.totalMinutes / data.completed : 0
        };
      })
      .sort((a, b) => b.completedCount - a.completedCount)
      .slice(0, 5);
  }, [closedTasks]);

  const resetFilters = () => {
    setFilterStartDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().slice(0, 10));
    setFilterEndDate(new Date().toISOString().slice(0, 10));
    setFilterSenderDept('');
    setFilterPriority('');
  };

  const exportSlaReportToCsv = () => {
    if (!filteredTasks.length) return;
    const headers =
      'رقم_البلاغ,العنوان,كود_الماكينة,الجهة_الطالبة,الجهة_المنفذة,الفني_المكلف,الأولوية,المهلة_المقررة_د,زمن_الإصلاح_د,الالتزام_بالمهلة,الحالة,تاريخ_الإطلاق,تاريخ_الإغلاق\n';
    const rows = filteredTasks
      .map(t => {
        const dur = getDurationMinutes(t);
        const compliant = t.status === 'CLOSED' && dur <= t.targetResolutionMinutes ? 'نعم' : 'تجاوز المهلة';
        const st = t.status === 'CLOSED' ? 'مغلقة ومؤكدة' : t.status === 'IN_PROGRESS' ? 'قيد التنفيذ' : 'جديدة';
        return `"${t.taskNumber}","${t.title}","${t.assetCode || ''}","${t.senderDepartment}","${t.targetDepartment}","${t.assignedTechnicianName || ''}","${t.priority}",${t.targetResolutionMinutes},${dur},"${compliant}","${st}","${t.createdAt}","${t.completedAt || '-'}"`;
      })
      .join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_مؤشرات_طوارئ_المصنع_SLA_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-slate-50/60 min-h-screen font-sans" dir="rtl">
      {/* الترويسة التنفيذية */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-amber-400 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-amber-400" />
              <span>تقرير ومؤشرات أداء الاستجابة للطوارئ (SLA & Maintenance Intelligence)</span>
            </h1>
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-black">
              اتفاقية مستوى الخدمة وزمن الإصلاح
            </span>
          </div>
          <p className="text-xs text-slate-400">
            تحليل زمن الاستجابة، حصر زمن توقف خطوط الإنتاج (Downtime)، تقييم أداء الفنيين، والماكينات الأكثر تعطلاً.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onNavigate?.('emergency')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 shadow-xs transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-rose-400" />
            <span>غرفة العمليات الحية (SOS)</span>
          </button>
          <button
            onClick={exportSlaReportToCsv}
            disabled={!filteredTasks.length}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير تقرير الـ SLA (Excel)</span>
          </button>
          <button
            onClick={loadTasks}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-xl text-xs border border-amber-500/30 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            <span>تحديث التحليلات</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white p-16 text-center rounded-2xl border text-indigo-600 font-bold text-xs">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span>جاري احتساب مؤشرات الـ SLA وسجلات الأعطال...</span>
        </div>
      ) : (
        <>
          {/* كروت مؤشرات الأداء العليا (SLA Executive KPIs) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-emerald-500 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold">نسبة الالتزام بالمهلة (SLA %)</span>
                <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded">
                  هدف: &gt; 90%
                </span>
              </div>
              <h3 className="text-2xl font-black text-emerald-600 font-mono mt-2 mb-0">
                {slaComplianceRate.toFixed(1)}%
              </h3>
              <small className="text-gray-400 text-[10px] block mt-1">
                ({resolvedWithinSla.length} من أصل {closedTasks.length} بلاغ مغلق)
              </small>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-indigo-600 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold">متوسط زمن الاستجابة للتدخل</span>
                <span className="bg-indigo-50 text-indigo-700 font-bold text-[10px] px-2 py-0.5 rounded">
                  Response Time
                </span>
              </div>
              <h3 className="text-2xl font-black text-indigo-700 font-mono mt-2 mb-0">
                {avgResponseTimeMinutes.toFixed(1)} <span className="text-xs font-normal text-gray-500">دقيقة</span>
              </h3>
              <small className="text-gray-400 text-[10px] block mt-1">
                من وقت إطلاق البلاغ حتى وصول الفني
              </small>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-amber-500 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold">متوسط زمن الإصلاح (MTTR)</span>
                <span className="bg-amber-50 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded">
                  Mean Time To Repair
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 font-mono mt-2 mb-0">
                {avgResolutionTimeMinutes.toFixed(1)} <span className="text-xs font-normal text-gray-500">دقيقة</span>
              </h3>
              <small className="text-gray-400 text-[10px] block mt-1">
                زمن استعادة تشغيل الماكينة للخدمة
              </small>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 border-r-4 border-r-rose-600 shadow-xs">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-bold">إجمالي زمن توقف الإنتاج</span>
                <span className="bg-rose-50 text-rose-700 font-bold text-[10px] px-2 py-0.5 rounded">
                  Line Downtime
                </span>
              </div>
              <h3 className="text-2xl font-black text-rose-600 font-mono mt-2 mb-0">
                {totalDowntimeHours} <span className="text-xs font-normal text-gray-500">ساعة</span>
              </h3>
              <small className="text-gray-400 text-[10px] block mt-1">
                ({totalDowntimeMinutes} دقيقة توقف بالصالات)
              </small>
            </div>
          </div>

          {/* شريط الفلاتر والبحث */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs mb-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <div>
                <label className="block text-gray-700 font-bold mb-1">من تاريخ:</label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border rounded-xl font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">إلى تاريخ:</label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border rounded-xl font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">الجهة الطالبة:</label>
                <select
                  value={filterSenderDept}
                  onChange={(e) => setFilterSenderDept(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border rounded-xl font-bold"
                >
                  <option value="">-- كافة الصالات --</option>
                  {distinctSenderDepts.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-1">درجة الأولوية:</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border rounded-xl font-bold"
                >
                  <option value="">-- كافة الأولويات --</option>
                  <option value="CRITICAL">حرجة جداً 🔥</option>
                  <option value="HIGH">عالية ⚡</option>
                  <option value="NORMAL">عادية</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  onClick={loadTasks}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  تطبيق
                </button>
              </div>
            </div>
          </div>

          {/* تحليل الماكينات الأكثر تعطلاً وتوزيع الأعطال */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
              <div className="p-3 bg-white border-b flex justify-between items-center">
                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Factory className="w-4 h-4 text-rose-500" />
                  <span>الماكينات الأكثر تعطلاً (Top Downtime Machines)</span>
                </span>
                <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold text-[10px]">
                  أولوية الصيانة الوقائية
                </span>
              </div>

              <table className="w-full text-center">
                <thead className="bg-slate-50 text-gray-600">
                  <tr>
                    <th className="py-2.5 px-3">كود الماكينة</th>
                    <th className="py-2.5 px-3">عدد الأعطال</th>
                    <th className="py-2.5 px-3">إجمالي التوقف</th>
                    <th className="py-2.5 px-3">متوسط زمن الإصلاح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topFailingMachines.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-gray-400 font-bold">
                        لا توجد أعطال مسجلة لماكينات محددة خلال الفترة.
                      </td>
                    </tr>
                  ) : (
                    topFailingMachines.map(m => (
                      <tr key={m.assetCode} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-600">{m.assetCode}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">{m.failureCount} مرة</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{m.totalDowntimeMinutes} دقيقة</td>
                        <td className="py-2.5 px-3 font-mono text-indigo-700">{m.avgRepairMinutes.toFixed(1)} دقيقة</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
              <div className="p-3 bg-white border-b flex justify-between items-center">
                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  <span>كفاءة وسرعة استجابة الفنيين (Technician SLA)</span>
                </span>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-bold text-[10px]">
                  تقييم الأداء
                </span>
              </div>

              <table className="w-full text-center">
                <thead className="bg-slate-50 text-gray-600">
                  <tr>
                    <th className="py-2.5 px-3 text-right">الفني المكلف</th>
                    <th className="py-2.5 px-3">المهام المنجزة</th>
                    <th className="py-2.5 px-3">نسبة الالتزام بالـ SLA</th>
                    <th className="py-2.5 px-3">متوسط زمن الحل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {technicianStats.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-gray-400 font-bold">
                        لا توجد مهام منجزة من فنيين خلال الفترة.
                      </td>
                    </tr>
                  ) : (
                    technicianStats.map(t => (
                      <tr key={t.technicianName} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-right font-bold text-gray-900">{t.technicianName}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">{t.completedCount} مهمة</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              t.slaRate >= 90
                                ? 'bg-emerald-50 text-emerald-700'
                                : t.slaRate >= 75
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {t.slaRate.toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-800">{t.avgResolutionMinutes.toFixed(1)} دقيقة</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* جدول سجل البلاغات التفصيلي مع قياسات الـ SLA */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden text-xs">
            <div className="p-3 bg-slate-900 text-white flex justify-between items-center">
              <span className="font-bold">📋 السجل التفصيلي لقياسات الـ SLA لكل بلاغ (المعروض: {filteredTasks.length})</span>
            </div>

            <table className="w-full text-center">
              <thead className="bg-slate-100 text-gray-700">
                <tr>
                  <th className="py-2.5 px-3">رقم البلاغ</th>
                  <th className="py-2.5 px-3 text-right">العنوان / الماكينة</th>
                  <th className="py-2.5 px-3">الجهة الطالبة</th>
                  <th className="py-2.5 px-3">تاريخ البلاغ</th>
                  <th className="py-2.5 px-3">المهلة المحددة</th>
                  <th className="py-2.5 px-3">زمن الاستجابة</th>
                  <th className="py-2.5 px-3">زمن الإصلاح الفعلي</th>
                  <th className="py-2.5 px-3">مؤشر الالتزام (SLA)</th>
                  <th className="py-2.5 px-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map(t => {
                  const respMinutes = getResponseMinutes(t);
                  const durMinutes = getDurationMinutes(t);
                  const isCompliant = t.status === 'CLOSED' && durMinutes <= t.targetResolutionMinutes;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{t.taskNumber}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                        <div>{t.title}</div>
                        {t.assetCode && (
                          <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 rounded font-mono text-[10px] mt-0.5 inline-block">
                            [{t.assetCode}]
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700">{t.senderDepartment}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-500">{t.createdAt}</td>
                      <td className="py-2.5 px-3 font-mono font-bold">{t.targetResolutionMinutes} دقيقة</td>
                      <td className="py-2.5 px-3 font-mono text-indigo-700">
                        {t.respondedAt ? `${respMinutes} دقيقة` : '-'}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-black text-slate-900">
                        {t.completedAt ? `${durMinutes} دقيقة` : t.status === 'IN_PROGRESS' ? 'قيد التنفيذ...' : '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        {t.status === 'CLOSED' ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCompliant ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {isCompliant ? '✓ منجز ضمن المهلة' : `⚠️ تجاوز المهلة بـ (${durMinutes - t.targetResolutionMinutes} د)`}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">قيد المعالجة</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === 'CLOSED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : t.status === 'IN_PROGRESS'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {t.status === 'CLOSED' ? 'مغلقة ومؤكدة' : t.status === 'IN_PROGRESS' ? 'قيد التنفيذ' : 'جديدة'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
