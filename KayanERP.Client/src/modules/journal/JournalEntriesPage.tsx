import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import { fetchJournalEntriesApi, saveJournalEntriesToLocal } from './journalApi';
import type { JournalEntry } from './journalApi';
import { NewJournalEntryModal } from './NewJournalEntryModal';
import { PermissionGuard } from '../../core/auth/PermissionGuard';
import { Scale, Plus, CheckCircle2, FileText, ChevronDown, ChevronUp } from 'lucide-react';

export const JournalEntriesPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [expandedEntryId, setExpandedEntryId] = useState<number | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchJournalEntriesApi();
      setEntries(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveEntry = (newEntry: JournalEntry) => {
    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveJournalEntriesToLocal(updated);

    const accData = JSON.parse(localStorage.getItem('kayan_chart_of_accounts') || '[]');
    const updatedAccounts = accData.map((acc: any) => {
      const matchLines = newEntry.lines.filter((l) => l.accountId === acc.id);
      if (matchLines.length > 0) {
        let balanceDelta = 0;
        matchLines.forEach((l) => {
          if (acc.nature === 'مدين') {
            balanceDelta += (l.debit - l.credit);
          } else {
            balanceDelta += (l.credit - l.debit);
          }
        });
        return { ...acc, currentBalance: acc.currentBalance + balanceDelta };
      }
      return acc;
    });
    localStorage.setItem('kayan_chart_of_accounts', JSON.stringify(updatedAccounts));
  };

  const columns = useMemo<ColumnDef<JournalEntry>[]>(
    () => [
      {
        key: 'entryNumber',
        header: 'رقم القيد',
        width: '135px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
            {row.entryNumber}
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
        key: 'description',
        header: 'البيان والمرجع',
        render: (row) => (
          <div>
            <div className="font-semibold text-gray-900 text-xs">{row.description}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              {row.referenceType} ({row.referenceNumber}) - بواسطة: {row.createdBy}
            </div>
          </div>
        ),
      },
      {
        key: 'totalDebit',
        header: 'إجمالي الطرف المدين',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-xs text-emerald-700">
            {row.totalDebit.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        key: 'totalCredit',
        header: 'إجمالي الطرف الدائن',
        align: 'center',
        render: (row) => (
          <span className="font-mono font-bold text-xs text-amber-700">
            {row.totalCredit.toLocaleString()} ج.م
          </span>
        ),
      },
      {
        key: 'status',
        header: 'الحالة',
        align: 'center',
        render: (row) => (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{row.status}</span>
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'تفاصيل القيد',
        align: 'center',
        width: '100px',
        render: (row) => (
          <button
            onClick={() => setExpandedEntryId(expandedEntryId === row.id ? null : row.id)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
          >
            <span>{expandedEntryId === row.id ? 'إخفاء' : 'عرض'}</span>
            {expandedEntryId === row.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        ),
      },
    ],
    [expandedEntryId]
  );

  const filterFields: FilterField[] = [
    {
      key: 'referenceType',
      label: 'نوع المستند المرجعي',
      type: 'select',
      options: [
        { label: 'فاتورة مبيعات', value: 'فاتورة مبيعات' },
        { label: 'صرف خامات معمل', value: 'صرف خامات معمل' },
        { label: 'سند صرف مصروفات', value: 'سند صرف مصروفات' },
        { label: 'قيد تسوية يدوي', value: 'قيد تسوية يدوي' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return entries.filter((item) => {
      const matchSearch =
        item.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = typeFilter ? item.referenceType === typeFilter : true;
      return matchSearch && matchType;
    });
  }, [entries, searchTerm, typeFilter]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Scale className="w-7 h-7 text-indigo-600" />
            <span>سجل ودفتر قيود اليومية العامة (General Journal)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            الترحيل المحاسبي المزدوج التلقائي لفواتير المبيعات وصرف الخامات، وتسجيل قيود التسويات اليدوية
          </p>
        </div>

        <PermissionGuard permission="Journal.Post" showDisabled>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>تحرير قيد يومية يدوي</span>
          </button>
        </PermissionGuard>
      </div>

      <DataTable<JournalEntry>
        columns={columns}
        data={paginatedData}
        totalRecords={filteredData.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchTerm}
        filters={filterFields}
        onFilterChange={(f) => setTypeFilter(f.referenceType || '')}
        isLoading={isLoading}
        exportFileName="دفتر_قيود_اليومية_كيان"
        enableExport={true}
      />

      {expandedEntryId && (
        <div className="mt-4 p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm animate-fadeIn">
          {(() => {
            const entry = entries.find((e) => e.id === expandedEntryId);
            if (!entry) return null;
            return (
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>تفاصيل سطور وحسابات القيد ({entry.entryNumber})</span>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{entry.description}</span>
                </div>

                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-50 p-2 font-bold text-gray-600">
                    <div className="col-span-3">كود واسم الحساب</div>
                    <div className="col-span-5">شرح البند</div>
                    <div className="col-span-2 text-center text-emerald-800">مدين (Debit)</div>
                    <div className="col-span-2 text-center text-amber-800">دائن (Credit)</div>
                  </div>

                  {entry.lines.map((line) => (
                    <div key={line.id} className="grid grid-cols-12 p-2.5 items-center">
                      <div className="col-span-3">
                        <span className="font-mono font-bold text-indigo-700 ml-1">{line.accountCode}</span>
                        <span className="text-gray-800">{line.accountName}</span>
                      </div>
                      <div className="col-span-5 text-gray-500">{line.description}</div>
                      <div className="col-span-2 text-center font-mono font-bold text-emerald-700">
                        {line.debit > 0 ? `${line.debit.toLocaleString()} ج.م` : '-'}
                      </div>
                      <div className="col-span-2 text-center font-mono font-bold text-amber-700">
                        {line.credit > 0 ? `${line.credit.toLocaleString()} ج.م` : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <NewJournalEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEntry}
      />
    </div>
  );
};
