import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef } from '../../core/components/data-table';
import {
  fetchCompaniesApi,
  saveCompaniesToLocal,
  fetchShiftRosterApi,
  saveShiftRosterToLocal,
} from './hrApi';
import type { CompanyEntity, ShiftScheduleAssignment } from './hrApi';
import { NewRosterModal } from './NewRosterModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import {
  Building2,
  Users,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
  Phone,
  Mail,
  FileText
} from 'lucide-react';

export const CompaniesAndHRPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roster' | 'companies'>('roster');
  const [companies, setCompanies] = useState<CompanyEntity[]>([]);
  const [roster, setRoster] = useState<ShiftScheduleAssignment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [cmpData, rstData] = await Promise.all([
        fetchCompaniesApi(),
        fetchShiftRosterApi(),
      ]);
      setCompanies(cmpData);
      setRoster(rstData);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveRoster = (newAssignment: ShiftScheduleAssignment) => {
    const updated = [newAssignment, ...roster];
    setRoster(updated);
    saveShiftRosterToLocal(updated);
  };

  const columnsRoster = useMemo<ColumnDef<ShiftScheduleAssignment>[]>(
    () => [
      {
        key: 'scheduleCode',
        header: 'كود التعيين',
        width: '135px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs">
            {row.scheduleCode}
          </span>
        ),
      },
      {
        key: 'employeeName',
        header: 'اسم الموظف والوظيفة',
        render: (row) => (
          <div>
            <div className="font-bold text-gray-900 text-xs">{row.employeeName}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{row.roleTitle}</div>
          </div>
        ),
      },
      {
        key: 'departmentName',
        header: 'الصالة وخط الإنتاج المكلف به',
        render: (row) => (
          <div>
            <div className="font-semibold text-gray-900 text-xs">{row.departmentName}</div>
            <div className="text-[11px] text-indigo-900 font-medium mt-0.5">خط: {row.lineAssignment}</div>
          </div>
        ),
      },
      {
        key: 'shiftName',
        header: 'الوردية ومواعيد العمل',
        render: (row) => (
          <div className="text-xs">
            <span className="font-bold text-gray-900 block">{row.shiftName}</span>
            <span className="text-[11px] text-gray-400 block">{row.workDays} (راحة: {row.restDay})</span>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'الحالة',
        align: 'center',
        render: (row) => (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{row.status}</span>
          </span>
        ),
      },
    ],
    []
  );

  const paginatedRoster = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return roster.slice(start, start + pageSize);
  }, [roster, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      {/* بطاقات المؤشرات اللحظية */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Users className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">طاقم الورديات المجدول</span>
            <span className="text-base font-bold font-mono text-gray-900">{roster.length} تعيينات مجدولة</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><Clock className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">الوردية الصباحية النشطة</span>
            <span className="text-base font-bold font-mono text-emerald-700">
              {roster.filter((r) => r.shiftName.includes('صباحية')).length} شيفات وفنيين
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Calendar className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">الورديات المسائية والليلية</span>
            <span className="text-base font-bold font-mono text-amber-700">
              {roster.filter((r) => !r.shiftName.includes('صباحية')).length} شيفات معمل
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600"><Building2 className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">الكيانات والشركات التابعة</span>
            <span className="text-base font-bold font-mono text-rose-700">{companies.length} شركات معتمدة</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            <span>إدارة الشركات وتوزيع وجدولة العاملين (Companies & Shift Rostering)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            بيانات الكيانات والشركات المسجلة، وجدول مناوبات الشيفات والعمال على خطوط الصالات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-xs flex gap-1">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'roster' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              جدول ومناوبات الورديات 👥
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'companies' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              دليل الشركات والكيانات 🏢
            </button>
          </div>

          {activeTab === 'roster' && (
            <PermissionGuard permission="Products.Manage" showDisabled>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>تعيين وردية ومناوبة</span>
              </button>
            </PermissionGuard>
          )}
        </div>
      </div>

      {activeTab === 'roster' && (
        <DataTable<ShiftScheduleAssignment>
          columns={columnsRoster}
          data={paginatedRoster}
          totalRecords={roster.length}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          isLoading={isLoading}
          exportFileName="جدول_مناوبات_ورديات_المعمل"
          enableExport={true}
        />
      )}

      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
          {companies.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                    <div>
                      <h2 className="font-bold text-gray-900 text-sm">{c.tradeName}</h2>
                      <span className="text-[11px] font-mono text-gray-400">{c.code}</span>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {c.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2.5 text-xs text-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">الاسم القانوني:</span>
                    <span className="font-semibold text-gray-900">{c.legalName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">السجل التجاري:</span>
                    <span className="font-mono font-bold text-indigo-900">{c.commercialRegister}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">البطاقة الضريبية:</span>
                    <span className="font-mono font-bold text-indigo-900">{c.taxNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">النشاط والغرض:</span>
                    <span className="text-gray-600">{c.activityType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">المقر الإداري:</span>
                    <span className="text-gray-900">{c.headquarters}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-mono">{c.phone}</span>
                </span>
                <span className="font-bold text-indigo-700">
                  {c.branchesCount} فروع ومنافذ تابعة
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <NewRosterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRoster}
      />
    </div>
  );
};
