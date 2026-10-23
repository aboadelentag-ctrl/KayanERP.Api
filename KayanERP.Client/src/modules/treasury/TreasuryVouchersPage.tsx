import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import {
  fetchTreasuryVouchersApi,
  saveTreasuryVouchersToLocal,
} from './treasuryApi';
import type { TreasuryVoucher } from './treasuryApi';
import { NewVoucherModal } from './NewVoucherModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import {
  HandCoins,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Building2,
  CheckCircle2,
  Receipt
} from 'lucide-react';

export const TreasuryVouchersPage: React.FC = () => {
  const [vouchers, setVouchers] = useState<TreasuryVoucher[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchTreasuryVouchersApi();
      setVouchers(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveVoucher = (newVoucher: TreasuryVoucher) => {
    const updated = [newVoucher, ...vouchers];
    setVouchers(updated);
    saveTreasuryVouchersToLocal(updated);

    // 1. توليد قيد يومية متوازن آلياً في دفتر اليومية العامة
    const journalEntries = JSON.parse(localStorage.getItem('kayan_journal_entries') || '[]');
    const isReceipt = newVoucher.type === 'سند قبض نقدية';

    const newJournalEntry = {
      id: Date.now(),
      entryNumber: `JRN-${isReceipt ? 'REC' : 'PAY'}-${Math.floor(100 + Math.random() * 900)}`,
      date: newVoucher.date,
      referenceType: isReceipt ? 'قيد تسوية يدوي' as const : 'سند صرف مصروفات' as const,
      referenceNumber: newVoucher.voucherNumber,
      description: `${newVoucher.type} - ${newVoucher.receivedFromOrPaidTo} (${newVoucher.description})`,
      totalDebit: newVoucher.amount,
      totalCredit: newVoucher.amount,
      status: 'مرحل للأستاذ العام' as const,
      createdBy: 'نظام الخزينة الآلي (Auto-Post)',
      lines: isReceipt
        ? [
            {
              id: Date.now() + 1,
              accountId: newVoucher.treasuryAccountId,
              accountCode: '1101',
              accountName: newVoucher.treasuryName,
              debit: newVoucher.amount,
              credit: 0,
              description: `قبض نقدية من: ${newVoucher.receivedFromOrPaidTo}`,
            },
            {
              id: Date.now() + 2,
              accountId: newVoucher.targetAccountId,
              accountCode: '1104',
              accountName: newVoucher.targetAccountName,
              debit: 0,
              credit: newVoucher.amount,
              description: newVoucher.description,
            },
          ]
        : [
            {
              id: Date.now() + 1,
              accountId: newVoucher.targetAccountId,
              accountCode: '5103',
              accountName: newVoucher.targetAccountName,
              debit: newVoucher.amount,
              credit: 0,
              description: newVoucher.description,
            },
            {
              id: Date.now() + 2,
              accountId: newVoucher.treasuryAccountId,
              accountCode: '1101',
              accountName: newVoucher.treasuryName,
              debit: 0,
              credit: newVoucher.amount,
              description: `صرف نقدية إلى: ${newVoucher.receivedFromOrPaidTo}`,
            },
          ],
    };
    localStorage.setItem('kayan_journal_entries', JSON.stringify([newJournalEntry, ...journalEntries]));

    // 2. تحديث أرصدة شجرة الحسابات بدقة
    const accData = JSON.parse(localStorage.getItem('kayan_chart_of_accounts') || '[]');
    const updatedAccounts = accData.map((acc: any) => {
      if (acc.id === newVoucher.treasuryAccountId) {
        const delta = isReceipt ? newVoucher.amount : -newVoucher.amount;
        return { ...acc, currentBalance: acc.currentBalance + delta };
      }
      if (acc.id === newVoucher.targetAccountId) {
        const delta = isReceipt ? -newVoucher.amount : newVoucher.amount;
        return { ...acc, currentBalance: acc.currentBalance + delta };
      }
      return acc;
    });
    localStorage.setItem('kayan_chart_of_accounts', JSON.stringify(updatedAccounts));
  };

  const totalReceipts = useMemo(
    () => vouchers.filter((v) => v.type === 'سند قبض نقدية').reduce((s, v) => s + v.amount, 0),
    [vouchers]
  );
  const totalPayments = useMemo(
    () => vouchers.filter((v) => v.type === 'سند صرف نقدية').reduce((s, v) => s + v.amount, 0),
    [vouchers]
  );
  const netCashFlow = totalReceipts - totalPayments;

  const columns = useMemo<ColumnDef<TreasuryVoucher>[]>(
    () => [
      {
        key: 'voucherNumber',
        header: 'رقم السند',
        width: '145px',
        render: (row) => (
          <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
            row.type === 'سند قبض نقدية'
              ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
              : 'text-rose-800 bg-rose-50 border border-rose-200'
          }`}>
            {row.voucherNumber}
          </span>
        ),
      },
      {
        key: 'date',
        header: 'التاريخ',
        align: 'center',
        render: (row) => <span className="font-mono text-xs text-gray-500">{row.date}</span>,
      },
      {
        key: 'type',
        header: 'نوع السند',
        align: 'center',
        render: (row) => (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full ${
            row.type === 'سند قبض نقدية'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-rose-100 text-rose-800'
          }`}>
            {row.type === 'سند قبض نقدية' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
            <span>{row.type}</span>
          </span>
        ),
      },
      {
        key: 'receivedFromOrPaidTo',
        header: 'الطرف المعني والبيان',
        render: (row) => (
          <div>
            <div className="font-bold text-gray-900 text-xs">{row.receivedFromOrPaidTo}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">{row.description}</div>
          </div>
        ),
      },
      {
        key: 'treasuryName',
        header: 'الخزينة والحساب المقابل',
        render: (row) => (
          <div className="text-xs">
            <span className="font-semibold text-indigo-900 block">{row.treasuryName}</span>
            <span className="text-[11px] text-gray-400 block">{row.targetAccountName}</span>
          </div>
        ),
      },
      {
        key: 'amount',
        header: 'المبلغ (ج.م)',
        align: 'center',
        render: (row) => (
          <span className={`font-mono font-bold text-sm ${
            row.type === 'سند قبض نقدية' ? 'text-emerald-700' : 'text-rose-700'
          }`}>
            {row.amount.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        key: 'paymentMethod',
        header: 'طريقة الدفع',
        align: 'center',
        render: (row) => (
          <span className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-700 rounded-md font-semibold">
            {row.paymentMethod}
          </span>
        ),
      },
    ],
    []
  );

  const filterFields: FilterField[] = [
    {
      key: 'type',
      label: 'نوع السند',
      type: 'select',
      options: [
        { label: 'سند قبض نقدية', value: 'سند قبض نقدية' },
        { label: 'سند صرف نقدية', value: 'سند صرف نقدية' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return vouchers.filter((item) => {
      const matchSearch =
        item.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.receivedFromOrPaidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter ? item.type === typeFilter : true;
      return matchSearch && matchType;
    });
  }, [vouchers, searchTerm, typeFilter]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      {/* بطاقات المؤشرات اللحظية للنقدية والسيولة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><ArrowDownLeft className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">إجمالي المقبوضات النقدية</span>
            <span className="text-base font-bold font-mono text-emerald-700">{totalReceipts.toLocaleString()} ج.م</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600"><ArrowUpRight className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">إجمالي المدفوعات والمصروفات</span>
            <span className="text-base font-bold font-mono text-rose-700">{totalPayments.toLocaleString()} ج.م</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600"><Wallet className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">صافي التدفق النقدي للفترة</span>
            <span className="text-base font-bold font-mono text-indigo-900">{netCashFlow.toLocaleString()} ج.م</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Receipt className="w-5 h-5" /></div>
          <div>
            <span className="text-xs text-gray-500 block">عدد السندات المحررة</span>
            <span className="text-base font-bold font-mono text-gray-900">{vouchers.length} سندات</span>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HandCoins className="w-7 h-7 text-indigo-600" />
            <span>سندات القبض والصرف والخزائن (Treasury Vouchers)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            إثبات تدفقات السيولة النقدية والشيكات، والترحيل المحاسبي المزدوج التلقائي لشجرة الحسابات
          </p>
        </div>

        <PermissionGuard permission="Journal.Post" showDisabled>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>تحرير سند قبض / صرف جديد</span>
          </button>
        </PermissionGuard>
      </div>

      <DataTable<TreasuryVoucher>
        columns={columns}
        data={paginatedData}
        totalRecords={filteredData.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchTerm}
        filters={filterFields}
        onFilterChange={(f) => setTypeFilter(f.type || '')}
        isLoading={isLoading}
        exportFileName="سجل_سندات_الخزينة_كيان"
        enableExport={true}
      />

      <NewVoucherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVoucher}
      />
    </div>
  );
};
