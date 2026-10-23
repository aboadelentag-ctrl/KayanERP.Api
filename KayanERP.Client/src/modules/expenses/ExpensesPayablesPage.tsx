import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import {
  fetchOperatingExpensesApi,
  saveOperatingExpensesToLocal,
} from './expensesApi';
import type { OperatingExpense } from './expensesApi';
import { NewExpenseModal } from './NewExpenseModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import {
  Wallet2,
  Plus,
  Flame,
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2
} from 'lucide-react';

export const ExpensesPayablesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<OperatingExpense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchOperatingExpensesApi();
      setExpenses(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveExpense = (newExpense: OperatingExpense) => {
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveOperatingExpensesToLocal(updated);

    // 1. توليد قيد يومية متوازن آلياً في دفتر اليومية العام
    const journalEntries = JSON.parse(localStorage.getItem('kayan_journal_entries') || '[]');
    const newJournalEntry = {
      id: Date.now(),
      entryNumber: `JRN-EXP-${Math.floor(100 + Math.random() * 900)}`,
      date: newExpense.date,
      referenceType: 'سند صرف مصروفات' as const,
      referenceNumber: newExpense.billNumber,
      description: `إثبات ${newExpense.category} - ${newExpense.supplierOrEntityName} (${newExpense.costCenter})`,
      totalDebit: newExpense.amount,
      totalCredit: newExpense.amount,
      status: 'مرحل للأستاذ العام' as const,
      createdBy: 'نظام المصروفات الآلي (Auto-Post)',
      lines: [
        {
          id: Date.now() + 1,
          accountId: 25,
          accountCode: '5103',
          accountName: newExpense.category,
          debit: newExpense.amount,
          credit: 0,
          description: newExpense.notes,
        },
        {
          id: Date.now() + 2,
          accountId: newExpense.paidAmount === newExpense.amount ? 3 : 14,
          accountCode: newExpense.paidAmount === newExpense.amount ? '1101' : '2101',
          accountName: newExpense.paidAmount === newExpense.amount ? 'خزينة المركز الرئيسي والمصنع' : 'حسابات الموردين (ذمم دائنة)',
          debit: 0,
          credit: newExpense.amount,
          description: `استحقاق: ${newExpense.supplierOrEntityName}`,
        },
      ],
    };
    localStorage.setItem('kayan_journal_entries', JSON.stringify([newJournalEntry, ...journalEntries]));

    // 2. تحديث شجرة الحسابات
    const accData = JSON.parse(localStorage.getItem('kayan_chart_of_accounts') || '[]');
    const updatedAccounts = accData.map((acc: any) => {
      if (acc.accountCode === '5103') {
        return { ...acc, currentBalance: acc.currentBalance + newExpense.amount };
      }
      if (acc.id === 3 && newExpense.paidAmount > 0) {
        return { ...acc, currentBalance: acc.currentBalance - newExpense.paidAmount };
      }
      return acc;
    });
    localStorage.setItem('kayan_chart_of_accounts', JSON.stringify(updatedAccounts));
  };

  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const totalDuePayables = useMemo(() => expenses.reduce((s, e) => s + e.remainingAmount, 0), [expenses]);
  const gasTotal = useMemo(
    () => expenses.filter((e) => e.category.includes('غاز')).reduce((s, e) => s + e.amount, 0),
    [expenses]
  );
  const electricityTotal = useMemo(
    () => expenses.filter((e) => e.category.includes('كهرباء')).reduce((s, e) => s + e.amount, 0),
    [expenses]
  );

  const columns = useMemo<ColumnDef<OperatingExpense>[]>(
    () => [
      {
        key: 'billNumber',
        header: 'رقم المطالبة',
        width: '145px',
        render: (row) => (
          <span className="font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-xs">
            {row.billNumber}
          </span>
        ),
      },
      {
        key: 'category',
        header: 'البند والتصنيف',
        render: (row) => (
          <div className="flex items-center gap-1.5">
            {row.category.includes('غاز') ? (
              <Flame className="w-4 h-4 text-amber-600" />
            ) : row.category.includes('كهرباء') ? (
              <Zap className="w-4 h-4 text-blue-600" />
            ) : (
              <Wallet2 className="w-4 h-4 text-gray-500" />
            )}
            <span className="font-bold text-gray-900 text-xs">{row.category}</span>
          </div>
        ),
      },
      {
        key: 'supplierOrEntityName',
        header: 'الجهة ومركز التكلفة',
        render: (row) => (
          <div>
            <div className="font-semibold text-gray-900 text-xs">{row.supplierOrEntityName}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{row.costCenter}</div>
          </div>
        ),
      },
      {
        key: 'dueDate',
        header: 'ميعاد الاستحقاق',
        align: 'center',
        render: (row) => <span className="font-mono text-xs text-gray-600">{row.dueDate}</span>,
      },
      {
        key: 'amount',
        header: 'إجمالي الفاتورة',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-xs text-gray-900">
            {row.amount.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        key: 'remainingAmount',
        header: 'المتبقي (ورقة دفع)',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-xs text-rose-700">
            {row.remainingAmount > 0 ? `${row.remainingAmount.toLocaleString()} ج.م` : 'خالص'}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'حالة السداد',
        align: 'center',
        render: (row) => (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
            row.status === 'مسدد بالكامل'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {row.status === 'مسدد بالكامل' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            <span>{row.status}</span>
          </span>
        ),
      },
    ],
    []
  );

  const filterFields: FilterField[] = [
    {
      key: 'category',
      label: 'بند المصروف',
      type: 'select',
      options: [
        { label: 'غاز طبيعي للأفران', value: 'غاز طبيعي للأفران' },
        { label: 'كهرباء المعمل والمستودعات', value: 'كهرباء المعمل والمستودعات' },
        { label: 'مياه ومرافق', value: 'مياه ومرافق' },
        { label: 'صيانة وقطع غيار', value: 'صيانة وقطع غيار' },
        { label: 'نثريات وإعاشة', value: 'نثريات وإعاشة' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return expenses.filter((item) => {
      const matchSearch =
        item.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplierOrEntityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter ? item.category === categoryFilter : true;
      return matchSearch && matchCat;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      {/* بطاقات المؤشرات اللحظية للطاقة ومصروفات التشغيل */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Flame className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">استهلاك غاز الأفران</span>
            <span className="text-base font-bold font-mono text-gray-900">{gasTotal.toLocaleString()} ج.م</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><Zap className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">طاقة وغرف التبريد</span>
            <span className="text-base font-bold font-mono text-gray-900">{electricityTotal.toLocaleString()} ج.م</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600"><AlertTriangle className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">أوراق دفع مستحقة للموردين</span>
            <span className="text-base font-bold font-mono text-rose-700">{totalDuePayables.toLocaleString()} ج.م</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Wallet2 className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">إجمالي المصروفات المحققة</span>
            <span className="text-base font-bold font-mono text-indigo-900">{totalExpenses.toLocaleString()} ج.م</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet2 className="w-7 h-7 text-rose-600" />
            <span>الموردين والغاز ومصروفات التشغيل (Expenses & Payables)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            إثبات فواتير الطاقة والغاز للأفران، والصيانة الدورية للمعدات، وأوراق الدفع المجدولة للموردين
          </p>
        </div>

        <PermissionGuard permission="Journal.Post" showDisabled>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إثبات فاتورة مصروف / ورقة دفع</span>
          </button>
        </PermissionGuard>
      </div>

      <DataTable<OperatingExpense>
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
        exportFileName="مصروفات_التشغيل_واوراق_الدفع"
        enableExport={true}
      />

      <NewExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
      />
    </div>
  );
};
