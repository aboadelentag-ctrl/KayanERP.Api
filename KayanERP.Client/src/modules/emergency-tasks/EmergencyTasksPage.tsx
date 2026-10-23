import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import {
  fetchEmergencyTasksApi,
  saveEmergencyTasksToLocal,
} from './emergencyTasksApi';
import type { EmergencyTask } from './emergencyTasksApi';
import { NewEmergencyTaskModal } from './NewEmergencyTaskModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import {
  AlertOctagon,
  Plus,
  CheckCircle2,
  Clock,
  Wrench,
  Flame,
  Check
} from 'lucide-react';

export const EmergencyTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<EmergencyTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchEmergencyTasksApi();
      setTasks(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveTask = (newTask: EmergencyTask) => {
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveEmergencyTasksToLocal(updated);
  };

  const handleAdvanceStatus = (id: number) => {
    const updated = tasks.map((t) => {
      if (t.id === id) {
        if (t.status === 'مفتوح') {
          return { ...t, status: 'قيد المعاينة والإصلاح' as const };
        }
        if (t.status === 'قيد المعاينة والإصلاح') {
          return {
            ...t,
            status: 'تم الإصلاح واختبار التشغيل' as const,
            resolutionNotes: 'تم إنهاء الصيانة وإعادة تشغيل الخط بكفاءة',
          };
        }
        if (t.status === 'تم الإصلاح واختبار التشغيل') {
          return { ...t, status: 'مغلق ومعتمد' as const };
        }
      }
      return t;
    });
    setTasks(updated);
    saveEmergencyTasksToLocal(updated);
  };

  const criticalCount = useMemo(
    () => tasks.filter((t) => t.priority.includes('حرجة') && t.status !== 'مغلق ومعتمد').length,
    [tasks]
  );

  const columns = useMemo<ColumnDef<EmergencyTask>[]>(
    () => [
      {
        key: 'taskNumber',
        header: 'رقم البلاغ',
        width: '135px',
        render: (row) => (
          <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-xs">
            {row.taskNumber}
          </span>
        ),
      },
      {
        key: 'title',
        header: 'العطل وموقع التأثير',
        render: (row) => (
          <div>
            <div className="font-bold text-gray-900 text-xs">{row.title}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              الموقع: {row.location} | أبلغ عنه: {row.reportedBy} ({row.reportedTime})
            </div>
          </div>
        ),
      },
      {
        key: 'priority',
        header: 'الأولوية',
        align: 'center',
        render: (row) => {
          const isCritical = row.priority.includes('حرجة');
          return (
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
              isCritical
                ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {row.priority}
            </span>
          );
        },
      },
      {
        key: 'assignedTo',
        header: 'الفني المسؤول',
        align: 'center',
        render: (row) => <span className="text-xs font-semibold text-gray-700">{row.assignedTo}</span>,
      },
      {
        key: 'status',
        header: 'حالة التذكرة',
        align: 'center',
        render: (row) => {
          const map: Record<string, { cls: string; icon: React.ReactNode }> = {
            'مفتوح': { cls: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse', icon: <Flame className="w-3.5 h-3.5" /> },
            'قيد المعاينة والإصلاح': { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Wrench className="w-3.5 h-3.5" /> },
            'تم الإصلاح واختبار التشغيل': { cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Clock className="w-3.5 h-3.5" /> },
            'مغلق ومعتمد': { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
          };
          const b = map[row.status] || { cls: 'bg-gray-50 text-gray-700 border-gray-200', icon: null };
          return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${b.cls}`}>
              {b.icon}
              <span>{row.status}</span>
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: 'تحديث المرحلة',
        align: 'center',
        width: '135px',
        render: (row) => {
          if (row.status === 'مغلق ومعتمد') {
            return <span className="text-[11px] text-gray-400 font-semibold">مغلق ومعتمد</span>;
          }

          let nextText = 'بدء المعاينة';
          if (row.status === 'قيد المعاينة والإصلاح') nextText = 'إتمام الإصلاح';
          if (row.status === 'تم الإصلاح واختبار التشغيل') nextText = 'اعتماد وإغلاق';

          return (
            <PermissionGuard permission="Production.Create" showDisabled>
              <button
                onClick={() => handleAdvanceStatus(row.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{nextText}</span>
              </button>
            </PermissionGuard>
          );
        },
      },
    ],
    [tasks]
  );

  const filterFields: FilterField[] = [
    {
      key: 'priority',
      label: 'درجة الأولوية',
      type: 'select',
      options: [
        { label: 'حرجة للغاية', value: 'حرجة للغاية (توقف إنتاج)' },
        { label: 'عالية', value: 'عالية' },
        { label: 'متوسطة', value: 'متوسطة' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return tasks.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.taskNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPriority = priorityFilter ? item.priority.includes(priorityFilter) : true;
      return matchSearch && matchPriority;
    });
  }, [tasks, searchTerm, priorityFilter]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      {/* بطاقات المؤشرات اللحظية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600"><AlertOctagon className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">أعطال حرجة نشطة</span>
            <span className="text-base font-bold font-mono text-rose-700">{criticalCount} أعطال خطوط</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Wrench className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">قيد المعاينة والإصلاح</span>
            <span className="text-base font-bold font-mono text-amber-700">
              {tasks.filter((t) => t.status === 'قيد المعاينة والإصلاح').length} تذاكر
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">تم إصلاحه واختباره اليوم</span>
            <span className="text-base font-bold font-mono text-emerald-700">
              {tasks.filter((t) => t.status === 'تم الإصلاح واختبار التشغيل' || t.status === 'مغلق ومعتمد').length} تذاكر
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Clock className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">متوسط زمن الاستجابة</span>
            <span className="text-base font-bold font-mono text-indigo-900">25 دقيقة (SLA)</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertOctagon className="w-7 h-7 text-rose-600" />
            <span>المهام الطارئة وأوامر الإصلاح السريعة (Emergency Tasks)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة بلاغات الأعطال المفاجئة لخطوط تصنيع الأفران، التبريد، وسيارات شحن الفروع الميدانية
          </p>
        </div>

        <PermissionGuard permission="Production.Create" showDisabled>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إرسال بلاغ عطل طارئ</span>
          </button>
        </PermissionGuard>
      </div>

      <DataTable<EmergencyTask>
        columns={columns}
        data={paginatedData}
        totalRecords={filteredData.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchTerm}
        filters={filterFields}
        onFilterChange={(f) => setPriorityFilter(f.priority || '')}
        isLoading={isLoading}
        exportFileName="بلاغات_الاعطال_الطارئة_كيان"
        enableExport={true}
      />

      <NewEmergencyTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
      />
    </div>
  );
};
