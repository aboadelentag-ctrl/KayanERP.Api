import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef } from '../../core/components/data-table';
import {
  fetchEmployeesApi,
  fetchProductivityLogsApi,
  saveProductivityLogsToLocal,
} from './productivityApi';
import type { Employee, ShiftProductivityLog } from './productivityApi';
import { ProductivityModal } from './ProductivityModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import {
  Users,
  Award,
  Plus,
  CheckCircle2,
  TrendingUp,
  Percent,
  Clock
} from 'lucide-react';

export const ProductivityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'logs' | 'team'>('logs');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<ShiftProductivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [empData, logData] = await Promise.all([
        fetchEmployeesApi(),
        fetchProductivityLogsApi(),
      ]);
      setEmployees(empData);
      setLogs(logData);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveLog = (newLog: ShiftProductivityLog) => {
    const updated = [newLog, ...logs];
    setLogs(updated);
    saveProductivityLogsToLocal(updated);
  };

  const avgEfficiency = useMemo(() => {
    if (logs.length === 0) return 100;
    const sum = logs.reduce((s, l) => s + l.efficiencyScore, 0);
    return Math.round(sum / logs.length);
  }, [logs]);

  const totalActualOutput = useMemo(() => logs.reduce((s, l) => s + l.actualProducedQuantity, 0), [logs]);

  const columns = useMemo<ColumnDef<ShiftProductivityLog>[]>(
    () => [
      {
        key: 'date',
        header: 'التاريخ والوردية',
        render: (row) => (
          <div>
            <div className="font-mono font-bold text-gray-900 text-xs">{row.date}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{row.shift}</div>
          </div>
        ),
      },
      {
        key: 'employeeName',
        header: 'الشيف والقسم',
        render: (row) => (
          <div>
            <div className="font-semibold text-gray-900 text-xs">{row.employeeName}</div>
            <div className="text-[11px] text-indigo-600 mt-0.5">{row.section}</div>
          </div>
        ),
      },
      {
        key: 'targetQuantity',
        header: 'المستهدف المعياري',
        align: 'center',
        render: (row) => <span className="font-mono text-gray-600 text-xs">{row.targetQuantity} كجم</span>,
      },
      {
        key: 'actualProducedQuantity',
        header: 'الإنتاج الفعلي',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-gray-900 text-xs">
            {row.actualProducedQuantity} كجم
          </span>
        ),
      },
      {
        key: 'wastePercentage',
        header: 'الهادر (%)',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
            {row.wastePercentage}%
          </span>
        ),
      },
      {
        key: 'efficiencyScore',
        header: 'معدل الكفاءة',
        align: 'center',
        render: (row) => (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold font-mono rounded-full border ${
            row.efficiencyScore >= 100
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{row.efficiencyScore}%</span>
          </span>
        ),
      },
      {
        key: 'notes',
        header: 'الملاحظات',
        render: (row) => <span className="text-gray-500 text-xs">{row.notes}</span>,
      },
    ],
    []
  );

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return logs.slice(start, start + pageSize);
  }, [logs, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      {/* بطاقات المؤشرات اللحظية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Users className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">طاقم التشغيل والشيفات</span>
            <span className="text-base font-bold text-gray-900">{employees.length} شيفات وفنيين</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><Award className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">متوسط كفاءة المعمل</span>
            <span className="text-base font-bold font-mono text-emerald-700">{avgEfficiency}% كفاءة تشغيل</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><TrendingUp className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">إجمالي ناتج التشغيل</span>
            <span className="text-base font-bold font-mono text-gray-900">{totalActualOutput.toLocaleString()} كجم</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600"><Percent className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">متوسط هادر التشغيل</span>
            <span className="text-base font-bold font-mono text-rose-700">2.3% هادر طبيعي</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-7 h-7 text-indigo-600" />
            <span>إنتاجية الشيفات والعمال والورديات (Shift Productivity)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            متابعة الناتج اليومي لخطوط المعمل، مقارنة الفعلي بالمعياري، ومراقبة هادر التشغيل الفردي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex gap-1">
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'logs' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              سجلات الإنتاجية اليومية
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'team' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              دليل طاقم المعمل
            </button>
          </div>

          <PermissionGuard permission="Production.Create" showDisabled>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل ناتج وردية</span>
            </button>
          </PermissionGuard>
        </div>
      </div>

      {activeTab === 'logs' && (
        <DataTable<ShiftProductivityLog>
          columns={columns}
          data={paginatedData}
          totalRecords={logs.length}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          isLoading={isLoading}
          exportFileName="سجلات_انتاجية_ورديات_المعمل"
          enableExport={true}
        />
      )}

      {activeTab === 'team' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden animate-fadeIn">
          <div className="bg-slate-50 px-6 py-3 border-b border-gray-200 text-xs font-bold text-gray-700">
            فريق تشغيل المعمل والورديات المعينة
          </div>

          <div className="divide-y divide-gray-100">
            {employees.map((emp) => (
              <div key={emp.id} className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs hover:bg-slate-50/75">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{emp.name} ({emp.code})</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{emp.roleTitle} - {emp.department}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className="font-mono text-gray-600 font-semibold">{emp.shift}</span>
                  <span className="font-mono font-bold text-indigo-900">المستهدف: {emp.dailyTargetKg} كجم/يوم</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {emp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ProductivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLog}
        employees={employees}
      />
    </div>
  );
};
