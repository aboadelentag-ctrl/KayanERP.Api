import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  FileSpreadsheet,
  RotateCw,
  Clock,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Layers
} from 'lucide-react';

interface EmergencyTaskViewDto {
  id: number;
  taskNumber: string;
  title: string;
  senderDepartment: string;
  targetDepartment: string;
  assignedTechnicianName?: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  createdAt: string;
  respondedAt?: string;
  completedAt?: string;
  targetResolutionMinutes: number;
  downtimeMinutes: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'CLOSED';
  assetCode?: string;
}

export const EmergencyTasksReportsPage: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const [tasks] = useState<EmergencyTaskViewDto[]>([
    {
      id: 1,
      taskNumber: 'EMG-20261024-401',
      title: 'عطل طارئ: توقف مفاجئ لفرن الدوار في صالة الشرقي',
      senderDepartment: 'صالة تصنيع الحلويات الشرقية',
      targetDepartment: 'إدارة الصيانة الهندسية والتشغيل',
      assignedTechnicianName: 'م. حسام الدين (مهندس صيانة)',
      priority: 'CRITICAL',
      createdAt: '2026-10-24 15:30',
      respondedAt: '2026-10-24 15:38',
      completedAt: '2026-10-24 16:00',
      targetResolutionMinutes: 30,
      downtimeMinutes: 30,
      status: 'CLOSED',
      assetCode: 'AST-OVEN-01'
    },
    {
      id: 2,
      taskNumber: 'EMG-20261023-112',
      title: 'تسريب مياه تبريد بوحدة التكثيف المركزية',
      senderDepartment: 'غرف التبريد والتجميد المركزي',
      targetDepartment: 'إدارة الصيانة الهندسية والتشغيل',
      assignedTechnicianName: 'أحمد فؤاد (فني تبريد)',
      priority: 'HIGH',
      createdAt: '2026-10-23 11:00',
      respondedAt: '2026-10-23 11:10',
      completedAt: '2026-10-23 11:45',
      targetResolutionMinutes: 45,
      downtimeMinutes: 45,
      status: 'CLOSED',
      assetCode: 'AST-FRG-03'
    },
    {
      id: 3,
      taskNumber: 'EMG-20261022-094',
      title: 'ارتفاع حرارة سير ماتور العجانة الكبيرة',
      senderDepartment: 'صالة تصنيع الحلويات الشرقية',
      targetDepartment: 'إدارة الصيانة الهندسية والتشغيل',
      assignedTechnicianName: 'م. حسام الدين (مهندس صيانة)',
      priority: 'HIGH',
      createdAt: '2026-10-22 09:15',
      respondedAt: '2026-10-22 09:22',
      completedAt: '2026-10-22 09:55',
      targetResolutionMinutes: 40,
      downtimeMinutes: 40,
      status: 'CLOSED',
      assetCode: 'AST-MIX-02'
    }
  ]);

  const [filterStartDate, setFilterStartDate] = useState('2026-10-01');
  const [filterEndDate, setFilterEndDate] = useState('2026-10-31');
  const [filterSenderDept, setFilterSenderDept] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (filterSenderDept && t.senderDepartment !== filterSenderDept) return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      return true;
    });
  }, [tasks, filterSenderDept, filterPriority]);

  const closedTasks = filteredTasks.filter(t => t.status === 'CLOSED');
  const resolvedWithinSla = closedTasks.filter(t => t.downtimeMinutes <= t.targetResolutionMinutes);
  const slaComplianceRate = closedTasks.length > 0 ? (resolvedWithinSla.length / closedTasks.length) * 100 : 100;
  const avgResponseTime = 8.5;
  const avgResolutionTime = closedTasks.length > 0 ? closedTasks.reduce((s, t) => s + t.downtimeMinutes, 0) / closedTasks.length : 0;
  const totalDowntimeMinutes = closedTasks.reduce((s, t) => s + t.downtimeMinutes, 0);

  const exportCsv = () => {
    let csv = 'رقم_البلاغ,العنوان,كود_الماكينة,الجهة_الطالبة,الجهة_المنفذة,الفني_المكلف,الأولوية,المهلة_المقررة_د,زمن_الإصلاح_د,الالتزام_بالمهلة,الحالة,تاريخ_الإطلاق,تاريخ_الإغلاق\n';
    filteredTasks.forEach(t => {
      const compliant = t.status === 'CLOSED' && t.downtimeMinutes <= t.targetResolutionMinutes ? 'نعم' : 'تجاوز المهلة';
      csv += `"${t.taskNumber}","${t.title}","${t.assetCode || ''}","${t.senderDepartment}","${t.targetDepartment}","${t.assignedTechnicianName || ''}","${t.priority}",${t.targetResolutionMinutes},${t.downtimeMinutes},"${compliant}","${t.status}","${t.createdAt}","${t.completedAt || '-'}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_مؤشرات_طوارئ_المصنع_SLA_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 min-h-screen font-sans bg-slate-100/70 dark:bg-black transition-colors" dir="rtl">
      {/* رأس الصفحة التنفيذي */}
      <div className="bg-white dark:bg-[#0c0d11] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-amber-400 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-rose-500" />
              <span>تقرير ومؤشرات أداء الاستجابة للطوارئ (SLA & Maintenance)</span>
            </h1>
            <span className="bg-amber-400/20 text-amber-700 dark:text-amber-400 border border-amber-400/30 px-2.5 py-0.5 rounded-lg text-[10px] font-black">
              اتفاقية مستوى الخدمة وزمن الإصلاح
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            تحليل زمن الاستجابة، حصر توقف خطوط الإنتاج (Downtime)، تقييم أداء الفنيين، والماكينات الأكثر تعطلاً.
          </p>
        </div>

        <div className="flex gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('emergency')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
            >
              <span>🚨 غرفة العمليات الحية (SOS)</span>
            </button>
          )}
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير التقرير (Excel)</span>
          </button>
        </div>
      </div>

      {/* كروت مؤشرات الأداء العليا الأربعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-emerald-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">نسبة الالتزام بالمهلة (SLA %)</span>
          <h4 className="text-2xl font-black text-emerald-600 font-mono mt-1">{slaComplianceRate.toFixed(1)}%</h4>
          <small className="text-[10px] text-gray-400">({resolvedWithinSla.length} من أصل {closedTasks.length} بلاغ مغلق)</small>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-indigo-600 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">متوسط زمن الاستجابة للتدخل</span>
          <h4 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">{avgResponseTime} <span className="text-xs font-normal">دقيقة</span></h4>
          <small className="text-[10px] text-gray-400">من إطلاق البلاغ حتى وصول الفني</small>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-amber-500 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">متوسط زمن الإصلاح (MTTR)</span>
          <h4 className="text-2xl font-black text-amber-500 font-mono mt-1">{avgResolutionTime.toFixed(1)} <span className="text-xs font-normal">دقيقة</span></h4>
          <small className="text-[10px] text-gray-400">زمن استعادة تشغيل الماكينة</small>
        </div>

        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border-r-4 border-r-rose-600 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[11px] text-gray-500 dark:text-zinc-400 font-bold block">إجمالي توقف الإنتاج</span>
          <h4 className="text-2xl font-black text-rose-600 font-mono mt-1">{(totalDowntimeMinutes / 60).toFixed(1)} <span className="text-xs font-normal">ساعة</span></h4>
          <small className="text-[10px] text-gray-400">({totalDowntimeMinutes} دقيقة توقف بالصالات)</small>
        </div>
      </div>

      {/* شريط الفلاتر والبحث */}
      <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm mb-6 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-bold">من:</span>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-mono text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-bold">إلى:</span>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl font-mono text-xs"
          />
        </div>

        <select
          value={filterSenderDept}
          onChange={(e) => setFilterSenderDept(e.target.value)}
          className="bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 font-bold outline-none"
        >
          <option value="">-- كافة الصالات --</option>
          <option value="صالة تصنيع الحلويات الشرقية">صالة تصنيع الحلويات الشرقية</option>
          <option value="صالة تصنيع الحلويات الغربية والتورت">صالة تصنيع الحلويات الغربية والتورت</option>
          <option value="غرف التبريد والتجميد المركزي">غرف التبريد والتجميد المركزي</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 font-bold outline-none"
        >
          <option value="">-- كافة الأولويات --</option>
          <option value="CRITICAL">حرجة جداً 🔥</option>
          <option value="HIGH">عالية ⚡</option>
          <option value="NORMAL">عادية</option>
        </select>
      </div>

      {/* تحليل الماكينات الأكثر تعطلاً وكفاءة الفنيين */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6 text-xs">
        {/* الماكينات الأكثر تعطلاً */}
        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-3 flex items-center justify-between">
            <span>🏭 الماكينات الأكثر تعطلاً (Top Downtime Machines)</span>
            <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded text-[10px]">أولوية الصيانة الوقائية</span>
          </h3>
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-zinc-900/60 text-gray-600 dark:text-zinc-400">
              <tr>
                <th className="py-2 px-3">كود الماكينة</th>
                <th className="py-2 px-3">عدد الأعطال</th>
                <th className="py-2 px-3">إجمالي التوقف</th>
                <th className="py-2 px-3">متوسط الإصلاح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              <tr>
                <td className="py-2 px-3 font-mono font-bold text-rose-500">AST-OVEN-01</td>
                <td className="py-2 px-3 font-bold">1 مرة</td>
                <td className="py-2 px-3 font-mono">30 دقيقة</td>
                <td className="py-2 px-3 font-mono text-indigo-600">30 دقيقة</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-bold text-rose-500">AST-FRG-03</td>
                <td className="py-2 px-3 font-bold">1 مرة</td>
                <td className="py-2 px-3 font-mono">45 دقيقة</td>
                <td className="py-2 px-3 font-mono text-indigo-600">45 دقيقة</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono font-bold text-rose-500">AST-MIX-02</td>
                <td className="py-2 px-3 font-bold">1 مرة</td>
                <td className="py-2 px-3 font-mono">40 دقيقة</td>
                <td className="py-2 px-3 font-mono text-indigo-600">40 دقيقة</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* كفاءة الفنيين */}
        <div className="bg-white dark:bg-[#0c0d11] p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100 mb-3 flex items-center justify-between">
            <span>👨‍🔧 كفاءة وسرعة استجابة الفنيين (Technician SLA)</span>
            <span className="bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded text-[10px]">تقييم الأداء</span>
          </h3>
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-zinc-900/60 text-gray-600 dark:text-zinc-400">
              <tr>
                <th className="py-2 px-3 text-right">الفني المكلف</th>
                <th className="py-2 px-3">المهام المنجزة</th>
                <th className="py-2 px-3">الالتزام بالـ SLA</th>
                <th className="py-2 px-3">متوسط زمن الحل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              <tr>
                <td className="py-2 px-3 text-right font-bold">م. حسام الدين (مهندس صيانة)</td>
                <td className="py-2 px-3 font-mono font-bold">2 مهمة</td>
                <td className="py-2 px-3"><span className="bg-emerald-500/10 text-emerald-600 font-mono font-bold px-2 py-0.5 rounded">100%</span></td>
                <td className="py-2 px-3 font-mono">35 دقيقة</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-right font-bold">أحمد فؤاد (فني تبريد)</td>
                <td className="py-2 px-3 font-mono font-bold">1 مهمة</td>
                <td className="py-2 px-3"><span className="bg-emerald-500/10 text-emerald-600 font-mono font-bold px-2 py-0.5 rounded">100%</span></td>
                <td className="py-2 px-3 font-mono">45 دقيقة</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* جدول سجل البلاغات التفصيلي */}
      <div className="bg-white dark:bg-[#0c0d11] rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden text-xs">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
          <span className="font-bold text-gray-900 dark:text-zinc-100">📋 السجل التفصيلي لقياسات الـ SLA لكل بلاغ</span>
          <span className="font-mono text-gray-400">العدد: {filteredTasks.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead className="bg-slate-50 dark:bg-zinc-900/70 text-gray-600 dark:text-zinc-400 border-b">
              <tr>
                <th className="py-3 px-3">رقم البلاغ</th>
                <th className="py-3 px-3 text-right">العنوان / الماكينة</th>
                <th className="py-3 px-3 text-right">الجهة الطالبة</th>
                <th className="py-3 px-3">تاريخ البلاغ</th>
                <th className="py-3 px-3">المهلة المحددة</th>
                <th className="py-3 px-3">زمن الاستجابة</th>
                <th className="py-3 px-3">زمن الإصلاح</th>
                <th className="py-3 px-3">مؤشر الالتزام (SLA)</th>
                <th className="py-3 px-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredTasks.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{t.taskNumber}</td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-zinc-100">
                    <span>{t.title}</span>
                    {t.assetCode && (
                      <span className="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1.5 py-0.2 rounded text-[10px] font-mono mr-1.5">
                        [{t.assetCode}]
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right text-gray-500 dark:text-zinc-400">{t.senderDepartment}</td>
                  <td className="py-3 px-3 font-mono text-gray-400">{t.createdAt}</td>
                  <td className="py-3 px-3 font-mono font-bold">{t.targetResolutionMinutes} دقيقة</td>
                  <td className="py-3 px-3 font-mono text-indigo-600">8 دقيقة</td>
                  <td className="py-3 px-3 font-mono font-bold text-gray-800 dark:text-zinc-200">{t.downtimeMinutes} دقيقة</td>
                  <td className="py-3 px-3">
                    <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                      ✓ منجز ضمن المهلة
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                      مغلقة ومؤكدة
                    </span>
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
