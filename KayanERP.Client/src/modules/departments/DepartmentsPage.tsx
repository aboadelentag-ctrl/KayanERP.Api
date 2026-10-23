import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import {
  fetchDepartmentsApi,
  saveDepartmentsToLocal,
  fetchDepartmentKpisApi,
} from './departmentsApi';
import type { Department, DepartmentKpiMetric } from './departmentsApi';
import { NewDepartmentModal } from './NewDepartmentModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import {
  Building2,
  TrendingUp,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  ShieldCheck,
  Flame,
  Factory
} from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'departments' | 'kpis'>('departments');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [kpiMetrics, setKpiMetrics] = useState<DepartmentKpiMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [depData, kpiData] = await Promise.all([
        fetchDepartmentsApi(),
        fetchDepartmentKpisApi(),
      ]);
      setDepartments(depData);
      setKpiMetrics(kpiData);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveDepartment = (newDept: Department) => {
    const updated = [newDept, ...departments];
    setDepartments(updated);
    saveDepartmentsToLocal(updated);
  };

  const totalWorkers = useMemo(() => departments.reduce((s, d) => s + d.workerCount, 0), [departments]);
  const totalCapacity = useMemo(() => departments.reduce((s, d) => s + d.dailyCapacityKg, 0), [departments]);
  const avgEfficiency = useMemo(() => {
    if (kpiMetrics.length === 0) return 100;
    return Math.round(kpiMetrics.reduce((s, k) => s + k.efficiencyPercentage, 0) / kpiMetrics.length);
  }, [kpiMetrics]);

  const columns = useMemo<ColumnDef<Department>[]>(
    () => [
      {
        key: 'code',
        header: 'كود الصالة',
        width: '120px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs">
            {row.code}
          </span>
        ),
      },
      {
        key: 'name',
        header: 'اسم الصالة والتصنيف',
        render: (row) => (
          <div>
            <div className="font-bold text-gray-900 text-xs">{row.name}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{row.type} - {row.location}</div>
          </div>
        ),
      },
      {
        key: 'supervisorName',
        header: 'المشرف المسؤول',
        render: (row) => (
          <span className="text-xs font-semibold text-gray-800">{row.supervisorName}</span>
        ),
      },
      {
        key: 'workerCount',
        header: 'طاقم العمل',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-xs text-indigo-900">
            {row.workerCount} شيفات وفنيين
          </span>
        ),
      },
      {
        key: 'dailyCapacityKg',
        header: 'الطاقة اليومية',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-xs text-emerald-700">
            {row.dailyCapacityKg.toLocaleString()} كجم/يوم
          </span>
        ),
      },
      {
        key: 'status',
        header: 'الحالة',
        align: 'center',
        render: (row) => (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
            row.status === 'نشط ويعمل'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{row.status}</span>
          </span>
        ),
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    return departments.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supervisorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [departments, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      {/* بطاقات المؤشرات اللحظية للهيكل الإداري والتشغيل */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Building2 className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">إجمالي الصالات والأقسام</span>
            <span className="text-base font-bold font-mono text-gray-900">{departments.length} صالات تشغيل</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><Users className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">طاقم العمالة المسكن</span>
            <span className="text-base font-bold font-mono text-emerald-700">{totalWorkers} عمال وشيفات</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Factory className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">الطاقة الإنتاجية القصوى</span>
            <span className="text-base font-bold font-mono text-amber-700">{totalCapacity.toLocaleString()} كجم/يوم</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600"><TrendingUp className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">متوسط كفاءة الصالات</span>
            <span className="text-base font-bold font-mono text-rose-700">{avgEfficiency}% (KPIs)</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-600" />
            <span>إدارة الأقسام وصالات التشغيل ومؤشرات الأداء (Departments & KPIs)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            الهيكل التنظيمي لصالات التصنيع والخبز والتعبئة، ولوحة قياس مؤشرات الكفاءة ونسب الهادر اللحظية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex gap-1">
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'departments' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              صالات التشغيل والأقسام
            </button>
            <button
              onClick={() => setActiveTab('kpis')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'kpis' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              مؤشرات الأداء (KPIs) 📈
            </button>
          </div>

          {activeTab === 'departments' && (
            <PermissionGuard permission="Products.Manage" showDisabled>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة صالة تشغيل</span>
              </button>
            </PermissionGuard>
          )}
        </div>
      </div>

      {activeTab === 'departments' && (
        <DataTable<Department>
          columns={columns}
          data={paginatedData}
          totalRecords={filteredData.length}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          onSearch={setSearchTerm}
          isLoading={isLoading}
          exportFileName="صالات_واقسام_المصنع_كيان"
          enableExport={true}
        />
      )}

      {activeTab === 'kpis' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden animate-fadeIn">
          <div className="bg-slate-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center text-xs font-bold text-gray-700">
            <span>لوحة تقييم كفاءة الصالات وهادر الخامات (Department KPIs Scorecard)</span>
            <span className="text-gray-400 font-normal">محدثة لحظياً بحسب إنتاجية الوردية</span>
          </div>

          <div className="divide-y divide-gray-100">
            {kpiMetrics.map((kpi) => (
              <div key={kpi.id} className="p-5 flex flex-wrap items-center justify-between gap-4 text-xs hover:bg-slate-50/75">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl font-bold font-mono text-base ${
                    kpi.efficiencyPercentage >= 100 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {kpi.efficiencyPercentage}%
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{kpi.departmentName}</h3>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      المستهدف: {kpi.targetOutputKg} كجم | الفعلي: {kpi.actualOutputKg} كجم | التوقف: {kpi.downtimeMinutes} دقيقة
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 block">نسبة الهادر</span>
                    <span className="font-mono font-bold text-rose-700 text-xs">{kpi.wastePercentage}%</span>
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] text-gray-400 block">مطابقة الجودة</span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">{kpi.safetyCompliance}%</span>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    kpi.statusEvaluation === 'أداء متميز'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : kpi.statusEvaluation === 'ضمن المستهدف'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {kpi.statusEvaluation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <NewDepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDepartment}
      />
    </div>
  );
};
