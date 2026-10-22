import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import { fetchAccountsApi, saveAccountsToLocal } from './accountsApi';
import type { AccountItem } from './accountsApi';
import { AccountModal } from './AccountModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import { BookOpen, Plus, Edit3, Trash2, FolderTree, Tag } from 'lucide-react';

export const ChartOfAccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountItem | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchAccountsApi();
      setAccounts(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveAccount = (item: AccountItem) => {
    let updated: AccountItem[];
    if (accounts.some((a) => a.id === item.id)) {
      updated = accounts.map((a) => (a.id === item.id ? item : a));
    } else {
      updated = [...accounts, item].sort((a, b) => a.accountCode.localeCompare(b.accountCode));
    }
    setAccounts(updated);
    saveAccountsToLocal(updated);
  };

  const handleDeleteAccount = (id: number) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الحساب المالي؟')) {
      const updated = accounts.filter((a) => a.id !== id);
      setAccounts(updated);
      saveAccountsToLocal(updated);
    }
  };

  const columns = useMemo<ColumnDef<AccountItem>[]>(
    () => [
      {
        key: 'accountCode',
        header: 'كود الحساب',
        width: '130px',
        render: (row) => (
          <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
            !row.isPosting ? 'bg-slate-900 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          }`}>
            {row.accountCode}
          </span>
        ),
      },
      {
        key: 'accountName',
        header: 'اسم الحساب والمستوى الشجري',
        render: (row) => {
          // مسافة بادئة مرئية تعبر عن المستوى الشجري
          const indent = (row.level - 1) * 20;
          return (
            <div style={{ marginRight: `${indent}px` }} className="flex items-center gap-2">
              {!row.isPosting ? (
                <FolderTree className="w-4 h-4 text-slate-700 shrink-0" />
              ) : (
                <Tag className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              )}
              <div>
                <span className={`text-xs ${!row.isPosting ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                  {row.accountName}
                </span>
                {row.parentCode && (
                  <span className="text-[10px] text-gray-400 font-mono block">
                    تابع لـ: {row.parentCode}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: 'category',
        header: 'التبويب',
        align: 'center',
        render: (row) => {
          const map: Record<string, string> = {
            'أصول': 'bg-emerald-50 text-emerald-700 border-emerald-200',
            'خصوم والتزامات': 'bg-amber-50 text-amber-700 border-amber-200',
            'حقوق ملكية': 'bg-blue-50 text-blue-700 border-blue-200',
            'إيرادات': 'bg-purple-50 text-purple-700 border-purple-200',
            'مصروفات وتكاليف': 'bg-rose-50 text-rose-700 border-rose-200',
          };
          return (
            <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${map[row.category] || 'bg-gray-50 text-gray-700'}`}>
              {row.category}
            </span>
          );
        },
      },
      {
        key: 'nature',
        header: 'الطبيعة',
        align: 'center',
        render: (row) => (
          <span className="text-xs font-semibold text-gray-600 font-mono">
            {row.nature}
          </span>
        ),
      },
      {
        key: 'currentBalance',
        header: 'الرصيد المحاسبي اللحظي',
        align: 'center',
        render: (row) => (
          <span className={`font-mono font-bold text-xs ${row.currentBalance < 0 ? 'text-rose-600' : 'text-gray-900'}`}>
            {row.currentBalance.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        key: 'isPosting',
        header: 'النوع',
        align: 'center',
        render: (row) => (
          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
            row.isPosting ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-800'
          }`}>
            {row.isPosting ? 'فرعي ترحيلي' : 'رئيسي تجميعي'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'الإجراءات',
        align: 'center',
        width: '90px',
        render: (row) => (
          <div className="flex items-center justify-center gap-1">
            <PermissionGuard permission="Accounts.View" showDisabled>
              <button
                onClick={() => {
                  setEditingAccount(row);
                  setIsModalOpen(true);
                }}
                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="تعديل الحساب"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </PermissionGuard>

            <PermissionGuard permission="Accounts.View" showDisabled>
              <button
                onClick={() => handleDeleteAccount(row.id)}
                className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="حذف الحساب"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </PermissionGuard>
          </div>
        ),
      },
    ],
    [accounts]
  );

  const filterFields: FilterField[] = [
    {
      key: 'category',
      label: 'التبويب الرئيسي',
      type: 'select',
      options: [
        { label: 'أصول', value: 'أصول' },
        { label: 'خصوم والتزامات', value: 'خصوم والتزامات' },
        { label: 'حقوق ملكية', value: 'حقوق ملكية' },
        { label: 'إيرادات', value: 'إيرادات' },
        { label: 'مصروفات وتكاليف', value: 'مصروفات وتكاليف' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return accounts.filter((item) => {
      const matchSearch =
        item.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.accountCode.includes(searchTerm);
      const matchCat = categoryFilter ? item.category === categoryFilter : true;
      return matchSearch && matchCat;
    });
  }, [accounts, searchTerm, categoryFilter]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-indigo-600" />
            <span>دليل وشجرة الحسابات المالية العامة (Chart of Accounts)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            الهيكل المحاسبي الشجري للأصول، الخصوم، حقوق الملكية، الإيرادات، وتكاليف تشغيل المعمل
          </p>
        </div>

        <PermissionGuard permission="Accounts.View" showDisabled>
          <button
            type="button"
            onClick={() => {
              setEditingAccount(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حساب مالي جديد</span>
          </button>
        </PermissionGuard>
      </div>

      <DataTable<AccountItem>
        columns={columns}
        data={paginatedData}
        totalRecords={filteredData.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchTerm}
        filters={filterFields}
        onFilterChange={(f) => setCategoryFilter(f.category || '')}
        isLoading={isLoading}
        exportFileName="دليل_شجرة_الحسابات_كيان"
        enableExport={true}
      />

      <AccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAccount(null);
        }}
        onSave={handleSaveAccount}
        existingAccounts={accounts}
        initialData={editingAccount}
      />
    </div>
  );
};
