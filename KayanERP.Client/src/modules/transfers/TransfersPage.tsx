import React, { useState, useEffect, useMemo } from 'react';
import { DataTable } from '../../core/components/data-table';
import type { ColumnDef, FilterField } from '../../core/components/data-table';
import { fetchTransfersApi, saveTransfersToLocal } from './transfersApi';
import type { StockTransfer } from './transfersApi';
import { NewTransferModal } from './NewTransferModal';
import { Truck, Plus, Boxes, CheckCircle2, ArrowRightLeft } from 'lucide-react';

export const TransfersPage: React.FC = () => {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await fetchTransfersApi();
      setTransfers(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveTransfer = (newTrf: StockTransfer) => {
    const updated = [newTrf, ...transfers];
    setTransfers(updated);
    saveTransfersToLocal(updated);

    // تحديث رصيد المجنسات داخل الفروع والمستودعات بالتبعية
    const brData = JSON.parse(localStorage.getItem('kayan_branches_data') || '[]');
    const updatedBranches = brData.map((b: any) => {
      if (b.id === newTrf.fromBranchId) {
        return { ...b, crateBalance: Math.max(0, b.crateBalance - newTrf.cratesLoaded) };
      }
      if (b.id === newTrf.toBranchId) {
        return { ...b, crateBalance: b.crateBalance + newTrf.cratesLoaded };
      }
      return b;
    });
    localStorage.setItem('kayan_branches_data', JSON.stringify(updatedBranches));
  };

  const handleConfirmReceipt = (id: number) => {
    const updated = transfers.map((t) => (t.id === id ? { ...t, status: 'تم الاستلام' as const } : t));
    setTransfers(updated);
    saveTransfersToLocal(updated);
  };

  const columns = useMemo<ColumnDef<StockTransfer>[]>(
    () => [
      {
        key: 'transferNumber',
        header: 'رقم إذن التحويل',
        width: '130px',
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
            {row.transferNumber}
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
        key: 'route',
        header: 'مسار التحويل (من ← إلى)',
        render: (row) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 text-xs">{row.fromBranchName}</span>
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="font-bold text-indigo-700 text-xs">{row.toBranchName}</span>
          </div>
        ),
      },
      {
        key: 'driverName',
        header: 'السائق والناقل',
        render: (row) => (
          <div className="flex items-center gap-1.5 text-xs text-gray-700">
            <Truck className="w-3.5 h-3.5 text-gray-400" />
            <span>{row.driverName}</span>
          </div>
        ),
      },
      {
        key: 'cratesLoaded',
        header: 'المجنسات المنقولة',
        align: 'center',
        render: (row) => (
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-amber-50 text-amber-800 border border-amber-200">
            <Boxes className="w-3 h-3" />
            <span>{row.cratesLoaded} قفص</span>
          </div>
        ),
      },
      {
        key: 'itemsCount',
        header: 'عدد الأصناف',
        align: 'center',
        render: (row) => <span className="text-xs font-semibold text-gray-600">{row.itemsCount} أصناف</span>,
      },
      {
        key: 'status',
        header: 'حالة الشحنة',
        align: 'center',
        render: (row) => {
          const isDone = row.status === 'تم الاستلام';
          return (
            <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${
              isDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
            }`}>
              {row.status}
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: 'الإجراء',
        align: 'center',
        width: '120px',
        render: (row) => {
          if (row.status === 'قيد النقل والتوزيع') {
            return (
              <button
                onClick={() => handleConfirmReceipt(row.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>إثبات استلام</span>
              </button>
            );
          }
          return <span className="text-[11px] text-gray-400">مكتمل</span>;
        },
      },
    ],
    [transfers]
  );

  const filterFields: FilterField[] = [
    {
      key: 'status',
      label: 'حالة الشحنة',
      type: 'select',
      options: [
        { label: 'تم الاستلام', value: 'تم الاستلام' },
        { label: 'قيد النقل والتوزيع', value: 'قيد النقل والتوزيع' },
      ],
    },
  ];

  const filteredData = useMemo(() => {
    return transfers.filter((item) => {
      const matchSearch =
        item.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fromBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.toBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.driverName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStat = statusFilter ? item.status === statusFilter : true;
      return matchSearch && matchStat;
    });
  }, [transfers, searchTerm, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pageIndex, pageSize]);

  return (
    <div className="p-6 bg-slate-50/50 min-h-screen" dir="rtl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-7 h-7 text-indigo-600" />
            <span>حركات الشحن والتحويل بين الفروع</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة أذون نقل المخزون، صرف شحنات المعمل لسيارات التوزيع، وتتبع عهد المجنسات في الطريق
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>إصدار إذن شحن وتحويل</span>
        </button>
      </div>

      <DataTable<StockTransfer>
        columns={columns}
        data={paginatedData}
        totalRecords={filteredData.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSearch={setSearchTerm}
        filters={filterFields}
        onFilterChange={(f) => setStatusFilter(f.status || '')}
        isLoading={isLoading}
        exportFileName="اذون_شحن_وتحويل_الفروع"
        enableExport={true}
      />

      <NewTransferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransfer}
      />
    </div>
  );
};
