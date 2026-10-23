import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef } from '../../core/components/data-table';
import {
  fetchSystemUsersApi,
  saveSystemUsersToLocal,
} from './securityApi';
import type { SystemUser } from './securityApi';
import { UserPermissionsModal } from './UserPermissionsModal';
import {
  ShieldCheck,
  Users,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

export const UsersManagementPage: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchSystemUsersApi();
      setUsers(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveUser = (updatedUser: SystemUser) => {
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updated);
    saveSystemUsersToLocal(updated);
  };

  const columns = useMemo<ColumnDef<SystemUser>[]>(
    () => [
      {
        key: 'username',
        header: 'اسم الدخول',
        width: '130px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-xs">
            @{row.username}
          </span>
        ),
      },
      {
        key: 'fullName',
        header: 'المستخدم والدور الإداري',
        render: (row) => (
          <div>
            <div className="font-bold text-gray-900 text-xs">{row.fullName}</div>
            <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
              <span>{row.role}</span>
              <span>•</span>
              <span className="text-indigo-900">{row.branchName}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'email',
        header: 'بيانات الاتصال',
        render: (row) => (
          <div className="text-xs text-gray-600">
            <span className="block font-mono text-[11px]">{row.email}</span>
            <span className="block font-mono text-[11px] text-gray-400 mt-0.5">{row.phone}</span>
          </div>
        ),
      },
      {
        key: 'customPermissions',
        header: 'الصلاحيات المفعلة',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full">
            {row.customPermissions.length} صلاحيات
          </span>
        ),
      },
      {
        key: 'status',
        header: 'حالة الحساب',
        align: 'center',
        render: (row) => (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{row.status}</span>
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'تخصيص الصلاحيات',
        align: 'center',
        width: '150px',
        render: (row) => (
          <button
            onClick={() => setSelectedUser(row)}
            className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>ضبط الصلاحيات</span>
          </button>
        ),
      },
    ],
    []
  );

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Users className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">إجمالي مستخدمي المنظومة</span>
            <span className="text-base font-bold font-mono text-gray-900">{users.length} حسابات إدارية</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">حسابات نشطة على رأس العمل</span>
            <span className="text-base font-bold font-mono text-emerald-700">
              {users.filter((u) => u.status === 'نشط').length} مستخدمين
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><KeyRound className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">نظام الحماية المطبق</span>
            <span className="text-base font-bold font-mono text-gray-900">RBAC Role-Based Access</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            <span>المستخدمين ومصفوفة الصلاحيات (Security & RBAC)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة حسابات مستخدمي الفروع والمعمل، وتعيين الصلاحيات المخصصة لكل دور
          </p>
        </div>
      </div>

      <DataTable<SystemUser>
        columns={columns}
        data={paginatedData}
        totalRecords={users.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
        exportFileName="مستخدمي_نظام_كيان"
        enableExport={true}
      />

      <UserPermissionsModal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </div>
  );
};
